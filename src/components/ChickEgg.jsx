import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChickEgg = ({ amount }) => {
    const [hatched, setHatched] = useState(false);

    useEffect(() => {
        // Auto-hatch after a delay
        const timer = setTimeout(() => setHatched(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ position: 'relative', width: '120px', height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>

            {/* The Chick (Hidden behind egg initially) */}
            <AnimatePresence>
                {hatched && (
                    <motion.div
                        initial={{ y: 50, scale: 0.5, opacity: 0 }}
                        animate={{ y: -20, scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        style={{ position: 'absolute', bottom: '40px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {/* Chick SVG */}
                        <svg width="60" height="60" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="#FFD700" /> {/* Body */}
                            <circle cx="35" cy="40" r="5" fill="#000" /> {/* Eye */}
                            <circle cx="65" cy="40" r="5" fill="#000" /> {/* Eye */}
                            <path d="M 40 55 L 50 65 L 60 55" fill="none" stroke="#FF4500" strokeWidth="3" /> {/* Beak */}
                            <path d="M 30 50 Q 10 30 20 60" fill="none" stroke="#FFD700" strokeWidth="5" /> {/* Wing */}
                            <path d="M 70 50 Q 90 30 80 60" fill="none" stroke="#FFD700" strokeWidth="5" /> {/* Wing */}
                        </svg>

                        {/* The "Sign" (Amount) */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: '#fff', padding: '4px 8px', borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '-10px',
                                textAlign: 'center', minWidth: '80px'
                            }}
                        >
                            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Spent Today</p>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', margin: 0 }}>₹{amount}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Egg Bottom (Always visible) */}
            <svg width="100" height="60" viewBox="0 0 100 60" style={{ zIndex: 2 }}>
                <path d="M 10 0 L 20 20 L 30 0 L 40 20 L 50 0 L 60 20 L 70 0 L 80 20 L 90 0 C 90 40 50 50 10 0" fill="#fff" stroke="#eee" strokeWidth="2" />
                <path d="M 10 0 Q 50 60 90 0 Z" fill="#fff" />
            </svg>

            {/* Egg Top (Cracks and flies away) */}
            <AnimatePresence>
                {!hatched && (
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -5, 5, -5, 5, 0] }} // Shake
                        exit={{ y: -100, opacity: 0, rotate: 20 }} // Fly away
                        transition={{ duration: 0.5 }}
                        style={{ position: 'absolute', bottom: '55px', zIndex: 3 }}
                    >
                        <svg width="100" height="50" viewBox="0 0 100 50">
                            <path d="M 10 50 L 20 30 L 30 50 L 40 30 L 50 50 L 60 30 L 70 50 L 80 30 L 90 50 Q 90 0 10 50" fill="#fff" stroke="#eee" strokeWidth="2" />
                            {/* Cracks */}
                            <path d="M 40 10 L 50 25 L 45 35" fill="none" stroke="#eee" strokeWidth="2" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChickEgg;
