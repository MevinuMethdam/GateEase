import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserPlus, User, Car, Edit2, Trash2, Check, X } from 'lucide-react';

const ManageVisitors = () => {
    const [visitors, setVisitors] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({
        resident_id: '', visitor_name: '', vehicle_number: ''
    });

    // Edit කරන්න තෝරගත්ත Visitor ගේ විස්තර තියාගන්න State එක
    const [editingVisitor, setEditingVisitor] = useState(null);

    const fetchData = async () => {
        try {
            const resVisitors = await axios.get('http://localhost:5000/api/visitors');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            setVisitors(resVisitors.data);
            setResidents(resResidents.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        // Security ලට ලේසි වෙන්න තත්පර 10න් 10ට Auto Refresh වෙනවා
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // අලුත් අමුත්තෙක් ඇතුළත් කිරීම
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/visitors', formData);
            alert('✅ Visitor logged successfully! Pending resident approval.');
            setFormData({ resident_id: '', visitor_name: '', vehicle_number: '' });
            fetchData();
        } catch (error) {
            alert('❌ Failed to log visitor.');
        }
    };

    // වාර්තාවක් Delete කිරීම
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gate log?')) {
            try {
                await axios.delete(`http://localhost:5000/api/visitors/${id}`);
                fetchData();
                alert('✅ Gate log deleted successfully!');
            } catch (error) {
                alert('❌ Failed to delete gate log');
            }
        }
    };

    // වාර්තාවක් Edit කරලා Save කිරීම
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/visitors/${editingVisitor.id}`, {
                visitor_name: editingVisitor.visitor_name,
                vehicle_number: editingVisitor.vehicle_number,
                approval_status: editingVisitor.approval_status
            });
            setEditingVisitor(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchData();
            alert('✅ Gate log updated successfully!');
        } catch (error) {
            alert('❌ Failed to update gate log');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="text-primary w-6 h-6" />
                Gate Security & Visitors
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Log New Visitor Form */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Log New Visitor</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Visitor Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input type="text" required placeholder="e.g. Nimal Perera" value={formData.visitor_name}
                                       onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                                       className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Vehicle Number (Optional)</label>
                            <div className="relative">
                                <Car className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input type="text" placeholder="e.g. CBA-1234" value={formData.vehicle_number}
                                       onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                       className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Visiting Whom?</label>
                            <select required value={formData.resident_id} onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,255,4,0.2)]">
                            <UserPlus className="w-5 h-5" /> Request Entry
                        </button>
                    </form>
                </div>

                {/* Today's Gate Log Table */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Today's Gate Log</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Visitor Details</th>
                                <th className="pb-4">Visiting</th>
                                <th className="pb-4">Time</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 pr-4 text-right">Resident Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visitors.map((vis) => (
                                <tr key={vis.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {/* Edit Mode එක */}
                                    {editingVisitor && editingVisitor.id === vis.id ? (
                                        <>
                                            <td className="py-2 pl-2 flex flex-col gap-1 mt-1.5">
                                                <input type="text" value={editingVisitor.visitor_name} onChange={(e) => setEditingVisitor({...editingVisitor, visitor_name: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-sm" placeholder="Name" />
                                                <input type="text" value={editingVisitor.vehicle_number} onChange={(e) => setEditingVisitor({...editingVisitor, vehicle_number: e.target.value})} className="bg-dark-input text-gray-400 px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-xs" placeholder="Vehicle No" />
                                            </td>
                                            <td className="py-2 text-gray-400 text-sm">{vis.resident_name || 'N/A'}</td>
                                            <td className="py-2 text-gray-500 text-xs">{new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-2">
                                                <select value={editingVisitor.approval_status} onChange={(e) => setEditingVisitor({...editingVisitor, approval_status: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-xs appearance-none cursor-pointer">
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="py-2 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-1.5 h-full mt-4">
                                                    <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingVisitor(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // Normal View (සාමාන්‍ය වෙලාවට)
                                        <>
                                            <td className="py-4 pl-2">
                                                <p className="font-bold text-white">{vis.visitor_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{vis.vehicle_number || 'Walk-in'}</p>
                                            </td>
                                            <td className="py-4 text-gray-300 text-sm">{vis.resident_name || 'N/A'}</td>
                                            <td className="py-4 text-gray-400 text-sm">
                                                {new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    vis.approval_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        vis.approval_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                    {vis.approval_status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-3">

                                                    {/* Action Taken text */}
                                                    <span className="text-gray-500 text-xs italic">
                                                        {vis.approval_status === 'pending' ? 'Waiting...' : 'Action taken'}
                                                    </span>

                                                    {/* Hover කරාම පේන Action Buttons (Edit & Delete) */}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingVisitor(vis)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit gate log">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(vis.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete log">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {visitors.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                                        No visitors logged today.
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

export default ManageVisitors;