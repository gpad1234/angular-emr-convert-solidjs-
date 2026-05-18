const express = require('express')
const cors = require('cors')
const { initDb } = require('./database')

const patientsRouter = require('./routes/patients')
const glucoseRouter = require('./routes/glucose')
const medicationsRouter = require('./routes/medications')
const appointmentsRouter = require('./routes/appointments')
const statsRouter = require('./routes/stats')

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

// Mount all routers under /api/v1
app.use('/api/v1', patientsRouter)
app.use('/api/v1', glucoseRouter)
app.use('/api/v1', medicationsRouter)
app.use('/api/v1', appointmentsRouter)
app.use('/api/v1', statsRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.path} not found` })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ detail: 'Internal server error' })
})

// Initialise database then start server (skip listen in test mode)
if (process.env.NODE_ENV !== 'test') {
  initDb()
  app.listen(PORT, () => {
    console.log(`Diabetes EMR API running on http://localhost:${PORT}`)
    console.log(`API base: http://localhost:${PORT}/api/v1`)
  })
}

// Export for test harnesses
module.exports = { app, initDb }
