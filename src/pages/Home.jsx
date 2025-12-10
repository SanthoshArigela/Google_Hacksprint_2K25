import React from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaBell, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { finance, auth, user } from '../services/api';


ChartJS.register(ArcElement, Tooltip, Legend);

const Home = ({ onAddClick, onLogout }) => {
    const [budgetData, setBudgetData] = React.useState({ budget: 0, spent: 0, percent: 0 });
    const [userData, setUserData] = React.useState({ name: 'Student', avatar: null });
    const [dailySpent, setDailySpent] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    const handleLogout = async () => {
        try {
            await auth.logout();
            onLogout();
        } catch (e) {
            console.error(e);
            onLogout();
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [budgetRes, expensesRes, profileRes] = await Promise.all([
                    finance.getBudget(new Date().toISOString().slice(0, 7)),
                    finance.getExpenses(),
                    user.getProfile()
                ]);

                // Calculate totals
                const totalBudget = parseFloat(budgetRes.amountTotal || 0);
                const totalSpent = expensesRes.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
                const percent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

                setBudgetData({
                    budget: totalBudget,
                    spent: totalSpent,
                    percent
                });

                // Calculate Daily Spent
                const today = new Date().toDateString();
                const todayTotal = expensesRes
                    .filter(e => new Date(e.txnTime).toDateString() === today)
                    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

                setDailySpent(todayTotal);

                // Set User Data
                const API_URL = 'http://localhost:3000';
                console.log("Fetched Profile:", profileRes);
                setUserData({
                    name: profileRes.name || 'Scholar',
                    avatar: profileRes.profilePictureUrl ? `${API_URL}${profileRes.profilePictureUrl}` : null,
                    gender: profileRes.gender || 'male'
                });

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    const chartData = {
        labels: ['Used', 'Remaining'],
        datasets: [
            {
                data: [budgetData.spent, Math.max(0, budgetData.budget - budgetData.spent)],
                backgroundColor: ['#8C52FF', 'rgba(255, 255, 255, 0.1)'],
                borderColor: ['transparent', 'transparent'],
                cutout: '80%',
            },
        ],
    };

    const getAvatarSrc = () => {
        if (userData.avatar) return userData.avatar;
        const seed = userData.name.split(' ')[0];
        if (userData.gender === 'female') return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '24px 20px', paddingBottom: '80px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
                        <img src={getAvatarSrc()} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
                <div style={{ flex: 1, marginLeft: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{getGreeting()}, {userData.name} 👋</h3>
                </div>
                <button onClick={handleLogout} className="glass" style={{ padding: '10px', borderRadius: '50%', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaSignOutAlt />
                </button>
            </div>

            {/* Budget Card */}
            <div className="glass-card" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '32px 0', marginBottom: '24px' }}>
                <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                    <Doughnut data={chartData} options={{ maintainAspectRatio: true, plugins: { tooltip: { enabled: false }, legend: { display: false } } }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Remaining</p>
                        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>₹{(budgetData.budget - budgetData.spent).toLocaleString()}</h2>
                    </div>
                </div>
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>You've used <span style={{ color: '#fff', fontWeight: '600' }}>{budgetData.percent}%</span> of your budget</p>
                </div>
            </div>

            {/* AI Prediction Banner */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: 'rgba(255, 191, 0, 0.15)', border: '1px solid rgba(255, 191, 0, 0.3)',
                    borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start',
                    marginBottom: '24px'
                }}
            >
                <FaExclamationTriangle color="var(--warning)" size={20} style={{ marginTop: '2px' }} />
                <div>
                    <h4 style={{ color: 'var(--warning)', fontSize: '14px', marginBottom: '4px' }}>AI Spending Alert</h4>
                    <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'rgba(255,255,255,0.8)' }}>
                        Based on your habits, you may overshoot your budget by <b>₹650</b> this month.
                    </p>
                </div>
            </motion.div>

            {/* Quick Stats - WITH CHICK ANIMATION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>Spent Today</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '20px' }}>₹{dailySpent}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                            <FaArrowUp size={10} /> 12%
                        </span>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>Highest Category</p>
                    <h3 style={{ fontSize: '18px' }}>🍔 Food</h3>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={onAddClick}
                style={{
                    position: 'fixed', bottom: '24px', right: '24px', width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    boxShadow: '0 8px 24px rgba(140, 82, 255, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}
            >
                <FaPlus size={24} color="#FFF" />
            </button>

        </motion.div >
    );
};

export default Home;
