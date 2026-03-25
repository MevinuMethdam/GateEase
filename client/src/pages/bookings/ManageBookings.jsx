import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Clock, MapPin, XCircle, Edit2, Trash2, Check, X, PieChart as PieChartIcon, CheckCircle, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [residents, setResidents] = useState([]);
    const [blackoutDates, setBlackoutDates] = useState([]);

    const [formData, setFormData] = useState({
        resident_id: '', facility_name: 'gym', booking_date: '', start_time: '', end_time: ''
    });

    // 🌟 UPDATE: Added start_time and end_time to state
    const [blackoutForm, setBlackoutForm] = useState({
        facility_name: 'gym', blackout_date: '', start_time: '', end_time: '', reason: ''
    });

    const [editingBooking, setEditingBooking] = useState(null);

    const fetchData = async () => {
        try {
            const resBookings = await axios.get('http://localhost:5000/api/bookings');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            const resBlackouts = await axios.get('http://localhost:5000/api/bookings/blackouts');

            setBookings(resBookings.data);
            setResidents(resResidents.data);
            setBlackoutDates(resBlackouts.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/bookings', formData);
            alert(`✅ ${res.data.message}`);
            setFormData({ ...formData, booking_date: '', start_time: '', end_time: '' });
            fetchData();
        } catch (error) {
            alert(`❌ ${error.response?.data?.message || 'Failed to book.'}`);
        }
    };

    const handleBlackoutSubmit = async (e) => {
        e.preventDefault();
        // Time validation for maintenance
        if (blackoutForm.start_time && blackoutForm.end_time) {
            const startNum = parseInt(blackoutForm.start_time.replace(':', ''));
            const endNum = parseInt(blackoutForm.end_time.replace(':', ''));
            if (endNum <= startNum) {
                return alert("End time must be later than start time.");
            }
        }

        try {
            await axios.post('http://localhost:5000/api/bookings/blackouts', blackoutForm);
            alert('✅ Facility time slot successfully blocked!');
            setBlackoutForm({ facility_name: 'gym', blackout_date: '', start_time: '', end_time: '', reason: '' });
            fetchData();
        } catch (error) {
            alert(`❌ Failed to add blackout time slot.`);
        }
    };

    const handleDeleteBlackout = async (id) => {
        if (window.confirm('Are you sure you want to remove this block? Residents will be able to book it again.')) {
            try {
                await axios.delete(`http://localhost:5000/api/bookings/blackouts/${id}`);
                fetchData();
            } catch (error) {
                alert('❌ Failed to remove block.');
            }
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const action = newStatus === 'confirmed' ? 'approve' : 'reject';
        if (window.confirm(`Are you sure you want to ${action} this booking?`)) {
            try {
                const targetBooking = bookings.find(b => b.id === id);
                await axios.put(`http://localhost:5000/api/bookings/${id}`, {
                    facility_name: targetBooking.facility_name,
                    booking_date: targetBooking.booking_date,
                    start_time: targetBooking.start_time,
                    end_time: targetBooking.end_time,
                    status: newStatus
                });
                alert(`✅ Booking ${newStatus.toUpperCase()} successfully!`);
                fetchData();
            } catch (error) {
                alert(`❌ Failed to update status: ${error.response?.data?.message || 'Error'}`);
            }
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
                fetchData();
            } catch (error) {
                alert('❌ Failed to cancel.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to completely delete this reservation?')) {
            try {
                await axios.delete(`http://localhost:5000/api/bookings/${id}`);
                fetchData();
                alert('✅ Reservation deleted successfully!');
            } catch (error) {
                alert('❌ Failed to delete reservation');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/bookings/${editingBooking.id}`, {
                facility_name: editingBooking.facility_name,
                booking_date: editingBooking.booking_date,
                start_time: editingBooking.start_time,
                end_time: editingBooking.end_time,
                status: editingBooking.status
            });
            setEditingBooking(null);
            fetchData();
            alert('✅ Reservation updated successfully!');
        } catch (error) {
            alert('❌ Failed to update reservation');
        }
    };

    const getPieChartData = () => {
        const counts = { gym: 0, party_hall: 0, pool: 0, bbq_area: 0 };
        bookings.forEach(bk => {
            if (bk.status === 'confirmed') {
                counts[bk.facility_name] = (counts[bk.facility_name] || 0) + 1;
            }
        });
        return [
            { name: 'Gymnasium', value: counts.gym, color: '#C0DE18' },
            { name: 'Party Hall', value: counts.party_hall, color: '#3B82F6' },
            { name: 'Pool', value: counts.pool, color: '#8B5CF6' },
            { name: 'BBQ Area', value: counts.bbq_area, color: '#F97316' }
        ].filter(item => item.value > 0);
    };

    const pieData = getPieChartData();

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary w-6 h-6" />
                Facility Bookings & Capacity Management
            </h2>

            <div className="bg-dark-card border border-white/5 p-6 rounded-3xl mb-8 shadow-xl animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-primary" /> Facility Usage Distribution
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 tracking-wide uppercase font-bold">Confirmed Reservations Only</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} formatter={(value) => [`${value} Bookings`, 'Total']} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#9CA3AF' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                            <PieChartIcon className="w-8 h-8 text-gray-600 mb-2" />
                            <p className="text-gray-500 text-sm italic">No confirmed reservations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Bookings Form */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-3xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">New Reservation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block font-bold uppercase text-[10px] tracking-widest">Resident</label>
                            <select required value={formData.resident_id} onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer focus:border-primary/50 transition-colors">
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block font-bold uppercase text-[10px] tracking-widest">Facility</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <select value={formData.facility_name} onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                        className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer focus:border-primary/50 transition-colors font-bold">
                                    <option value="gym">Gymnasium (Shared)</option>
                                    <option value="pool">Swimming Pool (Shared)</option>
                                    <option value="party_hall">Party Hall (Exclusive)</option>
                                    <option value="bbq_area">BBQ Area (Exclusive)</option>
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block font-bold uppercase text-[10px] tracking-widest">Date</label>
                            <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="date" required value={formData.booking_date} onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer focus:border-primary/50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block font-bold uppercase text-[10px] tracking-widest">Start Time</label>
                                <input type="time" required value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer text-sm focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block font-bold uppercase text-[10px] tracking-widest">End Time</label>
                                <input type="time" required value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer text-sm focus:border-primary/50" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(192,222,24,0.3)]">
                            <Plus className="w-5 h-5" /> Confirm Reservation
                        </button>
                    </form>
                </div>

                {/* Upcoming Reservations Table */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        Upcoming Reservations <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 font-bold uppercase tracking-widest leading-none">Real-time</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                <th className="pb-4 pl-2">Facility</th>
                                <th className="pb-4">Resident</th>
                                <th className="pb-4">Date & Time</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bookings.map((bk) => (
                                <tr key={bk.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    {editingBooking && editingBooking.id === bk.id ? (
                                        <>
                                            <td className="py-2 pl-2">
                                                <select value={editingBooking.facility_name} onChange={(e) => setEditingBooking({...editingBooking, facility_name: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-28 text-sm appearance-none cursor-pointer">
                                                    <option value="gym">Gymnasium</option>
                                                    <option value="party_hall">Party Hall</option>
                                                    <option value="pool">Swimming Pool</option>
                                                    <option value="bbq_area">BBQ Area</option>
                                                </select>
                                            </td>
                                            <td className="py-2 text-gray-400 text-sm">{bk.resident_name || 'N/A'}</td>
                                            <td className="py-2 flex flex-col gap-1 mt-1.5">
                                                <input type="date" value={editingBooking.booking_date.split('T')[0]} onChange={(e) => setEditingBooking({...editingBooking, booking_date: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-xs cursor-pointer" />
                                                <div className="flex gap-1 w-32">
                                                    <input type="time" value={editingBooking.start_time.substring(0,5)} onChange={(e) => setEditingBooking({...editingBooking, start_time: e.target.value})} className="bg-dark-input text-white px-1 py-1 rounded-lg border border-white/10 outline-none w-1/2 text-[10px] cursor-pointer" />
                                                    <input type="time" value={editingBooking.end_time.substring(0,5)} onChange={(e) => setEditingBooking({...editingBooking, end_time: e.target.value})} className="bg-dark-input text-white px-1 py-1 rounded-lg border border-white/10 outline-none w-1/2 text-[10px] cursor-pointer" />
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <select value={editingBooking.status} onChange={(e) => setEditingBooking({...editingBooking, status: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-sm appearance-none cursor-pointer">
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="py-2 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-1.5 h-full mt-5">
                                                    <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingBooking(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 pl-2 text-white font-bold capitalize">
                                                {bk.facility_name.replace('_', ' ')}
                                            </td>
                                            <td className="py-4 text-gray-300 font-medium">{bk.resident_name}</td>
                                            <td className="py-4">
                                                <div className="text-white text-sm font-semibold">{new Date(bk.booking_date).toLocaleDateString()}</div>
                                                <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-1 font-bold">
                                                    <Clock className="w-3 h-3" /> {bk.start_time.substring(0,5)} - {bk.end_time.substring(0,5)}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-[6px] text-[10px] font-extrabold uppercase tracking-widest border ${
                                                    bk.status === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        bk.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                            bk.status === 'rejected' ? 'bg-red-600/10 text-red-500 border-red-600/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                    {bk.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {bk.status === 'pending' && (
                                                        <div className="flex items-center gap-1 animate-in zoom-in duration-300">
                                                            <button onClick={() => handleStatusUpdate(bk.id, 'confirmed')} className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary hover:text-black transition-all" title="Approve">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleStatusUpdate(bk.id, 'rejected')} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" title="Reject">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {bk.status === 'confirmed' && (
                                                        <button onClick={() => handleCancel(bk.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1" title="Cancel Booking">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                        <button onClick={() => setEditingBooking(bk)} className="text-gray-500 hover:text-primary transition-colors p-1" title="Edit booking">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(bk.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1" title="Delete completely">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Calendar className="w-12 h-12 mb-3 opacity-10" />
                                            <p className="text-lg font-bold">No reservations found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Maintenance & Blackout Dates Section */}
            <div className="grid lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-700">
                <div className="lg:col-span-1 bg-red-500/5 border border-red-500/20 p-6 rounded-3xl h-fit shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5" /> Block Time Slot
                    </h3>
                    <form onSubmit={handleBlackoutSubmit} className="space-y-4 relative z-10">
                        <div>
                            <label className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1 block">Facility to Block</label>
                            <select required value={blackoutForm.facility_name} onChange={(e) => setBlackoutForm({ ...blackoutForm, facility_name: e.target.value })}
                                    className="w-full bg-[#050505] text-[#EAEAEA] px-4 py-3 rounded-xl border border-red-500/20 outline-none appearance-none cursor-pointer focus:border-red-500/50">
                                <option value="gym">Gymnasium</option>
                                <option value="pool">Swimming Pool</option>
                                <option value="party_hall">Party Hall</option>
                                <option value="bbq_area">BBQ Area</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1 block">Date</label>
                            <input type="date" required value={blackoutForm.blackout_date} onChange={(e) => setBlackoutForm({ ...blackoutForm, blackout_date: e.target.value })}
                                   className="w-full bg-[#050505] text-[#EAEAEA] px-4 py-3 rounded-xl border border-red-500/20 outline-none cursor-pointer focus:border-red-500/50" />
                        </div>
                        {/* 🌟 UPDATE: Added Start and End Time inputs for Maintenance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1 block">Start Time</label>
                                <input type="time" required value={blackoutForm.start_time} onChange={(e) => setBlackoutForm({ ...blackoutForm, start_time: e.target.value })}
                                       className="w-full bg-[#050505] text-[#EAEAEA] px-4 py-3 rounded-xl border border-red-500/20 outline-none cursor-pointer focus:border-red-500/50 text-sm" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1 block">End Time</label>
                                <input type="time" required value={blackoutForm.end_time} onChange={(e) => setBlackoutForm({ ...blackoutForm, end_time: e.target.value })}
                                       className="w-full bg-[#050505] text-[#EAEAEA] px-4 py-3 rounded-xl border border-red-500/20 outline-none cursor-pointer focus:border-red-500/50 text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1 block">Reason</label>
                            <input type="text" required placeholder="e.g. Deep Cleaning" value={blackoutForm.reason} onChange={(e) => setBlackoutForm({ ...blackoutForm, reason: e.target.value })}
                                   className="w-full bg-[#050505] text-[#EAEAEA] px-4 py-3 rounded-xl border border-red-500/20 outline-none focus:border-red-500/50" />
                        </div>
                        <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-500/30">
                            <ShieldAlert className="w-4 h-4" /> Block Time Slot
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                        Active Maintenance Blocks <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded font-bold uppercase tracking-widest leading-none">Maintenance</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                <th className="pb-4 pl-2">Facility</th>
                                <th className="pb-4">Date & Time</th>
                                <th className="pb-4">Reason</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {blackoutDates.map((bo) => (
                                <tr key={bo.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-2 text-white font-bold capitalize">{bo.facility_name.replace('_', ' ')}</td>
                                    {/* 🌟 UPDATE: Displaying start_time and end_time for Maintenance */}
                                    <td className="py-4">
                                        <div className="text-orange-400 font-semibold">{new Date(bo.blackout_date).toLocaleDateString()}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {bo.start_time?.substring(0,5)} - {bo.end_time?.substring(0,5)}
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-400 text-sm italic">{bo.reason}</td>
                                    <td className="py-4 pr-4 text-right">
                                        <button onClick={() => handleDeleteBlackout(bo.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100" title="Remove Block">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {blackoutDates.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">
                                        <p className="text-sm font-semibold tracking-wide">No active time blocks.</p>
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

export default ManageBookings;