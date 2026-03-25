import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, XCircle, Clock, User, Car } from 'lucide-react';

const GateApprovals = () => {
    const [visitors, setVisitors] = useState([]);

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

    const fetchVisitors = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/visitors/resident/${userId}`);
            setVisitors(response.data);
        } catch (error) {
            console.error('Error fetching visitors:', error);
        }
    };

    useEffect(() => {
        fetchVisitors();
        // තත්පර 5න් 5ට අලුත් අමුත්තන් ඇවිත්ද කියලා බලනවා (Real-time Feel)
        const interval = setInterval(fetchVisitors, 5000);
        return () => clearInterval(interval);
    }, []);

    // අමුත්තාව Approve හෝ Reject කිරීම
    const handleAction = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/visitors/${id}/status`, { status });
            fetchVisitors(); // List එක Refresh කරනවා
        } catch (error) {
            alert('❌ Failed to update status.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldAlert className="text-primary w-6 h-6" />
                Gate Entry Approvals
            </h2>

            <div className="bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="pb-4 pl-4">Visitor Info</th>
                            <th className="pb-4">Vehicle No</th>
                            <th className="pb-4">Arrival Time</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 pr-4 text-right">Your Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {visitors.map((vis) => (
                            <tr key={vis.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <td className="py-5 pl-4 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        vis.approval_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' : 'bg-gray-500/10 text-gray-400'
                                    }`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-base">{vis.visitor_name}</p>
                                        <p className="text-sm text-gray-500">Guest / Delivery</p>
                                    </div>
                                </td>

                                <td className="py-5">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Car className="w-4 h-4 text-gray-500" />
                                        {vis.vehicle_number || 'Walk-in'}
                                    </div>
                                </td>

                                <td className="py-5">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        {new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>

                                <td className="py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold w-fit flex items-center gap-1.5 ${
                        vis.approval_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            vis.approval_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {vis.approval_status.toUpperCase()}
                    </span>
                                </td>

                                <td className="py-5 pr-4 text-right">
                                    {vis.approval_status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleAction(vis.id, 'approved')}
                                                className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                                title="Allow Entry"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(vis.id, 'rejected')}
                                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                                title="Deny Entry"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm font-medium italic">Action Recorded</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {visitors.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-lg">No visitors today.</p>
                                        <p className="text-sm">Gate logs for your unit will appear here.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GateApprovals;