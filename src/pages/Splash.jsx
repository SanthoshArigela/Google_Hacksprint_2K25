import React from 'react';
import { motion } from 'framer-motion';

const Splash = () => {
    // Graph Path Data (A simple rising curve)
    const graphPath = "M10,80 C30,75 50,50 70,60 S110,40 130,30 S170,10 190,20";

    return (
        <div className="splash-screen" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)'
        }}>
            {/* Logo / Graph Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                    position: 'relative',
                    width: '200px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}
            >
                <svg width="200" height="100" viewBox="0 0 200 100" overflow="visible">
                    {/* Grid Lines for "Financial" feel */}
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5 }}>
                        <line x1="10" y1="90" x2="190" y2="90" stroke="#FFF" strokeWidth="1" />
                        <line x1="10" y1="10" x2="10" y2="90" stroke="#FFF" strokeWidth="1" />
                    </motion.g>

                    {/* The Animated Graph Line */}
                    <motion.path
                        d={graphPath}
                        fill="transparent"
                        stroke="url(#gradient)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    />

                    {/* Floating Glow Dot at the end */}
                    <motion.circle
                        cx="190" cy="20" r="6"
                        fill="#00D2FF"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: [1, 1.5, 1] }}
                        transition={{ delay: 1.7, duration: 1, repeat: Infinity }}
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8C52FF" />
                            <stop offset="100%" stopColor="#00D2FF" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Glow Effect behind */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '120px', height: '80px', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.3) 0%, transparent 70%)',
                    zIndex: -1
                }} />
            </motion.div>

            {/* Title Animation */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                style={{ textAlign: 'center' }}
            >
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    background: 'linear-gradient(to right, #00D2FF, #8C52FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                }}>
                    CHAMS
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '1px' }}>
                    FINANCIAL TRACKER
                </p>
            </motion.div>

        </div>
    );
};

export default Splash;
