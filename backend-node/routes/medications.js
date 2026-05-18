const express = require('express')
const { db } = require('../database')
const router = express.Router()

function formatMed(m) {
  return { ...m, is_active: m.end_date === null }
}

// GET /api/v1/patients/:id/medications
router.get('/patients/:id/medications', (req, res) => {
  const patientId = req.params.id
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const meds = db.prepare(
    `SELECT * FROM medications WHERE patient_id = ? ORDER BY start_date DESC`
  ).all(patientId)

  res.json(meds.map(formatMed))
})

// GET /api/v1/patients/:id/medications/active
router.get('/patients/:id/medications/active', (req, res) => {
  const patientId = req.params.id
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const meds = db.prepare(
    `SELECT * FROM medications WHERE patient_id = ? AND end_date IS NULL`
  ).all(patientId)

  res.json(meds.map(m => ({ ...m, is_active: true })))
})

// POST /api/v1/patients/:id/medications
router.post('/patients/:id/medications', (req, res) => {
  const patientId = req.params.id
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const {
    medication_name, brand_name, dosage, frequency, route,
    start_date, end_date, prescribing_provider, notes,
  } = req.body

  if (!medication_name) {
    return res.status(422).json({ detail: 'Missing required field: medication_name' })
  }

  const result = db.prepare(`
    INSERT INTO medications (patient_id, medication_name, brand_name, dosage, frequency, route,
      start_date, end_date, prescribing_provider, notes)
    VALUES (@patient_id, @medication_name, @brand_name, @dosage, @frequency, @route,
      @start_date, @end_date, @prescribing_provider, @notes)
  `).run({
    patient_id: patientId,
    medication_name,
    brand_name: brand_name ?? null,
    dosage: dosage ?? null,
    frequency: frequency ?? null,
    route: route ?? null,
    start_date: start_date ?? null,
    end_date: end_date ?? null,
    prescribing_provider: prescribing_provider ?? null,
    notes: notes ?? null,
  })

  const med = db.prepare('SELECT * FROM medications WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(formatMed(med))
})

// PATCH /api/v1/patients/:id/medications/:medId/discontinue
router.patch('/patients/:id/medications/:medId/discontinue', (req, res) => {
  const patientId = req.params.id
  const medId = req.params.medId

  const med = db.prepare(
    'SELECT * FROM medications WHERE id = ? AND patient_id = ?'
  ).get(medId, patientId)

  if (!med) return res.status(404).json({ detail: `Medication ${medId} not found for patient ${patientId}` })

  const today = new Date().toISOString().slice(0, 10)
  db.prepare('UPDATE medications SET end_date = ? WHERE id = ?').run(today, medId)

  const updated = db.prepare('SELECT * FROM medications WHERE id = ?').get(medId)
  res.json(formatMed(updated))
})

module.exports = router
