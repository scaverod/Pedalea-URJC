const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

// Tablas mínimas para arranque
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  username TEXT,
  role TEXT DEFAULT 'ROLE_USER',
  points INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  deletedAt TEXT,
  mustChangePassword INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerId INTEGER,
  title TEXT,
  description TEXT,
  gpxPath TEXT,
  distance REAL,
  elevationGain REAL,
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creatorId INTEGER,
  title TEXT,
  description TEXT,
  location TEXT,
  likesCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS critical_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  routeId INTEGER,
  creatorId INTEGER,
  lat REAL,
  lng REAL,
  category TEXT,
  description TEXT,
  votesExists INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  lang TEXT DEFAULT 'es',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Add resetPasswordToken and resetPasswordExpires columns if they don't exist
const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasResetPasswordToken = userColumns.some(col => col.name === 'resetPasswordToken');
const hasResetPasswordExpires = userColumns.some(col => col.name === 'resetPasswordExpires');

if (!hasResetPasswordToken) {
  db.exec(`ALTER TABLE users ADD COLUMN resetPasswordToken TEXT`);
}
if (!hasResetPasswordExpires) {
  db.exec(`ALTER TABLE users ADD COLUMN resetPasswordExpires INTEGER`);
}

// Add email verification and account deletion columns if they don't exist
const hasEmailVerified = userColumns.some(col => col.name === 'emailVerified');
const hasEmailVerificationToken = userColumns.some(col => col.name === 'emailVerificationToken');
const hasEmailVerificationExpires = userColumns.some(col => col.name === 'emailVerificationExpires');
const hasAccountDeletionToken = userColumns.some(col => col.name === 'accountDeletionToken');
const hasAccountDeletionExpires = userColumns.some(col => col.name === 'accountDeletionExpires');

if (!hasEmailVerified) {
  db.exec(`ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0`);
}
if (!hasEmailVerificationToken) {
  db.exec(`ALTER TABLE users ADD COLUMN emailVerificationToken TEXT`);
}
if (!hasEmailVerificationExpires) {
  db.exec(`ALTER TABLE users ADD COLUMN emailVerificationExpires INTEGER`);
}
if (!hasAccountDeletionToken) {
  db.exec(`ALTER TABLE users ADD COLUMN accountDeletionToken TEXT`);
}
if (!hasAccountDeletionExpires) {
  db.exec(`ALTER TABLE users ADD COLUMN accountDeletionExpires INTEGER`);
}

module.exports = db;