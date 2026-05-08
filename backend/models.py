"""
models.py - SQLAlchemy ORM Models (Database Schema)
=====================================================
Each class here maps to one database table. SQLAlchemy translates
Python attribute access into SQL queries automatically.

Relationships are declared bidirectionally so that, for example,
`patient.glucose_readings` gives the list of readings without extra queries,
and `reading.patient` gives the parent patient object.

cascade="all, delete-orphan":
  Deleting a Patient automatically deletes all of their related records.
  This enforces referential integrity at the ORM layer, not just in SQL.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from database import Base
import enum


# ─────────────────────────────────────────────────────────────────────────────
# Enumerations
# ─────────────────────────────────────────────────────────────────────────────

class DiabetesType(str, enum.Enum):
    """
    Classification of diabetes type per ADA (American Diabetes Association).
    Using str + enum.Enum means the value is stored/returned as a plain string,
    which plays nicely with JSON serialization.
    """
    TYPE1       = "Type 1"         # Autoimmune; requires insulin
    TYPE2       = "Type 2"         # Insulin resistance; most common (~90%)
    GESTATIONAL = "Gestational"    # Occurs during pregnancy
    LADA        = "LADA"           # Latent Autoimmune Diabetes in Adults (Type 1.5)
    PREDIABETES = "Prediabetes"    # HbA1c 5.7–6.4%; lifestyle intervention window
    OTHER       = "Other"


class GlucoseReadingType(str, enum.Enum):
    """
    Context in which the glucose measurement was taken.
    Clinical significance varies by type (different target ranges apply).
    """
    FASTING    = "Fasting"         # 8+ hours without food; target 80–130 mg/dL
    POST_MEAL  = "Post-meal"       # 2 hours after eating; target < 180 mg/dL
    BEDTIME    = "Bedtime"         # Before sleep; target 90–150 mg/dL
    RANDOM     = "Random"          # Unscheduled; used for trend monitoring
    PRE_MEAL   = "Pre-meal"        # Before eating; similar target as fasting


class AppointmentStatus(str, enum.Enum):
    SCHEDULED  = "Scheduled"
    COMPLETED  = "Completed"
    CANCELLED  = "Cancelled"
    NO_SHOW    = "No-show"


class AppointmentType(str, enum.Enum):
    ROUTINE_FOLLOWUP  = "Routine Follow-up"
    DIABETES_MGMT     = "Diabetes Management"
    LAB_REVIEW        = "Lab Review"
    URGENT            = "Urgent Visit"
    TELEHEALTH        = "Telehealth"
    DIETITIAN         = "Dietitian Consult"
    OPHTHALMOLOGY     = "Ophthalmology"   # Annual eye screening for diabetics
    PODIATRY          = "Podiatry"        # Annual foot screening
    NEPHROLOGY        = "Nephrology"      # Kidney function monitoring


class Gender(str, enum.Enum):
    MALE   = "Male"
    FEMALE = "Female"
    OTHER  = "Other"
    PREFER_NOT = "Prefer not to say"


# ─────────────────────────────────────────────────────────────────────────────
# Patient Model
# ─────────────────────────────────────────────────────────────────────────────

class Patient(Base):
    """
    Core patient record. Stores demographics and diabetes classification.

    Table: patients
    Central hub — all clinical data links back here via foreign keys.
    """
    __tablename__ = "patients"

    id                   = Column(Integer, primary_key=True, index=True)
    first_name           = Column(String(50), nullable=False)
    last_name            = Column(String(50), nullable=False, index=True)  # Indexed for search
    date_of_birth        = Column(Date, nullable=False)
    gender               = Column(SAEnum(Gender), nullable=False)
    phone                = Column(String(20))
    email                = Column(String(100))

    # Diabetes classification
    diabetes_type        = Column(SAEnum(DiabetesType), nullable=False)
    diagnosis_date       = Column(Date)           # When diabetes was first diagnosed

    # Biometrics — used to calculate BMI, track weight trends
    weight_kg            = Column(Float)
    height_cm            = Column(Float)

    # Administrative
    insurance_id         = Column(String(50))
    primary_care_provider = Column(String(100))
    notes                = Column(Text)           # Free-text clinical notes

    # Audit timestamps
    created_at           = Column(DateTime, default=datetime.utcnow)
    updated_at           = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ── Relationships ─────────────────────────────────────────────────────────
    # SQLAlchemy lazy-loads related objects by default (queries on access).
    # cascade="all, delete-orphan": deleting a patient removes all related rows.
    glucose_readings      = relationship("GlucoseReading",      back_populates="patient", cascade="all, delete-orphan", order_by="GlucoseReading.reading_datetime.desc()")
    hba1c_readings        = relationship("HbA1cReading",        back_populates="patient", cascade="all, delete-orphan", order_by="HbA1cReading.test_date.desc()")
    medications           = relationship("Medication",          back_populates="patient", cascade="all, delete-orphan")
    appointments          = relationship("Appointment",         back_populates="patient", cascade="all, delete-orphan", order_by="Appointment.appointment_datetime.desc()")
    blood_pressure_readings = relationship("BloodPressureReading", back_populates="patient", cascade="all, delete-orphan", order_by="BloodPressureReading.reading_datetime.desc()")

    def bmi(self) -> float | None:
        """Calculate Body Mass Index from stored height and weight."""
        if self.weight_kg and self.height_cm and self.height_cm > 0:
            return round(self.weight_kg / ((self.height_cm / 100) ** 2), 1)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Glucose Reading Model
# ─────────────────────────────────────────────────────────────────────────────

class GlucoseReading(Base):
    """
    Individual blood glucose measurement in mg/dL.

    Table: glucose_readings
    Most frequently updated table — diabetic patients may test 4–10x/day.

    Clinical reference ranges (ADA 2024 Standards of Care):
      Fasting / Pre-meal:  80–130 mg/dL  (target for most adults with diabetes)
      Post-meal (2hr):     < 180 mg/dL
      Hypoglycemia:        < 70 mg/dL    (requires immediate treatment)
      Hyperglycemia:       > 250 mg/dL   (may require extra insulin)
    """
    __tablename__ = "glucose_readings"

    id               = Column(Integer, primary_key=True, index=True)
    patient_id       = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    value_mgdl       = Column(Float, nullable=False)   # Blood glucose in mg/dL
    reading_type     = Column(SAEnum(GlucoseReadingType), nullable=False)
    reading_datetime = Column(DateTime, nullable=False, index=True)
    device_used      = Column(String(100))   # e.g. "Freestyle Libre 3", "Dexcom G7"
    notes            = Column(Text)          # e.g. "After high-carb meal", "felt shaky"
    created_at       = Column(DateTime, default=datetime.utcnow)

    patient          = relationship("Patient", back_populates="glucose_readings")


# ─────────────────────────────────────────────────────────────────────────────
# HbA1c Reading Model
# ─────────────────────────────────────────────────────────────────────────────

class HbA1cReading(Base):
    """
    Hemoglobin A1c (glycated hemoglobin) lab result.

    Table: hba1c_readings
    HbA1c reflects average blood glucose over the past 2–3 months.
    It is the primary long-term diabetes control metric (tested every 3–6 months).

    Clinical reference ranges:
      < 5.7%   → Normal
      5.7–6.4% → Prediabetes
      ≥ 6.5%   → Diabetes diagnosis
      < 7.0%   → ADA target for most adults with diabetes
      > 9.0%   → Severely uncontrolled (high complication risk)
    """
    __tablename__ = "hba1c_readings"

    id         = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    value_pct  = Column(Float, nullable=False)   # HbA1c percentage (e.g. 7.2)
    test_date  = Column(Date, nullable=False, index=True)
    lab_name   = Column(String(100))             # e.g. "Quest Diagnostics"
    notes      = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient    = relationship("Patient", back_populates="hba1c_readings")


# ─────────────────────────────────────────────────────────────────────────────
# Medication Model
# ─────────────────────────────────────────────────────────────────────────────

class Medication(Base):
    """
    Prescribed medication record.

    Table: medications
    Common diabetes medications include:
      - Metformin (first-line for Type 2; reduces hepatic glucose output)
      - Insulin Glargine / Detemir (basal insulin; covers background glucose)
      - Insulin Aspart / Lispro (bolus insulin; covers meals)
      - Liraglutide / Semaglutide (GLP-1 agonists; promote insulin, reduce appetite)
      - Empagliflozin / Dapagliflozin (SGLT-2 inhibitors; excrete glucose in urine)
      - Glipizide / Glimepiride (sulfonylureas; stimulate insulin secretion)
    """
    __tablename__ = "medications"

    id                   = Column(Integer, primary_key=True, index=True)
    patient_id           = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medication_name      = Column(String(100), nullable=False)   # Generic name preferred
    brand_name           = Column(String(100))                   # Optional brand name
    dosage               = Column(String(50))    # e.g. "500mg", "10 units"
    frequency            = Column(String(100))   # e.g. "Twice daily with meals"
    route                = Column(String(50))    # e.g. "Oral", "Subcutaneous", "IV"
    start_date           = Column(Date)
    end_date             = Column(Date)          # NULL means currently active
    prescribing_provider = Column(String(100))
    notes                = Column(Text)          # Side effects, titration instructions, etc.
    created_at           = Column(DateTime, default=datetime.utcnow)

    patient              = relationship("Patient", back_populates="medications")

    @property
    def is_active(self) -> bool:
        """True if medication has no end date (still being taken)."""
        return self.end_date is None


# ─────────────────────────────────────────────────────────────────────────────
# Appointment Model
# ─────────────────────────────────────────────────────────────────────────────

class Appointment(Base):
    """
    Clinical visit or scheduled appointment.

    Table: appointments
    Used to track care continuity. ADA recommends diabetic patients
    visit their care team every 3 months if uncontrolled, every 6 months
    if at target HbA1c.
    """
    __tablename__ = "appointments"

    id                    = Column(Integer, primary_key=True, index=True)
    patient_id            = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    appointment_datetime  = Column(DateTime, nullable=False, index=True)
    appointment_type      = Column(SAEnum(AppointmentType), nullable=False)
    status                = Column(SAEnum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    provider_name         = Column(String(100))
    location              = Column(String(100))   # Clinic name / "Telehealth"
    chief_complaint       = Column(String(200))   # Main reason for visit
    notes                 = Column(Text)          # Visit notes / plan
    follow_up_date        = Column(Date)          # When next visit is recommended
    created_at            = Column(DateTime, default=datetime.utcnow)

    patient               = relationship("Patient", back_populates="appointments")


# ─────────────────────────────────────────────────────────────────────────────
# Blood Pressure Reading Model
# ─────────────────────────────────────────────────────────────────────────────

class BloodPressureReading(Base):
    """
    Blood pressure measurement in mmHg.

    Table: blood_pressure_readings
    Hypertension is extremely common in diabetic patients (60–70%) and
    accelerates the development of cardiovascular disease, nephropathy,
    and retinopathy.

    ADA blood pressure targets for adults with diabetes:
      Systolic:  < 130 mmHg
      Diastolic: < 80 mmHg
    """
    __tablename__ = "blood_pressure_readings"

    id               = Column(Integer, primary_key=True, index=True)
    patient_id       = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    systolic         = Column(Integer, nullable=False)    # Top number (mmHg)
    diastolic        = Column(Integer, nullable=False)    # Bottom number (mmHg)
    pulse            = Column(Integer)                    # Heart rate (bpm)
    reading_datetime = Column(DateTime, nullable=False, index=True)
    notes            = Column(Text)
    created_at       = Column(DateTime, default=datetime.utcnow)

    patient          = relationship("Patient", back_populates="blood_pressure_readings")
