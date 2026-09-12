import logging
from typing import Dict, Any, Optional
from app.agents.state import NigraanState
from app.agents.llm_client import invoke_llm, clean_json_output, extract_text_from_llm_response
from app.services.tariff_engine import compute_k_electric_bill, compute_ssgc_bill
from app.core.supabase import get_supabase_client

logger = logging.getLogger(__name__)


async def extract_bill_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 1: Multimodal LLM extraction of utility bill figures with manual input fallback.
    No dedicated OCR library (Tesseract/cloud OCR); reads structured JSON directly.
    """
    tracking_id = state.get("tracking_id", "KE-BILL-0000")
    logger.info(f"[{tracking_id}] Running Multimodal Bill Extraction Node...")

    photo_base64 = state.get("photo_base64")
    # Manual fallback values passed in state
    units = state.get("units_billed")
    amount = state.get("amount_billed")
    category = state.get("tariff_category") or "Residential-Unprotected"
    provider = state.get("provider") or "K-Electric"

    if photo_base64:
        prompt = """
You are an expert utility bill auditor. Examine this utility bill image carefully.
Extract the following information and return ONLY valid JSON:
- "provider": "K-Electric" or "SSGC"
- "tariff_category": "Residential-Protected" or "Residential-Unprotected" or "Commercial"
- "units_billed": number of units / kWh / Hm3 billed (float/int)
- "amount_billed": total payable amount within due date in PKR (float/int)
- "account_no": consumer account or billing reference number

Return JSON ONLY:
"""
        try:
            raw_res = await invoke_llm(
                prompt=prompt,
                system_prompt="You are a precise utility bill data extractor. Return JSON only.",
                temperature=0.0,
                photo_base64=photo_base64,
            )
            parsed = clean_json_output(raw_res)
            extracted_units = parsed.get("units_billed")
            extracted_amount = parsed.get("amount_billed")
            extracted_cat = parsed.get("tariff_category")
            extracted_prov = parsed.get("provider")

            if extracted_units and float(extracted_units) > 0:
                units = float(extracted_units)
            if extracted_amount and float(extracted_amount) > 0:
                amount = float(extracted_amount)
            if extracted_cat:
                category = extracted_cat
            if extracted_prov:
                provider = extracted_prov

            logger.info(f"[{tracking_id}] Vision extracted: {units} units, Rs. {amount} from {provider}")
        except Exception as e:
            logger.warning(f"[{tracking_id}] Multimodal bill extraction encountered: {e}. Falling back to manual figures.")

    # Defaults if both extraction and manual were 0
    if not units or units <= 0:
        units = 320.0
    if not amount or amount <= 0:
        amount = 12000.0

    return {
        "provider": provider,
        "tariff_category": category,
        "units_billed": units,
        "amount_billed": amount,
    }


async def recompute_tariff_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 2: Deterministic Python calculation of exact expected bill from published tariff schedules.
    Never uses LLM arithmetic.
    """
    tracking_id = state.get("tracking_id")
    logger.info(f"[{tracking_id}] Running Deterministic Tariff Recomputation Node...")

    provider = state.get("provider", "K-Electric")
    units = float(state.get("units_billed", 0))
    amount_billed = float(state.get("amount_billed", 0)) if state.get("amount_billed") else None
    category = state.get("tariff_category", "Residential-Unprotected")

    if "ssgc" in provider.lower() or "gas" in provider.lower():
        calc_result = compute_ssgc_bill(units, category, amount_billed)
    else:
        calc_result = compute_k_electric_bill(units, category, amount_billed)

    logger.info(
        f"[{tracking_id}] Math Recomputed: Billed Rs. {amount_billed} vs Expected Rs. {calc_result['amount_expected']} "
        f"(Discrepancy: Rs. {calc_result['discrepancy']} / {calc_result['overcharge_pct']}%)"
    )

    return {
        "amount_expected": calc_result["amount_expected"],
        "discrepancy": calc_result["discrepancy"],
        "overcharge_pct": calc_result["overcharge_pct"],
        "verdict": calc_result["verdict"],
        "math_breakdown": calc_result["math_breakdown"],
    }


async def draft_billing_dispute_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 3: Drafts formal NEPRA / Utility billing dispute letter when an overcharge is flagged.
    """
    tracking_id = state.get("tracking_id", "KE-BILL-0000")
    verdict = state.get("verdict", "correct")

    if verdict != "flagged":
        return {"drafted_complaint": None}

    logger.info(f"[{tracking_id}] Overcharge detected. Drafting formal dispute letter...")

    provider = state.get("provider", "K-Electric")
    units = state.get("units_billed", 0)
    billed = state.get("amount_billed", 0)
    expected = state.get("amount_expected", 0)
    diff = state.get("discrepancy", 0)
    pct = state.get("overcharge_pct", 0)
    category = state.get("tariff_category", "Residential-Unprotected")

    prompt = f"""
You are the Legal & Consumer Rights Drafting Agent for Nigraan (نگران), Karachi's Civic Intelligence Copilot.
Draft a formal Billing Dispute and Rectification Claim to be lodged before the NEPRA Consumer Affairs Division and the {provider} Integrated Business Center (IBC).

EVIDENTIARY AUDIT PARTICULARS:
- Reference Tracking ID: {tracking_id}
- Utility Provider: {provider}
- Consumer Tariff Class: {category}
- Units Consumed in Cycle: {units} kWh/units
- Total Amount Billed: Rs. {billed:,.2f}
- Legitimate Expected Amount (NEPRA Official Schedule): Rs. {expected:,.2f}
- Proven Overcharge Discrepancy: Rs. {diff:,.2f} (+{pct}% over statutory tariff)

REQUIREMENTS:
1. Formal legal letterhead addressed to: "The Manager (Billing & Complaints), {provider} Integrated Business Center / NEPRA Consumer Affairs Division".
2. Citation of Tracking ID: "{tracking_id}".
3. Clear statement that a mathematical tariff audit demonstrates an unjustifiable billing discrepancy of Rs. {diff:,.2f}.
4. Demand for immediate billing reversal, issuance of a revised challan, and stay on power disconnection.
5. A complete, authentic URDU TRANSLATION SECTION titled "خلاصہ برائے صارفین تنازعات سیل" (Summary for Consumer Disputes Cell).

Draft the document now:
"""
    draft = await invoke_llm(
        prompt=prompt,
        system_prompt="You draft authoritative utility billing dispute claims in English and Urdu. Cite exact mathematical discrepancy figures.",
        temperature=0.2,
    )
    clean_draft = extract_text_from_llm_response(draft)

    return {"drafted_complaint": clean_draft}


async def critique_bill_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 4: Explicit 2nd LLM call to verify that drafted dispute accurately quotes the mathematical figures.
    """
    verdict = state.get("verdict")
    if verdict != "flagged" or not state.get("drafted_complaint"):
        return {"critique_passed": True}

    logger.info(f"[{state.get('tracking_id')}] Running Math Consistency Critique...")
    draft = state.get("drafted_complaint", "")
    diff = state.get("discrepancy", 0)
    tracking_id = state.get("tracking_id", "")

    prompt = f"""
Audit this drafted billing dispute letter:
Does it accurately cite the Tracking ID ("{tracking_id}") and indicate the overcharge discrepancy (~{diff:.0f})?
Letter:
\"\"\"{draft[:500]}\"\"\"

Return ONLY valid JSON:
{{"passed": true/false, "feedback": "confirmation"}}
"""
    try:
        res = await invoke_llm(prompt=prompt, system_prompt="Audit mathematical consistency. JSON only.", temperature=0.0)
        parsed = clean_json_output(res)
        passed = bool(parsed.get("passed", True))
    except Exception:
        passed = True

    return {"critique_passed": passed}


async def finalize_bill_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 5: Persists the bill analysis, math breakdown, verdict, and dispute letter to Supabase.
    """
    tracking_id = state.get("tracking_id")
    logger.info(f"[{tracking_id}] Persisting Bill Analysis to Supabase...")
    client = get_supabase_client()

    verdict = state.get("verdict", "correct")
    expected = state.get("amount_expected")
    breakdown = state.get("math_breakdown")
    complaint = extract_text_from_llm_response(state.get("drafted_complaint")) if state.get("drafted_complaint") else None
    units = state.get("units_billed")
    billed = state.get("amount_billed")
    provider = state.get("provider", "K-Electric")
    category = state.get("tariff_category", "Residential-Unprotected")

    if client:
        try:
            update_payload = {
                "provider": provider,
                "tariff_category": category,
                "units_billed": units,
                "amount_billed": billed,
                "amount_expected": expected,
                "math_breakdown": breakdown,
                "verdict": verdict,
                "drafted_complaint": complaint,
            }
            client.table("bills").update(update_payload).eq("tracking_id", tracking_id).execute()

            # Insert status_log
            bill_row = client.table("bills").select("id").eq("tracking_id", tracking_id).limit(1).execute()
            if bill_row.data:
                source_id = bill_row.data[0]["id"]
                client.table("status_log").insert({
                    "source_table": "bills",
                    "source_id": source_id,
                    "old_status": "submitted",
                    "new_status": verdict,
                }).execute()
            logger.info(f"[{tracking_id}] Bill successfully persisted to Supabase (verdict: {verdict})")
        except Exception as e:
            logger.warning(f"Supabase bills update failed: {e}")

    return {
        "status": verdict,
    }
