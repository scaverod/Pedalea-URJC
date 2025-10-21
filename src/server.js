require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Upload setup
const uploadDir = path.resolve(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/api/ping', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email, passwordHash, username) VALUES (?, ?, ?)');
    const info = stmt.run(email, passwordHash, username || null);
    const user = db.prepare('SELECT id, email, username, role, points, createdAt FROM users WHERE id = ?').get(info.lastInsertRowid);
    return res.json({ user });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'email_exists' });
    console.error(err);
    return res.status(500).json({ error: 'db_error' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND deletedAt IS NULL').get(email);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  const safeUser = { id: user.id, email: user.email, username: user.username, role: user.role, points: user.points };
  return res.json({ user: safeUser });
});

// Upload GPX (simple)
app.post('/api/routes', upload.single('gpx'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'gpx_required' });
  const { title, description, ownerId } = req.body;
  const stmt = db.prepare('INSERT INTO routes (ownerId, title, description, gpxPath) VALUES (?, ?, ?, ?)');
  const info = stmt.run(ownerId || null, title || null, description || null, req.file.path);
  const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(info.lastInsertRowid);
  return res.json({ route });
});

// List routes (basic)
app.get('/api/routes', (req, res) => {
  const rows = db.prepare('SELECT id, ownerId, title, description, distance, elevationGain, status, createdAt FROM routes ORDER BY createdAt DESC').all();
  res.json({ routes: rows });
});

// Simple news CRUD (admin endpoints would require auth in real app)
app.get('/api/news', (req, res) => {
  const rows = db.prepare('SELECT id, title, content, lang, createdAt FROM news ORDER BY createdAt DESC').all();
  res.json({ news: rows });
});

app.post('/api/news', (req, res) => {
  const { title, content, lang } = req.body;
  const stmt = db.prepare('INSERT INTO news (title, content, lang) VALUES (?, ?, ?)');
  const info = stmt.run(title, content, lang || 'es');
  const item = db.prepare('SELECT id, title, content, lang, createdAt FROM news WHERE id = ?').get(info.lastInsertRowid);
  res.json({ news: item });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = app;
