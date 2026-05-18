process.env.DATABASE_PATH = ':memory:'

const request = require('supertest')
const { app, initDb } = require('../server')
const { clearAndSeed } = require('../database')

beforeEach(() => {
  // ensure a clean seeded DB for every test
  clearAndSeed()
})

test('GET /api/v1/patients returns patients list', async () => {
  const res = await request(app).get('/api/v1/patients')
  expect(res.statusCode).toBe(200)
  expect(res.body).toHaveProperty('patients')
  expect(Array.isArray(res.body.patients)).toBe(true)
  expect(res.body.patients.length).toBeGreaterThan(0)
  expect(res.body).toHaveProperty('total')
})

test('GET /api/v1/patients/:id returns a patient', async () => {
  const list = await request(app).get('/api/v1/patients')
  const id = list.body.patients[0].id
  const res = await request(app).get(`/api/v1/patients/${id}`)
  expect(res.statusCode).toBe(200)
  expect(res.body).toHaveProperty('id', id)
})
