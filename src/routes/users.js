const express = require('express');
const db = require('../db');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, authorize(['ROLE_ADMIN']), (req, res) => {
    try {
        const users = db.prepare('SELECT id, email, username, role, points, createdAt FROM users').all();
        res.json(users);
    } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios.' });
    }
});

// Get a single user by ID (Admin only, or user themselves)
router.get('/:id', auth, (req, res) => {
    const { id } = req.params;
    try {
        const user = db.prepare('SELECT id, email, username, role, points, createdAt FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        // Allow admin to view any user, or a user to view their own profile
        if (req.user.role === 'ROLE_ADMIN' || req.user.id === user.id) {
            return res.json(user);
        }
        res.status(403).json({ message: 'Prohibido: No tienes permiso para ver este usuario.' });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error del servidor al obtener usuario.' });
    }
});

// Create a new user (Admin only)
router.post('/', auth, authorize(['ROLE_ADMIN']), async (req, res) => {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username || !role) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (email, passwordHash, username, role) VALUES (?, ?, ?, ?)');
        stmt.run(email, hashedPassword, username, role);
        res.status(201).json({ message: 'Usuario creado correctamente.' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error del servidor al crear usuario.' });
    }
});

// Update a user (Admin only, or user themselves)
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { email, username, role, password } = req.body; // password for admin to reset

    if (req.user.role !== 'ROLE_ADMIN' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Prohibido: No tienes permiso para actualizar este usuario.' });
    }

    try {
        let updateFields = [];
        let updateValues = [];

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (role && req.user.role === 'ROLE_ADMIN') { // Only admin can change roles
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (password && req.user.role === 'ROLE_ADMIN') { // Only admin can reset password
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('passwordHash = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar.' });
        }

        const stmt = db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`);
        const info = stmt.run(...updateValues, id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o sin cambios.' });
        }

        res.status(200).json({ message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'El correo ya está en uso.' });
        }
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar usuario.' });
    }
});

// Delete a user (Admin only)
router.delete('/:id', auth, authorize(['ROLE_ADMIN']), (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar usuario.' });
    }
});

// Admin: resend verification email
router.post('/:id/resend-verification', auth, authorize(['ROLE_ADMIN']), async (req, res) => {
    const { id } = req.params;
    console.log(`[users] resend-verification invoked for id=${id} by user=${req.user && req.user.id}`);
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        db.prepare('UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = ? WHERE id = ?')
          .run(verificationToken, verificationExpires, id);

        const verifyUrl = `http://${req.headers.host}/api/auth/verify-email/${verificationToken}`;
                        // If SMTP is not configured, skip sending mail in development and return immediately
                        if (!process.env.SMTP_HOST) {
                            console.log('[users] SMTP not configured - skipping resend verification email (dev mode)');
                            return res.json({ message: 'Correo de verificación reenviado (omitido - SMTP no configurado).' });
                        }
                        const transporter = require('nodemailer').createTransport({
                                host: process.env.SMTP_HOST,
                                port: process.env.SMTP_PORT,
                                secure: process.env.SMTP_SECURE === 'true',
                                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                        });
                        try {
                            await transporter.sendMail({ to: user.email, from: process.env.SMTP_FROM_EMAIL, subject: 'Verifica tu correo electrónico', html: `Haz clic: <a href="${verifyUrl}">${verifyUrl}</a>` });
                        } catch (e) {
                            console.error('Resend verification sendMail error', e);
                            return res.status(500).json({ message: 'No se pudo enviar el correo de verificación.' });
                        }

                        res.json({ message: 'Correo de verificación reenviado.' });
    } catch (error) {
        console.error('Error al reenviar verificación:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});

// Admin: send password reset for user
router.post('/:id/send-reset', auth, authorize(['ROLE_ADMIN']), async (req, res) => {
    const { id } = req.params;
    console.log(`[users] send-reset invoked for id=${id} by user=${req.user && req.user.id}`);
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1h
        db.prepare('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?')
          .run(resetToken, resetTokenExpires, id);

        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
                        // If SMTP is not configured, skip sending mail in development and return immediately
                        if (!process.env.SMTP_HOST) {
                            console.log('[users] SMTP not configured - skipping send reset email (dev mode)');
                            return res.json({ message: 'Correo de restablecimiento enviado (omitido - SMTP no configurado).' });
                        }
                        const transporter = require('nodemailer').createTransport({
                                host: process.env.SMTP_HOST,
                                port: process.env.SMTP_PORT,
                                secure: process.env.SMTP_SECURE === 'true',
                                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                        });
                        try {
                            await transporter.sendMail({ to: user.email, from: process.env.SMTP_FROM_EMAIL, subject: 'Restablecer contraseña', html: `Restablecer: <a href="${resetUrl}">${resetUrl}</a>` });
                        } catch (e) {
                            console.error('Send reset sendMail error', e);
                            return res.status(500).json({ message: 'No se pudo enviar el correo de restablecimiento.' });
                        }

                        res.json({ message: 'Correo de restablecimiento enviado.' });
    } catch (error) {
        console.error('Error al enviar restablecimiento:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});

// Admin: suspend / unsuspend user
router.post('/:id/suspend', auth, authorize(['ROLE_ADMIN']), (req, res) => {
    const { id } = req.params;
    const { suspend } = req.body; // boolean
    try {
        const stmt = db.prepare('UPDATE users SET suspended = ? WHERE id = ?');
        const info = stmt.run(suspend ? 1 : 0, id);
        if (info.changes === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.json({ message: suspend ? 'Usuario suspendido.' : 'Usuario reactivado.' });
    } catch (error) {
        console.error('Error al suspender:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});

module.exports = router;
