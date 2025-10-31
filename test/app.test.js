const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/server');


describe('Basic API', () => {
  test('GET /api/ping returns ok', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('now');
  });

  let testEmail = `test+${Date.now()}@example.com`;
  let testPassword = 'secret123';

  test('POST /api/auth/register', async () => {
    const reg = await request(app).post('/api/auth/register').send({ email: testEmail, password: testPassword, username: 'tester' });
    expect(reg.statusCode).toBe(201);
  expect(reg.body).toHaveProperty('message', 'Usuario registrado correctamente. Correo de verificación enviado.');
  }); // Added missing closing brace here

  test('POST /api/routes upload GPX', async () => {
    const gpxSample = path.join(__dirname, 'sample.gpx');
    // create a tiny GPX file
    fs.writeFileSync(gpxSample, `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="test"></gpx>`);
    const res = await request(app)
      .post('/api/routes')
      .field('title', 'Test Route')
      .attach('gpx', gpxSample);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('route');
    // cleanup
    fs.unlinkSync(gpxSample);
  }, 10000);
});