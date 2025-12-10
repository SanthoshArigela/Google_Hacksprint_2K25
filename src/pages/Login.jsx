import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaLock, FaUserPlus, FaMobileAlt, FaArrowLeft } from 'react-icons/fa';
import { auth } from '../services/api';

const Login = ({ onLogin, onVerify }) => {
    const [isSignup, setIsSignup] = useState(false);

    /* Login State */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /* Signup State */
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (isSignup) {
                // SIGNUP
                if (!email || !password || !name || !phone || !dob) {
                    setError("All fields are required");
                    setLoading(false);
                    return;
                }
                await auth.signup(email, password, name, phone, dob);
                onLogin();
            } else {
                // LOGIN
                await auth.login(email, password);
                onLogin();
            }
        } catch (err) {
            console.error(err);
            const resError = err.response?.data;
            setError(resError?.error || (isSignup ? 'Signup Failed' : 'Invalid credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ minHeight: '100vh', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '24px',
                    background: 'rgba(255,255,255,0.1)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}>
                    {isSignup ? <FaUserPlus size={32} color="var(--primary-color)" /> : <FaLock size={32} color="var(--primary-color)" />}
                </div>
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {isSignup ? 'Join us to start budgeting smart' : 'Sign in to continue budgeting'}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                {isSignup && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-card"
                        style={{ width: '100%', color: '#fff', fontSize: '16px' }}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-card"
                    style={{ width: '100%', color: '#fff', fontSize: '16px' }}
                />

                {isSignup && (
                    <>
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="glass-card"
                            style={{ width: '100%', color: '#fff', fontSize: '16px' }}
                        />
                        <input
                            type="date"
                            placeholder="Date of Birth"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="glass-card"
                            style={{ width: '100%', color: '#fff', fontSize: '16px' }}
                        />
                    </>
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-card"
                    style={{ width: '100%', color: '#fff', fontSize: '16px' }}
                />

                {error && <p style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</p>}
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '18px',
                    borderRadius: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'var(--primary-color)',
                    color: '#FFF',
                    marginBottom: '24px',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
            </button>

            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <span
                        onClick={() => setIsSignup(!isSignup)}
                        style={{ color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {isSignup ? 'Login' : 'Sign Up'}
                    </span>
                </p>
            </div>

        </motion.div>
    );
};

export default Login;
