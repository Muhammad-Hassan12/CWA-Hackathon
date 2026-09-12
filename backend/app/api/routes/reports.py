import random
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.schemas.reports import (
    CivicReportCreate,
    CivicReportResponse,
    BillReportCreate,
    BillReportResponse,
)
from app.agents.state import NigraanState
from app.agents.orchestrator import run_orchestrator_background
from app.core.supabase import get_supabase_client

router = APIRouter(tags=["Reports"])
logger = logging.getLogger(__name__)

# In-memory storage cache for local fallback when Supabase is initializing
LOCAL_REPORTS_STORE = {}


def generate_tracking_id(area: str, prefix: str = "CIV") -> str:
    area_code = "".join([c for c in area[:3] if c.isalpha()]).upper() or prefix
    num = random.randint(1000, 9999)
    return f"{area_code}-2026-{num}"


@router.post("/reports", response_model=CivicReportResponse)
async def create_civic_report(report_in: CivicReportCreate, background_tasks: BackgroundTasks):
    """
    Phase 1 endpoint: Accepts citizen intake, creates initial report, generates tracking ID,
    dispatches LangGraph orchestrator to background, and returns tracking_id immediately.
    """
    tracking_id = generate_tracking_id(report_in.area)
    now_iso = datetime.now(timezone.utc).isoformat()
    client = get_supabase_client()

    report_row_id = None
    if client:
        try:
            res = client.table("reports").insert({
                "tracking_id": tracking_id,
                "issue_type": report_in.issue_type,
                "description": report_in.description,
                "area": report_in.area,
                "lat": report_in.lat,
                "lng": report_in.lng,
                "status": "submitted",
                "confirm_count": 1,
            }).execute()
            if res.data:
                report_row_id = res.data[0]["id"]
            logger.info(f"Report inserted into Supabase with tracking ID {tracking_id}")
        except Exception as e:
            logger.warning(f"Failed to insert initial report in Supabase ({e}). Using local fallback store.")

    # Cache locally as well
    LOCAL_REPORTS_STORE[tracking_id] = {
        "tracking_id": tracking_id,
        "issue_type": report_in.issue_type,
        "description": report_in.description,
        "area": report_in.area,
        "lat": report_in.lat,
        "lng": report_in.lng,
        "status": "submitted",
        "confirm_count": 1,
        "created_at": now_iso,
        "drafted_complaint": None,
        "matched_authority": None,
    }

    # Initial state for LangGraph orchestrator
    initial_state: NigraanState = {
        "mode": "civic_issue",
        "tracking_id": tracking_id,
        "report_id": report_row_id,
        "description": report_in.description,
        "area": report_in.area,
        "lat": report_in.lat,
        "lng": report_in.lng,
        "photo_base64": report_in.photo_base64,
        "issue_type": report_in.issue_type,
        "status": "submitted",
        "created_at": now_iso,
        "critique_retries": 0,
        "is_duplicate": False,
    }

    # Dispatch agent in background task
    background_tasks.add_task(run_orchestrator_background, initial_state)

    return CivicReportResponse(
        tracking_id=tracking_id,
        status="submitted",
        issue_type=report_in.issue_type,
        area=report_in.area,
        message="Report registered in Public Ledger. Agent verification and complaint drafting initiated.",
        created_at=now_iso,
    )


@router.get("/reports/{tracking_id}")
async def get_report_status(tracking_id: str):
    """
    Fetches the live status, drafted complaint, and matched authority of a report.
    """
    client = get_supabase_client()
    if client:
        try:
            res = (
                client.table("reports")
                .select("*, authority_mandates(*)")
                .eq("tracking_id", tracking_id)
                .limit(1)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning(f"Error reading report {tracking_id} from Supabase: {e}")

    # Check local store
    if tracking_id in LOCAL_REPORTS_STORE:
        return LOCAL_REPORTS_STORE[tracking_id]

    raise HTTPException(status_code=404, detail="Report not found in Public Ledger")


@router.post("/reports/{tracking_id}/mark-resolved")
async def mark_report_resolved(tracking_id: str):
    """
    §8 Endpoint: Self-reported resolution by citizen.
    Explicitly marked as 'resolved_self_reported' to prevent false official closure claims.
    Logs transition in status_log table.
    """
    clean_id = tracking_id.strip().upper()
    client = get_supabase_client()
    now_iso = datetime.now(timezone.utc).isoformat()
    old_status = "drafted"
    row_id = None

    if client:
        try:
            # Check existing report
            fetch_res = client.table("reports").select("id, status").eq("tracking_id", clean_id).execute()
            if fetch_res.data:
                row = fetch_res.data[0]
                row_id = row["id"]
                old_status = row.get("status", "drafted")

            # Update status in reports table
            update_res = client.table("reports").update({
                "status": "resolved_self_reported"
            }).eq("tracking_id", clean_id).execute()

            # Record audit event in status_log
            if row_id:
                try:
                    client.table("status_log").insert({
                        "source_table": "reports",
                        "source_id": row_id,
                        "old_status": old_status,
                        "new_status": "resolved_self_reported",
                    }).execute()
                    logger.info(f"Audit status_log logged for report {clean_id}")
                except Exception as log_err:
                    logger.warning(f"Could not insert status_log: {log_err}")

            if update_res.data:
                logger.info(f"Report {clean_id} marked as resolved_self_reported in Supabase")
                # Update local cache
                if clean_id in LOCAL_REPORTS_STORE:
                    LOCAL_REPORTS_STORE[clean_id]["status"] = "resolved_self_reported"
                return {
                    "success": True,
                    "tracking_id": clean_id,
                    "status": "resolved_self_reported",
                    "disclaimer": "Self-reported by citizen; not an official authority closure certificate.",
                    "resolved_at": now_iso
                }
        except Exception as e:
            logger.warning(f"Error marking report {clean_id} resolved in Supabase: {e}")

    # Fallback to local store
    if clean_id in LOCAL_REPORTS_STORE:
        LOCAL_REPORTS_STORE[clean_id]["status"] = "resolved_self_reported"
        return {
            "success": True,
            "tracking_id": clean_id,
            "status": "resolved_self_reported",
            "disclaimer": "Self-reported by citizen; not an official authority closure certificate.",
            "resolved_at": now_iso
        }

    raise HTTPException(status_code=404, detail="Tracking ID not found in Public Register")


LOCAL_BILLS_STORE = {}


@router.post("/bills", response_model=BillReportResponse)
async def create_bill_report(bill_in: BillReportCreate, background_tasks: BackgroundTasks):
    """
    Phase 3 endpoint: Accepts utility bill verification intake, generates tracking ID,
    dispatches LangGraph Billing Subgraph to background, and returns tracking receipt immediately.
    """
    provider_prefix = "KE" if "electric" in bill_in.provider.lower() else "SSGC"
    tracking_id = f"{provider_prefix}-2026-{random.randint(1000, 9999)}"
    now_iso = datetime.now(timezone.utc).isoformat()

    client = get_supabase_client()
    if client:
        try:
            client.table("bills").insert({
                "tracking_id": tracking_id,
                "provider": bill_in.provider,
                "tariff_category": bill_in.tariff_category or "Residential-Unprotected",
                "units_billed": bill_in.units_billed,
                "amount_billed": bill_in.amount_billed,
                "verdict": "verifying",
            }).execute()
            logger.info(f"Initial bill row inserted for {tracking_id}")
        except Exception as e:
            logger.warning(f"Supabase bills insert failed: {e}")

    LOCAL_BILLS_STORE[tracking_id] = {
        "tracking_id": tracking_id,
        "provider": bill_in.provider,
        "tariff_category": bill_in.tariff_category or "Residential-Unprotected",
        "units_billed": bill_in.units_billed,
        "amount_billed": bill_in.amount_billed,
        "verdict": "verifying",
        "created_at": now_iso,
    }

    initial_state: NigraanState = {
        "mode": "billing_verify",
        "tracking_id": tracking_id,
        "provider": bill_in.provider,
        "tariff_category": bill_in.tariff_category or "Residential-Unprotected",
        "units_billed": bill_in.units_billed,
        "amount_billed": bill_in.amount_billed,
        "photo_base64": bill_in.photo_base64,
        "status": "submitted",
        "created_at": now_iso,
        "critique_retries": 0,
    }

    # Dispatch LangGraph billing subgraph in background
    background_tasks.add_task(run_orchestrator_background, initial_state)

    return BillReportResponse(
        tracking_id=tracking_id,
        provider=bill_in.provider,
        status="submitted",
        created_at=now_iso,
    )


@router.get("/bills/{tracking_id}")
async def get_bill_status(tracking_id: str):
    """
    Fetches the live verification result, itemized math breakdown, verdict, and dispute letter.
    """
    client = get_supabase_client()
    if client:
        try:
            res = (
                client.table("bills")
                .select("*")
                .eq("tracking_id", tracking_id)
                .limit(1)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning(f"Error fetching bill {tracking_id} from Supabase: {e}")

    if tracking_id in LOCAL_BILLS_STORE:
        return LOCAL_BILLS_STORE[tracking_id]

    raise HTTPException(status_code=404, detail="Bill record not found in Public Ledger")
