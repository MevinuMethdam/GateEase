import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Plus, User, AlertCircle, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({ resident_id: '', title: '', description: '', priority: 'low' });

    // Edit කරන්න තෝරගත්ත Complaint එකේ විස්තර තියාගන්න State එක
    const [editingComplaint, setEditingComplaint] = useState(null);

    const fetchData = async () => {
        try {
            const resComplaints = await axios.get('http://localhost:5000/api/complaints');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            setComplaints(resComplaints.data);
            setResidents(resResidents.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // අලුත් පැමිණිල්ලක් දාන්න
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/complaints', formData);
            alert('✅ Complaint logged successfully!');
            setFormData({ resident_id: '', title: '', description: '', priority: 'low' });
            fetchData();
        } catch (error) {
            alert('❌ Failed to log complaint.');
        }
    };

    // Status එක (Open/Resolved) වෙනස් කරන්න
    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status: newStatus });
            fetchData();
        } catch (error) {
            alert('❌ Failed to update status.');
        }
    };

    // පැමිණිල්ලක් Delete කිරීම
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                await axios.delete(`http://localhost:5000/api/complaints/${id}`);
                fetchData();
                alert('✅ Ticket deleted successfully!');
            } catch (error) {
                alert('❌ Failed to delete ticket');
            }
        }
    };

    // පැමිණිල්ල Edit කරලා Save කිරීම
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${editingComplaint.id}`, {
                title: editingComplaint.title,
                description: editingComplaint.description,
                priority: editingComplaint.priority
            });
            setEditingComplaint(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchData();
            alert('✅ Ticket updated successfully!');
        } catch (error) {
            alert('❌ Failed to update ticket');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="text-primary w-6 h-6" />
                Maintenance & Complaints
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Lodge Complaint Form */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Lodge a Complaint</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Resident (Who is reporting?)</label>
                            <select required value={formData.resident_id} onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <AlertCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input type="text" required placeholder="Issue Title (e.g. Water Leak)" value={formData.title}
                                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <textarea required placeholder="Describe the issue..." value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3"
                                      className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none resize-none" />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Priority Level</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                <option value="low">Low (Routine Check)</option>
                                <option value="medium">Medium (Needs Attention)</option>
                                <option value="high">High (Urgent/Emergency)</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,255,4,0.2)]">
                            <Plus className="w-5 h-5" /> Submit Issue
                        </button>
                    </form>
                </div>

                {/* Complaints List Table */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Active Tickets</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Issue</th>
                                <th className="pb-4">Resident</th>
                                <th className="pb-4">Priority</th>
                                <th className="pb-4">Update Status</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.map((comp) => (
                                <tr key={comp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {/* Edit Mode එක */}
                                    {editingComplaint && editingComplaint.id === comp.id ? (
                                        <>
                                            <td className="py-2 pl-2">
                                                <input type="text" value={editingComplaint.title} onChange={(e) => setEditingComplaint({...editingComplaint, title: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-full text-sm mb-1" placeholder="Title" />
                                                <input type="text" value={editingComplaint.description} onChange={(e) => setEditingComplaint({...editingComplaint, description: e.target.value})} className="bg-dark-input text-gray-400 px-2 py-1.5 rounded-lg border border-white/10 outline-none w-full text-xs" placeholder="Description" />
                                            </td>
                                            <td className="py-2 text-gray-400 text-sm">{comp.resident_name || 'N/A'}</td>
                                            <td className="py-2">
                                                <select value={editingComplaint.priority} onChange={(e) => setEditingComplaint({...editingComplaint, priority: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-sm appearance-none">
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </td>
                                            <td className="py-2">
                                                {/* Status එක මෙතනින් Edit කරන්නේ නෑ, ඒක සාමාන්‍ය විදියටම තියෙනවා */}
                                                <span className="text-gray-500 text-xs">Edit disabled</span>
                                            </td>
                                            <td className="py-2 pr-4 text-right flex justify-end gap-1.5 items-center h-full mt-3">
                                                <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingComplaint(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </td>
                                        </>
                                    ) : (
                                        // Normal View (සාමාන්‍ය වෙලාවට)
                                        <>
                                            <td className="py-4 pl-2">
                                                <p className="font-medium text-white">{comp.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{comp.description}</p>
                                            </td>
                                            <td className="py-4 text-gray-300 text-sm">{comp.resident_name || 'N/A'}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    comp.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        comp.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {comp.priority}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <select
                                                    value={comp.status}
                                                    onChange={(e) => handleStatusChange(comp.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium outline-none cursor-pointer border ${
                                                        comp.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            comp.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}
                                                >
                                                    <option value="open" className="bg-dark-bg text-white">Open</option>
                                                    <option value="in_progress" className="bg-dark-bg text-white">In Progress</option>
                                                    <option value="resolved" className="bg-dark-bg text-white">Resolved</option>
                                                </select>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                {/* Hover කරාම පේන Action Buttons (Edit & Delete) */}
                                                <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingComplaint(comp)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit ticket">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(comp.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete ticket">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                                        No active complaints.
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

export default ComplaintsList;