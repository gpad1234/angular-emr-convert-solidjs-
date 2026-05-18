const express = require('express')
const { db } = require('../database')
const router = express.Router()

// Helper: compute BMI
function computeBmi(weight_kg, height_cm) {
  if (!weight_kg || !height_cm) return null
  return Math.round((weight_kg / Math.pow(height_cm / 100, 2)) * 10) / 10
}

// Helper: format patient row with bmi
function formatPatient(row) {
  return {
    ...row,
    bmi: computeBmi(row.weight_kg, row.height_cm),
  }
}

// Helper: rename value_pct → value_percent to match frontend expectations
function formatHba1c(row) {
  if (!row) return null
  const { value_pct, ...rest } = row
  return { ...rest, value_percent: value_pct }
}

// GET /api/v1/patients
router.get('/patients', (req, res) => {
  const skip = Math.max(0, parseInt(req.query.skip) || 0)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const search = (req.query.search || '').trim()
  const diabetesType = req.query.diabetes_type || ''

  let where = []
  let params = {}

  if (search) {
    where.push(`(first_name LIKE @search OR last_name LIKE @search)`)
    params.search = `%${search}%`
  }
  if (diabetesType) {
    where.push(`diabetes_type = @diabetes_type`)
    params.diabetes_type = diabetesType
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const total = db.prepare(`SELECT COUNT(*) as n FROM patients ${whereClause}`).get(params).n
  const patients = db.prepare(
    `SELECT * FROM patients ${whereClause} ORDER BY last_name, first_name LIMIT @limit OFFSET @skip`
  ).all({ ...params, limit, skip })

  res.json({
    patients: patients.map(formatPatient),
    total,
    skip,
    limit,
    has_more: (skip + limit) < total,
  })
})

// GET /api/v1/patients/:id
router.get('/patients/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id)
  if (!patient) return res.status(404).json({ detail: `Patient ${req.params.id} not found` })
  res.json(formatPatient(patient))
})

// GET /api/v1/patients/:id/summary
router.get('/patients/:id/summary', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id)
  if (!patient) return res.status(404).json({ detail: `Patient ${req.params.id} not found` })

  const latestHba1c = db.prepare(
    `SELECT * FROM hba1c_readings WHERE patient_id = ? ORDER BY test_date DESC LIMIT 1`
  ).get(req.params.id) || null

  // Recent HbA1c history (last 4)
  const recentHba1c = db.prepare(
    `SELECT * FROM hba1c_readings WHERE patient_id = ? ORDER BY test_date DESC LIMIT 4`
  ).all(req.params.id)

  const latestGlucose = db.prepare(
    `SELECT * FROM glucose_readings WHERE patient_id = ? ORDER BY reading_datetime DESC LIMIT 1`
  ).get(req.params.id) || null

  const latestBp = db.prepare(
    `SELECT * FROM blood_pressure_readings WHERE patient_id = ? ORDER BY reading_datetime DESC LIMIT 1`
  ).get(req.params.id) || null

  const activeMedications = db.prepare(
    `SELECT * FROM medications WHERE patient_id = ? AND end_date IS NULL`
  ).all(req.params.id).map(m => ({ ...m, is_active: true }))

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const upcomingAppointments = db.prepare(
    `SELECT * FROM appointments WHERE patient_id = ? AND appointment_datetime >= ? AND status = 'Scheduled'
     ORDER BY appointment_datetime LIMIT 3`
  ).all(req.params.id, now)

  res.json({
    patient: { ...formatPatient(patient) },
    latest_hba1c: formatHba1c(latestHba1c),
    latest_glucose: latestGlucose,
    latest_bp: latestBp,
    active_medications: activeMedications,
    recent_hba1c: recentHba1c.map(formatHba1c),
    upcoming_appointments: upcomingAppointments,
  })
})

// POST /api/v1/patients
router.post('/patients', (req, res) => {
  const {
    first_name, last_name, date_of_birth, gender, phone, email,
    diabetes_type, diagnosis_date, weight_kg, height_cm,
    insurance_id, primary_care_provider, notes,
  } = req.body

  if (!first_name || !last_name || !date_of_birth || !gender || !diabetes_type) {
    return res.status(422).json({ detail: 'Missing required fields: first_name, last_name, date_of_birth, gender, diabetes_type' })
  }

  const result = db.prepare(`
    INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email,
      diabetes_type, diagnosis_date, weight_kg, height_cm, insurance_id, primary_care_provider, notes)
    VALUES (@first_name, @last_name, @date_of_birth, @gender, @phone, @email,
      @diabetes_type, @diagnosis_date, @weight_kg, @height_cm, @insurance_id, @primary_care_provider, @notes)
  `).run({ first_name, last_name, date_of_birth, gender, phone: phone ?? null, email: email ?? null,
           diabetes_type, diagnosis_date: diagnosis_date ?? null, weight_kg: weight_kg ?? null,
           height_cm: height_cm ?? null, insurance_id: insurance_id ?? null,
           primary_care_provider: primary_care_provider ?? null, notes: notes ?? null })

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(formatPatient(patient))
})

module.exports = router
