from typing import TypedDict, Optional, Dict, Any, List


class NigraanState(TypedDict, total=False):
    # Orchestrator routing
    mode: str  # 'civic_issue' | 'billing_verify' | 'procedure_guide'
    
    # Common identification
    tracking_id: str
    report_id: Optional[str]
    created_at: str
    
    # Civic Issue Inputs
    description: str
    area: str
    lat: Optional[float]
    lng: Optional[float]
    photo_base64: Optional[str]
    photo_url: Optional[str]
    
    # Civic Agent Internal State
    issue_type: Optional[str]
    severity: Optional[str]
    extraction_notes: Optional[str]
    matched_authority: Optional[Dict[str, Any]]
    
    # Deduplication
    is_duplicate: bool
    duplicate_of_id: Optional[str]
    duplicate_of_tracking_id: Optional[str]
    confirm_count: int
    
    # Draft & Critique loop
    drafted_complaint: Optional[str]
    critique_passed: bool
    critique_notes: Optional[str]
    critique_retries: int
    
    # Billing Verify State (Phase 3)
    provider: Optional[str]
    tariff_category: Optional[str]
    units_billed: Optional[float]
    amount_billed: Optional[float]
    amount_expected: Optional[float]
    discrepancy: Optional[float]
    overcharge_pct: Optional[float]
    verdict: Optional[str]  # 'correct' | 'flagged'
    math_breakdown: Optional[Dict[str, Any]]

    # Final state
    status: str  # 'submitted' | 'drafted' | 'confirmed_duplicate' | 'correct' | 'flagged' | 'error'
    error_message: Optional[str]
