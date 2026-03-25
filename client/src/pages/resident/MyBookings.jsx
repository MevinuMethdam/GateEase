import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🌟 NEW: Added Clock for pending and XCircle for rejected
import { Calendar, Plus, Clock, MapPin, CheckCircle, XCircle, Activity, AlertCircle } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        facility_name: 'gym', booking_date: '', start_time: '', end_time: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const fetchBookings = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/bookings/resident/${userId}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.booking_date) {
            errors.booking_date = "Please select a booking date.";
        } else {
            const selectedDate = new Date(formData.booking_date);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                errors.booking_date = "You cannot book a date in the past.";
            }
        }

        if (!formData.start_time) {
            errors.start_time = "Start time is required.";
        }
        if (!formData.end_time) {
            errors.end_time = "End time is required.";
        }

        if (formData.start_time && formData.end_time) {
            const startTimeNum = parseInt(formData.start_time.replace(':', ''));
            const endTimeNum = parseInt(formData.end_time.replace(':', ''));

            if (endTimeNum <= startTimeNum) {
                errors.time = "End time must be later than the start time.";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const userId = getUserId();

        try {
            const response = await axios.post('http://localhost:5000/api/bookings', {
                ...formData,
                resident_id: userId
            });
            // 🌟 NEW: Success message now dynamic based on Backend response
            alert(`✅ ${response.data.message}`);

            // Clear form and errors
            setFormData({ facility_name: 'gym', booking_date: '', start_time: '', end_time: '' });
            setFormErrors({});
            fetchBookings();
        } catch (error) {
            alert(`❌ ${error.response?.data?.message || 'Failed to book facility.'}`);
        }
    };

    const getChartData = () => {
        const usageData = {};

        bookings.forEach(bk => {
            if (bk.status === 'confirmed') {
                const dateStr = bk.booking_date;
                const date = new Date(dateStr);
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                if (!usageData[monthYear]) {
                    usageData[monthYear] = { name: monthYear, Usage: 0, sortDate: new Date(date.getFullYear(), date.getMonth(), 1) };
                }
                usageData[monthYear].Usage += 1;
            }
        });

        return Object.values(usageData)
            .sort((a, b) => a.sortDate - b.sortDate)
            .map(item => ({ name: item.name, Usage: item.Usage }));
    };

    const chartData = getChartData();

    return (
        <div className="relative z-10 font-sans">
            <h2 className="text-2xl md:text-[32px] font-extrabold text-[#EAEAEA] tracking-tight mb-8 flex items-center gap-3 drop-shadow-sm">
                <Calendar className="text-[#C0DE1B] w-8 h-8" />
                Reserve Facilities
            </h2>

            <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.05] p-6 md:p-8 rounded-[32px] mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-gradient-to-bl from-[#C0DE1B]/[0.05] to-transparent rounded-full blur-[60px] pointer-events-none group-hover:from-[#C0DE1B]/[0.08] transition-colors duration-700"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                            <Activity className="w-5 h-5 text-[#C0DE1B]" /> Usage Activity
                        </h3>
                        <p className="text-xs text-[#666666] font-bold uppercase tracking-widest mt-1.5">Your monthly facility bookings trend</p>
                    </div>
                    <div className="bg-[#111111] border border-[#C0DE1B]/20 px-5 py-2.5 rounded-2xl shadow-inner text-center">
                        <p className="text-[10px] text-[#848484] uppercase tracking-widest font-bold mb-0.5">Total Usage</p>
                        <p className="text-xl font-extrabold text-[#C0DE1B] drop-shadow-[0_0_8px_rgba(192,222,24,0.3)]">
                            {chartData.reduce((sum, item) => sum + item.Usage, 0)} <span className="text-xs text-[#555555]">Times</span>
                        </p>
                    </div>
                </div>

                <div className="h-[250px] w-full relative z-10">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C0DE1B" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#C0DE1B" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#555555" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(192,222,24,0.2)', strokeWidth: 2, strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', color: '#fff', boxShadow: '0 15px 30px rgba(0,0,0,0.8)' }}
                                    itemStyle={{ color: '#C0DE1B', fontWeight: 'bold' }}
                                    formatter={(value) => [`${value} Bookings`, 'Usage']}
                                />

                                <Area type="monotone" dataKey="Usage" stroke="#C0DE1B" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" activeDot={{ r: 6, fill: '#050505', stroke: '#C0DE1B', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111]/30 rounded-[20px] border border-white/[0.02]">
                            <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3 shadow-inner">
                                <Activity className="w-5 h-5 text-[#555555]" />
                            </div>
                            <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No Usage Data Yet</p>
                            <p className="text-[#555555] text-[11px] mt-1 text-center max-w-[250px]">Your facility booking history will be visualized here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-[#0A0A0A]/90 backdrop-blur-2xl p-8 rounded-[32px] border border-white/[0.05] h-fit shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                    <h3 className="text-[20px] font-extrabold text-[#EAEAEA] tracking-tight mb-6">New Reservation</h3>
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        <div>
                            <label className="text-[11px] font-bold text-[#848484] uppercase tracking-widest mb-2 block">Select Facility</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="w-5 h-5 text-[#555555] group-focus-within/input:text-[#C0DE1B] transition-colors" />
                                </div>
                                <select value={formData.facility_name} onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                        className="w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[20px] border border-white/[0.05] focus:outline-none focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 appearance-none cursor-pointer shadow-inner font-bold transition-all tracking-tight">
                                    <option value="gym">Gymnasium (Shared)</option>
                                    <option value="pool">Swimming Pool (Shared)</option>
                                    <option value="party_hall">Party Hall (Exclusive)</option>
                                    <option value="bbq_area">BBQ Area (Exclusive)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-[#848484] uppercase tracking-widest mb-2 block">Date</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className={`w-5 h-5 transition-colors ${formErrors.booking_date ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                                </div>
                                <input
                                    type="date"
                                    value={formData.booking_date}
                                    onChange={(e) => { setFormData({ ...formData, booking_date: e.target.value }); setFormErrors({...formErrors, booking_date: null}); }}
                                    className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[20px] border focus:outline-none cursor-pointer shadow-inner font-medium transition-all ${formErrors.booking_date ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}
                                />
                            </div>
                            {formErrors.booking_date && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.booking_date}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="text-[11px] font-bold text-[#848484] uppercase tracking-widest mb-2 block">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => { setFormData({ ...formData, start_time: e.target.value }); setFormErrors({...formErrors, start_time: null, time: null}); }}
                                    className={`w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[20px] border focus:outline-none cursor-pointer shadow-inner font-medium transition-all text-sm ${formErrors.start_time || formErrors.time ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}
                                />
                                {formErrors.start_time && <p className="text-red-400 text-[9px] mt-1.5 font-bold">{formErrors.start_time}</p>}
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#848484] uppercase tracking-widest mb-2 block">End Time</label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => { setFormData({ ...formData, end_time: e.target.value }); setFormErrors({...formErrors, end_time: null, time: null}); }}
                                    className={`w-full bg-[#111111] text-[#EAEAEA] px-4 py-4 rounded-[20px] border focus:outline-none cursor-pointer shadow-inner font-medium transition-all text-sm ${formErrors.end_time || formErrors.time ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}
                                />
                                {formErrors.end_time && <p className="text-red-400 text-[9px] mt-1.5 font-bold">{formErrors.end_time}</p>}
                            </div>
                        </div>

                        {formErrors.time && <p className="text-red-400 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.time}</p>}

                        <button type="submit" className="w-full bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold py-4 rounded-[20px] flex items-center justify-center gap-2 mt-6 transition-all duration-300 shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:shadow-[0_0_30px_rgba(192,222,24,0.5)] hover:-translate-y-1">
                            <Plus className="w-5 h-5" /> Confirm Booking
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-[#0A0A0A]/90 backdrop-blur-2xl p-8 rounded-[32px] border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                    <h3 className="text-[20px] font-extrabold text-[#EAEAEA] tracking-tight mb-6">Upcoming Reservations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th className="pb-4 pl-2 text-[11px] font-bold text-[#848484] uppercase tracking-widest">Facility</th>
                                <th className="pb-4 text-[11px] font-bold text-[#848484] uppercase tracking-widest">Date & Time</th>
                                <th className="pb-4 text-[11px] font-bold text-[#848484] uppercase tracking-widest">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bookings.map((bk) => (
                                <tr key={bk.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-5 pl-2">
                                        <p className="text-[#EAEAEA] font-extrabold capitalize tracking-wide">{bk.facility_name.replace('_', ' ')}</p>
                                    </td>
                                    <td className="py-5">
                                        <div className="text-white text-sm font-extrabold">{new Date(bk.booking_date).toLocaleDateString()}</div>
                                        <div className="text-[#666666] text-[11px] font-bold flex items-center gap-1.5 mt-1.5 tracking-wider">
                                            <Clock className="w-3.5 h-3.5" /> {bk.start_time.substring(0,5)} - {bk.end_time.substring(0,5)}
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        {/* 🌟 NEW: Dynamic Status Badges for Pending, Confirmed, Rejected, etc. */}
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-extrabold w-fit border ${
                                            bk.status === 'confirmed' ? 'bg-[#C0DE1B]/10 text-[#C0DE1B] border-[#C0DE1B]/20' :
                                                bk.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]' :
                                                    bk.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                        }`}>
                                            {bk.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                                            {bk.status === 'pending' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                                            {bk.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                            {bk.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center bg-[#111111]/30 rounded-[20px] border border-white/[0.02] border-dashed p-8">
                                            <Calendar className="w-10 h-10 mb-4 text-[#555555]" />
                                            <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No upcoming reservations</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MyBookings;