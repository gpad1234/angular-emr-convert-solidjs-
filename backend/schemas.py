"""
schemas.py - Pydantic Validation Schemas (Request / Response Models)
=====================================================================
Pydantic schemas serve two purposes:
  1. INPUT VALIDATION  — FastAPI validates incoming JSON against these schemas
     before the route function is called (returns 422 on failure).
  2. OUTPUT SERIALIZATION — Schemas control which database fields are
     included in responses (never accidentally leak sensitive columns).

Naming convention:
  *Base      — Shared fields used by Create and Read schemas
  *Create    — Fields accepted when POSTing a new resource
  *Update    — Fields accepted when PATCHing (all Optional)
  *Response  — Fields returned to the client (includes id, timestamps, etc.)
  *List      — Paginated list wrapper with metadata

Pydantic v2 note:
  orm_mode = True  →  model_config = ConfigDict(from_attributes=True)
  This allows constructing a schema directly from a SQLAlchemy ORM object:
    GlucoseResponse.model_validate(db_glucose_obj)
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field, computed_field
from models import DiabetesType, GlucoseReadingType, AppointmentStatus, AppointmentType, Gender


# ─────────────────────────────────────────────────────────────────────────────
# Shared ORM config — all Response schemas inherit this
# ─────────────────────────────────────────────────────────────────────────────

class ORMBase(BaseModel):
    """
    Base class for all response schemas.
    from_attributes=True allows SQLAlchemy ORM objects to be passed directly
    to model_validate() instead of manually converting to dicts.
    """
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────────────────────
# Glucose Reading Schemas
# ─────────────────────────────────────────────────────────────────────────────

class GlucoseReadingCreate(BaseModel):
    """Fields required to log a new glucose reading."""
    value_mgdl:       float              = Field(..., gt=0, lt=1000, description="Blood glucose in mg/dL")
    reading_type:     GlucoseReadingType
    reading_datetime: datetime
    device_used:      Optional[str]      = None
    notes:            Optional[str]      = None


class GlucoseReadingResponse(ORMBase):
    """Glucose reading returned to the client."""
    id:               int
    patient_id:       int
    value_mgdl:       float
    reading_type:     GlucoseReadingType
    reading_datetime: datetime
    device_used:      Optional[str]
    notes:            Optional[str]
    created_at:       datetime

    # Computed classification so the frontend can color-code without logic
    @property
    def level_label(self) -> str:
        """Return a human-readable level label for display."""
        v = self.value_mgdl
        if v < 54:   return "Critical Low"
        if v < 70:   return "Low"
        if v <= 130: return "Normal"
        if v <= 180: return "Slightly High"
        if v <= 250: return "High"
        return "Very High"


class GlucoseListResponse(ORMBase):
    """Paginated list of glucose readings."""
    readings: List[GlucoseReadingResponse]
    total:    int       # Total records in DB for this patient
    skip:     int       # Current offset
    limit:    int       # Page size
    has_more: bool      # True if there are more records beyond this page


# ─────────────────────────────────────────────────────────────────────────────
# HbA1c Schemas
# ─────────────────────────────────────────────────────────────────────────────

class HbA1cCreate(BaseModel):
    value_pct:  float = Field(..., gt=0, lt=25, description="HbA1c percentage e.g. 7.2")
    test_date:  date
    lab_name:   Optional[str] = None
    notes:      Optional[str] = None


class HbA1cResponse(ORMBase):
    id:         int
    patient_id: int
    value_pct:  float
    test_date:  date
    lab_name:   Optional[str]
    notes:      Optional[str]
    created_at: datetime

    @computed_field
    @property
    def value_percent(self) -> float:
        """Alias for value_pct — used by frontend components."""
        return self.value_pct


# ─────────────────────────────────────────────────────────────────────────────
# Medication Schemas
# ─────────────────────────────────────────────────────────────────────────────

class MedicationCreate(BaseModel):
    medication_name:      str
    brand_name:           Optional[str] = None
    dosage:               Optional[str] = None
    frequency:            Optional[str] = None
    route:                Optional[str] = None
    start_date:           Optional[date] = None
    end_date:             Optional[date] = None
    prescribing_provider: Optional[str] = None
    notes:                Optional[str] = None


class MedicationResponse(ORMBase):
    id:                   int
    patient_id:           int
    medication_name:      str
    brand_name:           Optional[str]
    dosage:               Optional[str]
    frequency:            Optional[str]
    route:                Optional[str]
    start_date:           Optional[date]
    end_date:             Optional[date]
    prescribing_provider: Optional[str]
    notes:                Optional[str]
    is_active:            bool        # Computed from end_date == None
    created_at:           datetime


# ─────────────────────────────────────────────────────────────────────────────
# Appointment Schemas
# ─────────────────────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    appointment_datetime: datetime
    appointment_type:     AppointmentType
    status:               AppointmentStatus = AppointmentStatus.SCHEDULED
    provider_name:        Optional[str] = None
    location:             Optional[str] = None
    chief_complaint:      Optional[str] = None
    notes:                Optional[str] = None
    follow_up_date:       Optional[date] = None


class AppointmentResponse(ORMBase):
    id:                   int
    patient_id:           int
    appointment_datetime: datetime
    appointment_type:     AppointmentType
    status:               AppointmentStatus
    provider_name:        Optional[str]
    location:             Optional[str]
    chief_complaint:      Optional[str]
    notes:                Optional[str]
    follow_up_date:       Optional[date]
    created_at:           datetime


# ─────────────────────────────────────────────────────────────────────────────
# Blood Pressure Schemas
# ─────────────────────────────────────────────────────────────────────────────

class BloodPressureCreate(BaseModel):
    systolic:         int = Field(..., gt=50, lt=300)
    diastolic:        int = Field(..., gt=30, lt=200)
    pulse:            Optional[int] = None
    reading_datetime: datetime
    notes:            Optional[str] = None


class BloodPressureResponse(ORMBase):
    id:               int
    patient_id:       int
    systolic:         int
    diastolic:        int
    pulse:            Optional[int]
    reading_datetime: datetime
    notes:            Optional[str]
    created_at:       datetime


# ─────────────────────────────────────────────────────────────────────────────
# Patient Schemas
# ─────────────────────────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    """Fields shared between Create and Response schemas."""
    first_name:            str
    last_name:             str
    date_of_birth:         date
    gender:                Gender
    phone:                 Optional[str]  = None
    email:                 Optional[str]  = None
    diabetes_type:         DiabetesType
    diagnosis_date:        Optional[date] = None
    weight_kg:             Optional[float] = None
    height_cm:             Optional[float] = None
    insurance_id:          Optional[str]  = None
    primary_care_provider: Optional[str]  = None
    notes:                 Optional[str]  = None


class PatientCreate(PatientBase):
    """Schema for POST /patients — all required fields from PatientBase."""
    pass


class PatientResponse(ORMBase, PatientBase):
    """Patient record returned from the API. Includes id and timestamps."""
    id:         int
    created_at: datetime
    updated_at: datetime

    # ── Computed fields ──────────────────────────────────────────────────────
    # These are calculated on the fly from stored height/weight
    bmi:        Optional[float] = None    # Populated in the router layer


class PatientInfoResponse(ORMBase):
    """Patient demographics — nested inside PatientSummaryResponse."""
    id:                    int
    first_name:            str
    last_name:             str
    date_of_birth:         date
    gender:                Gender
    phone:                 Optional[str]
    email:                 Optional[str]
    diabetes_type:         DiabetesType
    diagnosis_date:        Optional[date]
    weight_kg:             Optional[float]
    height_cm:             Optional[float]
    bmi:                   Optional[float]
    insurance_id:          Optional[str]
    primary_care_provider: Optional[str]
    notes:                 Optional[str]
    created_at:            datetime
    updated_at:            datetime


class PatientSummaryResponse(BaseModel):
    """
    Full patient clinical summary.
    The `patient` key holds demographics; all other keys are clinical data.
    Used for the patient detail page — one request returns everything needed
    to render the patient dashboard without additional API calls.
    """
    patient:               PatientInfoResponse

    # Latest clinical snapshot (most recent only — not full history)
    latest_hba1c:          Optional[HbA1cResponse]         = None
    latest_glucose:        Optional[GlucoseReadingResponse] = None
    latest_bp:             Optional[BloodPressureResponse]  = None
    active_medications:    List[MedicationResponse]         = []
    recent_hba1c:          List[HbA1cResponse]              = []   # Last 4 readings for trend
    upcoming_appointments: List[AppointmentResponse]        = []


class PatientListResponse(BaseModel):
    """Paginated list of patients with search and filter metadata."""
    patients:     List[PatientResponse]
    total:        int        # Total patients matching the current filter
    skip:         int
    limit:        int
    has_more:     bool       # Frontend uses this to show/hide "Load More" button


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard Stats Schema
# ─────────────────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    """
    Aggregate statistics for the EMR dashboard.
    Gives a quick clinical overview without iterating individual records.
    """
    total_patients:              int
    by_diabetes_type:            dict   # {"Type 2": 9, "Type 1": 3, ...}
    avg_hba1c_last_30_days:      Optional[float]   # Population average
    high_hba1c_count:            int    # Patients with HbA1c > 9% (at-risk)
    recent_hypoglycemia_count:   int    # Glucose readings < 70 in last 7 days
    active_medications_count:    int
