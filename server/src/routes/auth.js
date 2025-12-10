const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-refresh-key';
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY_DAYS = 30;

// Helper: Generate Tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = uuidv4(); // Opaque token for DB storage
    return { accessToken, refreshToken };
};

// POST /auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, phone, dob } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 10);
        const dobDate = dob ? new Date(dob) : null;

        // OTP Removed - Auto Verify
        const user = await prisma.user.create({
            data: {
                email, passwordHash, name, phone, dob: dobDate,
                isVerified: true // Auto-verify
            }
        });

        // Generate Tokens Immediately
        const tokens = generateTokens(user.id);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.refreshToken.create({
            data: { token: tokens.refreshToken, userId: user.id, expiresAt }
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Signup successful',
            accessToken: tokens.accessToken,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: error.message || 'Signup failed' });
    }
});

// POST /auth/verify (Kept but unused, or can be removed. Keeping for safety.)
router.post('/verify', async (req, res) => {
    res.status(200).json({ message: 'Verification disabled' });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

        // OTP Check Removed

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRY_DAYS);

        // Revoke old tokens? (Optional policy) Or just add new one
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

        // Verify in DB
        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!savedToken || savedToken.revoked || new Date() > savedToken.expiresAt) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Determine Logic: Rotate Token?
        // For now, simpler: Just issue new Access Token
        const accessToken = jwt.sign({ userId: savedToken.userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });

        res.json({ accessToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Refresh failed' });
    }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        // Revoke in DB
        await prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked: true }
        });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});

module.exports = router;
