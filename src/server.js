require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');

const db = require('./db');
const authRoutes = require('./routes/auth'); // Import auth routes
const userRoutes = require('./routes/users'); // Import user routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Simple request logger to help debug connectivity/timeouts during development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  // also write to a lightweight dev log file if possible
  try {
    fs.appendFileSync(path.join(__dirname, '..', 'server_requests.log'), `${new Date().toISOString()} ${req.method} ${req.originalUrl}\n`);
  } catch (e) {
    // ignore logging errors in development
  }
  next();
});

// Error handler to log unexpected errors
app.use((err, req, res, next) => {
  console.error('Unhandled error in request pipeline:', err && err.stack ? err.stack : err);
  try {
    fs.appendFileSync(path.join(__dirname, '..', 'server_errors.log'), `${new Date().toISOString()} ${err}\n`);
  } catch (e) {}
  if (!res.headersSent) {
    res.status(500).json({ error: 'internal_server_error' });
  } else {
    next(err);
  }
});

// Upload setup
const uploadDir = path.resolve(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/api/ping', (req, res) => {
  const now = new Date().toISOString();
  const msg = `${now} /api/ping hit\n`;
  try {
    fs.appendFileSync(path.join(__dirname, '..', 'server_requests.log'), msg);
  } catch (e) {
    // If logging fails, still respond
    console.error('Failed to write ping log:', e && e.stack ? e.stack : e);
  }
  res.json({ ok: true, now });
});

// Use authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Use user routes

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

// Serve frontend for any non-API route (allows client-side routing for pages like /reset-password/:token)
// Serve index.html for any non-API path using a regex route to avoid path-to-regexp issues
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

  // Log low-level TCP connections for debugging
  server.on('connection', (socket) => {
    try {
      const addr = socket.remoteAddress;
      const port = socket.remotePort;
      const ln = `${new Date().toISOString()} connection from ${addr}:${port}\n`;
      fs.appendFileSync(path.join(__dirname, '..', 'server_connections.log'), ln);
      console.log('New connection from', addr, port);
      socket.on('close', () => {
        try {
          fs.appendFileSync(path.join(__dirname, '..', 'server_connections.log'), `${new Date().toISOString()} closed ${addr}:${port}\n`);
        } catch (e) {}
      });
    } catch (e) {
      console.error('Failed to log connection', e && e.stack ? e.stack : e);
    }
  });
}

module.exports = app;
