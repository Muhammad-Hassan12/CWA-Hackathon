import logging
from typing import Dict, Any, Optional, List
from app.agents.state import NigraanState
from app.core.supabase import get_supabase_client
from app.core.procedure_registry import DEFAULT_FALLBACK_PROCEDURES

logger = logging.getLogger(__name__)


async def retrieve_procedure_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 1: Retrieves official published procedure record from Supabase or verified registry.
    """
    query = (state.get("description") or state.get("tracking_id") or "").strip().lower()
    logger.info(f"Running Procedure Retrieval for query: '{query}'...")

    client = get_supabase_client()
    matched_proc = None
    docs = []
    auths = []
    steps = []

    if client:
        try:
            # Match against procedures table
            res = client.table("procedures").select("*").execute()
            candidates = res.data or []

            for p in candidates:
                p_name = p.get("name", "").lower()
                p_cat = (p.get("category") or "").lower()
                # Keyword check
                if any(w in p_name or w in p_cat for w in query.split() if len(w) > 2) or query in p_name:
                    matched_proc = p
                    break

            # If still not matched, check common synonyms
            if not matched_proc:
                if any(w in query for w in ["cnic", "nadra", "identity", "smart card"]):
                    for p in candidates:
                        if "cnic" in p.get("name", "").lower():
                            matched_proc = p
                            break
                elif any(w in query for w in ["domicile", "prc", "residence"]):
                    for p in candidates:
                        if "domicile" in p.get("name", "").lower():
                            matched_proc = p
                            break
                elif any(w in query for w in ["license", "driving", "driving license", "police"]):
                    for p in candidates:
                        if "driving" in p.get("name", "").lower() or "license" in p.get("name", "").lower():
                            matched_proc = p
                            break

            # If matched, hydrate related tables
            if matched_proc:
                p_id = matched_proc["id"]
                docs_res = client.table("required_documents").select("*").eq("procedure_id", p_id).execute()
                docs = docs_res.data or []

                auth_res = client.table("authorities").select("*").eq("procedure_id", p_id).execute()
                auths = auth_res.data or []

                steps_res = client.table("roadmap_steps").select("*").eq("procedure_id", p_id).order("step_order").execute()
                steps = steps_res.data or []

        except Exception as e:
            logger.warning(f"Error retrieving procedure from Supabase: {e}")

    # Fallback to local verified registry if not found via Supabase
    if not matched_proc:
        for p in DEFAULT_FALLBACK_PROCEDURES:
            p_name = p["name"].lower()
            p_cat = (p.get("category") or "").lower()
            p_id = p["id"].lower()
            
            # Keyword or synonym matching
            if (
                p_id in query or
                p_name in query or
                query in p_name or
                any(w in p_name or w in p_cat for w in query.split() if len(w) > 2)
            ):
                matched_proc = p
                docs = p.get("required_documents", [])
                auths = p.get("authorities", [])
                steps = p.get("roadmap_steps", [])
                break

        if not matched_proc:
            if any(w in query for w in ["cnic", "nadra", "identity", "smart card"]):
                matched_proc = DEFAULT_FALLBACK_PROCEDURES[0]
            elif any(w in query for w in ["domicile", "prc", "residence"]):
                matched_proc = DEFAULT_FALLBACK_PROCEDURES[1]
            elif any(w in query for w in ["license", "driving", "driving license", "police"]):
                matched_proc = DEFAULT_FALLBACK_PROCEDURES[2]

            if matched_proc:
                docs = matched_proc.get("required_documents", [])
                auths = matched_proc.get("authorities", [])
                steps = matched_proc.get("roadmap_steps", [])

    if matched_proc:
        return {
            "procedure_data": {
                **matched_proc,
                "required_documents": docs,
                "authorities": auths,
                "roadmap_steps": steps,
            },
            "status": "verified_found",
        }

    return {
        "procedure_data": None,
        "status": "uncovered",
    }


async def constraint_gate_node(state: NigraanState) -> Dict[str, Any]:
    """
    Node 2: Constraint Gate (§7 Phase 4).
    If query is not covered in verified tables, returns explicit notice.
    NEVER allows LLM to invent requirements or hallucinate a checklist.
    """
    proc_data = state.get("procedure_data")
    if not proc_data:
        logger.warning("Constraint Gate triggered: Query is not covered in verified tables. Blocking LLM generation.")
        return {
            "drafted_complaint": (
                "OFFICIAL NOTICE: PROCEDURE NOT COVERED YET\n"
                "Nigraan strictly enforces anti-hallucination protocols for civic processes. "
                "The requested procedure has not yet been audited and verified against official gazette publications for Karachi. "
                "To protect citizens from administrative misinformation, unverified checklists will not be generated."
            ),
            "status": "uncovered",
        }

    return {"status": "gate_passed"}
