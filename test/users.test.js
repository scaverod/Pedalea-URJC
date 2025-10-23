const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');
const bcrypt = require('bcryptjs');

describe('User Management API', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;

    beforeAll(async () => {
        // Clear users table before all tests
        db.prepare('DELETE FROM users').run();

        // Create an admin user
        const adminEmail = `admin_${Date.now()}@example.com`;
        const adminPassword = 'adminpass';
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)')
            .run(adminEmail, hashedAdminPassword, 'adminuser', 'ROLE_ADMIN');
        adminUser = db.prepare('SELECT id, email, username, role FROM users WHERE email = ?').get(adminEmail);

        // Login admin to get token
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: adminEmail, password: adminPassword });
        adminToken = adminLoginRes.body.token;

        // Create a regular user
        const userEmail = `user_${Date.now()}@example.com`;
        const userPassword = 'userpass';
        const hashedUserPassword = await bcrypt.hash(userPassword, 10);
        db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)')
            .run(userEmail, hashedUserPassword, 'regularuser', 'ROLE_USER');
        regularUser = db.prepare('SELECT id, email, username, role FROM users WHERE email = ?').get(userEmail);

        // Login regular user to get token
        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: userEmail, password: userPassword });
        userToken = userLoginRes.body.token;
    });

    afterAll(() => {
        // Clean up after all tests are done
        db.prepare('DELETE FROM users').run();
    });

    // Admin access tests
    it('should allow admin to get all users', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2); // Admin and regular user
        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({ email: adminUser.email, role: 'ROLE_ADMIN' }),
            expect.objectContaining({ email: regularUser.email, role: 'ROLE_USER' }),
        ]));
    });

    it('should not allow regular user to get all users', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('x-auth-token', userToken);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the necessary permissions.');
    });

    it('should allow admin to create a new user', async () => {
        const newUserEmail = `newuser_${Date.now()}@example.com`;
        const res = await request(app)
            .post('/api/users')
            .set('x-auth-token', adminToken)
            .send({ email: newUserEmail, password: 'newuserpass', username: 'newuser', role: 'ROLE_USER' });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User created successfully.');

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(newUserEmail);
        expect(user).toBeDefined();
        expect(user.email).toEqual(newUserEmail);
    });

    it('should not allow regular user to create a new user', async () => {
        const newUserEmail = `anothernewuser_${Date.now()}@example.com`;
        const res = await request(app)
            .post('/api/users')
            .set('x-auth-token', userToken)
            .send({ email: newUserEmail, password: 'anotherpass', username: 'anotheruser', role: 'ROLE_USER' });

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the necessary permissions.');
    });

    it('should allow admin to update any user', async () => {
        const updatedUsername = 'updatedadmin';
        const res = await request(app)
            .put(`/api/users/${adminUser.id}`)
            .set('x-auth-token', adminToken)
            .send({ username: updatedUsername });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User updated successfully.');

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(adminUser.id);
        expect(user.username).toEqual(updatedUsername);
    });

    it('should allow a user to update their own profile', async () => {
        const updatedUsername = 'updatedregularuser';
        const res = await request(app)
            .put(`/api/users/${regularUser.id}`)
            .set('x-auth-token', userToken)
            .send({ username: updatedUsername });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User updated successfully.');

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(regularUser.id);
        expect(user.username).toEqual(updatedUsername);
    });

    it('should not allow a user to update another user\'s profile', async () => {
        const res = await request(app)
            .put(`/api/users/${adminUser.id}`)
            .set('x-auth-token', userToken)
            .send({ username: 'attemptedhack' });

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'Forbidden: You do not have permission to update this user.');
    });

    it('should allow admin to delete a user', async () => {
        const userToDeleteEmail = `todelete_${Date.now()}@example.com`;
        const hashedPass = await bcrypt.hash('deletepass', 10);
        db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)')
            .run(userToDeleteEmail, hashedPass, 'todelete', 'ROLE_USER');
        const userToDelete = db.prepare('SELECT id FROM users WHERE email = ?').get(userToDeleteEmail);

        const res = await request(app)
            .delete(`/api/users/${userToDelete.id}`)
            .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User deleted successfully.');

        const deletedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userToDelete.id);
        expect(deletedUser).toBeUndefined();
    });

    it('should not allow regular user to delete a user', async () => {
        const userToDeleteEmail = `todelete2_${Date.now()}@example.com`;
        const hashedPass = await bcrypt.hash('deletepass2', 10);
        db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)')
            .run(userToDeleteEmail, hashedPass, 'todelete2', 'ROLE_USER');
        const userToDelete = db.prepare('SELECT id FROM users WHERE email = ?').get(userToDeleteEmail);

        const res = await request(app)
            .delete(`/api/users/${userToDelete.id}`)
            .set('x-auth-token', userToken);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('message', 'Forbidden: You do not have the necessary permissions.');
    });
});
