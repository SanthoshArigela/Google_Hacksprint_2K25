const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticate'); // To be created

const router = express.Router();
const prisma = new PrismaClient();

// GET /budgets?month=YYYY-MM
router.get('/', authenticateToken, async (req, res) => {
    const { month } = req.query;
    const userId = req.user.userId;

    if (!month) return res.status(400).json({ error: 'Month is required' });

    const budget = await prisma.budget.findUnique({
        where: {
            userId_month: { userId, month }
        }
    });

    res.json(budget || { amountTotal: 0 }); // Return empty default if none
});

// POST /budgets
router.post('/', authenticateToken, async (req, res) => {
    const { month, amountTotal } = req.body;
    const userId = req.user.userId;

    const budget = await prisma.budget.upsert({
        where: {
            userId_month: { userId, month }
        },
        update: { amountTotal },
        create: {
            userId,
            month,
            amountTotal
        }
    });

    res.json(budget);
});

module.exports = router;
