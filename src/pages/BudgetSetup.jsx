import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaRobot, FaWallet, FaPlus } from 'react-icons/fa';
import { finance } from '../services/api';

const BudgetSetup = ({ onBack, onSave }) => {
    const [budget, setBudget] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load existing budget mainly for init
        loadExistingBudget();
    }, []);

    const loadExistingBudget = async () => {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const data = await finance.getBudget(currentMonth);
            if (data && data.amountTotal) {
                setBudget(Number(data.amountTotal));
                setInputValue(data.amountTotal.toString());
            }
        } catch (e) {
            console.error("No existing budget found or error", e);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setInputValue(val);
        setBudget(Number(val));
    };

    const addAmount = (amount) => {
        const newTotal = budget + amount;
        setBudget(newTotal);
        setInputValue(newTotal.toString());
    };

    const handleSave = async () => {
        if (budget <= 0) {
            alert("Please enter a valid amount for your purse.");
            return;
        }

        setLoading(true);
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            await finance.setBudget(currentMonth, budget);
            onSave(budget);
        } catch (e) {
            console.error(e);
            alert('Failed to save budget');
        } finally {
            setLoading(false);
        }
    };

    // Quick Options
    const quickOptions = [500, 1000, 2000, 5000];

    return (
        <div style={{ height: '100vh', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'transparent', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaArrowLeft /> Back
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                    <FaWallet size={32} color="var(--primary-color)" />
                </div>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>My Purse</h2>
                <p style={{ color: 'var(--text-secondary)' }}>How much is in your pocket this month?</p>
            </div>

            {/* Main Input - Big & Bold */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '8px' }}>₹</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="0"
                    autoFocus
                    style={{
                        background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary-color)',
                        color: '#fff', fontSize: '56px', fontWeight: '700', width: '200px', textAlign: 'center',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Quick Add Chips */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
                {quickOptions.map(amt => (
                    <button
                        key={amt}
                        onClick={() => addAmount(amt)}
                        className="glass"
                        style={{
                            padding: '8px 16px', borderRadius: '20px', fontSize: '14px',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        <FaPlus size={10} /> ₹{amt}
                    </button>
                ))}
            </div>

            {/* AI Recommendation */}
            <div className="glass-card" style={{
                display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', marginBottom: 'auto',
                background: 'rgba(140, 82, 255, 0.15)', border: '1px solid rgba(140, 82, 255, 0.3)'
            }}>
                <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '50%' }}>
                    <FaRobot color="#fff" />
                </div>
                <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Smart Suggestion</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                        Usually you spend around <b>₹7,500</b>.
                    </p>
                </div>
                <button
                    onClick={() => { setBudget(7500); setInputValue('7500'); }}
                    style={{
                        background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px',
                        color: '#fff', fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    Set
                </button>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                style={{
                    width: '100%', padding: '18px', borderRadius: '16px',
                    background: 'var(--primary-color)', color: '#fff', fontSize: '16px', fontWeight: '700',
                    opacity: loading ? 0.7 : 1, marginTop: '24px'
                }}
            >
                {loading ? 'Filling Purse...' : 'Fill My Purse'}
            </button>
        </div>
    );
};

export default BudgetSetup;
