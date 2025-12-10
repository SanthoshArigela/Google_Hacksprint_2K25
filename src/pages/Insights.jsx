import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FaLightbulb } from 'react-icons/fa';
import { startOfWeek, endOfWeek, subWeeks, format, isSameDay, parseISO, getDay } from 'date-fns';
import { finance } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insights = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState({ diff: 0, msg: "Analyzing..." });
    const [forecast, setForecast] = useState(0);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const today = new Date();
            const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
            const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
            const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

            // Fetch all expenses from start of LAST week until now
            const data = await finance.getExpenses({
                from: startOfLastWeek.toISOString(),
                to: today.toISOString()
            });

            // Process Data
            const thisWeekDaily = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
            const lastWeekDaily = [0, 0, 0, 0, 0, 0, 0];

            let thisWeekTotal = 0;
            let lastWeekTotal = 0;

            data.forEach(txn => {
                const date = parseISO(txn.txnTime);
                const dayIndex = (getDay(date) + 6) % 7; // Shift Sun(0) to 6, Mon(1) to 0
                const amount = parseFloat(txn.amount);

                if (date >= startOfCurrentWeek) {
                    thisWeekDaily[dayIndex] += amount;
                    thisWeekTotal += amount;
                } else if (date >= startOfLastWeek && date <= endOfLastWeek) {
                    lastWeekDaily[dayIndex] += amount;
                    lastWeekTotal += amount;
                }
            });

            // Calculate Difference
            let diffPercent = 0;
            let msg = "Spending is stable.";
            if (lastWeekTotal > 0) {
                diffPercent = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
            }

            if (diffPercent > 10) msg = `You spent ${diffPercent.toFixed(0)}% more this week. Watch out!`;
            else if (diffPercent < -10) msg = `Great! You spent ${Math.abs(diffPercent).toFixed(0)}% less this week.`;
            else msg = "Your spending is consistent with last week.";

            setInsight({ diff: diffPercent, msg });

            // Simple Forecast (Avg per day * remaining days)
            const daysPassed = (getDay(today) + 6) % 7 + 1;
            const avgDaily = thisWeekTotal / (daysPassed || 1);
            const predictedTotal = thisWeekTotal + (avgDaily * (7 - daysPassed));
            setForecast(predictedTotal);

            // Chart Data
            setChartData({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'This Week',
                        data: thisWeekDaily,
                        borderColor: '#8C52FF',
                        backgroundColor: 'rgba(140, 82, 255, 0.5)',
                        tension: 0.4,
                    },
                    {
                        label: 'Last Week',
                        data: lastWeekDaily,
                        borderColor: '#00D2FF',
                        backgroundColor: 'rgba(0, 210, 255, 0.5)',
                        borderDash: [5, 5],
                        tension: 0.4,
                    },
                ],
            });

        } catch (error) {
            console.error("Failed to load insights", error);
        } finally {
            setLoading(false);
        }
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#fff' } },
            title: { display: false },
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#aaa' } },
            x: { grid: { display: false }, ticks: { color: '#aaa' } }
        }
    };

    if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Analyzing your finances...</div>;

    return (
        <div style={{ padding: '24px 20px', paddingBottom: '90px' }}>
            <h2 style={{ marginBottom: '24px' }}>AI Insights</h2>

            {/* AI Tip Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(140, 82, 255, 0.2), rgba(0, 210, 255, 0.1))',
                border: '1px solid rgba(140, 82, 255, 0.3)',
                borderRadius: '20px', padding: '20px', marginBottom: '24px',
                display: 'flex', gap: '16px', alignItems: 'start'
            }}>
                <div style={{ background: 'var(--primary-color)', padding: '10px', borderRadius: '12px' }}>
                    <FaLightbulb color="#fff" size={20} />
                </div>
                <div>
                    <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Spending Alert</h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255,255,255,0.8)' }}>
                        {insight.msg}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Weekly Spending Trend</h3>
                {chartData && <Line data={chartData} options={options} />}
            </div>

            {/* Predictions */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Forecast</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Predicted end-of-week spend: <span style={{ color: '#fff', fontWeight: '700' }}>₹{forecast.toFixed(0)}</span>
                </p>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((forecast / 5000) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--warning), var(--danger))' }}></div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '8px' }}>
                    (Based on your average daily spending)
                </p>
            </div>
        </div>
    );
};

export default Insights;
