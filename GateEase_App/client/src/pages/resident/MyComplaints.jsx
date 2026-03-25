import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Plus, AlertCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'low' });

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

    const fetchComplaints = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/complaints/resident/${userId}`);
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // අලුත් පැමිණිල්ලක් දාන්න
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = getUserId();

        try {
            // Backend එකේ createComplaint එකට යවනවා (resident_id එකත් එක්කම)
            await axios.post('http://localhost:5000/api/complaints', {
                ...formData,
                resident_id: userId
            });
            alert('✅ Complaint Lodged Successfully! Admin will review it soon.');
            setFormData({ title: '', description: '', priority: 'low' }); // Form එක හිස් කරනවා
            fetchComplaints(); // List එක අලුත් කරනවා
        } catch (error) {
            alert('❌ Failed to lodge complaint.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="text-primary w-6 h-6" />
                My Maintenance Requests
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Report Issue Form */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-3xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Report an Issue</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Issue Title</label>
                            <AlertCircle className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="text" required placeholder="e.g. AC not working" value={formData.title}
                                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Description</label>
                            <MessageSquare className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <textarea required placeholder="Please provide details..." value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4"
                                      className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none resize-none" />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Priority Level</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer">
                                <option value="low">Low (Routine Check)</option>
                                <option value="medium">Medium (Needs Attention)</option>
                                <option value="high">High (Urgent/Emergency)</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(192,222,24,0.2)]">
                            <Plus className="w-5 h-5" /> Submit Request
                        </button>
                    </form>
                </div>

                {/* Complaints History Table */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">My Tickets</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Issue Details</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Priority</th>
                                <th className="pb-4">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.map((comp) => (
                                <tr key={comp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-2 max-w-[200px]">
                                        <p className="text-white font-medium truncate">{comp.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{comp.description}</p>
                                    </td>
                                    <td className="py-4 text-gray-400 text-sm">
                                        {new Date(comp.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                          comp.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              comp.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {comp.priority}
                      </span>
                                    </td>
                                    <td className="py-4">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
                                            comp.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                comp.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-green-500/10 text-green-400 border border-green-500/20'
                                        }`}>
                                            {comp.status === 'open' && <AlertCircle className="w-3.5 h-3.5" />}
                                            {comp.status === 'in_progress' && <Clock className="w-3.5 h-3.5" />}
                                            {comp.status === 'resolved' && <CheckCircle className="w-3.5 h-3.5" />}
                                            {comp.status.replace('_', ' ').toUpperCase()}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Wrench className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="text-lg">No active requests.</p>
                                            <p className="text-sm">Everything is working fine in your unit!</p>
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

export default MyComplaints;