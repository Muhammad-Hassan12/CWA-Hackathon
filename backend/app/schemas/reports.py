from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class CivicReportCreate(BaseModel):
    issue_type: Optional[str] = Field(None, description="Optional user hint: garbage, pothole, water, sewage, electricity, streetlight")
    description: str = Field(..., min_length=5, description="Citizen's description of the issue")
    area: str = Field(..., description="Karachi area e.g. Korangi, Clifton, Saddar, Gulshan-e-Iqbal, DHA, Malir, North Nazimabad")
    lat: Optional[float] = Field(None, description="GPS Latitude")
    lng: Optional[float] = Field(None, description="GPS Longitude")
    photo_base64: Optional[str] = Field(None, description="Optional base64-encoded image string or data URL")


class CivicReportResponse(BaseModel):
    tracking_id: str
    status: str
    issue_type: Optional[str] = None
    area: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BillReportCreate(BaseModel):
    provider: str = Field(default="K-Electric", description="K-Electric or SSGC")
    tariff_category: Optional[str] = Field(None, description="Residential-Protected or Residential-Unprotected")
    units_billed: Optional[float] = None
    amount_billed: Optional[float] = None
    photo_base64: Optional[str] = None


class BillReportResponse(BaseModel):
    tracking_id: str
    provider: str
    status: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
