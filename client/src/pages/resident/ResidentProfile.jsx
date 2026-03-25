import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, ShieldCheck, Home, Save, CheckCircle, AlertTriangle, Edit3, X, Users } from 'lucide-react';

const ResidentProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', unit_number: '', role: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState('');

    // 🌟 NEW: Emergency Contact States
    const [emergencyContact, setEmergencyContact] = useState({ name: '', relationship: '', phone: '' });
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

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
                    setProfile(res.data);
                    if (res.data.emergency_contact) {
                        setEmergencyContact(res.data.emergency_contact);
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

    const handleEmergencyContactUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/profile/${userId}/emergency-contact`, emergencyContact);
            setMessage('Emergency contact updated successfully!');
            setIsEmergencyModalOpen(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Emergency contact update failed:', error);
            alert('Failed to update emergency contact. Please try again.');
        }
    };

    return (
        <div className="pb-8 max-w-6xl mx-auto font-sans relative z-10">
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#EAEAEA] tracking-tight mb-2 drop-shadow-sm">Account Settings</h2>
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[#C0DE1B]"></div>
                    <p className="text-[#848484] text-xs font-bold uppercase tracking-widest">Manage your personal details & security</p>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30 text-green-400 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-sm">{message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.5)] group hover:border-[#C0DE1B]/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-[#C0DE1B]/[0.05] to-transparent rounded-full blur-[50px] pointer-events-none group-hover:from-[#C0DE1B]/[0.1] transition-colors duration-700"></div>

                        <div className="w-28 h-28 rounded-[24px] bg-[#111111] text-[#C0DE1B] flex items-center justify-center text-[44px] font-extrabold mx-auto mb-5 border border-[#C0DE1B]/20 shadow-[inset_0_2px_10px_rgba(192,222,24,0.1)] group-hover:shadow-[0_0_20px_rgba(192,222,24,0.15)] transition-all duration-500">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h3 className="text-[22px] font-extrabold text-[#EAEAEA] tracking-tight relative z-10">{profile.name}</h3>
                        <p className="text-[#848484] text-[11px] font-bold uppercase tracking-widest mt-1 relative z-10">{profile.role || 'Resident'}</p>

                        <div className="mt-8 space-y-4 text-left border-t border-white/[0.05] pt-6 relative z-10">
                            <div className="flex items-center gap-4 bg-[#111111]/50 p-4 rounded-[20px] border border-white/[0.02]">
                                <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.05]"><Home className="w-4 h-4 text-[#A0A0A0]" /></div>
                                <div>
                                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">Assigned Unit</p>
                                    <p className="text-[14px] text-[#EAEAEA] font-extrabold">{profile.unit_number || 'Pending Assignment'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-[#111111]/50 p-4 rounded-[20px] border border-white/[0.02]">
                                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20"><ShieldCheck className="w-4 h-4 text-green-500" /></div>
                                <div>
                                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">Account Status</p>
                                    <p className="text-[13px] text-green-500 font-extrabold tracking-wide">Active & Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] group hover:border-red-500/20 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-bl from-red-500/[0.05] to-transparent rounded-full blur-[40px] pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <h3 className="text-[16px] font-bold text-white flex items-center gap-2 tracking-tight">
                                <AlertTriangle className="w-4 h-4 text-red-500" /> Emergency Contact
                            </h3>
                            <button onClick={() => setIsEmergencyModalOpen(true)} className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center text-[#848484] hover:text-white hover:bg-white/[0.05] transition-all" title="Edit Contact">
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {emergencyContact.name ? (
                            <div className="space-y-4 relative z-10">
                                <div className="bg-[#111111]/80 p-4 rounded-[20px] border border-white/[0.02]">
                                    <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest mb-1">Contact Name</p>
                                    <p className="text-[14px] text-[#EAEAEA] font-extrabold flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#555555]"/>{emergencyContact.name}</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-[#111111]/80 p-4 rounded-[20px] border border-white/[0.02]">
                                        <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest mb-1">Relation</p>
                                        <p className="text-[13px] text-[#EAEAEA] font-bold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#555555]"/>{emergencyContact.relationship}</p>
                                    </div>
                                    <div className="flex-1 bg-[#111111]/80 p-4 rounded-[20px] border border-white/[0.02]">
                                        <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest mb-1">Phone</p>
                                        <p className="text-[13px] text-[#EAEAEA] font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#555555]"/>{emergencyContact.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-[#111111]/30 rounded-[20px] border border-white/[0.02] border-dashed relative z-10 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setIsEmergencyModalOpen(true)}>
                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#555555]" />
                                <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No Contact Added</p>
                                <p className="text-[#666666] text-[10px] mt-1">Click to add emergency info</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-[12px] bg-[#111111] border border-white/[0.05] flex items-center justify-center shadow-inner">
                                <User className="w-5 h-5 text-[#C0DE1B]" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-extrabold text-[#EAEAEA] tracking-tight">Personal Details</h3>
                                <p className="text-[#666666] text-[11px] font-bold uppercase tracking-widest">Update your basic information</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="relative group/input">
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Full Name</label>
                                <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                </div>
                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-semibold" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Email Address</label>
                                    <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                    </div>
                                    <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-semibold" required />
                                </div>
                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Phone Number</label>
                                    <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                        <Phone className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                    </div>
                                    <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-semibold" required />
                                </div>
                            </div>

                            <div className="pt-4 text-right">
                                <button type="submit" className="bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold py-3.5 px-8 rounded-[16px] flex items-center gap-2 inline-flex transition-all duration-300 shadow-[0_0_20px_rgba(192,222,24,0.2)] hover:shadow-[0_0_30px_rgba(192,222,24,0.4)] hover:-translate-y-1">
                                    <Save className="w-4 h-4" /> Save Details
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-[12px] bg-[#111111] border border-white/[0.05] flex items-center justify-center shadow-inner">
                                <Lock className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-extrabold text-[#EAEAEA] tracking-tight">Security</h3>
                                <p className="text-[#666666] text-[11px] font-bold uppercase tracking-widest">Update your password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">New Password</label>
                                    <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} placeholder="••••••••" className="w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-inner font-semibold placeholder:text-[#555555]" required minLength="6" />
                                </div>
                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Confirm Password</label>
                                    <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} placeholder="••••••••" className="w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-inner font-semibold placeholder:text-[#555555]" required minLength="6" />
                                </div>
                            </div>
                            <div className="pt-4 text-right">
                                <button type="submit" className="bg-[#111111] border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-[#050505] font-extrabold py-3.5 px-8 rounded-[16px] transition-all duration-300 shadow-lg">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {isEmergencyModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                    <div className="bg-[#0A0A0A] border border-white/[0.08] p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
                        <button onClick={() => setIsEmergencyModalOpen(false)} className="absolute top-6 right-6 text-[#666666] hover:text-white transition-colors bg-[#111111] p-2 rounded-full border border-white/[0.05]">
                            <X className="w-4 h-4" />
                        </button>

                        <h3 className="text-[22px] font-extrabold text-white mb-2 flex items-center gap-3 tracking-tight">
                            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-[12px] flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500"/>
                            </div>
                            Emergency Info
                        </h3>
                        <p className="text-[#848484] text-xs font-medium tracking-wide mb-8">Update your primary emergency contact details.</p>

                        <form onSubmit={handleEmergencyContactUpdate} className="space-y-6">
                            <div className="relative group/input">
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Contact Name</label>
                                <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-[#555555] group-focus-within/input:text-red-500 transition-colors" />
                                </div>
                                <input type="text" required value={emergencyContact.name} onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner font-bold" placeholder="e.g. John Doe" />
                            </div>

                            <div className="relative group/input">
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Relationship</label>
                                <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                    <Users className="w-5 h-5 text-[#555555] group-focus-within/input:text-red-500 transition-colors" />
                                </div>
                                <input type="text" required value={emergencyContact.relationship} onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner font-bold" placeholder="e.g. Father, Spouse" />
                            </div>

                            <div className="relative group/input">
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Phone Number</label>
                                <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                    <Phone className="w-5 h-5 text-[#555555] group-focus-within/input:text-red-500 transition-colors" />
                                </div>
                                <input type="text" required value={emergencyContact.phone} onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})} className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner font-bold" placeholder="e.g. +94 77 123 4567" />
                            </div>

                            <button type="submit" className="w-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-extrabold py-4 rounded-[16px] transition-all duration-300 shadow-lg mt-4">
                                Save Contact Info
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResidentProfile;