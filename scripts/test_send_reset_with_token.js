require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('express').json;
const userRoutes = require('../src/routes/users');

const app = express();
app.use(bodyParser());
app.use('/api/users', userRoutes);

const token = jwt.sign({ id: 289, role: 'ROLE_ADMIN' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });

const request = require('supertest');

(async () => {
  const res = await request(app).post('/api/users/291/send-reset').set('x-auth-token', token);
  console.log('Status:', res.status);
  console.log('Headers:', res.headers['content-type']);
  console.log('Body:', res.text);
})();
