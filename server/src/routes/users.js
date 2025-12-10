const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticate');

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unique name: userId-timestamp.ext
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.userId}-${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

// GET /users/me
router.get('/me', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, name: true, email: true, phone: true, age: true, gender: true, profilePictureUrl: true, role: true }
    });
    res.json(user);
});

// PUT /users/me (Handle both Fields and File)
router.put('/me', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, phone, age, gender } = req.body;
        const userId = req.user.userId;
        console.log("PUT /users/me - Body:", req.body);
        console.log("PUT /users/me - File:", req.file);

        let updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (age !== undefined && age !== '') {
            const parsedAge = parseInt(age);
            if (!isNaN(parsedAge)) updateData.age = parsedAge;
        }
        if (gender !== undefined) updateData.gender = gender;

        // If file uploaded, update URL
        if (req.file) {
            // Construct URL (Assuming served at /uploads)
            const fileUrl = `/uploads/${req.file.filename}`;
            updateData.profilePictureUrl = fileUrl;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, email: true, phone: true, age: true, gender: true, profilePictureUrl: true }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target && target.includes('phone')) {
                return res.status(400).json({ error: 'Phone number is already in use by another account.' });
            }
            if (target && target.includes('email')) {
                return res.status(400).json({ error: 'Email is already in use by another account.' });
            }
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
