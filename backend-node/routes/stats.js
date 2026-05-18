const express = require('express')
const { db } = require('../database')
const router = express.Router()

// GET /api/v1/stats/dashboard
router.get('/stats/dashboard', (req, res) => {
  // Total patients
  const total_patients = db.prepare('SELECT COUNT(*) as n FROM patients').get().n

  // Count by diabetes type
  const typeRows = db.prepare(
    `SELECT diabetes_type, COUNT(*) as n FROM patients GROUP BY diabetes_type`
  ).all()
  const by_diabetes_type = {}
  for (const row of typeRows) {
    by_diabetes_type[row.diabetes_type] = row.n
  }

  // Average HbA1c from tests in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10)

  const avgResult = db.prepare(
    `SELECT AVG(value_pct) as avg_val FROM hba1c_readings WHERE test_date >= ?`
  ).get(thirtyDaysAgoStr)
  const avg_hba1c = avgResult.avg_val !== null
    ? Math.round(parseFloat(avgResult.avg_val) * 10) / 10
    : null

  // Count patients with HbA1c > 9%
  const high_hba1c = db.prepare(
    `SELECT COUNT(DISTINCT patient_id) as n FROM hba1c_readings WHERE value_pct > 9.0`
  ).get().n

  // Recent hypoglycemia events (< 70 mg/dL in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().replace('T', ' ').slice(0, 19)

  const recent_hypoglycemia_events = db.prepare(
    `SELECT COUNT(*) as n FROM glucose_readings WHERE value_mgdl < 70 AND reading_datetime >= ?`
  ).get(sevenDaysAgoStr).n

  // Active medications count
  const active_medications_count = db.prepare(
    `SELECT COUNT(*) as n FROM medications WHERE end_date IS NULL`
  ).get().n

  res.json({
    total_patients,
    by_diabetes_type,
    avg_hba1c_last_30_days: avg_hba1c,
    high_hba1c_count: high_hba1c,
    recent_hypoglycemia_count: recent_hypoglycemia_events,
    active_medications_count,
  })
})

module.exports = router
