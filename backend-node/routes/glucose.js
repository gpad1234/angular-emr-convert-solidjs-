const express = require('express')
const { db } = require('../database')
const router = express.Router()

// GET /api/v1/patients/:id/glucose
router.get('/patients/:id/glucose', (req, res) => {
  const patientId = req.params.id
  const skip = Math.max(0, parseInt(req.query.skip) || 0)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
  const readingType = req.query.reading_type || ''

  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  let where = 'WHERE patient_id = @patient_id'
  const params = { patient_id: patientId }

  if (readingType) {
    where += ' AND reading_type = @reading_type'
    params.reading_type = readingType
  }

  const total = db.prepare(`SELECT COUNT(*) as n FROM glucose_readings ${where}`).get(params).n
  const readings = db.prepare(
    `SELECT * FROM glucose_readings ${where} ORDER BY reading_datetime DESC LIMIT @limit OFFSET @skip`
  ).all({ ...params, limit, skip })

  res.json({
    readings,
    total,
    skip,
    limit,
    has_more: (skip + limit) < total,
  })
})

// POST /api/v1/patients/:id/glucose
router.post('/patients/:id/glucose', (req, res) => {
  const patientId = req.params.id
  const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId)
  if (!patient) return res.status(404).json({ detail: `Patient ${patientId} not found` })

  const { value_mgdl, reading_type, reading_datetime, device_used, notes } = req.body

  if (!value_mgdl || !reading_type || !reading_datetime) {
    return res.status(422).json({ detail: 'Missing required fields: value_mgdl, reading_type, reading_datetime' })
  }

  const result = db.prepare(`
    INSERT INTO glucose_readings (patient_id, value_mgdl, reading_type, reading_datetime, device_used, notes)
    VALUES (@patient_id, @value_mgdl, @reading_type, @reading_datetime, @device_used, @notes)
  `).run({
    patient_id: patientId,
    value_mgdl,
    reading_type,
    reading_datetime,
    device_used: device_used ?? null,
    notes: notes ?? null,
  })

  const reading = db.prepare('SELECT * FROM glucose_readings WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(reading)
})

module.exports = router
