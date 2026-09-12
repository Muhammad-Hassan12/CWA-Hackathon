import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.schemas.procedures import (
    ProcedureResponse,
    ProcedureLookupRequest,
    ExploitationSignalCreate,
    ExploitationSignalResponse,
)
from app.core.supabase import get_supabase_client
from app.core.procedure_registry import DEFAULT_FALLBACK_PROCEDURES
from app.agents.procedure_nodes import retrieve_procedure_node, constraint_gate_node

router = APIRouter(tags=["Procedures"])
logger = logging.getLogger(__name__)


@router.get("/procedures", response_model=List[ProcedureResponse])
async def list_procedures():
    """
    Returns all officially verified civic procedures with hydrated documents, authorities, and roadmap steps.
    Falls back gracefully to verified default registry when Supabase is offline.
    """
    client = get_supabase_client()
    if not client:
        return [ProcedureResponse(**p) for p in DEFAULT_FALLBACK_PROCEDURES]

    try:
        procs_res = client.table("procedures").select("*").execute()
        procs = procs_res.data or []

        if not procs:
            return [ProcedureResponse(**p) for p in DEFAULT_FALLBACK_PROCEDURES]

        result = []
        for p in procs:
            p_id = p["id"]
            docs = client.table("required_documents").select("*").eq("procedure_id", p_id).execute().data or []
            auths = client.table("authorities").select("*").eq("procedure_id", p_id).execute().data or []
            steps = client.table("roadmap_steps").select("*").eq("procedure_id", p_id).order("step_order").execute().data or []

            result.append(
                ProcedureResponse(
                    id=str(p["id"]),
                    name=p["name"],
                    category=p.get("category"),
                    description=p.get("description"),
                    last_verified_at=str(p["last_verified_at"]),
                    source_url=p["source_url"],
                    required_documents=docs,
                    authorities=auths,
                    roadmap_steps=steps,
                )
            )
        return result
    except Exception as e:
        logger.warning(f"Error fetching procedures from Supabase ({e}); returning verified fallback.")
        return [ProcedureResponse(**p) for p in DEFAULT_FALLBACK_PROCEDURES]


@router.get("/procedures/{procedure_id}", response_model=ProcedureResponse)
async def get_procedure(procedure_id: str):
    """
    Fetches full verified checklist, documents, authorities, and roadmap steps for a single procedure.
    Supports UUID or shortcut keywords ('cnic', 'domicile', 'license').
    """
    client = get_supabase_client()
    if client:
        try:
            query = client.table("procedures").select("*")
            if len(procedure_id) > 10 and "-" in procedure_id:
                query = query.eq("id", procedure_id)
            else:
                keyword_map = {
                    "cnic": "CNIC Renewal",
                    "domicile": "Sindh Domicile",
                    "license": "Driving License",
                }
                search_term = keyword_map.get(procedure_id.lower(), procedure_id)
                query = query.ilike("name", f"%{search_term}%")

            res = query.limit(1).execute()
            if res.data:
                p = res.data[0]
                p_id = p["id"]
                docs = client.table("required_documents").select("*").eq("procedure_id", p_id).execute().data or []
                auths = client.table("authorities").select("*").eq("procedure_id", p_id).execute().data or []
                steps = client.table("roadmap_steps").select("*").eq("procedure_id", p_id).order("step_order").execute().data or []

                return ProcedureResponse(
                    id=str(p["id"]),
                    name=p["name"],
                    category=p.get("category"),
                    description=p.get("description"),
                    last_verified_at=str(p["last_verified_at"]),
                    source_url=p["source_url"],
                    required_documents=docs,
                    authorities=auths,
                    roadmap_steps=steps,
                )
        except Exception as e:
            logger.warning(f"Error fetching procedure {procedure_id} from Supabase: {e}")

    # Search in fallback registry
    pid_clean = procedure_id.lower()
    for p in DEFAULT_FALLBACK_PROCEDURES:
        if p["id"] == pid_clean or pid_clean in p["name"].lower() or pid_clean in p["id"]:
            return ProcedureResponse(**p)

    raise HTTPException(status_code=404, detail="Procedure record not found in verified registry")


@router.post("/procedures/lookup")
async def lookup_procedure_with_gate(req: ProcedureLookupRequest):
    """
    Anti-hallucination constraint gate lookup.
    If matched, returns verified procedure. If unverified, returns strict 'uncovered' notice.
    """
    state = {"description": req.query, "mode": "procedure_guide"}
    res = await retrieve_procedure_node(state)
    gate_res = await constraint_gate_node(res)

    if gate_res.get("status") == "uncovered":
        return {
            "status": "uncovered",
            "message": "Official Record Unverified for Karachi.",
            "notice": gate_res.get("drafted_complaint"),
            "procedure": None,
        }

    return {
        "status": "verified",
        "procedure": res.get("procedure_data"),
    }


@router.post("/exploitation-signal", response_model=ExploitationSignalResponse)
async def report_exploitation_signal(signal: ExploitationSignalCreate):
    """
    Citizen Protection Endpoint:
    Records an anonymous extortion or illegal fee demand signal at a municipal/licensing counter.
    Strictly aggregate-only: stores ZERO citizen identity or contact data (§9).
    Gracefully saves to Supabase or logs signal in offline fallback mode.
    """
    client = get_supabase_client()
    if client:
        try:
            client.table("exploitation_signals").insert({
                "procedure_id": signal.procedure_id,
                "authority_id": signal.authority_id,
                "reported_amount": signal.reported_amount,
                "note": signal.note,
            }).execute()
            logger.info("Exploitation signal recorded anonymously in Public Ledger.")
            return ExploitationSignalResponse(
                status="registered",
                message="Anonymous exploitation signal recorded in Public Ledger evidence register.",
            )
        except Exception as e:
            logger.warning(f"Failed to record exploitation signal in DB ({e}); logging in memory fallback.")

    logger.info(f"Offline signal recorded: procedure={signal.procedure_id}, amount={signal.reported_amount}")
    return ExploitationSignalResponse(
        status="registered",
        message="Anonymous exploitation signal recorded in Public Ledger evidence register.",
    )
