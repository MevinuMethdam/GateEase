import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Plus, AlertCircle, MessageSquare, Edit2, Trash2, Check, X, BarChart3, Star, Activity, CheckCircle2, Users, Send, Camera, Image as ImageIcon, User, Shield } from 'lucide-react';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({ resident_id: '', title: '', description: '', priority: 'low' });
    const [editingComplaint, setEditingComplaint] = useState(null);

    const [analytics, setAnalytics] = useState(null);

    const [formErrors, setFormErrors] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaintForModal, setSelectedComplaintForModal] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [photoName, setPhotoName] = useState('');

    const staffOptions = ['Unassigned', 'Kamal (Plumber)', 'Nimal (Electrician)', 'Sunil (HVAC)', 'Ajith (General)'];

    const fetchData = async () => {
        try {
            const resComplaints = await axios.get('http://localhost:5000/api/complaints');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            const resAnalytics = await axios.get('http://localhost:5000/api/complaints/admin/analytics');

            setComplaints(resComplaints.data);
            setResidents(resResidents.data);
            setAnalytics(resAnalytics.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.resident_id) {
            errors.resident_id = "Please select a resident.";
        }

        if (!formData.title.trim() || formData.title.trim().length < 5) {
            errors.title = "Issue title must be at least 5 characters long.";
        }

        if (!formData.description.trim() || formData.description.trim().length < 10) {
            errors.description = "Please provide a clear description (min 10 characters).";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await axios.post('http://localhost:5000/api/complaints', formData);
            alert('✅ Complaint logged successfully!');

            setFormData({ resident_id: '', title: '', description: '', priority: 'low' });
            setFormErrors({});
            fetchData();
        } catch (error) {
            alert('❌ Failed to log complaint.');
        }
    };

    const handleStatusChange = async (id, newStatus, currentStaff) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status: newStatus, assigned_staff: currentStaff });
            fetchData();

            if (selectedComplaintForModal && selectedComplaintForModal.id === id) {
                setSelectedComplaintForModal(prev => ({...prev, status: newStatus}));
            }
        } catch (error) {
            alert('❌ Failed to update status.');
        }
    };

    const handleStaffChange = async (id, currentStatus, newStaff) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status: currentStatus, assigned_staff: newStaff });
            fetchData();
        } catch (error) {
            alert('❌ Failed to assign staff.');
        }
    };

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

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${editingComplaint.id}`, {
                title: editingComplaint.title,
                description: editingComplaint.description,
                priority: editingComplaint.priority
            });
            setEditingComplaint(null);
            fetchData();
            alert('✅ Ticket updated successfully!');
        } catch (error) {
            alert('❌ Failed to update ticket');
        }
    };

    const openComplaintModal = async (comp) => {

        if (editingComplaint && editingComplaint.id === comp.id) return;

        setSelectedComplaintForModal(comp);
        setNewMessage('');
        removePhoto();
        setIsModalOpen(true);

        try {
            const res = await axios.get(`http://localhost:5000/api/complaints/${comp.id}/updates`);
            setUpdates(res.data);
        } catch (error) {
            console.error("Error fetching updates:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedComplaintForModal(null);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setPhotoName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPhotoUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhotoName('');
        setNewPhotoUrl('');
    };

    const handleSendUpdate = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !newPhotoUrl) return;

        try {
            await axios.post(`http://localhost:5000/api/complaints/${selectedComplaintForModal.id}/updates`, {
                sender_role: 'admin', // Or 'maintenance' depending on who is logged in
                message: newMessage,
                image_url: newPhotoUrl
            });
            setNewMessage('');
            removePhoto();
            const res = await axios.get(`http://localhost:5000/api/complaints/${selectedComplaintForModal.id}/updates`);
            setUpdates(res.data);
        } catch (error) {
            alert("❌ Failed to send message.");
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-primary text-primary' : 'text-gray-600'}`} />
                ))}
                <span className="text-white font-bold ml-2 text-sm">{Number(rating).toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="text-primary w-6 h-6" />
                Maintenance & Complaints
            </h2>

            {analytics && (
                <div className="mb-8 space-y-6 animate-in fade-in duration-500">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                        <BarChart3 className="w-5 h-5 text-primary" /> Repair Resolution Stats
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-dark-card border border-white/5 p-5 rounded-2xl shadow-lg flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Activity className="w-6 h-6 text-blue-400" /></div>
                            <div><p className="text-gray-400 text-sm">Total Tickets</p><p className="text-2xl font-bold text-white">{analytics.total}</p></div>
                        </div>
                        <div className="bg-dark-card border border-white/5 p-5 rounded-2xl shadow-lg flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20"><CheckCircle2 className="w-6 h-6 text-green-400" /></div>
                            <div><p className="text-gray-400 text-sm">Resolved Tickets</p><p className="text-2xl font-bold text-white">{analytics.resolved}</p></div>
                        </div>
                        <div className="bg-dark-card border border-white/5 p-5 rounded-2xl shadow-lg flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20"><Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /></div>
                            <div><p className="text-gray-400 text-sm">Avg. Service Rating</p><p className="text-2xl font-bold text-white">{analytics.averageRating} / 5.0</p></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-dark-card border border-white/5 p-6 rounded-2xl shadow-lg">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary"/> Staff Performance</h4>
                            {analytics.staffPerformance && analytics.staffPerformance.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.staffPerformance.map((staff, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300">{staff.assigned_staff} <span className="text-xs text-gray-500">({staff.completed_jobs} jobs)</span></span>
                                                {renderStars(staff.avg_rating)}
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(staff.avg_rating / 5) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500 italic">No rated jobs yet.</p>}
                        </div>

                        <div className="bg-dark-card border border-white/5 p-6 rounded-2xl shadow-lg">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary"/> Rating by Category</h4>
                            {analytics.categoryRatings && analytics.categoryRatings.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.categoryRatings.map((cat, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300 capitalize">{cat.category} Priority <span className="text-xs text-gray-500">({cat.total_issues} issues)</span></span>
                                                {renderStars(cat.avg_rating)}
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${(cat.avg_rating / 5) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500 italic">No category ratings yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Lodge a Complaint</h3>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Resident (Who is reporting?)</label>
                            <select
                                value={formData.resident_id}
                                onChange={(e) => { setFormData({ ...formData, resident_id: e.target.value }); setFormErrors({...formErrors, resident_id: null}); }}
                                className={`w-full bg-dark-input text-white px-4 py-3 rounded-xl border outline-none appearance-none cursor-pointer transition-colors ${formErrors.resident_id ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}>
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            {formErrors.resident_id && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {formErrors.resident_id}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <AlertCircle className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${formErrors.title ? 'text-red-500' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Issue Title (e.g. Water Leak)"
                                    value={formData.title}
                                    onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setFormErrors({...formErrors, title: null}); }}
                                    className={`w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-colors ${formErrors.title ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`} />
                            </div>
                            {formErrors.title && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {formErrors.title}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <MessageSquare className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${formErrors.description ? 'text-red-500' : 'text-gray-500'}`} />
                                <textarea
                                    placeholder="Describe the issue..."
                                    value={formData.description}
                                    onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setFormErrors({...formErrors, description: null}); }}
                                    rows="3"
                                    className={`w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border outline-none resize-none transition-colors ${formErrors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`} />
                            </div>
                            {formErrors.description && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {formErrors.description}</p>}
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

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Active Tickets</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Issue</th>
                                <th className="pb-4">Resident</th>
                                <th className="pb-4">Priority</th>
                                <th className="pb-4">Status & Assignment</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complaints.map((comp) => (
                                <tr key={comp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
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
                                                <span className="text-gray-500 text-xs">Edit disabled</span>
                                            </td>
                                            <td className="py-2 pr-4 text-right flex justify-end gap-1.5 items-center h-full mt-3">
                                                <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingComplaint(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 pl-2 cursor-pointer" onClick={() => openComplaintModal(comp)}>
                                                <p className="font-medium text-white group-hover:text-primary transition-colors">{comp.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{comp.description}</p>
                                            </td>
                                            <td className="py-4 text-gray-300 text-sm cursor-pointer" onClick={() => openComplaintModal(comp)}>{comp.resident_name || 'N/A'}</td>
                                            <td className="py-4 cursor-pointer" onClick={() => openComplaintModal(comp)}>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    comp.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        comp.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {comp.priority}
                                                </span>
                                            </td>

                                            <td className="py-4 flex flex-col gap-1.5">
                                                <select
                                                    value={comp.status}
                                                    onChange={(e) => handleStatusChange(comp.id, e.target.value, comp.assigned_staff)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer border uppercase tracking-wider ${
                                                        comp.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            comp.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}
                                                >
                                                    <option value="open" className="bg-dark-bg text-white">OPEN</option>
                                                    <option value="in_progress" className="bg-dark-bg text-white">IN PROGRESS</option>
                                                    <option value="resolved" className="bg-dark-bg text-white">RESOLVED</option>
                                                </select>

                                                <select
                                                    value={comp.assigned_staff || 'Unassigned'}
                                                    onChange={(e) => handleStaffChange(comp.id, comp.status, e.target.value)}
                                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 text-[10px] outline-none cursor-pointer w-full max-w-[120px]"
                                                >
                                                    {staffOptions.map(staff => <option key={staff} value={staff} className="bg-dark-bg text-white">{staff}</option>)}
                                                </select>
                                            </td>

                                            <td className="py-4 pr-4 text-right">
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

            {isModalOpen && selectedComplaintForModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[32px] w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative h-[85vh] flex flex-col overflow-hidden">

                        <div className="p-6 md:p-8 border-b border-white/[0.05] bg-[#111111]/50 flex justify-between items-start shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-extrabold text-white tracking-tight">{selectedComplaintForModal.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-[6px] text-[9px] uppercase font-bold tracking-wider border shadow-inner ${
                                        selectedComplaintForModal.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            selectedComplaintForModal.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                        {selectedComplaintForModal.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-[#A0A0A0] font-medium leading-relaxed">{selectedComplaintForModal.description}</p>
                                <p className="text-xs text-[#666666] mt-2">Reported by: <span className="text-white">{selectedComplaintForModal.resident_name || 'Resident'}</span></p>
                            </div>
                            <button onClick={closeModal} className="text-[#666666] hover:text-white transition-colors bg-[#111111] p-2 rounded-full border border-white/[0.05]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-[#050505]">
                            {updates.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <MessageSquare className="w-12 h-12 text-[#666666] mb-3" />
                                    <p className="text-[#A0A0A0] font-medium">No discussion history yet.</p>
                                    <p className="text-[#666666] text-xs mt-1">Send a message to the resident.</p>
                                </div>
                            ) : (
                                updates.map(update => (
                                    <div key={update.id} className={`flex flex-col w-full ${update.sender_role === 'admin' || update.sender_role === 'maintenance' ? 'items-end' : 'items-start'}`}>

                                        <div className="flex items-center gap-2 mb-1.5">
                                            {update.sender_role === 'resident' && <User className="w-3 h-3 text-[#555555]" />}
                                            <span className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">
                                                {update.sender_role} • {new Date(update.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            {(update.sender_role === 'admin' || update.sender_role === 'maintenance') && <Shield className="w-3 h-3 text-[#555555]" />}
                                        </div>

                                        <div className={`relative max-w-[85%] md:max-w-[70%] p-4 rounded-[20px] shadow-lg ${
                                            update.sender_role === 'admin' || update.sender_role === 'maintenance'
                                                ? 'bg-gradient-to-br from-[#C0DE1B]/20 to-[#C0DE1B]/5 border border-[#C0DE1B]/30 text-white rounded-tr-sm'
                                                : 'bg-[#111111] border border-white/[0.05] text-[#EAEAEA] rounded-tl-sm'
                                        }`}>
                                            {update.message && <p className="text-[14px] leading-relaxed font-medium">{update.message}</p>}
                                            {update.image_url && (
                                                <div className="mt-3 relative group rounded-[12px] overflow-hidden border border-white/10">
                                                    <a href={update.image_url} target="_blank" rel="noreferrer">
                                                        <img src={update.image_url} alt="Update attachment" className="w-full max-h-[200px] object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">Click to Enlarge</span>
                                                        </div>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-[#111111]/80 border-t border-white/[0.05] backdrop-blur-md shrink-0">
                            {selectedComplaintForModal.status !== 'resolved' ? (
                                <form onSubmit={handleSendUpdate} className="flex flex-col gap-3">
                                    {photoName && (
                                        <div className="flex items-center justify-between bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 p-2 px-4 rounded-[12px] w-fit shadow-inner">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-[#C0DE1B]" />
                                                <span className="text-xs text-[#EAEAEA] font-medium">{photoName}</span>
                                            </div>
                                            <button type="button" onClick={removePhoto} className="text-[#848484] hover:text-red-500 ml-3 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}
                                    <div className="flex gap-3 items-center">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="Send an update to the resident..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="w-full bg-[#050505] text-white pl-5 pr-12 py-4 rounded-[16px] border border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50 outline-none text-sm shadow-inner font-medium placeholder:text-[#555555]"
                                            />
                                            <label className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#848484] hover:text-[#C0DE1B] hover:bg-[#C0DE1B]/10 rounded-[10px] cursor-pointer transition-all">
                                                <Camera className="w-5 h-5" />
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                            </label>
                                        </div>
                                        <button type="submit" disabled={!newMessage.trim() && !newPhotoUrl}
                                                className="bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] hover:shadow-[0_0_20px_rgba(192,222,24,0.3)] disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed text-black p-4 rounded-[16px] transition-all shrink-0">
                                            <Send className="w-5 h-5 ml-0.5" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-[#C0DE1B]/5 border border-[#C0DE1B]/20 p-4 rounded-[16px] text-center">
                                    <p className="text-[#C0DE1B] font-bold text-sm flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> This ticket has been resolved and closed for new comments.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintsList;