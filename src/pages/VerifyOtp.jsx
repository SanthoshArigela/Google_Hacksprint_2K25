import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMobileAlt, FaArrowLeft } from 'react-icons/fa';
import { auth } from '../services/api';

const VerifyOtp = ({ email, onLogin, onBack }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        setLoading(true);
        setError('');
        try {
            await auth.verify(email, otp);
            onLogin();
        } catch (err) {
            setError(err.response?.data?.error || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>
                <p>Error: No email provided.</p>
                <button onClick={onBack} style={{ marginTop: '10px', padding: '8px 16px', background: 'var(--primary-color)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Back to Login</button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                minHeight: '100vh', padding: '32px 24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                textAlign: 'center'
            }}
        >
            <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: 'rgba(255,255,255,0.1)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
            }}>
                <FaMobileAlt size={32} color="var(--primary-color)" />
            </div>

            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Verify Mobile</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Enter the 4-digit OTP sent to {email}
            </p>

            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                    className="glass-card"
                    style={{
                        width: '100%', color: '#fff', fontSize: '32px',
                        textAlign: 'center', letterSpacing: '8px', padding: '24px'
                    }}
                />

                {error && <p style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</p>}

                <button
                    onClick={handleVerify}
                    disabled={loading || otp.length < 4}
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: 'var(--primary-color)',
                        color: '#FFF',
                        opacity: (loading || otp.length < 4) ? 0.7 : 1,
                        cursor: (loading || otp.length < 4) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <p onClick={onBack} style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaArrowLeft /> Back to Login
                </p>
            </div>
        </motion.div>
    );
};

export default VerifyOtp;
