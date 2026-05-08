"""
routers/patients.py - Patient CRUD Endpoints
=============================================
Provides REST endpoints for:
  GET  /api/v1/patients              — Paginated patient list with search/filter
  GET  /api/v1/patients/{id}         — Single patient record with BMI
  GET  /api/v1/patients/{id}/summary — Full clinical summary (all related data)

Pagination Design:
  All list endpoints use skip/limit (offset pagination). The response
  includes `total` and `has_more` so the frontend can render a
  "Load More" button without knowing the full count upfront.

  To extend with cursor-based pagination (more efficient for large datasets),
  replace `skip` with a `cursor` (last seen ID) query parameter.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime

from database import get_db
from models import Patient, HbA1cReading, GlucoseReading, BloodPressureReading, Medication, Appointment
from schemas import (
    PatientResponse, PatientCreate, PatientListResponse,
    PatientSummaryResponse, PatientInfoResponse, HbA1cResponse, GlucoseReadingResponse,
    BloodPressureResponse, MedicationResponse, AppointmentResponse
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# List Patients (with pagination and search)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/patients", response_model=PatientListResponse)
def list_patients(
    skip:          int           = Query(0,    ge=0,   description="Number of records to skip (offset)"),
    limit:         int           = Query(10,   ge=1, le=50, description="Max records to return (page size)"),
    search:        Optional[str] = Query(None, description="Search by first or last name"),
    diabetes_type: Optional[str] = Query(None, description="Filter by diabetes type (e.g. 'Type 2')"),
    db:            Session       = Depends(get_db),
):
    """
    Return a paginated list of patients.

    ### Pagination
    Use `skip` and `limit` to page through results:
    - Page 1: skip=0,  limit=10
    - Page 2: skip=10, limit=10
    - Page 3: skip=20, limit=10

    The response includes `has_more: true` when more records exist beyond
    the current page — use this to show/hide the "Load More" button.

    ### Filters
    - `search`: Case-insensitive substring match on first_name or last_name
    - `diabetes_type`: Exact match on diabetes_type field
    """
    # Build the base query
    query = db.query(Patient)

    # Apply search filter (case-insensitive LIKE on name fields)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Patient.first_name.ilike(pattern)) |
            (Patient.last_name.ilike(pattern))
        )

    # Apply diabetes type filter
    if diabetes_type:
        query = query.filter(Patient.diabetes_type == diabetes_type)

    # Get total count BEFORE applying skip/limit (needed for pagination math)
    total = query.count()

    # Apply ordering, offset, and limit for the current page
    patients = (
        query
        .order_by(Patient.last_name, Patient.first_name)
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Build response objects, computing BMI for each patient
    items = []
    for p in patients:
        p_dict = {
            "id":            p.id,
            "first_name":    p.first_name,
            "last_name":     p.last_name,
            "date_of_birth": p.date_of_birth,
            "gender":        p.gender,
            "phone":         p.phone,
            "email":         p.email,
            "diabetes_type": p.diabetes_type,
            "diagnosis_date": p.diagnosis_date,
            "weight_kg":     p.weight_kg,
            "height_cm":     p.height_cm,
            "bmi":           p.bmi(),   # Computed property on the model
            "insurance_id":  p.insurance_id,
            "primary_care_provider": p.primary_care_provider,
            "notes":         p.notes,
            "created_at":    p.created_at,
            "updated_at":    p.updated_at,
        }
        items.append(PatientResponse(**p_dict))

    return PatientListResponse(
        patients=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total,   # Are there records past this page?
    )


# ─────────────────────────────────────────────────────────────────────────────
# Get Single Patient
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db:         Session = Depends(get_db),
):
    """
    Return a single patient record by ID.
    Raises 404 if the patient does not exist.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    return PatientResponse(
        **{c.name: getattr(patient, c.name) for c in Patient.__table__.columns},
        bmi=patient.bmi(),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Patient Clinical Summary (full detail page data)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}/summary", response_model=PatientSummaryResponse)
def get_patient_summary(
    patient_id: int,
    db:         Session = Depends(get_db),
):
    """
    Return a patient's full clinical summary in a single request.

    This endpoint exists to minimize API calls from the patient detail page.
    Instead of 5 separate requests (patient, glucose, HbA1c, meds, appointments),
    the frontend makes one request and gets everything needed to render the dashboard.

    Returns:
    - All patient demographics
    - Latest glucose reading
    - Latest blood pressure reading
    - Latest HbA1c + last 4 readings for trend chart
    - All active medications
    - Upcoming appointments (next 3)
    """
    # Fetch the patient or 404
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # ── Latest glucose reading ────────────────────────────────────────────────
    latest_glucose_orm = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.patient_id == patient_id)
        .order_by(desc(GlucoseReading.reading_datetime))
        .first()
    )
    latest_glucose = GlucoseReadingResponse.model_validate(latest_glucose_orm) if latest_glucose_orm else None

    # ── HbA1c trend (last 4 readings for chart) ───────────────────────────────
    hba1c_records = (
        db.query(HbA1cReading)
        .filter(HbA1cReading.patient_id == patient_id)
        .order_by(desc(HbA1cReading.test_date))
        .limit(4)
        .all()
    )
    recent_hba1c = [HbA1cResponse.model_validate(h) for h in hba1c_records]
    latest_hba1c = recent_hba1c[0] if recent_hba1c else None

    # ── Latest blood pressure ─────────────────────────────────────────────────
    latest_bp_orm = (
        db.query(BloodPressureReading)
        .filter(BloodPressureReading.patient_id == patient_id)
        .order_by(desc(BloodPressureReading.reading_datetime))
        .first()
    )
    latest_bp = BloodPressureResponse.model_validate(latest_bp_orm) if latest_bp_orm else None

    # ── Active medications only ───────────────────────────────────────────────
    # end_date == None means currently active
    active_meds = (
        db.query(Medication)
        .filter(
            Medication.patient_id == patient_id,
            Medication.end_date == None,  # noqa: E711
        )
        .all()
    )

    # ── Upcoming appointments ─────────────────────────────────────────────────
    now = datetime.utcnow()
    upcoming_appts = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient_id,
            Appointment.appointment_datetime >= now,
            Appointment.status == "Scheduled",
        )
        .order_by(Appointment.appointment_datetime)
        .limit(3)
        .all()
    )

    patient_info = PatientInfoResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        phone=patient.phone,
        email=patient.email,
        diabetes_type=patient.diabetes_type,
        diagnosis_date=patient.diagnosis_date,
        weight_kg=patient.weight_kg,
        height_cm=patient.height_cm,
        bmi=patient.bmi(),
        insurance_id=patient.insurance_id,
        primary_care_provider=patient.primary_care_provider,
        notes=patient.notes,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
    )

    return PatientSummaryResponse(
        patient=patient_info,
        latest_hba1c=latest_hba1c,
        latest_glucose=latest_glucose,
        latest_bp=latest_bp,
        active_medications=[MedicationResponse.model_validate(m) for m in active_meds],
        recent_hba1c=recent_hba1c,
        upcoming_appointments=[AppointmentResponse.model_validate(a) for a in upcoming_appts],
    )


# ─────────────────────────────────────────────────────────────────────────────
# Create Patient
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/patients", response_model=PatientResponse, status_code=201)
def create_patient(
    patient_in: PatientCreate,
    db:         Session = Depends(get_db),
):
    """
    Create a new patient record.
    Returns the created patient with auto-assigned ID and timestamps.
    """
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)   # Reload from DB to get auto-assigned values

    return PatientResponse(
        **{c.name: getattr(patient, c.name) for c in Patient.__table__.columns},
        bmi=patient.bmi(),
    )
