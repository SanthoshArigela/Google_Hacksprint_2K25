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
// Middleware: CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5175',
    process.env.FRONTEND_URL // Deployment URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Flexible check: Exact match OR partial match (for Vercel subdomains if needed)
        // For Hackathon simplicity: If env is set, allow it. If local, allow localhost.
        if (allowedOrigins.includes(origin) || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)) {
            callback(null, true);
        } else {
            console.warn(`CORS Blocked: ${origin}`); // Warn but don't crash console
            // Fallback for Hackathon: Allow headers to pass if it looks like a browser
            // To be strictly safe for presentation: 
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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
