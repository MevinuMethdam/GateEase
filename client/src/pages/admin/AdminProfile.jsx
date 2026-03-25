import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, ShieldCheck, Save, CheckCircle, Camera, CheckCircle2 } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto font-sans pb-12 px-4">
            <div className="mb-8 mt-2">
                <h2 className="text-[32px] font-extrabold text-[#EAEAEA] tracking-tight mb-1.5 drop-shadow-sm">
                    Admin Profile.
                </h2>
                <p className="text-[#848484] text-sm font-medium tracking-wide">
                    Manage your system administrator details and security credentials.
                </p>
            </div>
            {message && (
                <div className="mb-8 p-4 rounded-2xl bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <CheckCircle className="w-5 h-5 text-[#C0DE1B] drop-shadow-[0_0_8px_rgba(192,222,24,0.4)]" />
                    <span className="text-[#C0DE1B] font-semibold tracking-wide">{message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">

                    <div className="bg-[#070707]/90 backdrop-blur-3xl rounded-[32px] p-8 border border-white/[0.04] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group flex flex-col items-center text-center hover:border-white/[0.08] transition-all duration-500">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#C0DE1B] opacity-[0.05] blur-[60px] group-hover:opacity-[0.15] transition-opacity duration-700"></div>

                        <div className="relative mb-6 mt-4">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#C0DE1B]/30 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_0_30px_rgba(192,222,24,0.15)] group-hover:shadow-[0_0_40px_rgba(192,222,24,0.3)] group-hover:border-[#C0DE1B]/60 transition-all duration-500 z-10 relative">
                                <span className="text-[48px] font-extrabold text-[#C0DE1B] drop-shadow-lg">{getInitial()}</span>
                            </div>
                            <div className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-br from-[#C0DE1B] to-[#9EBA11] rounded-full flex items-center justify-center text-black border-[3px] border-[#070707] shadow-[0_0_15px_rgba(192,222,24,0.4)] z-20 cursor-pointer hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#EAEAEA] tracking-tight mb-1">{profile?.name || 'Loading...'}</h2>
                        <p className="text-[#848484] text-sm font-medium mb-6">{profile?.email || 'Loading...'}</p>

                        <div className="px-4 py-1.5 rounded-full bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 flex items-center gap-2 shadow-[inset_0_0_10px_rgba(192,222,24,0.05)] backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#C0DE1B]" />
                            <span className="text-[11px] text-[#C0DE1B] uppercase tracking-widest font-extrabold">{profile?.role || 'System Administrator'}</span>
                        </div>
                    </div>

                    <div className="bg-[#070707]/90 backdrop-blur-3xl rounded-[28px] p-6 border border-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-5 hover:border-white/[0.08] transition-all duration-500 group">
                        <div className="w-14 h-14 rounded-[16px] bg-[#111111] border border-white/[0.05] flex items-center justify-center shadow-inner group-hover:border-[#C0DE1B]/30 group-hover:shadow-[0_0_15px_rgba(192,222,24,0.1)] transition-all">
                            <Lock className="w-6 h-6 text-[#848484] group-hover:text-[#C0DE1B] transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-[#EAEAEA] font-bold text-[16px] tracking-tight">System Access</h3>
                            <p className="text-[#C0DE1B] text-[13px] font-semibold mt-1 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Full Privileges
                            </p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-6">

                    {/* Personal Details Form */}
                    <div className="bg-[#070707]/90 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 border border-white/[0.04] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-50"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#111111] to-[#0A0A0A] flex items-center justify-center border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                <User className="w-5 h-5 text-[#C0DE1B] drop-shadow-[0_0_8px_rgba(192,222,24,0.4)]" />
                            </div>
                            <h3 className="text-[22px] font-extrabold text-[#EAEAEA] tracking-tight">Edit Details</h3>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[#848484] uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full bg-[#0A0A0A] border border-white/[0.05] rounded-[20px] py-4 pl-12 pr-4 text-[#EAEAEA] font-medium placeholder-[#444444] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#848484] uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile?.email || ''}
                                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                                            className="w-full bg-[#0A0A0A] border border-white/[0.05] rounded-[20px] py-4 pl-12 pr-4 text-[#EAEAEA] font-medium placeholder-[#444444] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#848484] uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={profile?.phone || ''}
                                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                            className="w-full bg-[#0A0A0A] border border-white/[0.05] rounded-[20px] py-4 pl-12 pr-4 text-[#EAEAEA] font-medium placeholder-[#444444] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold text-[15px] rounded-full flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:shadow-[0_0_30px_rgba(192,222,24,0.5)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#C0DE1B] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                                >
                                    <Save className="w-5 h-5" />
                                    Update Admin Info
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Form */}
                    <div className="bg-[#070707]/90 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 border border-white/[0.04] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-50"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#1A1A1A] to-[#111111] flex items-center justify-center border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-[22px] font-extrabold text-[#EAEAEA] tracking-tight">System Security</h3>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#848484] uppercase tracking-widest mb-2 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0A0A0A] border border-white/[0.05] rounded-[20px] py-4 px-5 text-[#EAEAEA] font-medium placeholder-[#444444] focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all shadow-inner tracking-widest"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#848484] uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0A0A0A] border border-white/[0.05] rounded-[20px] py-4 px-5 text-[#EAEAEA] font-medium placeholder-[#444444] focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all shadow-inner tracking-widest"
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#EAEAEA] text-[#050505] font-extrabold text-[15px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none"
                                >
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