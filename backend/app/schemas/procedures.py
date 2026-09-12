from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime, timezone


class RequiredDocumentItem(BaseModel):
    id: Optional[str] = None
    document_name: str
    notes: Optional[str] = None
    is_mandatory: bool = True


class AuthorityItem(BaseModel):
    id: Optional[str] = None
    office_name: str
    address: Optional[str] = None
    hours_text: Optional[str] = None
    contact_info: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class RoadmapStepItem(BaseModel):
    id: Optional[str] = None
    step_order: int
    description: str
    requires_witness: bool = False
    estimated_duration: Optional[str] = None


class ProcedureResponse(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    last_verified_at: str
    source_url: str
    required_documents: List[RequiredDocumentItem] = []
    authorities: List[AuthorityItem] = []
    roadmap_steps: List[RoadmapStepItem] = []


class ProcedureLookupRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Procedure search query")


class ExploitationSignalCreate(BaseModel):
    procedure_id: Optional[str] = None
    authority_id: Optional[str] = None
    reported_amount: Optional[float] = None
    note: str = Field(..., min_length=5, description="Brief anonymous description of extortion or extra bribe demanded at counter")


class ExploitationSignalResponse(BaseModel):
    status: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
