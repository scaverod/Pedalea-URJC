const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating random tokens
const nodemailer = require('nodemailer'); // For sending emails
const db = require('../db');

const router = express.Router();
const { auth } = require('../middleware/auth');

// Configure Nodemailer (using environment variables)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
                const stmt = db.prepare('INSERT INTO users (email, passwordHash, username) VALUES (?, ?, ?)');
                const info = stmt.run(email, hashedPassword, username);

                // Generate email verification token
                const verificationToken = crypto.randomBytes(20).toString('hex');
                const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
                db.prepare('UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = ? WHERE id = ?')
                    .run(verificationToken, verificationExpires, info.lastInsertRowid);

                // Send verification email
                const verifyUrl = `http://${req.headers.host}/api/auth/verify-email/${verificationToken}`;
        const mailOptions = {
                        to: email,
                        from: process.env.SMTP_FROM_EMAIL,
            subject: 'Verifica tu correo electrónico',
            html: `Por favor verifica tu correo haciendo clic en este enlace: <a href="${verifyUrl}">${verifyUrl}</a>`
                };

                try {
                    await transporter.sendMail(mailOptions);
                } catch (e) {
                    console.error('Error sending verification email:', e);
                }

                res.status(201).json({ message: 'Usuario registrado correctamente. Correo de verificación enviado.' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error del servidor durante el registro.' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // If configured, require email verification before allowing login
        const requireVerify = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
        if (requireVerify && !user.emailVerified && user.role !== 'ROLE_ADMIN') {
            return res.status(403).json({ message: 'Correo no verificado. Por favor verifica tu correo antes de iniciar sesión.' });
        }

        // Prevent suspended users from logging in
        if (user.suspended) {
            return res.status(403).json({ message: 'Cuenta suspendida. Contacta con un administrador.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error del servidor durante el inicio de sesión.' });
    }
});

// Return current authenticated user (authoritative)
router.get('/me', auth, (req, res) => {
    // req.user is set by auth middleware (contains id and role)
    try {
        const stmt = db.prepare('SELECT id, email, username, role FROM users WHERE id = ?');
        const user = stmt.get(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.json(user);
    } catch (e) {
        console.error('Error en GET /me:', e);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'El correo es obligatorio.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            // For security, don't reveal if the email doesn't exist
            return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

        db.prepare('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?')
            .run(resetToken, resetTokenExpires, user.id);

        // Send email
        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`; // Adjust host for production
        const mailOptions = {
            to: user.email,
            from: process.env.SMTP_FROM_EMAIL,
            subject: 'Solicitud de restablecimiento de contraseña',
            html: `Has recibido este correo porque tú (u otra persona) solicitó restablecer la contraseña de tu cuenta.<br/><br/>
                   Haz clic en el siguiente enlace (o pégalo en tu navegador) para completar el proceso:<br/>
                   <a href="${resetUrl}">${resetUrl}</a><br/><br/>
                   Si no solicitaste esto, ignora este correo y tu contraseña seguirá siendo la misma.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.' });
    } catch (error) {
        console.error('Error en olvido de contraseña:', error);
        res.status(500).json({ message: 'Error del servidor durante la solicitud de restablecimiento de contraseña.' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'La nueva contraseña es obligatoria.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?')
            .get(token, Date.now());

        if (!user) {
            return res.status(400).json({ message: 'El token de restablecimiento no es válido o ha expirado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare('UPDATE users SET passwordHash = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?')
            .run(hashedPassword, user.id);

        res.status(200).json({ message: 'La contraseña se ha restablecido correctamente.' });
    } catch (error) {
        console.error('Error en restablecimiento de contraseña:', error);
        res.status(500).json({ message: 'Error del servidor durante el restablecimiento de contraseña.' });
    }
});

module.exports = router;

// Verify email endpoint
router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const user = db.prepare('SELECT * FROM users WHERE emailVerificationToken = ? AND emailVerificationExpires > ?')
            .get(token, Date.now());

        if (!user) {
            return res.status(400).json({ message: 'El token de verificación no es válido o ha expirado.' });
        }

        db.prepare('UPDATE users SET emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?')
          .run(user.id);

        res.json({ message: 'Correo verificado correctamente.' });
    } catch (e) {
        console.error('Error en verificación de correo:', e);
        res.status(500).json({ message: 'Error del servidor durante la verificación de correo.' });
    }
});

// Request account deletion (sends confirmation email)
router.post('/request-delete', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'El correo es obligatorio.' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace de eliminación.' });

        const delToken = crypto.randomBytes(20).toString('hex');
        const delExpires = Date.now() + 24*60*60*1000; // 24h
        db.prepare('UPDATE users SET accountDeletionToken = ?, accountDeletionExpires = ? WHERE id = ?')
          .run(delToken, delExpires, user.id);

    // Point the deletion link to the client-side route so React can render a password confirmation form
    const deleteUrl = `http://${req.headers.host}/confirm-delete/${delToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.SMTP_FROM_EMAIL,
            subject: 'Confirmar eliminación de cuenta',
            html: `Haz clic para confirmar la eliminación de la cuenta: <a href="${deleteUrl}">${deleteUrl}</a>`
        };

        try { await transporter.sendMail(mailOptions); } catch(e) { console.error('Error sending deletion email:', e); }

        res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un enlace de eliminación.' });
    } catch (e) {
        console.error('Error al solicitar eliminación:', e);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});

// Confirm account deletion
router.post('/confirm-delete/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'La contraseña es obligatoria para confirmar la eliminación de la cuenta.' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE accountDeletionToken = ? AND accountDeletionExpires > ?')
            .get(token, Date.now());
    if (!user) return res.status(400).json({ message: 'El token de eliminación no es válido o ha expirado.' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(403).json({ message: 'Contraseña incorrecta.' });

        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
        res.json({ message: 'Cuenta eliminada correctamente.' });
    } catch (e) {
        console.error('Error al confirmar eliminación:', e);
        res.status(500).json({ message: 'Error del servidor.' });
    }
});