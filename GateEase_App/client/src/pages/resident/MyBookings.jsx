import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        facility_name: 'gym', booking_date: '', start_time: '', end_time: ''
    });

    // Token එකෙන් User ID එක ගන්නවා
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

    // අලුත් Booking එකක් දාන්න
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = getUserId();

        try {
            await axios.post('http://localhost:5000/api/bookings', {
                ...formData,
                resident_id: userId
            });
            alert('✅ Facility Booked Successfully!');
            setFormData({ facility_name: 'gym', booking_date: '', start_time: '', end_time: '' });
            fetchBookings();
        } catch (error) {
            // අපි Backend එකේ ලියපු "Already booked" error එක මෙතනින් පෙන්වනවා
            alert(`❌ ${error.response?.data?.message || 'Failed to book facility.'}`);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-primary w-6 h-6" />
                Reserve Facilities
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Reservation Form */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-3xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">New Reservation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Select Facility</label>
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
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">End Time</label>
                                <input type="time" required value={formData.end_time}
                                       onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                       className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(192,222,24,0.2)]">
                            <Plus className="w-5 h-5" /> Confirm Booking
                        </button>
                    </form>
                </div>

                {/* My Bookings Table */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">My Upcoming Reservations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Facility</th>
                                <th className="pb-4">Date & Time</th>
                                <th className="pb-4">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bookings.map((bk) => (
                                <tr key={bk.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-2">
                                        <p className="text-white font-medium capitalize">{bk.facility_name.replace('_', ' ')}</p>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-white text-sm font-medium">{new Date(bk.booking_date).toLocaleDateString()}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <Clock className="w-3.5 h-3.5" /> {bk.start_time.substring(0,5)} - {bk.end_time.substring(0,5)}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
                                            bk.status === 'confirmed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {bk.status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {bk.status.toUpperCase()}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="text-lg">No upcoming reservations.</p>
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