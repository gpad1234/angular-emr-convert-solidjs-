"""
routers/glucose.py - Blood Glucose Reading Endpoints
=====================================================
Provides endpoints for managing glucose readings per patient.

  GET  /api/v1/patients/{id}/glucose   — Paginated glucose history
  POST /api/v1/patients/{id}/glucose   — Log a new reading

Clinical Context:
  Blood glucose readings are the most frequently updated records in a
  diabetes EMR. A Type 1 diabetic may check 6-10 times per day with a CGM
  generating a reading every 5 minutes (~288/day). For this MVP, readings
  are entered manually; CGM integration would require a separate webhook/
  stream endpoint.

Glucose Classification (ADA 2024):
  < 54 mg/dL   → Critical Low (Level 2 hypoglycemia)
  54-69 mg/dL  → Low (Level 1 hypoglycemia)
  70-130 mg/dL → Normal / Target (fasting)
  131-180 mg/dL → Slightly High
  181-250 mg/dL → High
  > 250 mg/dL  → Very High (consider ketone check)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from database import get_db
from models import GlucoseReading, Patient
from schemas import GlucoseReadingCreate, GlucoseReadingResponse, GlucoseListResponse

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# List Glucose Readings (paginated)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}/glucose", response_model=GlucoseListResponse)
def list_glucose_readings(
    patient_id:   int,
    skip:         int           = Query(0,   ge=0, description="Offset for pagination"),
    limit:        int           = Query(10,  ge=1, le=100, description="Max readings to return"),
    reading_type: Optional[str] = Query(None, description="Filter by type: Fasting, Post-meal, etc."),
    db:           Session       = Depends(get_db),
):
    """
    Return paginated glucose readings for a patient, newest first.

    ### Load More Pattern
    The frontend calls this with skip=0, limit=10 initially.
    When the user taps "Load More", it calls again with skip=10.
    The accumulated results are displayed in a timeline.

    ### Filter by Type
    Pass `reading_type=Fasting` to show only fasting readings —
    useful for titrating insulin and reviewing fasting trends.
    """
    # Verify patient exists (avoids confusing empty-list response for bad IDs)
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # Base query filtered to this patient
    query = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.patient_id == patient_id)
    )

    # Optional: filter by reading type
    if reading_type:
        query = query.filter(GlucoseReading.reading_type == reading_type)

    # Count total matching records (for pagination metadata)
    total = query.count()

    # Fetch paginated records — newest readings first
    readings = (
        query
        .order_by(desc(GlucoseReading.reading_datetime))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return GlucoseListResponse(
        readings=[GlucoseReadingResponse.model_validate(r) for r in readings],
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Log New Glucose Reading
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/patients/{patient_id}/glucose", response_model=GlucoseReadingResponse, status_code=201)
def log_glucose_reading(
    patient_id:  int,
    reading_in:  GlucoseReadingCreate,
    db:          Session = Depends(get_db),
):
    """
    Log a new blood glucose reading for a patient.

    The value is validated to be between 1 and 1000 mg/dL by the Pydantic schema.
    Values outside physiologic range (< 20 or > 600) may indicate meter error.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    reading = GlucoseReading(
        patient_id=patient_id,
        **reading_in.model_dump(),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return GlucoseReadingResponse.model_validate(reading)


# ─────────────────────────────────────────────────────────────────────────────
# Get HbA1c Readings (paginated)
# ─────────────────────────────────────────────────────────────────────────────

from models import HbA1cReading
from schemas import HbA1cResponse, HbA1cCreate

@router.get("/patients/{patient_id}/hba1c", response_model=list[HbA1cResponse])
def list_hba1c(
    patient_id: int,
    db:         Session = Depends(get_db),
):
    """
    Return all HbA1c readings for a patient, newest first.

    Unlike glucose readings, HbA1c is tested infrequently (every 3-6 months),
    so pagination is not typically needed — the full history fits in one response.
    The list enables the frontend to render an HbA1c trend chart.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    records = (
        db.query(HbA1cReading)
        .filter(HbA1cReading.patient_id == patient_id)
        .order_by(desc(HbA1cReading.test_date))
        .all()
    )
    return [HbA1cResponse.model_validate(r) for r in records]


@router.post("/patients/{patient_id}/hba1c", response_model=HbA1cResponse, status_code=201)
def add_hba1c(
    patient_id: int,
    hba1c_in:   HbA1cCreate,
    db:         Session = Depends(get_db),
):
    """Log a new HbA1c lab result for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    record = HbA1cReading(patient_id=patient_id, **hba1c_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return HbA1cResponse.model_validate(record)
