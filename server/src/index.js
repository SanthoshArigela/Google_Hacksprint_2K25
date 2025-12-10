const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://127.0.0.1:5175',
            process.env.FRONTEND_URL // Allow deployed frontend
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV) {
            callback(null, true);
        } else {
            // For hackathon safety, if we really need it to work everywhere:
            // return callback(null, true); 
            // But let's stick to the env var for correctness first.
            // Actually, for a quick hackathon fix, let's just allow the env var if it matches, or fail.
            // A safer, more permissive check for this context:
            if (allowedOrigins.includes(origin) || origin === process.env.FRONTEND_URL) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budgets', budgetRoutes);
app.use('/users', userRoutes);

// Mock Root
app.get('/', (req, res) => {
    res.send('Student Budget API is running 🚀');
});

// Mock Data / Seeding Trigger (Dev only)
app.post('/seed', async (req, res) => {
    // Logic to seed initial categories
    res.json({ message: "Seeding implemented later" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
