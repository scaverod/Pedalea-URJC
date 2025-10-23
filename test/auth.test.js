const request = require('supertest');
const app = require('../src/server'); // Assuming your main app is exported from src/server.js
const db = require('../src/db'); // Assuming db.js exports the database instance
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // Import nodemailer (mocked globally in setupTests)

describe('Auth API', () => {
    let testEmail;
    let testPassword = 'securepassword123';
    let testUsername = 'testuser';

    beforeEach(() => {
        // Generate a unique email for each test to avoid conflicts
        testEmail = `testuser_${Date.now()}@example.com`;
        // Clear users table before each test to ensure a clean state
        db.prepare('DELETE FROM users').run();
        // Clear mock calls for nodemailer before each test
        nodemailer.createTransport().sendMail.mockClear();
    });

    afterAll(() => {
        // Clean up after all tests are done
        db.prepare('DELETE FROM users').run();
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

    expect(res.statusCode).toEqual(201);
    // Registration now triggers a verification email; message updated accordingly
    expect(res.body).toHaveProperty('message', 'User registered successfully. Verification email sent.');

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
        expect(user).toBeDefined();
        expect(user.email).toEqual(testEmail);
        expect(user.username).toEqual(testUsername);
        expect(user.passwordHash).toBeDefined(); // Password should be hashed
    });

    it('should not register a user with an existing email', async () => {
        // Register the first user
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

        // Try to register again with the same email
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: 'anotheruser' });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Email already registered.');
    });

    it('should log in an existing user successfully and return a token', async () => {
        // Register a user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });
            // Clear any sendMail calls recorded during registration
            nodemailer.createTransport().sendMail.mockClear();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: testPassword });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', testEmail);
        expect(res.body.user).toHaveProperty('username', testUsername);
        expect(res.body.user).toHaveProperty('role', 'ROLE_USER');
    });

    it('should not log in with incorrect password', async () => {
        // Register a user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should not log in with unregistered email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: testPassword });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should return 400 if email or password is missing during registration', async () => {
        const res1 = await request(app)
            .post('/api/auth/register')
            .send({ password: testPassword, username: testUsername });
        expect(res1.statusCode).toEqual(400);
        expect(res1.body).toHaveProperty('message', 'All fields are required.');

        const res2 = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, username: testUsername });
        expect(res2.statusCode).toEqual(400);
        expect(res2.body).toHaveProperty('message', 'All fields are required.');

        const res3 = await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword });
        expect(res3.statusCode).toEqual(400);
        expect(res3.body).toHaveProperty('message', 'All fields are required.');
    });

    it('should return 400 if email or password is missing during login', async () => {
        const res1 = await request(app)
            .post('/api/auth/login')
            .send({ password: testPassword });
        expect(res1.statusCode).toEqual(400);
        expect(res1.body).toHaveProperty('message', 'Email and password are required.');

        const res2 = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail });
        expect(res2.statusCode).toEqual(400);
        expect(res2.body).toHaveProperty('message', 'Email and password are required.');
    });

    it('should send a password reset link for a registered email', async () => {
        // Register a user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

        // Clear registration email call so we only assert the reset email call
        nodemailer.createTransport().sendMail.mockClear();

        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testEmail });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'If an account with that email exists, a password reset link has been sent.');

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
        expect(user.resetPasswordToken).toBeDefined();
        expect(user.resetPasswordExpires).toBeGreaterThan(Date.now());
        expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
    });

    it('should not reveal if email does not exist for forgot password', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nonexistent@example.com' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'If an account with that email exists, a password reset link has been sent.');
        expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled(); // No email should be sent
    });

    it('should reset password with a valid token', async () => {
        // Register a user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

        // Request password reset to get a token
        await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testEmail });

        const userBeforeReset = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
        const resetToken = userBeforeReset.resetPasswordToken;

        const newPassword = 'newSecurePassword123';
        const res = await request(app)
            .post(`/api/auth/reset-password/${resetToken}`)
            .send({ password: newPassword });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Password has been reset successfully.');

        const userAfterReset = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
        expect(userAfterReset.resetPasswordToken).toBeNull();
        expect(userAfterReset.resetPasswordExpires).toBeNull();

        // Try logging in with the new password
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: newPassword });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
    });

    it('should not reset password with an invalid token', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password/invalidtoken')
            .send({ password: 'newSecurePassword123' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Password reset token is invalid or has expired.');
    });

    it('should not reset password with an expired token', async () => {
        // Register a user first
        await request(app)
            .post('/api/auth/register')
            .send({ email: testEmail, password: testPassword, username: testUsername });

        // Manually set an expired token
        const expiredToken = 'expiredtoken123';
        const expiredTime = Date.now() - 1000; // 1 second ago
        db.prepare('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?')
            .run(expiredToken, expiredTime, testEmail);

        const res = await request(app)
            .post(`/api/auth/reset-password/${expiredToken}`)
            .send({ password: 'newSecurePassword123' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Password reset token is invalid or has expired.');
    });

    it('should return 400 if new password is missing during reset password', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password/sometoken')
            .send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'New password is required.');
    });
});