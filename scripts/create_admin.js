#!/usr/bin/env node
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const [,, email, password] = process.argv;
if (!email || !password) {
  console.log('Usage: node scripts/create_admin.js <email> <password>');
  process.exit(1);
}

const dbPath = path.resolve(__dirname, '..', 'data', 'database.sqlite');
const db = new Database(dbPath);

try {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`User already exists: ${email}`);
    process.exit(0);
  }

  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)');
  const info = stmt.run(email, hashed, 'admin', 'ROLE_ADMIN');
  console.log('Admin created with id', info.lastInsertRowid);
} catch (err) {
  console.error('Error creating admin:', err);
  process.exit(1);
}
