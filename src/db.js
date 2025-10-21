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

module.exports = db;
