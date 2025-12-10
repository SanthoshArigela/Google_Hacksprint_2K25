const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticate');

const router = express.Router();
const prisma = new PrismaClient();

// GET /expenses
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { from, to } = req.query; // Optional date filters

    const where = { userId };
    if (from && to) {
        where.txnTime = {
            gte: new Date(from),
            lte: new Date(to)
        };
    }

    const expenses = await prisma.expense.findMany({
        where,
        orderBy: { txnTime: 'desc' },
        include: { category: true }
    });

    res.json(expenses);
});

// POST /expenses
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { amount, categoryId, note, txnTime } = req.body;

    const expense = await prisma.expense.create({
        data: {
            userId,
            amount,
            categoryId,
            note,
            txnTime: new Date(txnTime || Date.now())
        }
    });

    res.status(201).json(expense);
});

module.exports = router;
