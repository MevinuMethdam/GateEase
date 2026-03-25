import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, ShieldCheck, Home, Save, CheckCircle } from 'lucide-react';

const ResidentProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', unit_number: '', role: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState('');

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const userId = getUserId();

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/profile/${userId}`)
                .then(res => setProfile(res.data))
                .catch(err => console.error('Error fetching profile:', err));
        }
    }, [userId]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/profile/${userId}`, {
                name: profile.name, email: profile.email, phone: profile.phone
            });
            localStorage.setItem('userName', profile.name); // Sidebar එකේ නම Update වෙන්න
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match!");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/profile/${userId}/password`, {
                newPassword: passwords.new
            });
            setPasswords({ current: '', new: '', confirm: '' });
            alert('Password changed successfully!');
        } catch (error) {
            console.error('Password change failed:', error);
        }
    };

    return (
        <div className="pb-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
                <p className="text-gray-400">Manage your personal details and account security.</p>
            </div>

            {message && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Status & Overview Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-card rounded-3xl border border-white/5 p-8 text-center shadow-lg">
                        <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-2 border-primary/30">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                        <p className="text-primary mt-1 capitalize">{profile.role || 'Resident'}</p>

                        <div className="mt-8 space-y-4 text-left border-t border-white/5 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5"><Home className="w-5 h-5 text-gray-400" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Assigned Unit</p>
                                    <p className="text-sm text-white font-medium">{profile.unit_number || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10"><ShieldCheck className="w-5 h-5 text-green-500" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Account Status</p>
                                    <p className="text-sm text-green-400 font-medium">Active & Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Edit Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details Form */}
                    <div className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Personal Details
                        </h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-primary transition-colors" required />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 text-right">
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 inline-flex transition-colors">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security & Password Form */}
                    <div className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-yellow-500" /> Security
                        </h3>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                    <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} placeholder="Enter new password" className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" required minLength="6" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                    <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} placeholder="Confirm new password" className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" required minLength="6" />
                                </div>
                            </div>
                            <div className="pt-2 text-right">
                                <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-xl transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentProfile;