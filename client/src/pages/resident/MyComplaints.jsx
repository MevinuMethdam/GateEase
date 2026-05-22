import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Plus, AlertCircle, MessageSquare, Clock, CheckCircle, Star, Send, Camera, X, Image as ImageIcon, Sparkles, Tag, XCircle } from 'lucide-react';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', category: 'General', priority: 'low' });

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updates, setUpdates] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [photoName, setPhotoName] = useState('');

    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [feedback, setFeedback] = useState('');

    const [isDetectingAI, setIsDetectingAI] = useState(false);
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
        fetchUserStatus();
        fetchComplaints();
        const interval = setInterval(() => {
            fetchUserStatus();
            fetchComplaints();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAutoDetectAI = async () => {
        if (!formData.description.trim()) {
            alert("Please describe the issue first so the AI can analyze it! 🤖");
            return;
        }

        setIsDetectingAI(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/analyze-complaint', {
                description: formData.description
            });

            const { category, urgency } = res.data;

            let mappedPriority = urgency ? urgency.toLowerCase() : 'low';
            if (!['low', 'medium', 'high', 'critical'].includes(mappedPriority)) {
                mappedPriority = 'low';
            }

            setFormData(prev => ({
                ...prev,
                category: category || 'General',
                priority: mappedPriority
            }));

        } catch (error) {
            console.error("AI Error:", error);
            alert("❌ Failed to analyze with AI. Please set manually.");
        } finally {
            setIsDetectingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userStatus === 'inactive') {
            return alert("Your account is deactivated. You cannot submit new complaints.");
        }

        const userId = getUserId();
        try {
            await axios.post('http://localhost:5000/api/complaints', {
                ...formData,
                resident_id: userId
            });
            alert('✅ Complaint Lodged Successfully! Admin will review it soon.');
            setFormData({ title: '', description: '', category: 'General', priority: 'low' });
            fetchComplaints();
        } catch (error) {
            alert('❌ Failed to lodge complaint.');
        }
    };

    const openComplaintModal = async (comp) => {
        setSelectedComplaint(comp);
        setRating(comp.rating || 0);
        setFeedback(comp.feedback || '');
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
        setSelectedComplaint(null);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size is too large. Please upload an image under 5MB.");
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

        if (userStatus === 'inactive') return alert("Account deactivated. You cannot send messages.");

        if (!newMessage.trim() && !newPhotoUrl) return;

        try {
            await axios.post(`http://localhost:5000/api/complaints/${selectedComplaint.id}/updates`, {
                sender_role: 'resident',
                message: newMessage,
                image_url: newPhotoUrl
            });
            setNewMessage('');
            removePhoto();
            const res = await axios.get(`http://localhost:5000/api/complaints/${selectedComplaint.id}/updates`);
            setUpdates(res.data);
        } catch (error) {
            alert("❌ Failed to send message. (If sending a photo, it might be too large)");
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        if (userStatus === 'inactive') return alert("Account deactivated. Cannot submit feedback.");

        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/complaints/${selectedComplaint.id}/feedback`, {
                rating,
                feedback
            });
            alert("✅ Thank you for your feedback!");
            fetchComplaints();
            closeModal();
        } catch (error) {
            alert("❌ Failed to submit feedback.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Wrench className="text-primary w-6 h-6" />
                My Maintenance Requests
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 bg-dark-card p-6 rounded-3xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Report an Issue</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Issue Title</label>
                            <AlertCircle className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="text" required placeholder="e.g. AC not working" value={formData.title}
                                   disabled={userStatus === 'inactive'}
                                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none transition-colors disabled:opacity-50" />
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-sm text-gray-400 block">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAutoDetectAI}
                                    disabled={isDetectingAI || !formData.description.trim() || userStatus === 'inactive'}
                                    className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
                                        isDetectingAI || !formData.description.trim() || userStatus === 'inactive'
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                            : 'bg-gradient-to-r from-[#C0DE1B]/20 to-[#C0DE1B]/10 text-[#C0DE1B] hover:bg-[#C0DE1B]/30 border border-[#C0DE1B]/30 hover:scale-[1.02]'
                                    }`}
                                >
                                    {isDetectingAI ? (
                                        <><span className="w-3 h-3 border-2 border-[#C0DE1B] border-t-transparent rounded-full animate-spin"></span> Analyzing...</>
                                    ) : (
                                        <><Sparkles className="w-3.5 h-3.5" /> Auto-Detect Category</>
                                    )}
                                </button>
                            </div>
                            <MessageSquare className="absolute left-3 top-[42px] w-5 h-5 text-gray-500" />
                            <textarea required placeholder="Please provide details... (e.g. Water pipe burst in the bathroom)" value={formData.description}
                                      disabled={userStatus === 'inactive'}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4"
                                      className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none resize-none transition-colors disabled:opacity-50" />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Category</label>
                            <Tag className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    disabled={userStatus === 'inactive'}
                                    className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer focus:border-primary/50 transition-colors appearance-none disabled:opacity-50">
                                <option value="General">General</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Carpentry">Carpentry</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="HVAC">HVAC</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Priority Level</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    disabled={userStatus === 'inactive'} // 🌟 Disable Input
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none cursor-pointer focus:border-primary/50 transition-colors disabled:opacity-50">
                                <option value="low">Low (Routine Check)</option>
                                <option value="medium">Medium (Needs Attention)</option>
                                <option value="high">High (Urgent/Emergency)</option>
                                <option value="critical" className="text-red-400 font-bold">Critical (Immediate Action)</option>
                            </select>
                        </div>

                        {userStatus === 'inactive' ? (
                            <button type="button" disabled className="w-full bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 cursor-not-allowed">
                                <XCircle className="w-5 h-5" /> Account Deactivated
                            </button>
                        ) : (
                            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(192,222,24,0.2)]">
                                <Plus className="w-5 h-5" /> Submit Request
                            </button>
                        )}
                    </form>
                </div>

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">My Tickets <span className="text-xs text-gray-500 font-normal ml-2">(Click a row to view/update)</span></h3>
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
                                <tr key={comp.id}
                                    onClick={() => openComplaintModal(comp)}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <td className="py-4 pl-2 max-w-[200px]">
                                        <div className="flex flex-col">
                                            <p className="text-white font-medium truncate group-hover:text-primary transition-colors">{comp.title}</p>
                                            {comp.category && (
                                                <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1"><Tag className="w-2.5 h-2.5 inline mr-1" />{comp.category}</span>
                                            )}
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{comp.description}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-400 text-sm">
                                        {new Date(comp.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                                            comp.priority === 'critical' ? 'bg-red-600/20 text-red-500 border border-red-600/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]' :
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

            {isModalOpen && selectedComplaint && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                    <div className="bg-[#111111] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6 pr-8">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{selectedComplaint.title}</h3>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                    selectedComplaint.status === 'resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                    {selectedComplaint.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{selectedComplaint.description}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4 custom-scrollbar">
                            {updates.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm italic py-4">No additional updates or photos yet.</p>
                            ) : (
                                updates.map(update => (
                                    <div key={update.id} className={`flex flex-col max-w-[80%] ${update.sender_role === 'resident' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[10px] text-gray-500 mb-1 capitalize">{update.sender_role} • {new Date(update.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <div className={`p-3 rounded-2xl border ${
                                            update.sender_role === 'resident' ? 'bg-primary/10 border-primary/20 text-white rounded-br-sm' : 'bg-white/5 border-white/10 text-gray-200 rounded-bl-sm'
                                        }`}>
                                            {update.message && <p className="text-sm">{update.message}</p>}
                                            {update.image_url && (
                                                <a href={update.image_url} target="_blank" rel="noreferrer" className="block mt-2">
                                                    <img src={update.image_url} alt="Update" className="max-h-32 rounded-lg border border-white/10" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-auto">
                            {selectedComplaint.status !== 'resolved' ? (
                                <form onSubmit={handleSendUpdate} className="flex flex-col gap-3">
                                    {photoName && (
                                        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-2 px-3 rounded-lg w-fit max-w-full">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-xs text-primary truncate">{photoName}</span>
                                            </div>
                                            <button type="button" onClick={removePhoto} className="text-primary hover:text-white ml-2"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder={userStatus === 'inactive' ? "Account deactivated..." : "Add a comment or detail..."}
                                                value={newMessage}
                                                disabled={userStatus === 'inactive'}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="w-full bg-black text-white pl-4 pr-10 py-3 rounded-xl border border-white/10 focus:border-primary/50 outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <label className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${userStatus === 'inactive' ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-primary hover:bg-white/5 cursor-pointer'}`}>
                                                <Camera className="w-4 h-4" />
                                                <input type="file" accept="image/*" disabled={userStatus === 'inactive'} className="hidden" onChange={handlePhotoChange} />
                                            </label>
                                        </div>
                                        <button type="submit" disabled={!newMessage.trim() && !newPhotoUrl || userStatus === 'inactive'} className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-colors">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            ) : (

                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                                    <h4 className="text-white font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary"/> Issue Resolved</h4>

                                    {selectedComplaint.rating > 0 ? (
                                        <div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1,2,3,4,5].map(star => (
                                                    <Star key={star} className={`w-5 h-5 ${star <= selectedComplaint.rating ? 'fill-primary text-primary' : 'text-gray-600'}`} />
                                                ))}
                                            </div>
                                            {selectedComplaint.feedback && <p className="text-sm text-gray-300 italic">"{selectedComplaint.feedback}"</p>}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFeedbackSubmit}>
                                            <p className="text-xs text-gray-400 mb-3">Please rate the service and leave feedback.</p>
                                            <div className="flex items-center gap-2 mb-4">
                                                {[1,2,3,4,5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`w-6 h-6 transition-colors ${userStatus === 'inactive' ? 'text-gray-700 cursor-not-allowed' : 'cursor-pointer'} ${star <= (hoveredStar || rating) ? 'fill-primary text-primary hover:scale-110' : 'text-gray-600 hover:text-gray-400'}`}
                                                        onClick={() => userStatus !== 'inactive' && setRating(star)}
                                                        onMouseEnter={() => userStatus !== 'inactive' && setHoveredStar(star)}
                                                        onMouseLeave={() => userStatus !== 'inactive' && setHoveredStar(0)}
                                                    />
                                                ))}
                                            </div>
                                            <textarea
                                                placeholder={userStatus === 'inactive' ? "Account deactivated..." : "Your feedback (optional)..."}
                                                value={feedback}
                                                disabled={userStatus === 'inactive'}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full bg-black text-white px-4 py-3 rounded-xl border border-white/10 focus:border-primary/50 outline-none text-sm mb-3 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                rows="2"
                                            ></textarea>
                                            <button type="submit" disabled={userStatus === 'inactive'} className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-6 rounded-xl text-sm transition-colors">Submit Feedback</button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyComplaints;