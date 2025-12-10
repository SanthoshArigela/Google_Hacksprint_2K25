import React from 'react';
import { FaHome, FaList, FaChartPie, FaUser } from 'react-icons/fa';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'home', icon: <FaHome />, label: 'Home' },
        { id: 'expenses', icon: <FaList />, label: 'Expenses' },
        { id: 'insights', icon: <FaChartPie />, label: 'Insights' },
        { id: 'profile', icon: <FaUser />, label: 'Profile' },
    ];

    return (
        <div className="glass" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '16px 8px', borderRadius: '24px 24px 0 0', borderBottom: 'none',
            zIndex: 50, maxWidth: '480px', margin: '0 auto' // Constrain to container
        }}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            background: 'transparent',
                            color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            transition: 'all 0.2s', flex: 1
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                        <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
