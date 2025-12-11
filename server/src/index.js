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
// Middleware (Permissive CORS for Debugging)
app.use(cors({
    origin: function (origin, callback) {
        console.log("Incoming Origin:", origin); // Debug log to see what Vercel sends
        // Allow ALL origins for now to fix the deployment error
        callback(null, true);
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
