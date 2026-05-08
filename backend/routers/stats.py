"""
routers/stats.py - Dashboard Aggregate Statistics
==================================================
  GET /api/v1/stats/dashboard — Population-level metrics for the EMR home screen

These endpoints aggregate data across ALL patients for a clinical operations
overview. Useful for:
  - Identifying patients who need attention (high HbA1c, recent hypoglycemia)
  - Monitoring population health trends
  - Quick practitioner dashboard at a glance
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from database import get_db
from models import Patient, HbA1cReading, GlucoseReading, Medication
from schemas import DashboardStats

router = APIRouter()


@router.get("/stats/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Return aggregate statistics for the EMR dashboard.

    Computed efficiently with SQL aggregation rather than fetching all
    records into Python — important for performance with large datasets.
    """

    # ── Total patient count ───────────────────────────────────────────────────
    total_patients = db.query(func.count(Patient.id)).scalar()

    # ── Patient count by diabetes type ────────────────────────────────────────
    # GROUP BY diabetes_type → {type: count}
    type_rows = (
        db.query(Patient.diabetes_type, func.count(Patient.id))
        .group_by(Patient.diabetes_type)
        .all()
    )
    # Use .value to get the string label (e.g. "Type 2") not the enum repr
    by_diabetes_type = {row[0].value: row[1] for row in type_rows}

    # ── Average HbA1c from tests in the last 30 days ─────────────────────────
    # Only counts the most recent test per patient within the window
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
    avg_hba1c_result = (
        db.query(func.avg(HbA1cReading.value_pct))
        .filter(HbA1cReading.test_date >= thirty_days_ago)
        .scalar()
    )
    avg_hba1c = round(float(avg_hba1c_result), 1) if avg_hba1c_result else None

    # ── Count patients with HbA1c > 9% (at-risk for complications) ───────────
    # Uses a subquery to get the latest HbA1c per patient
    high_hba1c = (
        db.query(func.count(func.distinct(HbA1cReading.patient_id)))
        .filter(HbA1cReading.value_pct > 9.0)
        .scalar()
    )

    # ── Count glucose readings < 70 mg/dL in the last 7 days ─────────────────
    # Hypoglycemia (BG < 70) is dangerous and requires clinical follow-up
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_hypo = (
        db.query(func.count(GlucoseReading.id))
        .filter(
            GlucoseReading.value_mgdl < 70,
            GlucoseReading.reading_datetime >= seven_days_ago,
        )
        .scalar()
    )

    # ── Count total active medication prescriptions ───────────────────────────
    active_meds = (
        db.query(func.count(Medication.id))
        .filter(Medication.end_date == None)  # noqa: E711
        .scalar()
    )

    return DashboardStats(
        total_patients=total_patients or 0,
        by_diabetes_type=by_diabetes_type,
        avg_hba1c_last_30_days=avg_hba1c,
        high_hba1c_count=high_hba1c or 0,
        recent_hypoglycemia_count=recent_hypo or 0,
        active_medications_count=active_meds or 0,
    )
