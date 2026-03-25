import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🌟 NEW: Added Wrench for the Category dropdown
import { Users, Plus, Mail, Phone, Lock, User, Edit2, Trash2, X, Check, Shield, TrendingUp, UserMinus, AlertTriangle, CreditCard, PhoneCall, Car, Wrench } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ManageResidents = () => {
    const [residents, setResidents] = useState([]);
    const [units, setUnits] = useState([]);

    // 🌟 NEW: Added 'category' to state (Default is 'General')
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', unit_id: '', status: 'owner_occupied', role: 'resident',
        nic: '', emergency_contact: '', vehicle_number: '', category: 'General'
    });

    const [editingUser, setEditingUser] = useState(null);

    const [formErrors, setFormErrors] = useState({});

    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);

    const fetchData = async () => {
        try {
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            const resUnits = await axios.get('http://localhost:5000/api/units');
            setResidents(resResidents.data);
            setUnits(resUnits.data.filter(u => u.status && u.status.toLowerCase() === 'vacant'));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = "Full Name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) errors.email = "Please enter a valid email address";

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) errors.phone = "Phone number must be exactly 10 digits (e.g. 0712345678)";

        if (formData.password.length < 6) errors.password = "Password must be at least 6 characters long";

        if (formData.role === 'resident') {
            const nicRegex = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;
            if (!formData.nic) {
                errors.nic = "NIC number is mandatory for residents";
            } else if (!nicRegex.test(formData.nic)) {
                errors.nic = "Invalid NIC format (e.g. 123456789V or 12 digits)";
            }

            if (!formData.emergency_contact) {
                errors.emergency_contact = "Emergency contact is mandatory";
            } else if (!phoneRegex.test(formData.emergency_contact)) {
                errors.emergency_contact = "Must be exactly 10 digits (e.g. 0712345678)";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const dataToSend = { ...formData };
            if (formData.role === 'maintenance') {
                dataToSend.unit_id = null;
                dataToSend.status = null;
                dataToSend.nic = null;
                dataToSend.emergency_contact = null;
                dataToSend.vehicle_number = null;
            } else {
                // Resident කෙනෙක් නම් Category එක Null කරනවා
                dataToSend.category = null;
            }

            await axios.post('http://localhost:5000/api/users/residents', dataToSend);
            alert(`✅ ${formData.role === 'resident' ? 'Resident' : 'Maintenance Staff'} added successfully!`);

            setFormData({ name: '', email: '', password: '', phone: '', unit_id: '', status: 'owner_occupied', role: 'resident', nic: '', emergency_contact: '', vehicle_number: '', category: 'General' });

            setFormErrors({});
            fetchData();
        } catch (error) {
            alert('❌ Failed to add user. Email might exist.');
        }
    };

    const handleDelete = async (id, name, role) => {
        const message = role === 'maintenance'
            ? `Are you sure you want to completely remove ${name} from Maintenance Staff?`
            : `Are you sure you want to completely delete ${name}'s account? This action cannot be undone.`;

        if (window.confirm(message)) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                fetchData();
                alert('✅ User removed successfully!');
            } catch (error) {
                alert('❌ Failed to delete user');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, {
                name: editingUser.name,
                email: editingUser.email,
                phone: editingUser.phone
            });
            setEditingUser(null);
            fetchData();
            alert('✅ Details updated successfully!');
        } catch (error) {
            alert('❌ Failed to update details');
        }
    };

    const openDeactivateModal = (user) => {
        setUserToDeactivate(user);
        setIsDeactivateModalOpen(true);
    };

    const confirmDeactivation = async () => {
        if (!userToDeactivate) return;

        try {
            await axios.put(`http://localhost:5000/api/users/${userToDeactivate.id}/deactivate`);

            setIsDeactivateModalOpen(false);
            setUserToDeactivate(null);
            fetchData();
            alert(`✅ Account for ${userToDeactivate.name} has been deactivated.`);
        } catch (error) {
            console.error('Error deactivating user:', error);
            alert('❌ Failed to deactivate user. Please try again.');
        }
    };

    const getChartData = () => {
        const groupedData = {};

        residents.forEach(user => {
            const dateStr = user.created_at || new Date().toISOString();
            const date = new Date(dateStr);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!groupedData[monthYear]) {
                groupedData[monthYear] = {
                    name: monthYear,
                    newResidents: 0,
                    newStaff: 0,
                    sortDate: new Date(date.getFullYear(), date.getMonth(), 1)
                };
            }

            if (user.role === 'maintenance') {
                groupedData[monthYear].newStaff += 1;
            } else {
                groupedData[monthYear].newResidents += 1;
            }
        });

        const sortedData = Object.values(groupedData).sort((a, b) => a.sortDate - b.sortDate);

        let totalRes = 0;
        let totalStaff = 0;

        return sortedData.map(item => {
            totalRes += item.newResidents;
            totalStaff += item.newStaff;
            return {
                name: item.name,
                Residents: totalRes,
                Staff: totalStaff
            };
        });
    };

    const chartData = getChartData();

    return (
        <div className="relative z-10 font-sans pb-8 max-w-[1600px] mx-auto">
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#EAEAEA] tracking-tight mb-2 drop-shadow-sm flex items-center gap-4">
                    <Users className="text-[#C0DE1B] w-10 h-10" />
                    Resident & Staff Management
                </h2>
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[#C0DE1B]"></div>
                    <p className="text-[#848484] text-xs font-bold uppercase tracking-widest">Register, edit, and deactivate system users</p>
                </div>
            </div>

            <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[32px] mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-gradient-to-bl from-[#C0DE1B]/[0.05] to-transparent rounded-full blur-[60px] pointer-events-none group-hover:from-[#C0DE1B]/[0.08] transition-colors duration-700"></div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-6">
                    <div>
                        <h3 className="text-[20px] font-extrabold text-white flex items-center gap-2 tracking-tight">
                            <TrendingUp className="w-5 h-5 text-[#C0DE1B]" /> Community Growth
                        </h3>
                        <p className="text-[#666666] text-[11px] font-bold uppercase tracking-widest mt-1.5">Timeline of user registrations</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-[#111111] border border-[#C0DE1B]/20 px-5 py-3 rounded-[16px] text-center shadow-inner min-w-[120px]">
                            <p className="text-[10px] text-[#848484] uppercase tracking-widest font-bold mb-1">Residents</p>
                            <p className="text-[24px] font-extrabold text-[#C0DE1B] leading-none">{residents.filter(r => r.role !== 'maintenance').length}</p>
                        </div>
                        <div className="bg-[#111111] border border-blue-500/20 px-5 py-3 rounded-[16px] text-center shadow-inner min-w-[120px]">
                            <p className="text-[10px] text-[#848484] uppercase tracking-widest font-bold mb-1">Staff</p>
                            <p className="text-[24px] font-extrabold text-blue-400 leading-none">{residents.filter(r => r.role === 'maintenance').length}</p>
                        </div>
                    </div>
                </div>

                <div className="h-[280px] w-full relative z-10">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                                <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight={600} />
                                <YAxis stroke="#555555" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} fontWeight={600} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', color: '#fff', fontSize: '13px', boxShadow: '0 15px 40px rgba(0,0,0,0.8)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#848484', paddingBottom: '20px' }}/>
                                <Line type="monotone" dataKey="Residents" name="Residents" stroke="#C0DE1B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#C0DE1B' }} />
                                <Line type="monotone" dataKey="Staff" name="Maintenance Staff" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111' }} activeDot={{ r: 7, strokeWidth: 0, fill: '#3B82F6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111]/30 rounded-[24px] border border-white/[0.02] border-dashed">
                            <Users className="w-10 h-10 text-[#555555] mb-3" />
                            <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No Growth Data</p>
                            <p className="text-[#666666] text-[11px] mt-1">Graph will populate once users are registered.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                <div className="lg:col-span-1 bg-[#0A0A0A]/90 backdrop-blur-2xl p-8 rounded-[32px] border border-white/[0.05] h-fit shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-[12px] bg-[#111111] border border-white/[0.05] flex items-center justify-center shadow-inner">
                            <Plus className="w-5 h-5 text-[#C0DE1B]" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-extrabold text-[#EAEAEA] tracking-tight">Add New User</h3>
                            <p className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">Register accounts to the system</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="relative group/input">
                            <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Account Role</label>
                            <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                <Shield className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                            </div>
                            <select
                                value={formData.role}
                                onChange={(e) => {
                                    setFormData({ ...formData, role: e.target.value });
                                    setFormErrors({...formErrors, unit_id: null, nic: null, emergency_contact: null});
                                }}
                                className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-bold appearance-none cursor-pointer"
                            >
                                <option value="resident">Apartment Resident</option>
                                <option value="maintenance">Maintenance Staff</option>
                            </select>
                        </div>

                        {/* 🌟 NEW: Category Select - Shows ONLY if Role is Maintenance */}
                        {formData.role === 'maintenance' && (
                            <div className="relative group/input animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Staff Category</label>
                                <div className="absolute left-4 top-9 flex items-center pointer-events-none">
                                    <Wrench className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                </div>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-bold appearance-none cursor-pointer text-blue-400"
                                >
                                    <option value="General" className="text-white">General</option>
                                    <option value="Plumbing" className="text-white">Plumbing</option>
                                    <option value="Electrical" className="text-white">Electrical</option>
                                    <option value="Carpentry" className="text-white">Carpentry</option>
                                    <option value="Cleaning" className="text-white">Cleaning</option>
                                    <option value="HVAC" className="text-white">HVAC</option>
                                </select>
                            </div>
                        )}

                        <div className="relative group/input">
                            <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                <User className={`w-5 h-5 transition-colors ${formErrors.name ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                            </div>
                            <input type="text" placeholder="Full Name" value={formData.name}
                                   onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({...formErrors, name: null}); }}
                                   className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.name ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                            {formErrors.name && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.name}</p>}
                        </div>

                        <div className="relative group/input">
                            <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                <Mail className={`w-5 h-5 transition-colors ${formErrors.email ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                            </div>
                            <input type="email" placeholder="Email Address" value={formData.email}
                                   onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({...formErrors, email: null}); }}
                                   className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.email ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                            {formErrors.email && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.email}</p>}
                        </div>

                        <div className="relative group/input">
                            <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                <Phone className={`w-5 h-5 transition-colors ${formErrors.phone ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                            </div>
                            <input type="text" placeholder="Phone Number" value={formData.phone}
                                   onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFormErrors({...formErrors, phone: null}); }}
                                   className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.phone ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                            {formErrors.phone && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.phone}</p>}
                        </div>

                        <div className="relative group/input">
                            <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                <Lock className={`w-5 h-5 transition-colors ${formErrors.password ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                            </div>
                            <input type="password" placeholder="Assign Temporary Password" value={formData.password}
                                   onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFormErrors({...formErrors, password: null}); }}
                                   className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.password ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                            {formErrors.password && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.password}</p>}
                        </div>

                        {formData.role === 'resident' && (
                            <div className="pt-2 pb-2 space-y-4 animate-in fade-in duration-300">

                                <div className="relative group/input">
                                    <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                        <CreditCard className={`w-5 h-5 transition-colors ${formErrors.nic ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                                    </div>
                                    <input type="text" placeholder="NIC Number" value={formData.nic}
                                           onChange={(e) => { setFormData({ ...formData, nic: e.target.value }); setFormErrors({...formErrors, nic: null}); }}
                                           className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.nic ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                                    {formErrors.nic && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.nic}</p>}
                                </div>

                                <div className="relative group/input">
                                    <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                        <PhoneCall className={`w-5 h-5 transition-colors ${formErrors.emergency_contact ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                                    </div>
                                    <input type="text" placeholder="Emergency Contact No." value={formData.emergency_contact}
                                           onChange={(e) => { setFormData({ ...formData, emergency_contact: e.target.value }); setFormErrors({...formErrors, emergency_contact: null}); }}
                                           className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold placeholder:text-[#555555] focus:outline-none ${formErrors.emergency_contact ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`} />
                                    {formErrors.emergency_contact && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.emergency_contact}</p>}
                                </div>

                                <div className="relative group/input">
                                    <div className="absolute left-4 top-4 flex items-center pointer-events-none">
                                        <Car className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                    </div>
                                    <input type="text" placeholder="Vehicle Number (Optional)" value={formData.vehicle_number}
                                           onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                           className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-semibold placeholder:text-[#555555]" />
                                </div>

                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Assign Unit</label>
                                    <select value={formData.unit_id}
                                            onChange={(e) => { setFormData({ ...formData, unit_id: e.target.value }); setFormErrors({...formErrors, unit_id: null}); }}
                                            className={`w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[16px] border transition-all shadow-inner font-semibold appearance-none cursor-pointer focus:outline-none ${formErrors.unit_id ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}>
                                        <option value="" className="text-[#555555]">-- Select Vacant Unit --</option>
                                        {units.map(u => <option key={u.id} value={u.id}>Unit: {u.unit_number} (Floor {u.floor_number})</option>)}
                                    </select>
                                    {formErrors.unit_id && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {formErrors.unit_id}</p>}
                                </div>

                                <div className="relative group/input">
                                    <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Occupancy Type</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[16px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 transition-all shadow-inner font-semibold appearance-none cursor-pointer">
                                        <option value="owner_occupied">Apartment Owner</option>
                                        <option value="rented">Tenant (Rented)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold py-4 rounded-[16px] flex items-center justify-center gap-2 mt-6 transition-all duration-300 shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:shadow-[0_0_30px_rgba(192,222,24,0.5)] hover:-translate-y-1">
                            <Plus className="w-5 h-5" /> {formData.role === 'resident' ? 'Register Resident' : 'Add Staff Member'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-[#0A0A0A]/90 backdrop-blur-2xl p-8 rounded-[32px] border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-[12px] bg-[#111111] border border-white/[0.05] flex items-center justify-center shadow-inner">
                            <Users className="w-5 h-5 text-[#C0DE1B]" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-extrabold text-[#EAEAEA] tracking-tight">System Users Directory</h3>
                            <p className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">Total {residents.length} active users</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/[0.05] text-[#848484] text-[10px] font-bold uppercase tracking-widest">
                                <th className="pb-5 pl-2">User Identity</th>
                                <th className="pb-5">Contact Email</th>
                                <th className="pb-5">Phone No.</th>
                                <th className="pb-5 pr-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {residents.map((res) => (
                                <tr key={res.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                    {editingUser && editingUser.id === res.id ? (
                                        <>
                                            <td className="py-4 pl-2"><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="bg-[#111111] text-white px-4 py-2.5 rounded-[12px] border border-white/[0.05] focus:border-[#C0DE1B]/50 outline-none w-full text-sm shadow-inner font-semibold" /></td>
                                            <td className="py-4"><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="bg-[#111111] text-white px-4 py-2.5 rounded-[12px] border border-white/[0.05] focus:border-[#C0DE1B]/50 outline-none w-full text-sm shadow-inner font-semibold" /></td>
                                            <td className="py-4"><input type="text" value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="bg-[#111111] text-white px-4 py-2.5 rounded-[12px] border border-white/[0.05] focus:border-[#C0DE1B]/50 outline-none w-full text-sm shadow-inner font-semibold" /></td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <button onClick={handleUpdate} className="w-9 h-9 flex items-center justify-center bg-[#C0DE1B]/10 text-[#C0DE1B] border border-[#C0DE1B]/20 rounded-[10px] hover:bg-[#C0DE1B] hover:text-[#050505] transition-all shadow-inner"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingUser(null)} className="w-9 h-9 flex items-center justify-center bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-[10px] hover:bg-gray-500 hover:text-white transition-all shadow-inner"><X className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-5 pl-2 flex flex-col justify-center">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[15px] font-extrabold shadow-inner border ${res.role === 'maintenance' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : res.status === 'inactive' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 'bg-[#C0DE1B]/10 text-[#C0DE1B] border-[#C0DE1B]/20'}`}>
                                                        {res.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={`font-extrabold text-[14px] ${res.status === 'inactive' ? 'text-gray-500 line-through' : 'text-[#EAEAEA]'}`}>{res.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {/* 🌟 NEW: Category එකත් පෙන්වනවා Maintenance නම් විතරක් */}
                                                            <p className="text-[9px] text-[#666666] uppercase tracking-widest font-bold">
                                                                {res.role} {res.role === 'maintenance' && res.category ? <span className="text-blue-400 ml-1">• {res.category}</span> : ''}
                                                            </p>
                                                            {res.status === 'inactive' && <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/30 uppercase font-bold tracking-wider">Deactivated</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-[#A0A0A0] text-[13px] font-medium">{res.email}</td>
                                            <td className="py-5 text-[#A0A0A0] text-[13px] font-medium">{res.phone}</td>
                                            <td className="py-5 pr-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingUser(res)} className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center text-[#848484] hover:text-[#C0DE1B] hover:border-[#C0DE1B]/30 hover:bg-[#C0DE1B]/5 transition-all" title="Edit details"><Edit2 className="w-3.5 h-3.5" /></button>

                                                    {res.role === 'resident' && res.status !== 'inactive' && (
                                                        <button onClick={() => openDeactivateModal(res)} className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center text-[#848484] hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all" title="Deactivate/Move Out"><UserMinus className="w-3.5 h-3.5" /></button>
                                                    )}

                                                    <button onClick={() => handleDelete(res.id, res.name, res.role)} className="w-8 h-8 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center text-[#848484] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all" title="Delete permanently"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {residents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center bg-[#111111]/30 rounded-[20px] border border-white/[0.02] border-dashed p-8">
                                            <Users className="w-10 h-10 mb-4 text-[#555555]" />
                                            <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No users registered</p>
                                            <p className="text-[#666666] text-xs mt-1">Use the form to add residents or staff.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* DEACTIVATE RESIDENT MODAL (US05) */}
            {/* ========================================== */}
            {isDeactivateModalOpen && userToDeactivate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                    <div className="bg-[#0A0A0A] border border-orange-500/20 p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-orange-500/[0.05] to-transparent rounded-full blur-[40px] pointer-events-none"></div>

                        <button onClick={() => setIsDeactivateModalOpen(false)} className="absolute top-6 right-6 text-[#666666] hover:text-white transition-colors bg-[#111111] p-2 rounded-full border border-white/[0.05] z-10">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-[inset_0_2px_10px_rgba(249,115,22,0.1)]">
                                <UserMinus className="w-8 h-8 text-orange-500"/>
                            </div>

                            <h3 className="text-[24px] font-extrabold text-white mb-2 tracking-tight text-center">Deactivate Account?</h3>
                            <p className="text-[#A0A0A0] text-sm text-center mb-8 font-medium">
                                You are about to deactivate the account for <strong className="text-white">{userToDeactivate.name}</strong>. They will no longer be able to log in to the Resident Portal.
                            </p>

                            <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-[16px] flex items-start gap-3 mb-8">
                                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-orange-400/80 font-bold tracking-wide leading-relaxed">
                                    Their previous billing and complaint history will be retained, but their active unit status will be revoked.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsDeactivateModalOpen(false)} className="flex-1 bg-[#111111] border border-white/[0.05] text-[#EAEAEA] hover:bg-white/[0.05] font-extrabold py-3.5 rounded-[16px] transition-all duration-300">
                                    Cancel
                                </button>
                                <button onClick={confirmDeactivation} className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] font-extrabold py-3.5 rounded-[16px] transition-all duration-300 hover:-translate-y-0.5">
                                    Yes, Deactivate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageResidents;