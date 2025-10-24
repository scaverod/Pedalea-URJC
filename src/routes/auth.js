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
        return res.status(400).json({ message: 'All fields are required.' });
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
                        subject: 'Please verify your email',
                        html: `Please verify your email by clicking this link: <a href="${verifyUrl}">${verifyUrl}</a>`
                };

                try {
                    await transporter.sendMail(mailOptions);
                } catch (e) {
                    console.error('Error sending verification email:', e);
                }

                res.status(201).json({ message: 'User registered successfully. Verification email sent.' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // If configured, require email verification before allowing login
        const requireVerify = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
        if (requireVerify && !user.emailVerified && user.role !== 'ROLE_ADMIN') {
            return res.status(403).json({ message: 'Email not verified. Please verify your email before logging in.' });
        }

        // Prevent suspended users from logging in
        if (user.suspended) {
            return res.status(403).json({ message: 'Account suspended. Contact an administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Return current authenticated user (authoritative)
router.get('/me', auth, (req, res) => {
    // req.user is set by auth middleware (contains id and role)
    try {
        const stmt = db.prepare('SELECT id, email, username, role FROM users WHERE id = ?');
        const user = stmt.get(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (e) {
        console.error('GET /me error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            // For security, don't reveal if the email doesn't exist
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
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
            subject: 'Password Reset Request',
            html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   <a href="${resetUrl}">${resetUrl}</a>\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset request.' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'New password is required.' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?')
            .get(token, Date.now());

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare('UPDATE users SET passwordHash = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?')
            .run(hashedPassword, user.id);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
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
            return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
        }

        db.prepare('UPDATE users SET emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?')
          .run(user.id);

        res.json({ message: 'Email verified successfully.' });
    } catch (e) {
        console.error('Email verification error:', e);
        res.status(500).json({ message: 'Server error during email verification.' });
    }
});

// Request account deletion (sends confirmation email)
router.post('/request-delete', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return res.status(200).json({ message: 'If an account with that email exists, a deletion link has been sent.' });

        const delToken = crypto.randomBytes(20).toString('hex');
        const delExpires = Date.now() + 24*60*60*1000; // 24h
        db.prepare('UPDATE users SET accountDeletionToken = ?, accountDeletionExpires = ? WHERE id = ?')
          .run(delToken, delExpires, user.id);

    // Point the deletion link to the client-side route so React can render a password confirmation form
    const deleteUrl = `http://${req.headers.host}/confirm-delete/${delToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.SMTP_FROM_EMAIL,
            subject: 'Confirm account deletion',
            html: `Click to confirm account deletion: <a href="${deleteUrl}">${deleteUrl}</a>`
        };

        try { await transporter.sendMail(mailOptions); } catch(e) { console.error('Error sending deletion email:', e); }

        res.status(200).json({ message: 'If an account with that email exists, a deletion link has been sent.' });
    } catch (e) {
        console.error('Request delete error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Confirm account deletion
router.post('/confirm-delete/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required to confirm account deletion.' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE accountDeletionToken = ? AND accountDeletionExpires > ?')
            .get(token, Date.now());
        if (!user) return res.status(400).json({ message: 'Deletion token is invalid or has expired.' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(403).json({ message: 'Password incorrect.' });

        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
        res.json({ message: 'Account deleted successfully.' });
    } catch (e) {
        console.error('Confirm delete error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});