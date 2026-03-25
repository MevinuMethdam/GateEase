import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, ShieldCheck, Save, CheckCircle } from 'lucide-react';

const AdminProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', role: '' });
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
                .then(res => {
                    if (res.data) {
                        setProfile({
                            name: res.data.name || '',
                            email: res.data.email || '',
                            phone: res.data.phone || '',
                            role: res.data.role || 'Admin'
                        });
                    }
                })
                .catch(err => console.error('Error fetching profile:', err));
        }
    }, [userId]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/profile/${userId}`, {
                name: profile.name, email: profile.email, phone: profile.phone
            });
            localStorage.setItem('userName', profile.name);
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

    const getInitial = () => {
        return profile?.name ? profile.name.charAt(0).toUpperCase() : 'A';
    };

    return (
        <div className="pb-12 max-w-6xl mx-auto font-sans">
            <div className="mb-10">
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Admin Profile</h2>
                <p className="text-gray-400 text-lg">Manage your system administrator details and security.</p>
            </div>

            {message && (
                <div className="mb-8 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 font-medium">
                    <CheckCircle className="w-6 h-6" /> {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ⬅️ Left Side: Profile Card */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#0A0A0A] rounded-[32px] border border-white/5 overflow-hidden relative p-8 text-center shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 blur-[70px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="w-28 h-28 rounded-full bg-[#1A1A1A] flex items-center justify-center text-5xl font-extrabold text-primary mx-auto mb-6 shadow-[0_0_30px_rgba(192,222,24,0.15)]">
                                {getInitial()}
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{profile?.name || 'Loading...'}</h3>
                            <p className="text-gray-400 mt-1">{profile?.email}</p>
                            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize border border-primary/20">
                                System Administrator
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-full bg-[#141414] border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-white font-semibold">System Access</p>
                                <p className="text-sm text-primary">Full Admin Privileges</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ➡️ Right Side: Forms */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Personal Details Form */}
                    <div className="bg-[#0A0A0A] rounded-[32px] border border-white/5 p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            Edit Details
                        </h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 pl-2">Full Name</label>
                                <input type="text" value={profile?.name || ''} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 pl-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                        <input type="email" value={profile?.email || ''} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 pl-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                        <input type="text" value={profile?.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                                    </div>
                                </div>
                            </div>
                            {/* ⬇️ Professional Size & Right Aligned Button */}
                            <div className="pt-4 text-right">
                                <button type="submit" className="bg-primary hover:bg-[#a8c215] text-black font-bold text-base py-3 px-8 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(192,222,24,0.3)]">
                                    <Save className="w-5 h-5" /> Update Admin Info
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Form */}
                    <div className="bg-[#0A0A0A] rounded-[32px] border border-white/5 p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                                <Lock className="w-5 h-5" />
                            </div>
                            System Security
                        </h3>
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 pl-2">New Password</label>
                                    <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required minLength="6" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 pl-2">Confirm New Password</label>
                                    <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required minLength="6" />
                                </div>
                            </div>
                            {/* ⬇️ Professional Size & Right Aligned Button */}
                            <div className="pt-4 text-right">
                                <button type="submit" className="bg-white hover:bg-gray-200 text-black font-bold text-base py-3 px-8 rounded-full transition-all">
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;