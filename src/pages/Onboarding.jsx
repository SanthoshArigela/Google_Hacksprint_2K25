import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaBrain, FaPiggyBank } from 'react-icons/fa';

const slides = [
    {
        icon: <FaChartLine size={80} color="#00D2FF" />,
        title: "Track Easily",
        desc: "Track all your expenses in one place without the hassle."
    },
    {
        icon: <FaBrain size={80} color="#8C52FF" />,
        title: "AI Insights",
        desc: "AI predicts overspending before it happens."
    },
    {
        icon: <FaPiggyBank size={80} color="#FF2E93" />,
        title: "Set Budgets",
        desc: "Get personalized budgets based on your habits."
    }
];

const Onboarding = ({ onFinish }) => {
    const [index, setIndex] = useState(0);

    const nextSlide = () => {
        if (index < slides.length - 1) {
            setIndex(index + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div style={{ height: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        style={{ textAlign: 'center', width: '100%' }}
                    >
                        <div style={{ marginBottom: '40px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }}>
                            {slides[index].icon}
                        </div>
                        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>{slides[index].title}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{slides[index].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                {slides.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === index ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: i === index ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>

            <button
                onClick={nextSlide}
                className="glass"
                style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                    color: '#FFF',
                    boxShadow: '0 8px 20px rgba(140, 82, 255, 0.3)'
                }}
            >
                {index === slides.length - 1 ? "Get Started" : "Next"}
            </button>
        </div>
    );
};

export default Onboarding;
