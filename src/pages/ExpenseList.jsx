import React, { useState, useEffect } from 'react';
import { FaSearch, FaUtensils, FaBus, FaShoppingBag, FaFilm, FaFilter, FaMoneyBillWave } from 'react-icons/fa';
import { finance } from '../services/api';

const ExpenseList = () => {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await finance.getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = expenses.filter(e => {
        const matchesSearch = (e.note || e.title || 'Expense').toLowerCase().includes(search.toLowerCase());
        // Simple filter logic (can be expanded)
        const matchesDate = true; // Implement actual date logic if needed
        return matchesSearch && matchesDate;
    });

    // Helper to get Icon
    const getCategoryIcon = (catName) => {
        const name = (catName || '').toLowerCase();
        if (name.includes('food')) return <FaUtensils />;
        if (name.includes('transport') || name.includes('uber')) return <FaBus />;
        if (name.includes('shopping') || name.includes('grocery')) return <FaShoppingBag />;
        if (name.includes('movie') || name.includes('entertainment')) return <FaFilm />;
        return <FaMoneyBillWave />;
    };

    if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Loading transactions...</div>;

    return (
        <div style={{ padding: '24px 20px', paddingBottom: '90px' }}>
            <h2 style={{ marginBottom: '24px' }}>Transactions</h2>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div className="glass" style={{
                    flex: 1, padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <FaSearch color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%' }}
                    />
                </div>
                {/* <button className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
                    <FaFilter color="var(--primary-color)" />
                </button> */}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    <p>No transaction history found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filtered.map(item => (
                        <div key={item.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {React.cloneElement(getCategoryIcon(item.category?.name || item.note), { color: '#fff', size: 20 })}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.note || 'Expense'}</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {new Date(item.txnTime).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ fontSize: '16px', color: '#fff' }}>-₹{item.amount}</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {item.category?.name || (
                                        (item.note || '').toLowerCase().includes('meesho') ? 'Shopping' :
                                            (item.note || '').toLowerCase().includes('zomato') ? 'Food' :
                                                (item.note || '').toLowerCase().includes('uber') ? 'Transport' :
                                                    'Uncategorized'
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
