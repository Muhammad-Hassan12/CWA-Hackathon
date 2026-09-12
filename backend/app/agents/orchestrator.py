import logging
from langgraph.graph import StateGraph, END
from app.agents.state import NigraanState
from app.agents.civic_nodes import (
    extract_and_classify_node,
    verify_mandate_node,
    dedup_check_node,
    draft_complaint_node,
    critique_node,
    finalize_report_node,
)
from app.agents.billing_nodes import (
    extract_bill_node,
    recompute_tariff_node,
    draft_billing_dispute_node,
    critique_bill_node,
    finalize_bill_node,
)

logger = logging.getLogger(__name__)


# Router function
def route_mode(state: NigraanState) -> str:
    mode = state.get("mode", "civic_issue")
    if mode == "civic_issue":
        return "extract_and_classify"
    elif mode == "billing_verify":
        return "extract_bill"
    elif mode == "procedure_guide":
        return "procedure_stub"
    return "extract_and_classify"


# Conditional edge for civic deduplication
def check_duplicate_route(state: NigraanState) -> str:
    if state.get("is_duplicate"):
        logger.info(f"[{state.get('tracking_id')}] Routing to finalize directly as duplicate.")
        return "finalize_report"
    return "draft_complaint"


# Conditional edge for Civic Critique / Revise Loop (§0 rule 4)
def should_retry_draft(state: NigraanState) -> str:
    passed = state.get("critique_passed", False)
    retries = state.get("critique_retries", 0)
    
    if not passed and retries < 2:
        logger.info(f"[{state.get('tracking_id')}] Critique rejected draft. Bouncing back to draft_complaint (attempt {retries + 1})...")
        return "draft_complaint"
    
    logger.info(f"[{state.get('tracking_id')}] Critique passed or max retries ({retries}) reached. Advancing to finalize.")
    return "finalize_report"


# Conditional edge for Billing Verdict (Flagged overcharge vs Correct)
def check_bill_verdict_route(state: NigraanState) -> str:
    verdict = state.get("verdict", "correct")
    if verdict == "flagged":
        logger.info(f"[{state.get('tracking_id')}] Bill flagged for overcharge. Routing to draft_billing_dispute...")
        return "draft_billing_dispute"
    logger.info(f"[{state.get('tracking_id')}] Bill verified accurate against NEPRA tariff. Finalizing...")
    return "finalize_bill"


# Stub node for procedures (Phase 4)
async def procedure_stub_node(state: NigraanState) -> NigraanState:
    logger.info("Procedure stub node reached.")
    return state


def build_orchestrator():
    workflow = StateGraph(NigraanState)

    # 1. Civic Issue Subgraph Nodes
    workflow.add_node("extract_and_classify", extract_and_classify_node)
    workflow.add_node("verify_mandate", verify_mandate_node)
    workflow.add_node("dedup_check", dedup_check_node)
    workflow.add_node("draft_complaint", draft_complaint_node)
    workflow.add_node("critique", critique_node)
    workflow.add_node("finalize_report", finalize_report_node)

    # 2. Billing Verify Subgraph Nodes (Phase 3)
    workflow.add_node("extract_bill", extract_bill_node)
    workflow.add_node("recompute_tariff", recompute_tariff_node)
    workflow.add_node("draft_billing_dispute", draft_billing_dispute_node)
    workflow.add_node("critique_bill", critique_bill_node)
    workflow.add_node("finalize_bill", finalize_bill_node)

    # 3. Procedure Stub (Phase 4)
    workflow.add_node("procedure_stub", procedure_stub_node)

    # Entry point router based on mode
    workflow.set_conditional_entry_point(
        route_mode,
        {
            "extract_and_classify": "extract_and_classify",
            "extract_bill": "extract_bill",
            "procedure_stub": "procedure_stub",
        }
    )

    # Civic Subgraph Edges
    workflow.add_edge("extract_and_classify", "verify_mandate")
    workflow.add_edge("verify_mandate", "dedup_check")
    workflow.add_conditional_edges(
        "dedup_check",
        check_duplicate_route,
        {
            "draft_complaint": "draft_complaint",
            "finalize_report": "finalize_report",
        }
    )
    workflow.add_edge("draft_complaint", "critique")
    workflow.add_conditional_edges(
        "critique",
        should_retry_draft,
        {
            "draft_complaint": "draft_complaint",
            "finalize_report": "finalize_report",
        }
    )
    workflow.add_edge("finalize_report", END)

    # Billing Subgraph Edges (Phase 3)
    workflow.add_edge("extract_bill", "recompute_tariff")
    workflow.add_conditional_edges(
        "recompute_tariff",
        check_bill_verdict_route,
        {
            "draft_billing_dispute": "draft_billing_dispute",
            "finalize_bill": "finalize_bill",
        }
    )
    workflow.add_edge("draft_billing_dispute", "critique_bill")
    workflow.add_edge("critique_bill", "finalize_bill")
    workflow.add_edge("finalize_bill", END)

    # Procedure Stub Edge
    workflow.add_edge("procedure_stub", END)

    return workflow.compile()


# Singleton compiled graph
orchestrator = build_orchestrator()


async def run_orchestrator_background(initial_state: NigraanState):
    """
    Executes the LangGraph pipeline in background task without blocking citizen HTTP response.
    """
    try:
        tracking_id = initial_state.get("tracking_id")
        logger.info(f"[{tracking_id}] Starting LangGraph Orchestrator in mode '{initial_state.get('mode')}'...")
        final_state = await orchestrator.ainvoke(initial_state)
        logger.info(f"[{tracking_id}] LangGraph Orchestrator completed. Final Status: {final_state.get('status')}")
        return final_state
    except Exception as e:
        logger.error(f"[{initial_state.get('tracking_id')}] Orchestrator execution error: {e}", exc_info=True)
