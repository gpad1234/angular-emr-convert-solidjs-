"""
routers/appointments.py - Appointment Endpoints
================================================
  GET  /api/v1/patients/{id}/appointments   — Paginated appointment history
  POST /api/v1/patients/{id}/appointments   — Schedule a new appointment
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from database import get_db
from models import Appointment, Patient
from schemas import AppointmentCreate, AppointmentResponse

router = APIRouter()


@router.get("/patients/{patient_id}/appointments", response_model=list[AppointmentResponse])
def list_appointments(
    patient_id: int,
    skip:       int = Query(0, ge=0),
    limit:      int = Query(10, ge=1, le=50),
    db:         Session = Depends(get_db),
):
    """
    Return paginated appointment history for a patient, newest first.
    
    ADA recommends patients with diabetes visit their care team:
      - Every 3 months if HbA1c is above target or medications are being adjusted
      - Every 6 months if HbA1c is at target and stable
    This endpoint helps care teams quickly review visit frequency and recency.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(desc(Appointment.appointment_datetime))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [AppointmentResponse.model_validate(a) for a in appointments]


@router.post("/patients/{patient_id}/appointments", response_model=AppointmentResponse, status_code=201)
def schedule_appointment(
    patient_id: int,
    appt_in:    AppointmentCreate,
    db:         Session = Depends(get_db),
):
    """Schedule a new appointment for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    appt = Appointment(patient_id=patient_id, **appt_in.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return AppointmentResponse.model_validate(appt)
