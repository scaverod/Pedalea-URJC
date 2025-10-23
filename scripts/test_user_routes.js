const express = require('express');
const bodyParser = require('express').json;
const userRoutes = require('../src/routes/users');
const db = require('../src/db');
const request = require('supertest');

const app = express();
app.use(bodyParser());
app.use('/api/users', userRoutes);

(async () => {
  try {
    const res = await request(app).post('/api/users/291/send-reset');
    console.log('Status:', res.status);
    console.log('Headers:', res.headers['content-type']);
    console.log('Body:', res.text);
  } catch (e) {
    console.error('Error running test request', e);
  }
})();
