"""
sample_data.py - Realistic Diabetes Patient Dataset
=====================================================
This module seeds the database with 15 fictional but clinically realistic
patients representing the spectrum of diabetes care.

Data is intentionally varied to exercise all UI states:
  - Well-controlled patients (HbA1c < 7%)
  - Poorly controlled patients (HbA1c > 9%)
  - Multiple diabetes types (Type 1, Type 2, LADA, Gestational, Prediabetes)
  - Patients with complications (nephropathy, retinopathy, neuropathy)
  - Various medication regimens
  - Different demographics (ages, genders, ethnic backgrounds)

HOW TO ADD MORE DATA:
  - Add entries to SAMPLE_PATIENTS, SAMPLE_MEDICATIONS, etc.
  - Restart the server — the seed function skips if patients already exist.
  - To RESET: delete diabetes_emr.db and restart.

CLINICAL NOTE:
  All glucose values, HbA1c percentages, and medication doses in this file
  are based on published ADA standards. They are for demonstration only.
"""

from datetime import date, datetime, timedelta
import random

# ─────────────────────────────────────────────────────────────────────────────
# Patient Demographics
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_PATIENTS = [
    {
        "id": 1,
        "first_name": "Maria",
        "last_name": "Garcia",
        "date_of_birth": date(1974, 3, 15),
        "gender": "Female",
        "phone": "555-0101",
        "email": "maria.garcia@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2021, 6, 10),
        "weight_kg": 78.5,
        "height_cm": 162.0,
        "insurance_id": "BCB-001234",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "Patient is compliant with medications. Reports improved diet and 20-min daily walks. Needs annual ophthalmology screening.",
    },
    {
        "id": 2,
        "first_name": "James",
        "last_name": "Washington",
        "date_of_birth": date(1957, 11, 22),
        "gender": "Male",
        "phone": "555-0102",
        "email": "james.washington@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2012, 2, 5),
        "weight_kg": 98.2,
        "height_cm": 178.0,
        "insurance_id": "MCR-007841",
        "primary_care_provider": "Dr. Robert Kim",
        "notes": "Long-standing T2DM with early nephropathy (eGFR 58). On ACE inhibitor. Poorly adherent with diet. Requires medication adjustment.",
    },
    {
        "id": 3,
        "first_name": "Emily",
        "last_name": "Chen",
        "date_of_birth": date(1998, 7, 8),
        "gender": "Female",
        "phone": "555-0103",
        "email": "emily.chen@example.com",
        "diabetes_type": "Type 1",
        "diagnosis_date": date(2011, 9, 14),
        "weight_kg": 58.0,
        "height_cm": 165.0,
        "insurance_id": "UHC-445521",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "Using Omnipod Dash insulin pump with Dexcom G7 CGM. Very motivated. Works with certified diabetes educator monthly. Excellent control.",
    },
    {
        "id": 4,
        "first_name": "Robert",
        "last_name": "Johnson",
        "date_of_birth": date(1981, 4, 30),
        "gender": "Male",
        "phone": "555-0104",
        "email": "robert.johnson@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2025, 10, 12),
        "weight_kg": 102.0,
        "height_cm": 183.0,
        "insurance_id": "AET-228847",
        "primary_care_provider": "Dr. Patricia Williams",
        "notes": "Recently diagnosed. Very motivated for lifestyle change. Starting with Metformin and intensive dietary counseling. No complications yet.",
    },
    {
        "id": 5,
        "first_name": "Sarah",
        "last_name": "Williams",
        "date_of_birth": date(1992, 9, 5),
        "gender": "Female",
        "phone": "555-0105",
        "email": "sarah.williams@example.com",
        "diabetes_type": "Gestational",
        "diagnosis_date": date(2026, 2, 20),
        "weight_kg": 74.0,
        "height_cm": 168.0,
        "insurance_id": "CIG-112233",
        "primary_care_provider": "Dr. Patricia Williams",
        "notes": "28 weeks pregnant. Gestational diabetes diagnosed at 24-week screen. Monitoring 4x/day. Diet-controlled so far. Follow up with OB/MFM.",
    },
    {
        "id": 6,
        "first_name": "David",
        "last_name": "Kim",
        "date_of_birth": date(1968, 5, 18),
        "gender": "Male",
        "phone": "555-0106",
        "email": "david.kim@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2008, 11, 3),
        "weight_kg": 85.0,
        "height_cm": 172.0,
        "insurance_id": "BCB-998877",
        "primary_care_provider": "Dr. Robert Kim",
        "notes": "Long-standing T2DM with multiple complications: background diabetic retinopathy (bilateral), stage 3a nephropathy, and peripheral neuropathy in feet. On triple oral therapy. Podiatry referral pending.",
    },
    {
        "id": 7,
        "first_name": "Lisa",
        "last_name": "Thompson",
        "date_of_birth": date(1984, 1, 27),
        "gender": "Female",
        "phone": "555-0107",
        "email": "lisa.thompson@example.com",
        "diabetes_type": "LADA",
        "diagnosis_date": date(2022, 4, 8),
        "weight_kg": 63.0,
        "height_cm": 170.0,
        "insurance_id": "UHC-775544",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "LADA confirmed by positive anti-GAD antibodies. Initially misdiagnosed as T2DM. Transitioning off sulfonylurea to basal insulin as C-peptide declines.",
    },
    {
        "id": 8,
        "first_name": "Michael",
        "last_name": "Brown",
        "date_of_birth": date(1953, 8, 14),
        "gender": "Male",
        "phone": "555-0108",
        "email": "m.brown@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2005, 3, 21),
        "weight_kg": 91.0,
        "height_cm": 175.0,
        "insurance_id": "MCR-003344",
        "primary_care_provider": "Dr. Robert Kim",
        "notes": "Complex patient with T2DM, HTN, HFrEF (EF 40%), and CAD. SGLT-2 inhibitor chosen for cardiorenal benefit. Cardiology co-managing.",
    },
    {
        "id": 9,
        "first_name": "Jennifer",
        "last_name": "Martinez",
        "date_of_birth": date(1987, 6, 12),
        "gender": "Female",
        "phone": "555-0109",
        "email": "jennifer.martinez@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2020, 8, 14),
        "weight_kg": 71.0,
        "height_cm": 163.0,
        "insurance_id": "AET-556677",
        "primary_care_provider": "Dr. Patricia Williams",
        "notes": "Excellent adherence. Lost 12kg since diagnosis through lifestyle modification. HbA1c improved from 8.4% to 6.2%. Currently well controlled.",
    },
    {
        "id": 10,
        "first_name": "Thomas",
        "last_name": "Anderson",
        "date_of_birth": date(1971, 12, 3),
        "gender": "Male",
        "phone": "555-0110",
        "email": "t.anderson@example.com",
        "diabetes_type": "Prediabetes",
        "diagnosis_date": date(2025, 1, 15),
        "weight_kg": 89.0,
        "height_cm": 180.0,
        "insurance_id": "BCB-334455",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "Prediabetes identified on routine screening. Strong family history T2DM (father, brother). Enrolled in CDC Diabetes Prevention Program. Goal: 7% body weight loss.",
    },
    {
        "id": 11,
        "first_name": "Ashley",
        "last_name": "Davis",
        "date_of_birth": date(1995, 2, 19),
        "gender": "Female",
        "phone": "555-0111",
        "email": "ashley.davis@example.com",
        "diabetes_type": "Type 1",
        "diagnosis_date": date(2008, 11, 30),
        "weight_kg": 61.0,
        "height_cm": 167.0,
        "insurance_id": "CIG-889966",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "T1DM since age 13. Uses Tandem Control-IQ closed-loop system. Occasional DKA episodes in early 20s; now well-managed. Hypoglycemia unawareness — lower threshold set on CGM.",
    },
    {
        "id": 12,
        "first_name": "Carlos",
        "last_name": "Rodriguez",
        "date_of_birth": date(1978, 10, 7),
        "gender": "Male",
        "phone": "555-0112",
        "email": "carlos.rod@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2018, 7, 22),
        "weight_kg": 88.0,
        "height_cm": 174.0,
        "insurance_id": "UHC-662211",
        "primary_care_provider": "Dr. Patricia Williams",
        "notes": "T2DM with family history. GLP-1 agonist added for weight management and cardiovascular risk reduction. Reports nausea improving over time.",
    },
    {
        "id": 13,
        "first_name": "Patricia",
        "last_name": "Wilson",
        "date_of_birth": date(1963, 4, 25),
        "gender": "Female",
        "phone": "555-0113",
        "email": "p.wilson@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2010, 9, 6),
        "weight_kg": 82.0,
        "height_cm": 160.0,
        "insurance_id": "MCR-112244",
        "primary_care_provider": "Dr. Robert Kim",
        "notes": "Progressive T2DM now on basal-bolus insulin regimen. Fear of hypoglycemia limits dose increases. Requires counseling on hypoglycemia recognition and treatment.",
    },
    {
        "id": 14,
        "first_name": "Kevin",
        "last_name": "Taylor",
        "date_of_birth": date(1989, 8, 31),
        "gender": "Male",
        "phone": "555-0114",
        "email": "kevin.taylor@example.com",
        "diabetes_type": "Type 1",
        "diagnosis_date": date(2007, 5, 11),
        "weight_kg": 75.0,
        "height_cm": 180.0,
        "insurance_id": "AET-771133",
        "primary_care_provider": "Dr. Sarah Chen",
        "notes": "Competitive triathlete with T1DM. Manages around intense exercise schedule. Uses temp basal reductions before events. Carb-loads with monitoring.",
    },
    {
        "id": 15,
        "first_name": "Sandra",
        "last_name": "Lee",
        "date_of_birth": date(1970, 6, 17),
        "gender": "Female",
        "phone": "555-0115",
        "email": "sandra.lee@example.com",
        "diabetes_type": "Type 2",
        "diagnosis_date": date(2015, 3, 4),
        "weight_kg": 72.0,
        "height_cm": 159.0,
        "insurance_id": "BCB-445566",
        "primary_care_provider": "Dr. Patricia Williams",
        "notes": "T2DM resolved following Roux-en-Y gastric bypass (2023). Currently in diabetes remission — HbA1c 5.9% off medications. Monitoring annually for recurrence.",
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# HbA1c History per Patient
# ─────────────────────────────────────────────────────────────────────────────
# Format: patient_id → list of (value_pct, test_date, lab_name, notes)
# Values should tell a clinical story (improving, worsening, or stable)

SAMPLE_HBA1C = {
    1:  [(8.1, date(2025, 2, 10), "Quest Diagnostics", "Above target; counseled on diet"),
         (7.6, date(2025, 5, 12), "Quest Diagnostics", "Improving with Metformin increase"),
         (7.2, date(2025, 8, 14), "Quest Diagnostics", "Continues to improve"),
         (6.9, date(2026, 2, 20), "Quest Diagnostics", "At target range")],

    2:  [(10.2, date(2025, 1, 5),  "LabCorp", "Poorly controlled; medication adjusted"),
         (9.8,  date(2025, 4, 8),  "LabCorp", "Slight improvement; compliance issues"),
         (10.1, date(2025, 7, 14), "LabCorp", "Worsening; nephrology referral placed"),
         (9.4,  date(2026, 1, 20), "LabCorp", "Insulin added to regimen")],

    3:  [(6.4, date(2025, 3, 1), "Quest Diagnostics", "Excellent control with pump therapy"),
         (6.2, date(2025, 6, 5), "Quest Diagnostics", "CGM data reviewed; adjustments minimal"),
         (6.5, date(2025, 9, 8), "Quest Diagnostics", "Slightly up — review pump settings"),
         (6.3, date(2026, 3, 12), "Quest Diagnostics", "Back to excellent control")],

    4:  [(8.9, date(2025, 10, 20), "LabCorp", "Baseline at diagnosis"),
         (7.8, date(2026, 1, 18), "LabCorp", "Improving with Metformin and lifestyle")],

    5:  [(5.6, date(2026, 2, 25), "Quest Diagnostics", "Baseline before gestational DM diagnosis — normal"),
         (5.8, date(2026, 4, 15), "Quest Diagnostics", "Diet-controlled gestational DM")],

    6:  [(9.2, date(2025, 2, 8),  "LabCorp", "Poorly controlled; added 3rd agent"),
         (8.7, date(2025, 5, 11), "LabCorp", "Modest improvement"),
         (8.9, date(2025, 8, 6),  "LabCorp", "Nephrology flagged eGFR < 60"),
         (8.4, date(2026, 2, 3),  "LabCorp", "Marginal improvement; basal insulin discussion")],

    7:  [(7.4, date(2025, 4, 10), "Quest Diagnostics", "Metformin only — early LADA"),
         (7.9, date(2025, 7, 22), "Quest Diagnostics", "C-peptide declining; sulfonylurea added"),
         (8.1, date(2025, 10, 15),"Quest Diagnostics", "Transitioning to basal insulin"),
         (7.3, date(2026, 2, 28), "Quest Diagnostics", "Better control on insulin")],

    8:  [(8.0, date(2025, 3, 14), "LabCorp", "Baseline at SGLT-2 start"),
         (7.6, date(2025, 6, 12), "LabCorp", "Improving — also on ACEi + beta-blocker"),
         (7.3, date(2025, 9, 18), "LabCorp", "Continued improvement"),
         (7.1, date(2026, 3, 5),  "LabCorp", "Near target for cardiac comorbidity")],

    9:  [(8.4, date(2025, 1, 6),  "Quest Diagnostics", "At diagnosis with lifestyle intervention"),
         (7.1, date(2025, 4, 9),  "Quest Diagnostics", "6kg weight loss achieved"),
         (6.5, date(2025, 7, 14), "Quest Diagnostics", "12kg total loss — excellent progress"),
         (6.2, date(2026, 1, 22), "Quest Diagnostics", "Well controlled — reduced to annual labs")],

    10: [(6.1, date(2025, 1, 20), "Quest Diagnostics", "Prediabetes; DPP program enrolled"),
         (5.9, date(2025, 7, 15), "Quest Diagnostics", "5% weight loss achieved"),
         (5.8, date(2026, 1, 30), "Quest Diagnostics", "Trending toward normal — continue lifestyle mod")],

    11: [(6.8, date(2025, 2, 14), "LabCorp", "Closed-loop pump data excellent"),
         (6.6, date(2025, 5, 20), "LabCorp", "Hypoglycemia awareness improved with CGM alerts"),
         (6.9, date(2025, 8, 25), "LabCorp", "Slight increase — reviewed carb ratios"),
         (6.7, date(2026, 2, 18), "LabCorp", "Stable control")],

    12: [(8.6, date(2025, 3, 8),  "Quest Diagnostics", "Started GLP-1 agonist"),
         (7.8, date(2025, 6, 11), "Quest Diagnostics", "GLP-1 + Metformin working; weight -5kg"),
         (7.3, date(2025, 9, 22), "Quest Diagnostics", "Continued improvement"),
         (6.9, date(2026, 3, 18), "Quest Diagnostics", "At target — good cardiovascular risk reduction")],

    13: [(9.5, date(2025, 2, 5),  "LabCorp", "Started basal-bolus insulin — adjustment in progress"),
         (8.7, date(2025, 5, 9),  "LabCorp", "Improving but hypoglycemia fear limiting doses"),
         (8.2, date(2025, 8, 13), "LabCorp", "Counseling on hypoglycemia management helping"),
         (7.8, date(2026, 2, 10), "LabCorp", "Best control in years")],

    14: [(6.5, date(2025, 3, 18), "Quest Diagnostics", "Athlete management — temp basal strategy"),
         (6.3, date(2025, 6, 22), "Quest Diagnostics", "Triathlon season: frequent CGM review"),
         (6.7, date(2025, 9, 15), "Quest Diagnostics", "Post-season; carb intake normalized"),
         (6.4, date(2026, 3, 10), "Quest Diagnostics", "Excellent overall control")],

    15: [(6.8, date(2025, 3, 20), "Quest Diagnostics", "12 months post-bypass — gradual improvement"),
         (6.2, date(2025, 9, 11), "Quest Diagnostics", "Significant improvement — reducing medications"),
         (5.9, date(2026, 3, 4),  "Quest Diagnostics", "Diabetes remission — off all diabetes meds")],
}


# ─────────────────────────────────────────────────────────────────────────────
# Medications per Patient
# ─────────────────────────────────────────────────────────────────────────────
# Format: patient_id → list of medication dicts

SAMPLE_MEDICATIONS = {
    1: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2021, 6, 15), "prescribing_provider": "Dr. Sarah Chen",
         "notes": "Titrated from 500mg over 4 weeks to reduce GI side effects"},
        {"medication_name": "Empagliflozin", "brand_name": "Jardiance",
         "dosage": "10mg", "frequency": "Once daily in the morning", "route": "Oral",
         "start_date": date(2023, 3, 1), "prescribing_provider": "Dr. Sarah Chen",
         "notes": "Added for additional HbA1c lowering and cardiovascular protection"},
    ],
    2: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2012, 3, 1), "prescribing_provider": "Dr. Robert Kim"},
        {"medication_name": "Glipizide", "brand_name": "Glucotrol",
         "dosage": "10mg", "frequency": "Once daily before breakfast", "route": "Oral",
         "start_date": date(2015, 6, 10), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Monitor for hypoglycemia — patient skips breakfast occasionally"},
        {"medication_name": "Insulin Glargine", "brand_name": "Lantus",
         "dosage": "20 units", "frequency": "Once daily at bedtime", "route": "Subcutaneous",
         "start_date": date(2026, 1, 25), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Basal insulin added. Start 20u, titrate 2u every 3 days to fasting BG 80-130"},
        {"medication_name": "Lisinopril",
         "dosage": "10mg", "frequency": "Once daily", "route": "Oral",
         "start_date": date(2016, 2, 8), "prescribing_provider": "Dr. Robert Kim",
         "notes": "ACE inhibitor for nephroprotection — monitor potassium and creatinine"},
    ],
    3: [
        {"medication_name": "Insulin Aspart", "brand_name": "NovoLog",
         "dosage": "Per pump bolus calculator", "frequency": "With each meal and correction doses",
         "route": "Subcutaneous (insulin pump)", "start_date": date(2019, 5, 1),
         "prescribing_provider": "Dr. Sarah Chen",
         "notes": "Using Omnipod Dash. ICR 1:10 breakfast, 1:12 lunch/dinner. ISF 1:45"},
        {"medication_name": "Insulin Aspart basal (pump)", "brand_name": "NovoLog",
         "dosage": "0.65 u/hr average basal rate", "frequency": "Continuous subcutaneous infusion",
         "route": "Subcutaneous (insulin pump)", "start_date": date(2019, 5, 1),
         "prescribing_provider": "Dr. Sarah Chen"},
    ],
    4: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "500mg", "frequency": "Once daily with dinner (will increase)", "route": "Oral",
         "start_date": date(2025, 10, 20), "prescribing_provider": "Dr. Patricia Williams",
         "notes": "Starting dose. Plan to increase to 1000mg BID over 4 weeks if tolerated"},
    ],
    5: [
        {"medication_name": "Glyburide", "brand_name": "Diabeta",
         "dosage": "2.5mg", "frequency": "Once daily with breakfast", "route": "Oral",
         "start_date": date(2026, 3, 28), "prescribing_provider": "Dr. Patricia Williams",
         "notes": "Added when fasting BG > 95 mg/dL despite diet. Continue monitoring 4x/day"},
    ],
    6: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2008, 11, 10), "prescribing_provider": "Dr. Robert Kim"},
        {"medication_name": "Sitagliptin", "brand_name": "Januvia",
         "dosage": "50mg", "frequency": "Once daily", "route": "Oral",
         "start_date": date(2018, 4, 5), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Dose reduced to 50mg due to eGFR < 60 (renal dose adjustment required)"},
        {"medication_name": "Insulin Glargine", "brand_name": "Basaglar",
         "dosage": "18 units", "frequency": "Once daily at bedtime", "route": "Subcutaneous",
         "start_date": date(2023, 9, 15), "prescribing_provider": "Dr. Robert Kim"},
    ],
    7: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2022, 4, 15), "prescribing_provider": "Dr. Sarah Chen"},
        {"medication_name": "Insulin Glargine", "brand_name": "Toujeo",
         "dosage": "14 units", "frequency": "Once daily at bedtime", "route": "Subcutaneous",
         "start_date": date(2025, 10, 20), "prescribing_provider": "Dr. Sarah Chen",
         "notes": "Started as C-peptide declining. Will add rapid-acting when HbA1c > 8%"},
    ],
    8: [
        {"medication_name": "Empagliflozin", "brand_name": "Jardiance",
         "dosage": "10mg", "frequency": "Once daily in the morning", "route": "Oral",
         "start_date": date(2025, 3, 20), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Chosen for EMPA-REG OUTCOME cardiorenal benefit (HFrEF + CKD + T2DM)"},
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "500mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2005, 4, 1), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Reduced dose due to eGFR monitoring"},
        {"medication_name": "Carvedilol", "brand_name": "Coreg",
         "dosage": "12.5mg", "frequency": "Twice daily", "route": "Oral",
         "start_date": date(2020, 1, 15), "prescribing_provider": "Cardiology",
         "notes": "For HFrEF — cardiology managed"},
    ],
    9: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2020, 8, 20), "prescribing_provider": "Dr. Patricia Williams"},
    ],
    10: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "500mg", "frequency": "Once daily with dinner", "route": "Oral",
         "start_date": date(2025, 6, 1), "prescribing_provider": "Dr. Sarah Chen",
         "notes": "DPP trial evidence supports Metformin for high-risk prediabetes"},
    ],
    11: [
        {"medication_name": "Insulin Lispro", "brand_name": "Humalog",
         "dosage": "Per Control-IQ algorithm", "frequency": "Continuous + meal boluses",
         "route": "Subcutaneous (Tandem pump)", "start_date": date(2021, 3, 15),
         "prescribing_provider": "Dr. Sarah Chen",
         "notes": "Tandem Control-IQ closed-loop. CGM lower alert set to 80 (unawareness)"},
    ],
    12: [
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily with meals", "route": "Oral",
         "start_date": date(2018, 7, 30), "prescribing_provider": "Dr. Patricia Williams"},
        {"medication_name": "Semaglutide", "brand_name": "Ozempic",
         "dosage": "1mg", "frequency": "Once weekly injection", "route": "Subcutaneous",
         "start_date": date(2025, 3, 15), "prescribing_provider": "Dr. Patricia Williams",
         "notes": "GLP-1 agonist for HbA1c and weight reduction. Titrated from 0.25mg over 4 weeks"},
    ],
    13: [
        {"medication_name": "Insulin Glargine", "brand_name": "Lantus",
         "dosage": "22 units", "frequency": "Once daily at bedtime", "route": "Subcutaneous",
         "start_date": date(2021, 5, 10), "prescribing_provider": "Dr. Robert Kim"},
        {"medication_name": "Insulin Aspart", "brand_name": "NovoLog",
         "dosage": "6-8 units", "frequency": "Before each meal (per sliding scale)", "route": "Subcutaneous",
         "start_date": date(2021, 5, 10), "prescribing_provider": "Dr. Robert Kim",
         "notes": "Sliding scale: < 150 = 0u, 151-200 = 2u, 201-250 = 4u, 251-300 = 6u, > 300 call"},
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily", "route": "Oral",
         "start_date": date(2010, 9, 15), "prescribing_provider": "Dr. Robert Kim"},
    ],
    14: [
        {"medication_name": "Insulin Lispro", "brand_name": "Humalog",
         "dosage": "Per correction factor + carb ratio", "frequency": "Pre-meal bolus",
         "route": "Subcutaneous", "start_date": date(2015, 8, 1),
         "prescribing_provider": "Dr. Sarah Chen",
         "notes": "ICR 1:15. Temp basal -30% starting 90 min before exercise; +30% after intense sessions"},
        {"medication_name": "Insulin Detemir", "brand_name": "Levemir",
         "dosage": "12 units", "frequency": "Once daily in the evening", "route": "Subcutaneous",
         "start_date": date(2015, 8, 1), "prescribing_provider": "Dr. Sarah Chen"},
    ],
    15: [
        # All diabetes medications discontinued after remission
        {"medication_name": "Metformin", "brand_name": "Glucophage",
         "dosage": "1000mg", "frequency": "Twice daily", "route": "Oral",
         "start_date": date(2015, 3, 10), "end_date": date(2025, 12, 1),
         "prescribing_provider": "Dr. Patricia Williams",
         "notes": "Discontinued 18 months post-bypass — HbA1c < 6.5% without medication"},
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# Appointment History per Patient
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_APPOINTMENTS = {
    1: [
        {"appointment_datetime": datetime(2026, 5, 15, 10, 0),
         "appointment_type": "Routine Follow-up", "status": "Scheduled",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "3-month diabetes follow-up",
         "follow_up_date": date(2026, 8, 15)},
        {"appointment_datetime": datetime(2026, 2, 20, 9, 30),
         "appointment_type": "Lab Review", "status": "Completed",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "HbA1c result review",
         "notes": "HbA1c 6.9% — at target. Continue current regimen. Praised patient on lifestyle changes.",
         "follow_up_date": date(2026, 5, 15)},
        {"appointment_datetime": datetime(2025, 11, 12, 11, 0),
         "appointment_type": "Ophthalmology", "status": "Completed",
         "provider_name": "Dr. John Harris, OD", "location": "Vision Associates",
         "chief_complaint": "Annual diabetic eye screening",
         "notes": "No diabetic retinopathy detected. Next annual screening in November 2026."},
    ],
    2: [
        {"appointment_datetime": datetime(2026, 5, 22, 14, 0),
         "appointment_type": "Diabetes Management", "status": "Scheduled",
         "provider_name": "Dr. Robert Kim", "location": "North Medical Center",
         "chief_complaint": "Insulin initiation follow-up and dose titration"},
        {"appointment_datetime": datetime(2026, 1, 28, 10, 30),
         "appointment_type": "Routine Follow-up", "status": "Completed",
         "provider_name": "Dr. Robert Kim", "location": "North Medical Center",
         "chief_complaint": "Quarterly diabetes and CKD management",
         "notes": "Added basal insulin (Lantus 20u HS). eGFR stable at 58. Metformin continued at current dose. Nephrology follow-up in 3 months.",
         "follow_up_date": date(2026, 5, 22)},
        {"appointment_datetime": datetime(2025, 10, 5, 9, 0),
         "appointment_type": "Nephrology", "status": "Completed",
         "provider_name": "Dr. Amy Patel", "location": "Kidney Care Specialists",
         "chief_complaint": "Stage 3 CKD monitoring",
         "notes": "eGFR 58, albumin/creatinine ratio 45 mg/g. Continue ACEi. Low-sodium, low-protein diet counseling."},
    ],
    3: [
        {"appointment_datetime": datetime(2026, 6, 10, 11, 0),
         "appointment_type": "Routine Follow-up", "status": "Scheduled",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "Quarterly T1DM pump and CGM review"},
        {"appointment_datetime": datetime(2026, 3, 12, 10, 0),
         "appointment_type": "Routine Follow-up", "status": "Completed",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "HbA1c review and pump settings",
         "notes": "HbA1c 6.3%. CGM TIR 72%. Adjusted ICR at breakfast 1:10→1:9. No changes to basal.",
         "follow_up_date": date(2026, 6, 10)},
    ],
    4: [
        {"appointment_datetime": datetime(2026, 4, 18, 9, 0),
         "appointment_type": "Diabetes Management", "status": "Completed",
         "provider_name": "Dr. Patricia Williams", "location": "Westside Health",
         "chief_complaint": "Metformin tolerance check and diabetes education",
         "notes": "GI side effects improved with slow titration. Increase to 1000mg BID. Dietitian referral placed.",
         "follow_up_date": date(2026, 7, 18)},
        {"appointment_datetime": datetime(2026, 7, 18, 10, 30),
         "appointment_type": "Routine Follow-up", "status": "Scheduled",
         "provider_name": "Dr. Patricia Williams", "location": "Westside Health",
         "chief_complaint": "3-month follow-up; repeat HbA1c"},
        {"appointment_datetime": datetime(2026, 4, 25, 14, 0),
         "appointment_type": "Dietitian Consult", "status": "Scheduled",
         "provider_name": "Jennifer Park, RD, CDE", "location": "Westside Health",
         "chief_complaint": "Medical nutrition therapy for newly diagnosed T2DM"},
    ],
    9: [
        {"appointment_datetime": datetime(2026, 1, 22, 10, 0),
         "appointment_type": "Lab Review", "status": "Completed",
         "provider_name": "Dr. Patricia Williams", "location": "Westside Health",
         "chief_complaint": "Annual HbA1c — patient doing excellently",
         "notes": "HbA1c 6.2%. Weight 71kg (was 83kg at diagnosis). Reduced follow-up to annual visits. Maintain current Metformin.",
         "follow_up_date": date(2027, 1, 22)},
    ],
    10: [
        {"appointment_datetime": datetime(2026, 1, 30, 9, 30),
         "appointment_type": "Routine Follow-up", "status": "Completed",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "DPP progress review and HbA1c",
         "notes": "HbA1c 5.8%. Lost 6.2kg (7% body weight). DPP program 50% complete. Excellent progress.",
         "follow_up_date": date(2026, 7, 30)},
        {"appointment_datetime": datetime(2026, 7, 30, 10, 0),
         "appointment_type": "Routine Follow-up", "status": "Scheduled",
         "provider_name": "Dr. Sarah Chen", "location": "Riverside Clinic",
         "chief_complaint": "6-month DPP follow-up"},
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# Glucose Reading Generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_glucose_readings(patient_id: int, diabetes_type: str, avg_hba1c: float,
                               num_readings: int = 25) -> list:
    """
    Generate realistic blood glucose readings for a patient.

    The distribution of glucose values is based on the patient's average HbA1c.
    HbA1c correlates with average blood glucose (eAG):
      HbA1c 6.0% → eAG ~126 mg/dL
      HbA1c 7.0% → eAG ~154 mg/dL
      HbA1c 8.0% → eAG ~183 mg/dL
      HbA1c 9.0% → eAG ~212 mg/dL

    Formula: eAG = (28.7 × HbA1c) - 46.7

    Args:
        patient_id:    The patient's database ID
        diabetes_type: "Type 1", "Type 2", etc.
        avg_hba1c:     Patient's most recent HbA1c value
        num_readings:  How many readings to generate (for demo/pagination)
    """
    readings = []
    # Convert HbA1c to estimated average glucose
    eag = (28.7 * avg_hba1c) - 46.7

    # Standard deviation varies by diabetes type (Type 1 has higher variability)
    std_dev = 35 if "Type 1" in diabetes_type or "LADA" in diabetes_type else 22

    reading_types = ["Fasting", "Post-meal", "Pre-meal", "Bedtime", "Random"]
    devices = {
        "Type 1": ["Dexcom G7", "Freestyle Libre 3", "Omnipod CGM", "Tandem CGM"],
        "Type 2": ["Accu-Chek Guide", "OneTouch Ultra 2", "Contour Next", "Freestyle Lite"],
        "LADA":   ["Dexcom G7", "Freestyle Libre 2"],
        "Gestational": ["Accu-Chek Guide", "OneTouch Verio"],
    }
    device_list = devices.get(diabetes_type, ["Accu-Chek Guide", "Contour Next"])

    random.seed(patient_id * 42)  # Reproducible data per patient

    # Generate readings spread over the last 90 days
    for i in range(num_readings):
        days_ago = random.randint(0, 89)
        hour = random.choice([6, 7, 8, 11, 12, 13, 17, 18, 21, 22])
        reading_dt = datetime(2026, 5, 8) - timedelta(days=days_ago, hours=random.randint(0, 2))
        reading_dt = reading_dt.replace(hour=hour, minute=random.randint(0, 59))

        # Apply time-of-day modifiers (fasting is lower than post-meal)
        reading_type = reading_types[i % len(reading_types)]
        modifier = {"Fasting": -15, "Pre-meal": -10, "Post-meal": +35,
                    "Bedtime": +5, "Random": 0}.get(reading_type, 0)

        raw_value = random.gauss(eag + modifier, std_dev)
        value = round(max(45, min(450, raw_value)), 1)  # Clamp to physiologic range

        readings.append({
            "patient_id":       patient_id,
            "value_mgdl":       value,
            "reading_type":     reading_type,
            "reading_datetime": reading_dt,
            "device_used":      random.choice(device_list),
            "notes":            None,
        })

    # Sort by datetime descending so newest appears first
    readings.sort(key=lambda r: r["reading_datetime"], reverse=True)
    return readings


# ─────────────────────────────────────────────────────────────────────────────
# Blood Pressure Reading Generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_bp_readings(patient_id: int, base_systolic: int, base_diastolic: int,
                          num_readings: int = 8) -> list:
    """Generate blood pressure readings around a baseline value."""
    readings = []
    random.seed(patient_id * 17)
    for i in range(num_readings):
        days_ago = random.randint(0, 89)
        reading_dt = datetime(2026, 5, 8) - timedelta(days=days_ago)
        readings.append({
            "patient_id":       patient_id,
            "systolic":         int(random.gauss(base_systolic, 8)),
            "diastolic":        int(random.gauss(base_diastolic, 5)),
            "pulse":            random.randint(60, 90),
            "reading_datetime": reading_dt,
        })
    readings.sort(key=lambda r: r["reading_datetime"], reverse=True)
    return readings


# ─────────────────────────────────────────────────────────────────────────────
# Blood pressure baselines per patient (systolic, diastolic)
# ADA target: < 130/80 for patients with diabetes
# ─────────────────────────────────────────────────────────────────────────────
BP_BASELINES = {
    1:  (128, 78),   # Well-controlled
    2:  (145, 88),   # Hypertension with T2DM + CKD
    3:  (112, 70),   # Young T1DM athlete
    4:  (135, 84),   # Newly diagnosed, slightly elevated
    5:  (118, 74),   # Gestational — closely monitored
    6:  (148, 90),   # Multiple complications, harder to control
    7:  (122, 76),   # LADA — young-ish patient
    8:  (132, 82),   # Heart failure — on multiple agents
    9:  (120, 75),   # Well-controlled T2DM
    10: (134, 85),   # Prediabetes, metabolic syndrome pattern
    11: (110, 68),   # Young T1DM
    12: (138, 86),   # T2DM with GLP-1 — improving
    13: (142, 88),   # T2DM on insulin — hypertension
    14: (108, 65),   # Athlete — low BP at rest
    15: (124, 78),   # Post-bypass — improving metabolic profile
}


# ─────────────────────────────────────────────────────────────────────────────
# Main Seed Function
# ─────────────────────────────────────────────────────────────────────────────

def seed_database(db) -> None:
    """
    Populate the database with sample data if it is empty.

    This function is called once on application startup (see main.py).
    It checks whether patients exist before inserting, so it is safe
    to call repeatedly — it will not duplicate data.

    To reset the data: delete diabetes_emr.db and restart the server.

    Args:
        db: An active SQLAlchemy database session (from SessionLocal)
    """
    from models import (Patient, HbA1cReading, Medication,
                        Appointment, GlucoseReading, BloodPressureReading)

    # ── Skip if already seeded ────────────────────────────────────────────────
    existing_count = db.query(Patient).count()
    if existing_count > 0:
        print(f"[Seed] Database already contains {existing_count} patients. Skipping seed.")
        return

    print("[Seed] Seeding database with sample diabetes patient data...")

    # ── Insert Patients ───────────────────────────────────────────────────────
    for p_data in SAMPLE_PATIENTS:
        patient = Patient(**p_data)
        db.add(patient)
    db.flush()  # Assigns IDs without committing; needed for foreign keys below

    # ── Insert HbA1c readings ─────────────────────────────────────────────────
    for patient_id, hba1c_list in SAMPLE_HBA1C.items():
        for value_pct, test_date, lab_name, notes in hba1c_list:
            db.add(HbA1cReading(
                patient_id=patient_id,
                value_pct=value_pct,
                test_date=test_date,
                lab_name=lab_name,
                notes=notes,
            ))

    # ── Insert Medications ────────────────────────────────────────────────────
    for patient_id, med_list in SAMPLE_MEDICATIONS.items():
        for med in med_list:
            db.add(Medication(patient_id=patient_id, **med))

    # ── Insert Appointments ───────────────────────────────────────────────────
    for patient_id, appt_list in SAMPLE_APPOINTMENTS.items():
        for appt in appt_list:
            db.add(Appointment(patient_id=patient_id, **appt))

    # ── Generate and insert Glucose Readings ─────────────────────────────────
    # Map patient_id to their latest HbA1c for glucose generation
    latest_hba1c_map = {
        pid: values[-1][0] for pid, values in SAMPLE_HBA1C.items()
    }
    type_map = {p["id"]: p["diabetes_type"] for p in SAMPLE_PATIENTS}

    for p_data in SAMPLE_PATIENTS:
        pid = p_data["id"]
        avg_hba1c = latest_hba1c_map.get(pid, 7.0)
        diabetes_type = type_map.get(pid, "Type 2")

        # Generate 25 readings to enable pagination demo
        readings = generate_glucose_readings(pid, diabetes_type, avg_hba1c, num_readings=25)
        for r in readings:
            db.add(GlucoseReading(**r))

    # ── Generate and insert Blood Pressure readings ───────────────────────────
    for p_data in SAMPLE_PATIENTS:
        pid = p_data["id"]
        systolic, diastolic = BP_BASELINES.get(pid, (130, 80))
        bp_readings = generate_bp_readings(pid, systolic, diastolic, num_readings=8)
        for bp in bp_readings:
            db.add(BloodPressureReading(**bp))

    # ── Commit everything in one transaction ─────────────────────────────────
    db.commit()
    print(f"[Seed] Successfully seeded {len(SAMPLE_PATIENTS)} patients with clinical data.")
