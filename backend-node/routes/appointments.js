const express = require('express')
const { db } = require('../database')
const router = express.Router()

// GET /api/v1/patients/:id/appointments
router.get('/patients/:id/appointments', (req, res) => {
  const patientId = req.params.id
  const skip = Math.max(0, parseInt(req.query.skip) || 0)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))

  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const appointments = db.prepare(
    `SELECT * FROM appointments WHERE patient_id = ?
     ORDER BY appointment_datetime DESC LIMIT ? OFFSET ?`
  ).all(patientId, limit, skip)

  res.json(appointments)
})

// POST /api/v1/patients/:id/appointments
router.post('/patients/:id/appointments', (req, res) => {
  const patientId = req.params.id
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const {
    appointment_datetime, appointment_type, status = 'Scheduled',
    provider_name, location, chief_complaint, notes, follow_up_date,
  } = req.body

  if (!appointment_datetime || !appointment_type) {
    return res.status(422).json({ detail: 'Missing required fields: appointment_datetime, appointment_type' })
  }

  const result = db.prepare(`
    INSERT INTO appointments (patient_id, appointment_datetime, appointment_type, status,
      provider_name, location, chief_complaint, notes, follow_up_date)
    VALUES (@patient_id, @appointment_datetime, @appointment_type, @status,
      @provider_name, @location, @chief_complaint, @notes, @follow_up_date)
  `).run({
    patient_id: patientId,
    appointment_datetime,
    appointment_type,
    status,
    provider_name: provider_name ?? null,
    location: location ?? null,
    chief_complaint: chief_complaint ?? null,
    notes: notes ?? null,
    follow_up_date: follow_up_date ?? null,
  })

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(appt)
})

module.exports = router
