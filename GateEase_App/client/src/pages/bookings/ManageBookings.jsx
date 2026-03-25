import React, { useState, useEffect } from 'react';
import axios from 'axios';
// අලුතින් Edit2, Trash2, Check, X අයිකන් ටික Import කළා
import { Calendar, Plus, Clock, MapPin, XCircle, Edit2, Trash2, Check, X } from 'lucide-react';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({
        resident_id: '', facility_name: 'gym', booking_date: '', start_time: '', end_time: ''
    });

    // Edit කරන්න තෝරගත්ත Booking එකේ විස්තර තියාගන්න State එක
    const [editingBooking, setEditingBooking] = useState(null);

    const fetchData = async () => {
        try {
            const resBookings = await axios.get('http://localhost:5000/api/bookings');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            setBookings(resBookings.data);
            setResidents(resResidents.data);
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
            await axios.post('http://localhost:5000/api/bookings', formData);
            alert('✅ Booking Confirmed!');
            setFormData({ ...formData, booking_date: '', start_time: '', end_time: '' });
            fetchData();
        } catch (error) {
            alert(`❌ ${error.response?.data?.message || 'Failed to book.'}`);
        }
    };

    // Booking එකක් Cancel කිරීම
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

    // Booking එකක් Delete කිරීම (සම්පූර්ණයෙන්ම මකලා දාන්න)
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

    // Booking එක Edit කරලා Save කිරීම
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/bookings/${editingBooking.id}`, {
                facility_name: editingBooking.facility_name,
                booking_date: editingBooking.booking_date,
                start_time: editingBooking.start_time,
                end_time: editingBooking.end_time,
                status: editingBooking.status
            });
            setEditingBooking(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchData();
            alert('✅ Reservation updated successfully!');
        } catch (error) {
            alert('❌ Failed to update reservation');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary w-6 h-6" />
                Facility Bookings
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Booking Form (කිසිම වෙනසක් නෑ) */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">New Reservation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Resident</label>
                            <select required value={formData.resident_id} onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Facility</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <select value={formData.facility_name} onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                        className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                    <option value="gym">Gymnasium</option>
                                    <option value="party_hall">Party Hall</option>
                                    <option value="pool">Swimming Pool</option>
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Date</label>
                            <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="date" required value={formData.booking_date}
                                   onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Start Time</label>
                                <input type="time" required value={formData.start_time}
                                       onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer text-sm" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">End Time</label>
                                <input type="time" required value={formData.end_time}
                                       onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer text-sm" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02]">
                            <Plus className="w-5 h-5" /> Confirm Booking
                        </button>
                    </form>
                </div>

                {/* Bookings List */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Upcoming Reservations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-2">Facility</th>
                                <th className="pb-3">Resident</th>
                                <th className="pb-3">Date & Time</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 pr-4 text-right">Action</th> {/* Action Column එක Right Align කළා */}
                            </tr>
                            </thead>
                            <tbody>
                            {bookings.map((bk) => (
                                <tr key={bk.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {/* Edit Mode එක */}
                                    {editingBooking && editingBooking.id === bk.id ? (
                                        <>
                                            <td className="py-2 pl-2">
                                                <select value={editingBooking.facility_name} onChange={(e) => setEditingBooking({...editingBooking, facility_name: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-28 text-sm appearance-none cursor-pointer">
                                                    <option value="gym">Gymnasium</option>
                                                    <option value="party_hall">Party Hall</option>
                                                    <option value="pool">Swimming Pool</option>
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
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
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
                                        // Normal View (සාමාන්‍ය වෙලාවට)
                                        <>
                                            <td className="py-4 pl-2 text-white font-medium capitalize">
                                                {bk.facility_name.replace('_', ' ')}
                                            </td>
                                            <td className="py-4 text-gray-300">{bk.resident_name}</td>
                                            <td className="py-4">
                                                <div className="text-white text-sm">{new Date(bk.booking_date).toLocaleDateString()}</div>
                                                <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" /> {bk.start_time.substring(0,5)} - {bk.end_time.substring(0,5)}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                                    bk.status === 'confirmed' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {bk.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-3">

                                                    {/* පරණ Cancel අයිකන් එක (Confirmed ඒවට විතරයි) */}
                                                    {bk.status === 'confirmed' ? (
                                                        <button onClick={() => handleCancel(bk.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Cancel Booking">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <span className="w-[28px]"></span> // ඉඩ තියාගන්න
                                                    )}

                                                    {/* Hover කරාම පේන Action Buttons (Edit & Delete) */}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingBooking(bk)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit booking">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(bk.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete completely">
                                                            <Trash2 className="w-4 h-4" />
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
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No upcoming bookings.</td>
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