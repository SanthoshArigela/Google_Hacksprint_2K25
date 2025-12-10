import React, { useState } from 'react';
import BudgetSetup from './BudgetSetup';
import { auth, user } from '../services/api';
import { FaCamera, FaUser, FaPhone, FaEnvelope, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';

const Profile = ({ onLogout }) => {
    const [showBudget, setShowBudget] = useState(false);
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', age: '', gender: '', profilePictureUrl: null });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [error, setError] = useState('');

    React.useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await user.getProfile();
            setProfile(data);
            setEditData({
                name: data.name || '',
                phone: data.phone || '',
                age: data.age || '',
                gender: data.gender || 'male'
            });
        } catch (e) {
            console.error(e);
            setError("Failed to load profile. Please try logging in again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('phone', editData.phone);
            formData.append('age', editData.age);
            formData.append('gender', editData.gender);
            if (selectedFile) {
                formData.append('profileImage', selectedFile);
            }

            const updated = await user.updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            setPreviewImage(null);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.logout();
            onLogout();
        } catch (e) {
            console.error(e);
            onLogout(); // Logout anyway
        }
    };

    if (showBudget) {
        return <BudgetSetup onBack={() => setShowBudget(false)} onSave={() => setShowBudget(false)} />;
    }

    const API_URL = 'http://localhost:3000'; // Or from env

    // Default Avatar Logic based on Gender
    const getDefaultAvatar = () => {
        const gender = (isEditing ? editData.gender : profile.gender) || 'male';
        if (gender === 'female') return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie'; // Female seed
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'; // Male seed
    };

    const avatarSrc = previewImage
        ? previewImage
        : (profile.profilePictureUrl ? `${API_URL}${profile.profilePictureUrl}?t=${new Date().getTime()}` : getDefaultAvatar());

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading Profile...</div>
    );

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
            <button onClick={onLogout} style={{ marginTop: '16px', color: '#fff' }}>Logout</button>
        </div>
    );

    return (
        <div style={{ padding: '24px', paddingTop: '40px', paddingBottom: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>Profile</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={{ color: 'var(--primary-color)', background: 'transparent', fontWeight: '600' }}>Edit</button>
                ) : (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => { setIsEditing(false); setPreviewImage(null); }} style={{ color: 'var(--text-secondary)', background: 'transparent' }}>Cancel</button>
                        <button onClick={handleSave} style={{ color: 'var(--success)', background: 'transparent', fontWeight: '600' }}>Save</button>
                    </div>
                )}
            </div>

            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <div style={{
                        width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                        border: '3px solid var(--glass-border)', background: '#333'
                    }}>
                        <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {isEditing && (
                        <label style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}>
                            <FaCamera color="#fff" size={14} />
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    )}
                </div>
                {!isEditing && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{profile.name || 'Student'}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
                    </div>
                )}
            </div>

            {/* Monthly Budget Link */}
            <div className="glass-card" onClick={() => setShowBudget(true)} style={{ padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span>💰 Monthly Budget</span>
                <span style={{ color: 'var(--primary-color)' }}>Edit</span>
            </div>

            {/* Inputs (Editing Mode) or List (View Mode) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {isEditing ? (
                    <>
                        <div className="glass-card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaUser color="var(--text-secondary)" />
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Full Name"
                                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 0', width: '100%' }}
                            />
                        </div>
                        <div className="glass-card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaPhone color="var(--text-secondary)" />
                            <input
                                type="tel"
                                value={editData.phone}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                placeholder="Phone Number"
                                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 0', width: '100%' }}
                            />
                        </div>
                        <div className="glass-card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaBirthdayCake color="var(--text-secondary)" />
                            <input
                                type="number"
                                value={editData.age}
                                onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                                placeholder="Age"
                                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 0', width: '100%' }}
                            />
                        </div>
                        <div className="glass-card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaVenusMars color="var(--text-secondary)" />
                            <select
                                value={editData.gender}
                                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 0', width: '100%' }}
                            >
                                <option value="male" style={{ background: '#333' }}>Male</option>
                                <option value="female" style={{ background: '#333' }}>Female</option>
                                <option value="other" style={{ background: '#333' }}>Other</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        {profile.phone && (
                            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <FaPhone />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phone</p>
                                    <p>{profile.phone}</p>
                                </div>
                            </div>
                        )}
                        {profile.age && (
                            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <FaBirthdayCake />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Age</p>
                                    <p>{profile.age}</p>
                                </div>
                            </div>
                        )}
                        {profile.gender && (
                            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <FaVenusMars />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gender</p>
                                    <p style={{ textTransform: 'capitalize' }}>{profile.gender}</p>
                                </div>
                            </div>
                        )}
                        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                <FaEnvelope />
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email</p>
                                <p>{profile.email}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="glass-card"
                style={{
                    width: '100%', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(255, 59, 48, 0.1)'
                }}
            >
                <span>Log Out</span>
            </button>
        </div>
    );
};

export default Profile;
