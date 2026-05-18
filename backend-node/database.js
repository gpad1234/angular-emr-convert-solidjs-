const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'diabetes_emr.db')
const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name            TEXT    NOT NULL,
      last_name             TEXT    NOT NULL,
      date_of_birth         TEXT    NOT NULL,
      gender                TEXT    NOT NULL,
      phone                 TEXT,
      email                 TEXT,
      diabetes_type         TEXT    NOT NULL,
      diagnosis_date        TEXT,
      weight_kg             REAL,
      height_cm             REAL,
      insurance_id          TEXT,
      primary_care_provider TEXT,
      notes                 TEXT,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hba1c_readings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      value_pct  REAL    NOT NULL,
      test_date  TEXT    NOT NULL,
      lab_name   TEXT,
      notes      TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS glucose_readings (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id       INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      value_mgdl       REAL    NOT NULL,
      reading_type     TEXT    NOT NULL,
      reading_datetime TEXT    NOT NULL,
      device_used      TEXT,
      notes            TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blood_pressure_readings (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id       INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      systolic         INTEGER NOT NULL,
      diastolic        INTEGER NOT NULL,
      pulse            INTEGER,
      reading_datetime TEXT    NOT NULL,
      notes            TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medications (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id            INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      medication_name       TEXT    NOT NULL,
      brand_name            TEXT,
      dosage                TEXT,
      frequency             TEXT,
      route                 TEXT,
      start_date            TEXT,
      end_date              TEXT,
      prescribing_provider  TEXT,
      notes                 TEXT,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id            INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      appointment_datetime  TEXT    NOT NULL,
      appointment_type      TEXT    NOT NULL,
      status                TEXT    NOT NULL DEFAULT 'Scheduled',
      provider_name         TEXT,
      location              TEXT,
      chief_complaint       TEXT,
      notes                 TEXT,
      follow_up_date        TEXT,
      created_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

// ─────────────────────────────────────────────────────────────────────────────
// Sample Data
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_PATIENTS = [
  { id: 1,  first_name: 'Maria',    last_name: 'Garcia',     date_of_birth: '1974-03-15', gender: 'Female', phone: '555-0101', email: 'maria.garcia@example.com',     diabetes_type: 'Type 2',     diagnosis_date: '2021-06-10', weight_kg: 78.5,  height_cm: 162.0, insurance_id: 'BCB-001234', primary_care_provider: 'Dr. Sarah Chen',       notes: 'Patient is compliant with medications. Reports improved diet and 20-min daily walks. Needs annual ophthalmology screening.' },
  { id: 2,  first_name: 'James',    last_name: 'Washington', date_of_birth: '1957-11-22', gender: 'Male',   phone: '555-0102', email: 'james.washington@example.com', diabetes_type: 'Type 2',     diagnosis_date: '2012-02-05', weight_kg: 98.2,  height_cm: 178.0, insurance_id: 'MCR-007841', primary_care_provider: 'Dr. Robert Kim',       notes: 'Long-standing T2DM with early nephropathy (eGFR 58). On ACE inhibitor. Poorly adherent with diet. Requires medication adjustment.' },
  { id: 3,  first_name: 'Emily',    last_name: 'Chen',       date_of_birth: '1998-07-08', gender: 'Female', phone: '555-0103', email: 'emily.chen@example.com',       diabetes_type: 'Type 1',     diagnosis_date: '2011-09-14', weight_kg: 58.0,  height_cm: 165.0, insurance_id: 'UHC-445521', primary_care_provider: 'Dr. Sarah Chen',       notes: 'Using Omnipod Dash insulin pump with Dexcom G7 CGM. Very motivated. Works with certified diabetes educator monthly. Excellent control.' },
  { id: 4,  first_name: 'Robert',   last_name: 'Johnson',    date_of_birth: '1981-04-30', gender: 'Male',   phone: '555-0104', email: 'robert.johnson@example.com',   diabetes_type: 'Type 2',     diagnosis_date: '2025-10-12', weight_kg: 102.0, height_cm: 183.0, insurance_id: 'AET-228847', primary_care_provider: 'Dr. Patricia Williams', notes: 'Recently diagnosed. Very motivated for lifestyle change. Starting with Metformin and intensive dietary counseling. No complications yet.' },
  { id: 5,  first_name: 'Sarah',    last_name: 'Williams',   date_of_birth: '1992-09-05', gender: 'Female', phone: '555-0105', email: 'sarah.williams@example.com',   diabetes_type: 'Gestational',diagnosis_date: '2026-02-20', weight_kg: 74.0,  height_cm: 168.0, insurance_id: 'CIG-112233', primary_care_provider: 'Dr. Patricia Williams', notes: '28 weeks pregnant. Gestational diabetes diagnosed at 24-week screen. Monitoring 4x/day. Diet-controlled so far. Follow up with OB/MFM.' },
  { id: 6,  first_name: 'David',    last_name: 'Kim',        date_of_birth: '1968-05-18', gender: 'Male',   phone: '555-0106', email: 'david.kim@example.com',        diabetes_type: 'Type 2',     diagnosis_date: '2008-11-03', weight_kg: 85.0,  height_cm: 172.0, insurance_id: 'BCB-998877', primary_care_provider: 'Dr. Robert Kim',       notes: 'Long-standing T2DM with multiple complications: background diabetic retinopathy (bilateral), stage 3a nephropathy, and peripheral neuropathy in feet. On triple oral therapy. Podiatry referral pending.' },
  { id: 7,  first_name: 'Lisa',     last_name: 'Thompson',   date_of_birth: '1984-01-27', gender: 'Female', phone: '555-0107', email: 'lisa.thompson@example.com',    diabetes_type: 'LADA',       diagnosis_date: '2022-04-08', weight_kg: 63.0,  height_cm: 170.0, insurance_id: 'UHC-775544', primary_care_provider: 'Dr. Sarah Chen',       notes: 'LADA confirmed by positive anti-GAD antibodies. Initially misdiagnosed as T2DM. Transitioning off sulfonylurea to basal insulin as C-peptide declines.' },
  { id: 8,  first_name: 'Michael',  last_name: 'Brown',      date_of_birth: '1953-08-14', gender: 'Male',   phone: '555-0108', email: 'm.brown@example.com',          diabetes_type: 'Type 2',     diagnosis_date: '2005-03-21', weight_kg: 91.0,  height_cm: 175.0, insurance_id: 'MCR-003344', primary_care_provider: 'Dr. Robert Kim',       notes: 'Complex patient with T2DM, HTN, HFrEF (EF 40%), and CAD. SGLT-2 inhibitor chosen for cardiorenal benefit. Cardiology co-managing.' },
  { id: 9,  first_name: 'Jennifer', last_name: 'Martinez',   date_of_birth: '1987-06-12', gender: 'Female', phone: '555-0109', email: 'jennifer.martinez@example.com', diabetes_type: 'Type 2',    diagnosis_date: '2020-08-14', weight_kg: 71.0,  height_cm: 163.0, insurance_id: 'AET-556677', primary_care_provider: 'Dr. Patricia Williams', notes: 'Excellent adherence. Lost 12kg since diagnosis through lifestyle modification. HbA1c improved from 8.4% to 6.2%. Currently well controlled.' },
  { id: 10, first_name: 'Thomas',   last_name: 'Anderson',   date_of_birth: '1971-12-03', gender: 'Male',   phone: '555-0110', email: 't.anderson@example.com',       diabetes_type: 'Prediabetes',diagnosis_date: '2025-01-15', weight_kg: 89.0,  height_cm: 180.0, insurance_id: 'BCB-334455', primary_care_provider: 'Dr. Sarah Chen',       notes: 'Prediabetes identified on routine screening. Strong family history T2DM (father, brother). Enrolled in CDC Diabetes Prevention Program. Goal: 7% body weight loss.' },
  { id: 11, first_name: 'Ashley',   last_name: 'Davis',      date_of_birth: '1995-02-19', gender: 'Female', phone: '555-0111', email: 'ashley.davis@example.com',     diabetes_type: 'Type 1',     diagnosis_date: '2008-11-30', weight_kg: 61.0,  height_cm: 167.0, insurance_id: 'CIG-889966', primary_care_provider: 'Dr. Sarah Chen',       notes: 'T1DM since age 13. Uses Tandem Control-IQ closed-loop system. Occasional DKA episodes in early 20s; now well-managed. Hypoglycemia unawareness — lower threshold set on CGM.' },
  { id: 12, first_name: 'Carlos',   last_name: 'Rodriguez',  date_of_birth: '1978-10-07', gender: 'Male',   phone: '555-0112', email: 'carlos.rod@example.com',       diabetes_type: 'Type 2',     diagnosis_date: '2018-07-22', weight_kg: 88.0,  height_cm: 174.0, insurance_id: 'UHC-662211', primary_care_provider: 'Dr. Patricia Williams', notes: 'T2DM with family history. GLP-1 agonist added for weight management and cardiovascular risk reduction. Reports nausea improving over time.' },
  { id: 13, first_name: 'Patricia', last_name: 'Wilson',     date_of_birth: '1963-04-25', gender: 'Female', phone: '555-0113', email: 'p.wilson@example.com',         diabetes_type: 'Type 2',     diagnosis_date: '2010-09-06', weight_kg: 82.0,  height_cm: 160.0, insurance_id: 'MCR-112244', primary_care_provider: 'Dr. Robert Kim',       notes: 'Progressive T2DM now on basal-bolus insulin regimen. Fear of hypoglycemia limits dose increases. Requires counseling on hypoglycemia recognition and treatment.' },
  { id: 14, first_name: 'Kevin',    last_name: 'Taylor',     date_of_birth: '1989-08-31', gender: 'Male',   phone: '555-0114', email: 'kevin.taylor@example.com',     diabetes_type: 'Type 1',     diagnosis_date: '2007-05-11', weight_kg: 75.0,  height_cm: 180.0, insurance_id: 'AET-771133', primary_care_provider: 'Dr. Sarah Chen',       notes: 'Competitive triathlete with T1DM. Manages around intense exercise schedule. Uses temp basal reductions before events. Carb-loads with monitoring.' },
  { id: 15, first_name: 'Sandra',   last_name: 'Lee',        date_of_birth: '1970-06-17', gender: 'Female', phone: '555-0115', email: 'sandra.lee@example.com',       diabetes_type: 'Type 2',     diagnosis_date: '2015-03-04', weight_kg: 72.0,  height_cm: 159.0, insurance_id: 'BCB-445566', primary_care_provider: 'Dr. Patricia Williams', notes: 'T2DM resolved following Roux-en-Y gastric bypass (2023). Currently in diabetes remission — HbA1c 5.9% off medications. Monitoring annually for recurrence.' },
]

const SAMPLE_HBA1C = {
  1:  [[8.1,'2025-02-10','Quest Diagnostics','Above target; counseled on diet'],[7.6,'2025-05-12','Quest Diagnostics','Improving with Metformin increase'],[7.2,'2025-08-14','Quest Diagnostics','Continues to improve'],[6.9,'2026-02-20','Quest Diagnostics','At target range']],
  2:  [[10.2,'2025-01-05','LabCorp','Poorly controlled; medication adjusted'],[9.8,'2025-04-08','LabCorp','Slight improvement; compliance issues'],[10.1,'2025-07-14','LabCorp','Worsening; nephrology referral placed'],[9.4,'2026-01-20','LabCorp','Insulin added to regimen']],
  3:  [[6.4,'2025-03-01','Quest Diagnostics','Excellent control with pump therapy'],[6.2,'2025-06-05','Quest Diagnostics','CGM data reviewed; adjustments minimal'],[6.5,'2025-09-08','Quest Diagnostics','Slightly up — review pump settings'],[6.3,'2026-03-12','Quest Diagnostics','Back to excellent control']],
  4:  [[8.9,'2025-10-20','LabCorp','Baseline at diagnosis'],[7.8,'2026-01-18','LabCorp','Improving with Metformin and lifestyle']],
  5:  [[5.6,'2026-02-25','Quest Diagnostics','Baseline before gestational DM diagnosis — normal'],[5.8,'2026-04-15','Quest Diagnostics','Diet-controlled gestational DM']],
  6:  [[9.2,'2025-02-08','LabCorp','Poorly controlled; added 3rd agent'],[8.7,'2025-05-11','LabCorp','Modest improvement'],[8.9,'2025-08-06','LabCorp','Nephrology flagged eGFR < 60'],[8.4,'2026-02-03','LabCorp','Marginal improvement; basal insulin discussion']],
  7:  [[7.4,'2025-04-10','Quest Diagnostics','Metformin only — early LADA'],[7.9,'2025-07-22','Quest Diagnostics','C-peptide declining; sulfonylurea added'],[8.1,'2025-10-15','Quest Diagnostics','Transitioning to basal insulin'],[7.3,'2026-02-28','Quest Diagnostics','Better control on insulin']],
  8:  [[8.0,'2025-03-14','LabCorp','Baseline at SGLT-2 start'],[7.6,'2025-06-12','LabCorp','Improving — also on ACEi + beta-blocker'],[7.3,'2025-09-18','LabCorp','Continued improvement'],[7.1,'2026-03-05','LabCorp','Near target for cardiac comorbidity']],
  9:  [[8.4,'2025-01-06','Quest Diagnostics','At diagnosis with lifestyle intervention'],[7.1,'2025-04-09','Quest Diagnostics','6kg weight loss achieved'],[6.5,'2025-07-14','Quest Diagnostics','12kg total loss — excellent progress'],[6.2,'2026-01-22','Quest Diagnostics','Well controlled — reduced to annual labs']],
  10: [[6.1,'2025-01-20','Quest Diagnostics','Prediabetes; DPP program enrolled'],[5.9,'2025-07-15','Quest Diagnostics','5% weight loss achieved'],[5.8,'2026-01-30','Quest Diagnostics','Trending toward normal — continue lifestyle mod']],
  11: [[6.8,'2025-02-14','LabCorp','Closed-loop pump data excellent'],[6.6,'2025-05-20','LabCorp','Hypoglycemia awareness improved with CGM alerts'],[6.9,'2025-08-25','LabCorp','Slight increase — reviewed carb ratios'],[6.7,'2026-02-18','LabCorp','Stable control']],
  12: [[8.6,'2025-03-08','Quest Diagnostics','Started GLP-1 agonist'],[7.8,'2025-06-11','Quest Diagnostics','GLP-1 + Metformin working; weight -5kg'],[7.3,'2025-09-22','Quest Diagnostics','Continued improvement'],[6.9,'2026-03-18','Quest Diagnostics','At target — good cardiovascular risk reduction']],
  13: [[9.5,'2025-02-05','LabCorp','Started basal-bolus insulin — adjustment in progress'],[8.7,'2025-05-09','LabCorp','Improving but hypoglycemia fear limiting doses'],[8.2,'2025-08-13','LabCorp','Counseling on hypoglycemia management helping'],[7.8,'2026-02-10','LabCorp','Best control in years']],
  14: [[6.5,'2025-03-18','Quest Diagnostics','Athlete management — temp basal strategy'],[6.3,'2025-06-22','Quest Diagnostics','Triathlon season: frequent CGM review'],[6.7,'2025-09-15','Quest Diagnostics','Post-season; carb intake normalized'],[6.4,'2026-03-10','Quest Diagnostics','Excellent overall control']],
  15: [[6.8,'2025-03-20','Quest Diagnostics','12 months post-bypass — gradual improvement'],[6.2,'2025-09-11','Quest Diagnostics','Significant improvement — reducing medications'],[5.9,'2026-03-04','Quest Diagnostics','Diabetes remission — off all diabetes meds']],
}

const SAMPLE_MEDICATIONS = {
  1: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2021-06-15', prescribing_provider: 'Dr. Sarah Chen', notes: 'Titrated from 500mg over 4 weeks to reduce GI side effects' },
    { medication_name: 'Empagliflozin', brand_name: 'Jardiance', dosage: '10mg', frequency: 'Once daily in the morning', route: 'Oral', start_date: '2023-03-01', prescribing_provider: 'Dr. Sarah Chen', notes: 'Added for additional HbA1c lowering and cardiovascular protection' },
  ],
  2: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2012-03-01', prescribing_provider: 'Dr. Robert Kim' },
    { medication_name: 'Glipizide', brand_name: 'Glucotrol', dosage: '10mg', frequency: 'Once daily before breakfast', route: 'Oral', start_date: '2015-06-10', prescribing_provider: 'Dr. Robert Kim', notes: 'Monitor for hypoglycemia — patient skips breakfast occasionally' },
    { medication_name: 'Insulin Glargine', brand_name: 'Lantus', dosage: '20 units', frequency: 'Once daily at bedtime', route: 'Subcutaneous', start_date: '2026-01-25', prescribing_provider: 'Dr. Robert Kim', notes: 'Basal insulin added. Start 20u, titrate 2u every 3 days to fasting BG 80-130' },
    { medication_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', route: 'Oral', start_date: '2016-02-08', prescribing_provider: 'Dr. Robert Kim', notes: 'ACE inhibitor for nephroprotection — monitor potassium and creatinine' },
  ],
  3: [
    { medication_name: 'Insulin Aspart', brand_name: 'NovoLog', dosage: 'Per pump bolus calculator', frequency: 'With each meal and correction doses', route: 'Subcutaneous (insulin pump)', start_date: '2019-05-01', prescribing_provider: 'Dr. Sarah Chen', notes: 'Using Omnipod Dash. ICR 1:10 breakfast, 1:12 lunch/dinner. ISF 1:45' },
    { medication_name: 'Insulin Aspart basal (pump)', brand_name: 'NovoLog', dosage: '0.65 u/hr average basal rate', frequency: 'Continuous subcutaneous infusion', route: 'Subcutaneous (insulin pump)', start_date: '2019-05-01', prescribing_provider: 'Dr. Sarah Chen' },
  ],
  4: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '500mg', frequency: 'Once daily with dinner (will increase)', route: 'Oral', start_date: '2025-10-20', prescribing_provider: 'Dr. Patricia Williams', notes: 'Starting dose. Plan to increase to 1000mg BID over 4 weeks if tolerated' },
  ],
  5: [
    { medication_name: 'Glyburide', brand_name: 'Diabeta', dosage: '2.5mg', frequency: 'Once daily with breakfast', route: 'Oral', start_date: '2026-03-28', prescribing_provider: 'Dr. Patricia Williams', notes: 'Added when fasting BG > 95 mg/dL despite diet. Continue monitoring 4x/day' },
  ],
  6: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2008-11-10', prescribing_provider: 'Dr. Robert Kim' },
    { medication_name: 'Sitagliptin', brand_name: 'Januvia', dosage: '50mg', frequency: 'Once daily', route: 'Oral', start_date: '2018-04-05', prescribing_provider: 'Dr. Robert Kim', notes: 'Dose reduced to 50mg due to eGFR < 60 (renal dose adjustment required)' },
    { medication_name: 'Insulin Glargine', brand_name: 'Basaglar', dosage: '18 units', frequency: 'Once daily at bedtime', route: 'Subcutaneous', start_date: '2023-09-15', prescribing_provider: 'Dr. Robert Kim' },
  ],
  7: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2022-04-15', prescribing_provider: 'Dr. Sarah Chen' },
    { medication_name: 'Insulin Glargine', brand_name: 'Toujeo', dosage: '14 units', frequency: 'Once daily at bedtime', route: 'Subcutaneous', start_date: '2025-10-20', prescribing_provider: 'Dr. Sarah Chen', notes: 'Started as C-peptide declining. Will add rapid-acting when HbA1c > 8%' },
  ],
  8: [
    { medication_name: 'Empagliflozin', brand_name: 'Jardiance', dosage: '10mg', frequency: 'Once daily in the morning', route: 'Oral', start_date: '2025-03-20', prescribing_provider: 'Dr. Robert Kim', notes: 'Chosen for EMPA-REG OUTCOME cardiorenal benefit (HFrEF + CKD + T2DM)' },
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '500mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2005-04-01', prescribing_provider: 'Dr. Robert Kim', notes: 'Reduced dose due to eGFR monitoring' },
    { medication_name: 'Carvedilol', brand_name: 'Coreg', dosage: '12.5mg', frequency: 'Twice daily', route: 'Oral', start_date: '2020-01-15', prescribing_provider: 'Cardiology', notes: 'For HFrEF — cardiology managed' },
  ],
  9:  [{ medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2020-08-20', prescribing_provider: 'Dr. Patricia Williams' }],
  10: [{ medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '500mg', frequency: 'Once daily with dinner', route: 'Oral', start_date: '2025-06-01', prescribing_provider: 'Dr. Sarah Chen', notes: 'DPP trial evidence supports Metformin for high-risk prediabetes' }],
  11: [{ medication_name: 'Insulin Lispro', brand_name: 'Humalog', dosage: 'Per Control-IQ algorithm', frequency: 'Continuous + meal boluses', route: 'Subcutaneous (Tandem pump)', start_date: '2021-03-15', prescribing_provider: 'Dr. Sarah Chen', notes: 'Tandem Control-IQ closed-loop. CGM lower alert set to 80 (unawareness)' }],
  12: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily with meals', route: 'Oral', start_date: '2018-07-30', prescribing_provider: 'Dr. Patricia Williams' },
    { medication_name: 'Semaglutide', brand_name: 'Ozempic', dosage: '1mg', frequency: 'Once weekly injection', route: 'Subcutaneous', start_date: '2025-03-15', prescribing_provider: 'Dr. Patricia Williams', notes: 'GLP-1 agonist for HbA1c and weight reduction. Titrated from 0.25mg over 4 weeks' },
  ],
  13: [
    { medication_name: 'Insulin Glargine', brand_name: 'Lantus', dosage: '22 units', frequency: 'Once daily at bedtime', route: 'Subcutaneous', start_date: '2021-05-10', prescribing_provider: 'Dr. Robert Kim' },
    { medication_name: 'Insulin Aspart', brand_name: 'NovoLog', dosage: '6-8 units', frequency: 'Before each meal (per sliding scale)', route: 'Subcutaneous', start_date: '2021-05-10', prescribing_provider: 'Dr. Robert Kim', notes: 'Sliding scale: < 150 = 0u, 151-200 = 2u, 201-250 = 4u, 251-300 = 6u, > 300 call' },
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily', route: 'Oral', start_date: '2010-09-15', prescribing_provider: 'Dr. Robert Kim' },
  ],
  14: [
    { medication_name: 'Insulin Lispro', brand_name: 'Humalog', dosage: 'Per correction factor + carb ratio', frequency: 'Pre-meal bolus', route: 'Subcutaneous', start_date: '2015-08-01', prescribing_provider: 'Dr. Sarah Chen', notes: 'ICR 1:15. Temp basal -30% starting 90 min before exercise; +30% after intense sessions' },
    { medication_name: 'Insulin Detemir', brand_name: 'Levemir', dosage: '12 units', frequency: 'Once daily in the evening', route: 'Subcutaneous', start_date: '2015-08-01', prescribing_provider: 'Dr. Sarah Chen' },
  ],
  15: [
    { medication_name: 'Metformin', brand_name: 'Glucophage', dosage: '1000mg', frequency: 'Twice daily', route: 'Oral', start_date: '2015-03-10', end_date: '2025-12-01', prescribing_provider: 'Dr. Patricia Williams', notes: 'Discontinued 18 months post-bypass — HbA1c < 6.5% without medication' },
  ],
}

const SAMPLE_APPOINTMENTS = {
  1: [
    { appointment_datetime: '2026-05-15T10:00:00', appointment_type: 'Routine Follow-up', status: 'Scheduled', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: '3-month diabetes follow-up', follow_up_date: '2026-08-15' },
    { appointment_datetime: '2026-02-20T09:30:00', appointment_type: 'Lab Review', status: 'Completed', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: 'HbA1c result review', notes: 'HbA1c 6.9% — at target. Continue current regimen. Praised patient on lifestyle changes.', follow_up_date: '2026-05-15' },
    { appointment_datetime: '2025-11-12T11:00:00', appointment_type: 'Ophthalmology', status: 'Completed', provider_name: 'Dr. John Harris, OD', location: 'Vision Associates', chief_complaint: 'Annual diabetic eye screening', notes: 'No diabetic retinopathy detected. Next annual screening in November 2026.' },
  ],
  2: [
    { appointment_datetime: '2026-05-22T14:00:00', appointment_type: 'Diabetes Management', status: 'Scheduled', provider_name: 'Dr. Robert Kim', location: 'North Medical Center', chief_complaint: 'Insulin initiation follow-up and dose titration' },
    { appointment_datetime: '2026-01-28T10:30:00', appointment_type: 'Routine Follow-up', status: 'Completed', provider_name: 'Dr. Robert Kim', location: 'North Medical Center', chief_complaint: 'Quarterly diabetes and CKD management', notes: 'Added basal insulin (Lantus 20u HS). eGFR stable at 58. Metformin continued at current dose.', follow_up_date: '2026-05-22' },
    { appointment_datetime: '2025-10-05T09:00:00', appointment_type: 'Nephrology', status: 'Completed', provider_name: 'Dr. Amy Patel', location: 'Kidney Care Specialists', chief_complaint: 'Stage 3 CKD monitoring', notes: 'eGFR 58, albumin/creatinine ratio 45 mg/g. Continue ACEi. Low-sodium, low-protein diet counseling.' },
  ],
  3: [
    { appointment_datetime: '2026-06-10T11:00:00', appointment_type: 'Routine Follow-up', status: 'Scheduled', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: 'Quarterly T1DM pump and CGM review' },
    { appointment_datetime: '2026-03-12T10:00:00', appointment_type: 'Routine Follow-up', status: 'Completed', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: 'HbA1c review and pump settings', notes: 'HbA1c 6.3%. CGM TIR 72%. Adjusted ICR at breakfast 1:10→1:9. No changes to basal.', follow_up_date: '2026-06-10' },
  ],
  4: [
    { appointment_datetime: '2026-04-18T09:00:00', appointment_type: 'Diabetes Management', status: 'Completed', provider_name: 'Dr. Patricia Williams', location: 'Westside Health', chief_complaint: 'Metformin tolerance check and diabetes education', notes: 'GI side effects improved with slow titration. Increase to 1000mg BID. Dietitian referral placed.', follow_up_date: '2026-07-18' },
    { appointment_datetime: '2026-07-18T10:30:00', appointment_type: 'Routine Follow-up', status: 'Scheduled', provider_name: 'Dr. Patricia Williams', location: 'Westside Health', chief_complaint: '3-month follow-up; repeat HbA1c' },
    { appointment_datetime: '2026-04-25T14:00:00', appointment_type: 'Dietitian Consult', status: 'Scheduled', provider_name: 'Jennifer Park, RD, CDE', location: 'Westside Health', chief_complaint: 'Medical nutrition therapy for newly diagnosed T2DM' },
  ],
  9: [
    { appointment_datetime: '2026-01-22T10:00:00', appointment_type: 'Lab Review', status: 'Completed', provider_name: 'Dr. Patricia Williams', location: 'Westside Health', chief_complaint: 'Annual HbA1c — patient doing excellently', notes: 'HbA1c 6.2%. Weight 71kg (was 83kg at diagnosis). Reduced follow-up to annual visits. Maintain current Metformin.', follow_up_date: '2027-01-22' },
  ],
  10: [
    { appointment_datetime: '2026-01-30T09:30:00', appointment_type: 'Routine Follow-up', status: 'Completed', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: 'DPP progress review and HbA1c', notes: 'HbA1c 5.8%. Lost 6.2kg (7% body weight). DPP program 50% complete. Excellent progress.', follow_up_date: '2026-07-30' },
    { appointment_datetime: '2026-07-30T10:00:00', appointment_type: 'Routine Follow-up', status: 'Scheduled', provider_name: 'Dr. Sarah Chen', location: 'Riverside Clinic', chief_complaint: '6-month DPP follow-up' },
  ],
}

// BP baselines: [systolic, diastolic]
const BP_BASELINES = {
  1: [128,78], 2: [145,88], 3: [112,70], 4: [135,84], 5: [118,74],
  6: [148,90], 7: [122,76], 8: [132,82], 9: [120,75], 10: [134,85],
  11: [110,68], 12: [138,86], 13: [142,88], 14: [108,65], 15: [124,78],
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeding Helpers (deterministic pseudo-random, matching Python logic)
// ─────────────────────────────────────────────────────────────────────────────

function seededRandom(seed) {
  // Simple LCG matching general behaviour of Python's random.seed+gauss
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function gaussRandom(rng, mean, std) {
  // Box-Muller transform
  const u1 = rng() || 1e-10
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

function generateGlucoseReadings(patientId, diabetesType, avgHba1c, numReadings = 25) {
  const eag = (28.7 * avgHba1c) - 46.7
  const stdDev = (diabetesType.includes('Type 1') || diabetesType === 'LADA') ? 35 : 22
  const readingTypes = ['Fasting', 'Post-meal', 'Pre-meal', 'Bedtime', 'Random']
  const devicesByType = {
    'Type 1':     ['Dexcom G7','Freestyle Libre 3','Omnipod CGM','Tandem CGM'],
    'Type 2':     ['Accu-Chek Guide','OneTouch Ultra 2','Contour Next','Freestyle Lite'],
    'LADA':       ['Dexcom G7','Freestyle Libre 2'],
    'Gestational':['Accu-Chek Guide','OneTouch Verio'],
  }
  const deviceList = devicesByType[diabetesType] || ['Accu-Chek Guide','Contour Next']
  const modifiers = { Fasting: -15, 'Pre-meal': -10, 'Post-meal': +35, Bedtime: +5, Random: 0 }

  const rng = seededRandom(patientId * 42)
  const readings = []
  const baseDate = new Date('2026-05-08T00:00:00Z')

  for (let i = 0; i < numReadings; i++) {
    const daysAgo = Math.floor(rng() * 90)
    const hourChoices = [6,7,8,11,12,13,17,18,21,22]
    const hour = hourChoices[Math.floor(rng() * hourChoices.length)]
    const extraHours = Math.floor(rng() * 3)
    const minute = Math.floor(rng() * 60)

    const dt = new Date(baseDate)
    dt.setUTCDate(dt.getUTCDate() - daysAgo - extraHours / 24)
    dt.setUTCHours(hour, minute, 0, 0)

    const readingType = readingTypes[i % readingTypes.length]
    const modifier = modifiers[readingType] || 0
    const rawValue = gaussRandom(rng, eag + modifier, stdDev)
    const value = Math.round(Math.max(45, Math.min(450, rawValue)) * 10) / 10
    const device = deviceList[Math.floor(rng() * deviceList.length)]

    readings.push({
      patient_id: patientId,
      value_mgdl: value,
      reading_type: readingType,
      reading_datetime: dt.toISOString().replace('T', ' ').slice(0, 19),
      device_used: device,
      notes: null,
    })
  }

  readings.sort((a, b) => b.reading_datetime.localeCompare(a.reading_datetime))
  return readings
}

function generateBpReadings(patientId, baseSystolic, baseDiastolic, numReadings = 8) {
  const rng = seededRandom(patientId * 17)
  const readings = []
  const baseDate = new Date('2026-05-08T00:00:00Z')

  for (let i = 0; i < numReadings; i++) {
    const daysAgo = Math.floor(rng() * 90)
    const dt = new Date(baseDate)
    dt.setUTCDate(dt.getUTCDate() - daysAgo)
    const systolic = Math.round(gaussRandom(rng, baseSystolic, 8))
    const diastolic = Math.round(gaussRandom(rng, baseDiastolic, 5))
    const pulse = 60 + Math.floor(rng() * 31)

    readings.push({
      patient_id: patientId,
      systolic,
      diastolic,
      pulse,
      reading_datetime: dt.toISOString().replace('T', ' ').slice(0, 19),
    })
  }

  readings.sort((a, b) => b.reading_datetime.localeCompare(a.reading_datetime))
  return readings
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as n FROM patients').get().n
  if (count > 0) {
    console.log(`[Seed] Database already has ${count} patients. Skipping.`)
    return
  }

  console.log('[Seed] Seeding database with sample data...')

  const insertPatient = db.prepare(`
    INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email,
      diabetes_type, diagnosis_date, weight_kg, height_cm, insurance_id, primary_care_provider, notes)
    VALUES (@id, @first_name, @last_name, @date_of_birth, @gender, @phone, @email,
      @diabetes_type, @diagnosis_date, @weight_kg, @height_cm, @insurance_id, @primary_care_provider, @notes)
  `)

  const insertHba1c = db.prepare(`
    INSERT INTO hba1c_readings (patient_id, value_pct, test_date, lab_name, notes)
    VALUES (@patient_id, @value_pct, @test_date, @lab_name, @notes)
  `)

  const insertMed = db.prepare(`
    INSERT INTO medications (patient_id, medication_name, brand_name, dosage, frequency, route,
      start_date, end_date, prescribing_provider, notes)
    VALUES (@patient_id, @medication_name, @brand_name, @dosage, @frequency, @route,
      @start_date, @end_date, @prescribing_provider, @notes)
  `)

  const insertAppt = db.prepare(`
    INSERT INTO appointments (patient_id, appointment_datetime, appointment_type, status,
      provider_name, location, chief_complaint, notes, follow_up_date)
    VALUES (@patient_id, @appointment_datetime, @appointment_type, @status,
      @provider_name, @location, @chief_complaint, @notes, @follow_up_date)
  `)

  const insertGlucose = db.prepare(`
    INSERT INTO glucose_readings (patient_id, value_mgdl, reading_type, reading_datetime, device_used, notes)
    VALUES (@patient_id, @value_mgdl, @reading_type, @reading_datetime, @device_used, @notes)
  `)

  const insertBp = db.prepare(`
    INSERT INTO blood_pressure_readings (patient_id, systolic, diastolic, pulse, reading_datetime)
    VALUES (@patient_id, @systolic, @diastolic, @pulse, @reading_datetime)
  `)

  const seedAll = db.transaction(() => {
    // Patients
    for (const p of SAMPLE_PATIENTS) insertPatient.run(p)

    // HbA1c
    for (const [pidStr, list] of Object.entries(SAMPLE_HBA1C)) {
      const pid = Number(pidStr)
      for (const [value_pct, test_date, lab_name, notes] of list) {
        insertHba1c.run({ patient_id: pid, value_pct, test_date, lab_name, notes })
      }
    }

    // Medications
    for (const [pidStr, list] of Object.entries(SAMPLE_MEDICATIONS)) {
      const pid = Number(pidStr)
      for (const m of list) {
        insertMed.run({
          patient_id: pid,
          medication_name: m.medication_name,
          brand_name: m.brand_name ?? null,
          dosage: m.dosage ?? null,
          frequency: m.frequency ?? null,
          route: m.route ?? null,
          start_date: m.start_date ?? null,
          end_date: m.end_date ?? null,
          prescribing_provider: m.prescribing_provider ?? null,
          notes: m.notes ?? null,
        })
      }
    }

    // Appointments
    for (const [pidStr, list] of Object.entries(SAMPLE_APPOINTMENTS)) {
      const pid = Number(pidStr)
      for (const a of list) {
        insertAppt.run({
          patient_id: pid,
          appointment_datetime: a.appointment_datetime,
          appointment_type: a.appointment_type,
          status: a.status,
          provider_name: a.provider_name ?? null,
          location: a.location ?? null,
          chief_complaint: a.chief_complaint ?? null,
          notes: a.notes ?? null,
          follow_up_date: a.follow_up_date ?? null,
        })
      }
    }

    // Glucose readings
    const latestHba1c = {}
    for (const [pidStr, list] of Object.entries(SAMPLE_HBA1C)) {
      latestHba1c[Number(pidStr)] = list[list.length - 1][0]
    }
    for (const p of SAMPLE_PATIENTS) {
      const avgHba1c = latestHba1c[p.id] ?? 7.0
      const readings = generateGlucoseReadings(p.id, p.diabetes_type, avgHba1c, 25)
      for (const r of readings) insertGlucose.run(r)
    }

    // Blood pressure readings
    for (const p of SAMPLE_PATIENTS) {
      const [sys, dia] = BP_BASELINES[p.id] ?? [130, 80]
      const bpReadings = generateBpReadings(p.id, sys, dia, 8)
      for (const bp of bpReadings) insertBp.run(bp)
    }
  })

  seedAll()
  console.log(`[Seed] Seeded ${SAMPLE_PATIENTS.length} patients with clinical data.`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────────────────────

function initDb() {
  createTables()
  seedDatabase()
}

// Reset DB contents but keep schema intact. Useful for tests.
function resetDb() {
  const tables = [
    'hba1c_readings',
    'glucose_readings',
    'blood_pressure_readings',
    'medications',
    'appointments',
    'patients',
  ]

  const existsStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")

  const deleteTx = db.transaction(() => {
    for (const t of tables) {
      const row = existsStmt.get(t)
      if (row) {
        db.prepare(`DELETE FROM ${t}`).run()
      }
    }
  })

  deleteTx()
  try {
    db.exec('VACUUM')
  } catch (e) {
    // VACUUM may be a no-op on in-memory DBs; ignore errors
  }
}

module.exports = { db, initDb, resetDb }
