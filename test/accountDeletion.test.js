const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // mocked in setupTests

describe('Account deletion flow', () => {
  let testEmail;
  const testPassword = 'DelPass123!';
  const testUsername = 'deleteuser';

  beforeEach(() => {
    testEmail = `del_${Date.now()}@example.com`;
    db.prepare('DELETE FROM users').run();
    nodemailer.createTransport().sendMail.mockClear();
  });

  afterAll(() => {
    db.prepare('DELETE FROM users').run();
  });

  it('sends deletion email and deletes account when password is correct', async () => {
    // register user
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, username: testUsername });
    expect(reg.statusCode).toBe(201);

    // ensure user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    expect(user).toBeDefined();

    // clear any registration email calls
    nodemailer.createTransport().sendMail.mockClear();

    // request deletion
    const reqDel = await request(app)
      .post('/api/auth/request-delete')
      .send({ email: testEmail });
    expect(reqDel.statusCode).toBe(200);

    // sendMail called once
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

    // token saved in DB
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    expect(user.accountDeletionToken).toBeDefined();

    const token = user.accountDeletionToken;

    // Attempt confirm-delete with wrong password -> should be 403 and user still exists
    const bad = await request(app)
      .post(`/api/auth/confirm-delete/${token}`)
      .send({ password: 'wrongpassword' });
    expect(bad.statusCode).toBe(403);

    const still = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    expect(still).toBeDefined();

    // Now confirm with correct password
    const confirm = await request(app)
      .post(`/api/auth/confirm-delete/${token}`)
      .send({ password: testPassword });
    expect(confirm.statusCode).toBe(200);

    // User no longer in DB
    const gone = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    expect(gone).toBeUndefined();
  });
});
