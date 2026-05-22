import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, XCircle, Clock, User, Car, QrCode, X, Calendar, Share2, AlertTriangle } from 'lucide-react';

const GateApprovals = () => {

    const [visitors, setVisitors] = useState([]);
    // 🌟 අලුත් State එක: User Status
    const [userStatus, setUserStatus] = useState('active');

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const fetchUserStatus = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const response = await axios.get('http://localhost:5000/api/users/residents');
            const me = response.data.find(u => u.id === parseInt(userId) || u.id === userId);
            if (me) setUserStatus(me.status);
        } catch (error) { console.error('Error fetching status:', error); }
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
        fetchUserStatus();
        fetchVisitors();
        const interval = setInterval(() => {
            fetchUserStatus();
            fetchVisitors();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, status) => {
        if (userStatus === 'inactive') return alert("Account deactivated. Action not allowed.");
        try {
            await axios.put(`http://localhost:5000/api/visitors/${id}/status`, { status });
            fetchVisitors();
        } catch (error) {
            alert('❌ Failed to update status.');
        }
    };

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrFormData, setQrFormData] = useState({ visitor_name: '', visit_date: '' });
    const [generatedToken, setGeneratedToken] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateQR = async (e) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) return alert("User ID not found");

        if (userStatus === 'inactive') return alert("Account deactivated. Cannot generate passes.");

        setIsGenerating(true);
        try {
            const res = await axios.post('http://localhost:5000/api/visitors/passes/create', {
                resident_id: userId,
                visitor_name: qrFormData.visitor_name,
                visit_date: qrFormData.visit_date
            });
            setGeneratedToken(res.data.pass_token);
        } catch (error) {
            console.error(error);
            alert('❌ Failed to generate VIP Pass.');
        } finally {
            setIsGenerating(false);
        }
    };

    const closeQrModal = () => {
        setIsQrModalOpen(false);
        setGeneratedToken(null);
        setQrFormData({ visitor_name: '', visit_date: '' });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="text-primary w-6 h-6" />
                    Gate Entry Approvals
                </h2>

                {userStatus === 'inactive' ? (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 w-fit cursor-not-allowed">
                        <XCircle className="w-5 h-5" /> Account Deactivated
                    </div>
                ) : (
                    <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(192,222,24,0.3)] w-fit"
                    >
                        <QrCode className="w-5 h-5" /> Generate VIP Pass
                    </button>
                )}
            </div>

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
                                                disabled={userStatus === 'inactive'}
                                                className={`p-2.5 rounded-xl transition-all ${userStatus === 'inactive' ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed' : 'bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]'}`}
                                                title="Allow Entry"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(vis.id, 'rejected')}
                                                disabled={userStatus === 'inactive'}
                                                className={`p-2.5 rounded-xl transition-all ${userStatus === 'inactive' ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
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

            {isQrModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                    <div className="bg-[#111111] border border-white/[0.08] p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-2xl relative">
                        <button onClick={closeQrModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                            <X className="w-5 h-5" />
                        </button>

                        {!generatedToken ? (
                            <>
                                <h3 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#C0DE1B]/10 rounded-xl flex items-center justify-center">
                                        <QrCode className="w-5 h-5 text-[#C0DE1B]"/>
                                    </div>
                                    Create VIP Pass
                                </h3>
                                <p className="text-gray-400 text-sm mb-8">Generate a secure QR code for your guest to skip the queue at the main gate.</p>

                                <form onSubmit={handleGenerateQR} className="space-y-5">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Visitor Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Kasun Perera"
                                                value={qrFormData.visitor_name}
                                                onChange={(e) => setQrFormData({...qrFormData, visitor_name: e.target.value})}
                                                className="w-full bg-[#050505] text-white pl-12 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date of Visit</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={qrFormData.visit_date}
                                                onChange={(e) => setQrFormData({...qrFormData, visit_date: e.target.value})}
                                                className="w-full bg-[#050505] text-white pl-12 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none transition-all font-medium cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="w-full bg-[#C0DE1B] hover:bg-[#9EBA11] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(192,222,24,0.2)] mt-4 disabled:opacity-50"
                                    >
                                        {isGenerating ? 'Generating Secure Token...' : 'Generate QR Code'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center animate-in zoom-in-95 duration-300">
                                <h3 className="text-xl font-extrabold text-[#C0DE1B] mb-2 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-6 h-6" /> Pass Generated!
                                </h3>
                                <p className="text-gray-400 text-sm mb-6">Screenshot and share this QR code with your visitor.</p>

                                <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(192,222,24,0.15)] border-4 border-[#C0DE1B]/20">

                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedToken}`}
                                        alt="Gate Pass QR"
                                        className="w-[200px] h-[200px]"
                                    />
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 mb-8 flex items-center justify-between">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Entry Token</span>
                                    <span className="text-white font-mono font-bold tracking-widest">{generatedToken}</span>
                                </div>

                                <button onClick={closeQrModal} className="w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default GateApprovals;