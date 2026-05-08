"""
routers/medications.py - Medication Endpoints
=============================================
  GET  /api/v1/patients/{id}/medications          — All medications (active + inactive)
  GET  /api/v1/patients/{id}/medications/active   — Active medications only
  POST /api/v1/patients/{id}/medications           — Add a new medication
  PATCH /api/v1/patients/{id}/medications/{med_id} — Discontinue a medication (set end_date)
"""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Medication, Patient
from schemas import MedicationCreate, MedicationResponse

router = APIRouter()


@router.get("/patients/{patient_id}/medications", response_model=list[MedicationResponse])
def list_medications(
    patient_id: int,
    db:         Session = Depends(get_db),
):
    """
    Return all medications (active and previously discontinued) for a patient.
    
    Use this for a full medication history view. Active medications
    have end_date == null; discontinued ones have an end_date set.
    The response `is_active` field reflects this.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    meds = (
        db.query(Medication)
        .filter(Medication.patient_id == patient_id)
        .order_by(Medication.start_date.desc().nullslast())
        .all()
    )
    return [MedicationResponse.model_validate(m) for m in meds]


@router.get("/patients/{patient_id}/medications/active", response_model=list[MedicationResponse])
def list_active_medications(
    patient_id: int,
    db:         Session = Depends(get_db),
):
    """
    Return only currently active medications (no end_date set).
    This is what the patient detail page sidebar should display.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    meds = (
        db.query(Medication)
        .filter(
            Medication.patient_id == patient_id,
            Medication.end_date == None,  # noqa: E711
        )
        .all()
    )
    return [MedicationResponse.model_validate(m) for m in meds]


@router.post("/patients/{patient_id}/medications", response_model=MedicationResponse, status_code=201)
def add_medication(
    patient_id: int,
    med_in:     MedicationCreate,
    db:         Session = Depends(get_db),
):
    """Prescribe a new medication for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    med = Medication(patient_id=patient_id, **med_in.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return MedicationResponse.model_validate(med)


@router.patch("/patients/{patient_id}/medications/{medication_id}/discontinue",
              response_model=MedicationResponse)
def discontinue_medication(
    patient_id:    int,
    medication_id: int,
    db:            Session = Depends(get_db),
):
    """
    Discontinue a medication by setting its end_date to today.
    
    This soft-deletes the medication record rather than removing it,
    preserving the patient's medication history for clinical audit purposes.
    """
    med = (
        db.query(Medication)
        .filter(
            Medication.id == patient_id,
            Medication.patient_id == patient_id,
        )
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    if med.end_date is not None:
        raise HTTPException(status_code=400, detail="Medication is already discontinued")

    med.end_date = date.today()
    db.commit()
    db.refresh(med)
    return MedicationResponse.model_validate(med)
