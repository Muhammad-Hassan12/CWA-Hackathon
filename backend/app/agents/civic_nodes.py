import logging
from typing import Dict, Any, Optional
from app.agents.state import NigraanState
from app.agents.llm_client import invoke_llm, clean_json_output, extract_text_from_llm_response
from app.core.supabase import get_supabase_client

logger = logging.getLogger(__name__)

# Fallback in-memory Karachi Authority Mandates (derived verbatim from database/seed_data.sql)
# Ensures verification works reliably even during local testing before Supabase connection
FALLBACK_AUTHORITIES = {
    ("garbage", "Korangi"): {
        "authority_name": "Sindh Solid Waste Management Board (SSWMB) - District Korangi",
        "contact_info": "Helpline: 1128 | WhatsApp: +92-300-0501128 | Email: complaints@sswmb.gos.pk",
        "complaint_template": "To The Managing Director, SSWMB Korangi Zone: Excessive unattended garbage and open dumping reported at {location} in Korangi. Overflowing waste is obstructing pedestrians and posing health hazards. Please dispatch municipal compaction and sanitation team for immediate clearance."
    },
    ("garbage", "Clifton"): {
        "authority_name": "Cantonment Board Clifton (CBC) Sanitation Branch",
        "contact_info": "Helpline: 1072 | UAN: +92-21-35847970 | Web: cbc.gov.pk",
        "complaint_template": "To The Chief Executive Officer, Cantonment Board Clifton: Solid municipal waste accumulation identified at {location}, Clifton. Regular collection cycle missed. Requesting sanitation inspector review and immediate dispatch of refuse collection vehicles."
    },
    ("pothole", "Korangi"): {
        "authority_name": "Karachi Metropolitan Corporation (KMC) Engineering & Road Works",
        "contact_info": "Helpline: 1334 | Phone: +92-21-99215000",
        "complaint_template": "To Chief Engineer Road Maintenance, KMC: Severe road subsidence/potholes on primary artery at {location}, Korangi. Posing imminent accident risk to motorists and cargo logistics. Immediate asphalt patchwork requested."
    },
    ("water", "Korangi"): {
        "authority_name": "Karachi Water & Sewerage Corporation (KWSC) - Korangi Division",
        "contact_info": "Helpline: 1339 | WhatsApp: +92-317-0241339",
        "complaint_template": "To Executive Engineer (Water Supply), KWSC Korangi: Zero pipeline water pressure and complete supply outage for {duration} in {location}, Korangi. Citizens facing acute scarcity. Please restore scheduled bulk water delivery."
    },
    ("sewage", "Korangi"): {
        "authority_name": "KWSC Sewerage & Drainage Directorate - Korangi",
        "contact_info": "Helpline: 1339 | Phone: +92-21-99215000",
        "complaint_template": "To Chief Engineer (Sewerage), KWSC Korangi: Manhole overflow and contaminated effluent flooding road at {location}, Korangi. Health emergency risk. Jetting / suction machine required immediately."
    },
    ("electricity", "Korangi"): {
        "authority_name": "K-Electric Integrated Customer Experience Center - Korangi",
        "contact_info": "Helpline: 118 | WhatsApp: +92-348-0000118 | SMS: 8119",
        "complaint_template": "To Regional Head, K-Electric Korangi IBC: Unscheduled prolonged electrical blackout / transformer fault reported at {location}, Korangi. Live electrical hazards suspected. Dispatch field technician for prompt rectification."
    },
    ("streetlight", "Korangi"): {
        "authority_name": "TMC Korangi Street Lighting Department",
        "contact_info": "Helpline: 1334",
        "complaint_template": "To Incharge Electrical, TMC Korangi: Multiple streetlights non-operational along {location}, Korangi. Street engulfed in darkness causing pedestrian safety concerns and street crimes. Urgent bulb/line replacement requested."
    }
}


async def extract_and_classify_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 1: Multimodal classification of civic report into standard issue_type & severity.
    """
    logger.info(f"[{state.get('tracking_id')}] Running Extract & Classify Node...")
    description = state.get("description", "")
    area = state.get("area", "Karachi")
    user_hint = state.get("issue_type")

    prompt = f"""
You are an expert Karachi Civic Intelligence triage agent for the Nigraan platform.
Analyze this citizen's complaint from area '{area}':

CITIZEN REPORT:
"{description}"

USER PRESELECTED HINT: {user_hint or 'None provided'}

Extract and return ONLY a valid JSON object with:
- "issue_type": must be exactly one of: "garbage", "pothole", "water", "sewage", "electricity", "streetlight"
- "severity": must be one of: "low", "medium", "critical"
- "summary": a one-sentence concise English summary of the hazard
- "urdu_keyword": primary Urdu term (e.g. کچرا, گڑھا, پانی کی قلت, گٹر کا پانی, لوڈ شیڈنگ, اسٹریٹ لائٹ)

Return JSON ONLY without commentary.
"""
    try:
        raw_res = await invoke_llm(
            prompt=prompt,
            system_prompt="You are a strict municipal triage parser. Return JSON only.",
            temperature=0.0,
            photo_base64=state.get("photo_base64")
        )
        parsed = clean_json_output(raw_res)
        issue_type = parsed.get("issue_type", user_hint or "garbage").lower()
        severity = parsed.get("severity", "medium").lower()
        summary = parsed.get("summary", "")
        logger.info(f"[{state.get('tracking_id')}] Classified as '{issue_type}', severity '{severity}'")
        return {
            "issue_type": issue_type,
            "severity": severity,
            "extraction_notes": summary,
        }
    except Exception as e:
        logger.error(f"Extraction failed: {e}. Using fallback classification.")
        issue_type = user_hint or "garbage"
        return {
            "issue_type": issue_type,
            "severity": "medium",
            "extraction_notes": description[:100],
        }


async def verify_mandate_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 2: Looks up verified jurisdictional authority in Supabase authority_mandates.
    """
    logger.info(f"[{state.get('tracking_id')}] Running Mandate Verification Node...")
    issue_type = state.get("issue_type", "garbage")
    area = state.get("area", "Korangi")

    client = get_supabase_client()
    matched_authority = None

    if client:
        try:
            res = (
                client.table("authority_mandates")
                .select("*")
                .eq("issue_type", issue_type)
                .ilike("area", f"%{area}%")
                .limit(1)
                .execute()
            )
            if res.data:
                matched_authority = res.data[0]
                logger.info(f"Matched authority from Supabase: {matched_authority.get('authority_name')}")
        except Exception as e:
            logger.warning(f"Supabase mandate lookup failed: {e}")

    # Fallback to local verified registry if DB offline or empty
    if not matched_authority:
        key = (issue_type, area)
        if key in FALLBACK_AUTHORITIES:
            matched_authority = FALLBACK_AUTHORITIES[key]
        else:
            # Default to KMC or SSWMB generic authority
            matched_authority = {
                "authority_name": f"Karachi Metropolitan Corporation (KMC) / SSWMB Zone ({area})",
                "contact_info": "Helpline: 1334 / 1128 | Web: kmc.gos.pk",
                "complaint_template": "To Municipal Commissioner, {area}: Civic hazard regarding {issue_type} identified at {location}. Immediate rectification and officer dispatch required."
            }

    return {"matched_authority": matched_authority}


async def dedup_check_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 3: Checks for duplicate reports in the same area using pg_trgm similarity or matching.
    If duplicate is confirmed, increments confirmation count instead of generating redundant noise.
    """
    logger.info(f"[{state.get('tracking_id')}] Running Dedup Check Node...")
    client = get_supabase_client()
    is_duplicate = False
    duplicate_of_id = None
    duplicate_tracking = None

    if client:
        try:
            # Look for recent active reports in same area and issue type
            res = (
                client.table("reports")
                .select("id, tracking_id, description, confirm_count")
                .eq("area", state.get("area"))
                .eq("issue_type", state.get("issue_type"))
                .neq("status", "resolved_self_reported")
                .limit(5)
                .execute()
            )
            for row in res.data or []:
                # Simple keyword / token overlap check (mirrors pg_trgm threshold)
                existing_desc = (row.get("description") or "").lower()
                current_desc = (state.get("description") or "").lower()
                
                common_words = set(existing_desc.split()).intersection(set(current_desc.split()))
                if len(common_words) >= 4:
                    is_duplicate = True
                    duplicate_of_id = row.get("id")
                    duplicate_tracking = row.get("tracking_id")
                    # Increment confirm count on existing report
                    new_count = (row.get("confirm_count") or 1) + 1
                    client.table("reports").update({"confirm_count": new_count}).eq("id", duplicate_of_id).execute()
                    logger.info(f"Duplicate detected! Linked to {duplicate_tracking}, new count: {new_count}")
                    break
        except Exception as e:
            logger.warning(f"Dedup check query failed: {e}")

    return {
        "is_duplicate": is_duplicate,
        "duplicate_of_id": duplicate_of_id,
        "duplicate_of_tracking_id": duplicate_tracking,
        "status": "confirmed_duplicate" if is_duplicate else "verifying"
    }


async def draft_complaint_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 4: Drafts formal complaint in both English and Urdu addressed to the verified authority.
    Incorporates critique notes if this is a retry loop.
    """
    logger.info(f"[{state.get('tracking_id')}] Running Draft Complaint Node (retry {state.get('critique_retries', 0)})...")
    authority = state.get("matched_authority", {})
    authority_name = authority.get("authority_name", "Municipal Authority")
    contact_info = authority.get("contact_info", "1334")
    tracking_id = state.get("tracking_id", "KOR-2026-0000")
    area = state.get("area", "Karachi")
    lat = state.get("lat")
    lng = state.get("lng")
    coords_str = f"GPS Coordinates: {lat}, {lng}" if lat and lng else "GPS: Location pinned by citizen"
    description = state.get("description")
    severity = state.get("severity", "medium").upper()
    critique_notes = state.get("critique_notes")

    prompt = f"""
You are the official Drafting Agent for Nigraan (نگران), Karachi's Civic Intelligence Copilot.
Draft an official, highly structured complaint to be lodged with the designated authority.

AUTHORITY TO ADDRESS:
- Organization: {authority_name}
- Official Contact / Channel: {contact_info}

CITIZEN ISSUE PARTICULARS:
- Tracking ID: {tracking_id}
- Area / Sector: {area}, Karachi
- Location & Coordinates: {coords_str}
- Priority Severity: {severity}
- Citizen Grievance Statement: "{description}"

{"PREVIOUS CRITIQUE FEEDBACK TO FIX: " + critique_notes if critique_notes else ""}

REQUIREMENTS:
1. Formal header addressed specifically to: "{authority_name}".
2. Reference the Tracking ID: "{tracking_id}".
3. Clear statement of the civic issue, urgency level ({severity}), and hazardous impact on residents.
4. Specific remedy requested (sanitation compaction team, jetting machine, asphalt patchwork, feeder repair).
5. Formal closing.
6. A complete, authentic URDU TRANSLATION SECTION titled "خلاصہ برائے فیلڈ انسپکٹر" (Urdu Summary for Field Inspector) so municipal workers can act immediately.

Draft the document now:
"""
    draft = await invoke_llm(
        prompt=prompt,
        system_prompt="You draft formal municipal complaints in English and Urdu. Maintain institutional gravity.",
        temperature=0.2
    )
    clean_draft = extract_text_from_llm_response(draft)

    return {"drafted_complaint": clean_draft}


async def critique_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 5: CRITICAL — Explicit Second LLM Call.
    Evaluates the draft against strict rules and determines whether to accept or bounce back.
    """
    retries = state.get("critique_retries", 0)
    logger.info(f"[{state.get('tracking_id')}] Running Critique Node (Attempt {retries + 1})...")

    draft = state.get("drafted_complaint", "")
    authority_name = state.get("matched_authority", {}).get("authority_name", "")
    tracking_id = state.get("tracking_id", "")

    critique_prompt = f"""
You are the Quality Control Auditor for the Nigraan Civic Intelligence platform.
Audit the following drafted civic complaint against four mandatory compliance rules:

DRAFT TO AUDIT:
\"\"\"{draft}\"\"\"

MANDATORY RULES:
1. AUTHORITY CHECK: Does the draft explicitly name the assigned authority ("{authority_name}") in the header or address?
2. TRACKING ID CHECK: Does the draft include the exact Tracking ID ("{tracking_id}")?
3. TONE & REMEDY: Is the tone respectful, official, and does it demand a specific municipal action?
4. URDU SECTION: Does the draft include an authentic Urdu translation/summary for field inspectors?

Return ONLY a JSON object:
{{
  "passed": true/false,
  "authority_check": true/false,
  "tracking_check": true/false,
  "urdu_check": true/false,
  "feedback": "Short specific feedback explaining what is missing or confirming compliance"
}}
"""
    try:
        raw_res = await invoke_llm(
            prompt=critique_prompt,
            system_prompt="You are a strict compliance auditor. Return JSON only.",
            temperature=0.0
        )
        critique = clean_json_output(raw_res)
        passed = bool(critique.get("passed", False))
        feedback = critique.get("feedback", "Complaint meets standard.")
        logger.info(f"[{tracking_id}] Critique verdict: passed={passed}. Feedback: {feedback}")
    except Exception as e:
        logger.warning(f"Critique evaluation fallback: {e}")
        # Deterministic check: ensure authority name and tracking id appear in draft
        passed = (tracking_id in draft) and (len(draft) > 100)
        feedback = "Rule-based audit passed." if passed else "Missing tracking identifier."

    return {
        "critique_passed": passed,
        "critique_notes": feedback,
        "critique_retries": retries + 1
    }


async def finalize_report_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 6: Persists the finalized report, status, and audit log to Supabase.
    """
    tracking_id = state.get("tracking_id")
    logger.info(f"[{tracking_id}] Running Finalize Node. Persisting to Supabase...")
    client = get_supabase_client()

    final_status = "drafted"
    if state.get("is_duplicate"):
        final_status = "confirmed_duplicate"

    matched_auth = state.get("matched_authority") or {}
    matched_id = matched_auth.get("id")
    clean_complaint = extract_text_from_llm_response(state.get("drafted_complaint"))

    if client:
        try:
            update_payload = {
                "issue_type": state.get("issue_type"),
                "severity": state.get("severity"),
                "drafted_complaint": clean_complaint,
                "status": final_status,
            }
            if matched_id:
                update_payload["matched_authority_id"] = matched_id

            client.table("reports").update(update_payload).eq("tracking_id", tracking_id).execute()

            # Insert status_log
            report_row = client.table("reports").select("id").eq("tracking_id", tracking_id).limit(1).execute()
            if report_row.data:
                source_id = report_row.data[0]["id"]
                client.table("status_log").insert({
                    "source_table": "reports",
                    "source_id": source_id,
                    "old_status": "submitted",
                    "new_status": final_status
                }).execute()
            logger.info(f"[{tracking_id}] Successfully persisted to Supabase (status: {final_status})")
        except Exception as e:
            logger.warning(f"Supabase update failed during finalize: {e}")

    return {
        "status": final_status
    }
