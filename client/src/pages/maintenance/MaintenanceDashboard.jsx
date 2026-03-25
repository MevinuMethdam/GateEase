import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, AlertCircle, MapPin, Calendar as CalendarIcon, MessageSquare, Send, Camera, X, Image as ImageIcon, User, Shield, Wrench, LayoutDashboard, ClipboardList, PackagePlus, History, Star, Package, Activity, TrendingUp } from 'lucide-react';

const MaintenanceDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const userName = localStorage.getItem('userName'); // උදා: "Kamal (Plumber)"

    const [activeTab, setActiveTab] = useState('overview');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [photoName, setPhotoName] = useState('');

    const [materialRequests, setMaterialRequests] = useState([]);
    const [materialForm, setMaterialForm] = useState({ task_id: '', item_name: '', quantity: '', reason: '' });

    const [materialFormErrors, setMaterialFormErrors] = useState({});

    const fetchTasks = async () => {
        if (!userName) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/complaints/maintenance-staff/${userName}`);
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [userName]);

    // Data filtering for new tabs
    const activeTasks = tasks.filter(t => t.status !== 'resolved');
    const resolvedTasks = tasks.filter(t => t.status === 'resolved');

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}/status`, {
                status: newStatus,
                assigned_staff: userName
            });
            fetchTasks();

            if (selectedTaskForModal && selectedTaskForModal.id === id) {
                setSelectedTaskForModal(prev => ({...prev, status: newStatus}));
            }
        } catch (error) {
            alert('❌ Failed to update task status.');
        }
    };

    const openTaskModal = async (task) => {
        setSelectedTaskForModal(task);
        setNewMessage('');
        removePhoto();
        setIsModalOpen(true);

        try {
            const res = await axios.get(`http://localhost:5000/api/complaints/${task.id}/updates`);
            setUpdates(res.data);
        } catch (error) {
            console.error("Error fetching updates:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTaskForModal(null);
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
            await axios.post(`http://localhost:5000/api/complaints/${selectedTaskForModal.id}/updates`, {
                sender_role: 'maintenance',
                message: newMessage,
                image_url: newPhotoUrl
            });
            setNewMessage('');
            removePhoto();

            const res = await axios.get(`http://localhost:5000/api/complaints/${selectedTaskForModal.id}/updates`);
            setUpdates(res.data);
        } catch (error) {
            alert("❌ Failed to send message.");
        }
    };

    const validateMaterialForm = () => {
        const errors = {};

        if (!materialForm.task_id) errors.task_id = "Please select an active task.";
        if (!materialForm.item_name.trim()) errors.item_name = "Item name is required.";

        if (!materialForm.quantity || isNaN(materialForm.quantity) || Number(materialForm.quantity) <= 0) {
            errors.quantity = "Quantity must be a valid number greater than 0.";
        }

        setMaterialFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleMaterialSubmit = (e) => {
        e.preventDefault();

        if (!validateMaterialForm()) return;

        const newReq = { ...materialForm, id: Date.now(), status: 'Pending', date: new Date().toLocaleDateString() };
        setMaterialRequests([newReq, ...materialRequests]);

        setMaterialForm({ task_id: '', item_name: '', quantity: '', reason: '' });
        setMaterialFormErrors({});

        alert("✅ Material request sent to Admin!");
    };

    const TabButton = ({ id, icon: Icon, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === id
                    ? 'bg-[#C0DE1B]/10 text-[#C0DE1B] border border-[#C0DE1B]/30 shadow-inner'
                    : 'text-[#848484] hover:bg-white/5 hover:text-white border border-transparent'
            }`}
        >
            <Icon className="w-4 h-4" /> {label}
            {count !== undefined && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-md text-[10px] ${activeTab === id ? 'bg-[#C0DE1B] text-black' : 'bg-[#222] text-white'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    const GlassCard = ({ children, className = '' }) => (
        <div className={`bg-black/60 backdrop-blur-lg border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
            {children}
        </div>
    );

    const NeonStatCard = ({ children, icon: Icon, accent }) => (
        <GlassCard className="p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${accent}/10 rounded-full blur-2xl group-hover:bg-${accent}/20 transition-all`}></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-${accent}/10 flex items-center justify-center border border-${accent}/20`}>
                    <Icon className={`w-6 h-6 text-${accent}`} />
                </div>
                {children}
            </div>
        </GlassCard>
    );

    return (

        <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1517646280197-a63690623a88?q=80&w=2000')", // Modern tool workshop
                    filter: "blur(20px)",
                    opacity: 0.2
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto p-10 pb-20">
                {/* Header */}
                <div className="mb-10 flex justify-between items-center animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
                            <Wrench className="text-[#C0DE1B] w-8 h-8" />
                            Operations Hub
                        </h2>
                        <p className="text-[#848484] text-xs font-bold uppercase tracking-widest mt-1 ml-11">Authorized Access: {userName || 'Staff'}</p>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 mb-10 border-b border-white/5 custom-scrollbar animate-in fade-in duration-500">
                    <TabButton id="overview" icon={LayoutDashboard} label="Dashboard" />
                    <TabButton id="tasks" icon={ClipboardList} label="Active Tasks" count={activeTasks.length} />
                    <TabButton id="schedule" icon={Clock} label="Today's Schedule" />
                    <TabButton id="materials" icon={PackagePlus} label="Request Parts" />
                    <TabButton id="history" icon={History} label="Completed Jobs" />
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <NeonStatCard icon={Activity} accent="blue-400">
                                <div><p className="text-[#848484] text-xs font-bold uppercase tracking-widest">Jobs Pending</p><p className="text-3xl font-black text-white mt-1">{activeTasks.length}</p></div>
                            </NeonStatCard>
                            <NeonStatCard icon={CheckCircle2} accent="green-400">
                                <div><p className="text-[#848484] text-xs font-bold uppercase tracking-widest">Jobs Completed</p><p className="text-3xl font-black text-white mt-1">{resolvedTasks.length}</p></div>
                            </NeonStatCard>
                            <NeonStatCard icon={Star} accent="[#C0DE1B]">
                                <div><p className="text-[#848484] text-xs font-bold uppercase tracking-widest">Average Service Rating</p><p className="text-3xl font-black text-white mt-1">4.8 <span className="text-sm text-gray-500 font-medium">/ 5.0</span></p></div>
                            </NeonStatCard>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="grid gap-4 animate-in fade-in duration-500">
                        {activeTasks.map(task => (
                            <GlassCard key={task.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all hover:border-[#C0DE1B]/30 hover:shadow-[#C0DE1B]/10 hover:-translate-y-1">
                                {/* UNTOUCHED INFO AREA */}
                                <div className="flex-1 cursor-pointer group" onClick={() => openTaskModal(task)}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{task.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {task.priority} Priority
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{task.description}</p>

                                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                            Unit: {task.unit_no || 'Common Area'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            <AlertCircle className="w-3.5 h-3.5 text-primary" />
                                            By: {task.resident_name}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                                            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                            {new Date(task.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest">
                                        <MessageSquare className="w-4 h-4" /> View Updates & Reply
                                    </div>
                                </div>

                                <div className="w-full md:w-auto bg-[#111] p-1.5 rounded-xl border border-white/10 shrink-0">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                        className={`w-full md:w-40 px-4 py-2.5 rounded-lg text-xs font-bold outline-none cursor-pointer uppercase tracking-wider transition-colors ${
                                            task.status === 'open' ? 'bg-yellow-500/10 text-yellow-400' :
                                                task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-green-500/20 text-green-400 border border-green-500/20'
                                        }`}
                                    >
                                        <option value="open" className="bg-[#111] text-white">OPEN</option>
                                        <option value="in_progress" className="bg-[#111] text-white">IN PROGRESS</option>
                                        <option value="resolved" className="bg-[#111] text-white">RESOLVED</option>
                                    </select>
                                </div>
                            </GlassCard>
                        ))}

                        {activeTasks.length === 0 && (
                            <div className="text-center py-16 bg-black/40 border border-white/5 rounded-3xl shadow-xl">
                                <div className="w-20 h-20 bg-[#C0DE1B]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C0DE1B]/20">
                                    <CheckCircle2 className="w-10 h-10 text-[#C0DE1B]" />
                                </div>
                                <p className="text-xl font-bold text-white mb-1">No active tasks!</p>
                                <p className="text-gray-500 text-sm">You are all caught up. Take a break! ☕</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="bg-black/40 p-10 rounded-[32px] border border-white/[0.05] shadow-xl animate-in fade-in duration-500">
                        <h3 className="text-lg font-bold text-white mb-10 flex items-center gap-2"><Clock className="text-[#C0DE1B] w-5 h-5"/> Today's Operation Timeline</h3>
                        {activeTasks.length > 0 ? (
                            <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                                {activeTasks.map((task, i) => (
                                    <div key={task.id} className="relative pl-10">
                                        <div className="absolute -left-3 top-1.5 w-6 h-6 bg-[#111] border border-[#C0DE1B]/50 rounded-full flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-[#C0DE1B] rounded-full shadow-[0_0_10px_#C0DE1B]"></div>
                                        </div>
                                        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:-translate-x-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-white font-bold">{task.title}</h4>
                                                <span className="text-xs text-[#848484] font-bold uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#C0DE1B]"/> {task.unit_no || 'Common Area'}</span>
                                            </div>
                                            <p className="text-[#666666] text-sm mb-4 line-clamp-1">{task.description}</p>
                                            <div className="flex gap-2.5">
                                                <span className={`px-2.5 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider ${task.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2.5 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                                    {task.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[#666666] text-sm text-center py-8">Your schedule is clear!</p>
                        )}
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="grid lg:grid-cols-5 gap-6 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 bg-black/40 p-6 md:p-8 rounded-[32px] border border-white/[0.05] shadow-xl h-fit">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PackagePlus className="text-[#C0DE1B] w-5 h-5"/> Requisition Parts</h3>

                            <form onSubmit={handleMaterialSubmit} className="space-y-4" noValidate>
                                {/* Task Select */}
                                <div>
                                    <label className="text-[10px] text-[#848484] font-bold uppercase tracking-widest mb-1.5 block">Select Task ID</label>
                                    <select
                                        value={materialForm.task_id}
                                        onChange={(e) => { setMaterialForm({...materialForm, task_id: e.target.value}); setMaterialFormErrors({...materialFormErrors, task_id: null}); }}
                                        className={`w-full bg-[#111] text-white px-4 py-3.5 rounded-xl border transition-all outline-none cursor-pointer text-sm ${materialFormErrors.task_id ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/30'}`}>
                                        <option value="">-- Choose Active Task --</option>
                                        {activeTasks.map(t => <option key={t.id} value={t.id}>{t.title} ({t.unit_no})</option>)}
                                    </select>
                                    {materialFormErrors.task_id && <p className="text-red-400 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {materialFormErrors.task_id}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#848484] font-bold uppercase tracking-widest mb-1.5 block">Required Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2-inch PVC Pipe"
                                        value={materialForm.item_name}
                                        onChange={(e) => { setMaterialForm({...materialForm, item_name: e.target.value}); setMaterialFormErrors({...materialFormErrors, item_name: null}); }}
                                        className={`w-full bg-[#111] text-white px-4 py-3.5 rounded-xl border transition-all outline-none text-sm ${materialFormErrors.item_name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/30'}`} />
                                    {materialFormErrors.item_name && <p className="text-red-400 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {materialFormErrors.item_name}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#848484] font-bold uppercase tracking-widest mb-1.5 block">Quantity Needed</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 2"
                                        value={materialForm.quantity}
                                        onChange={(e) => { setMaterialForm({...materialForm, quantity: e.target.value}); setMaterialFormErrors({...materialFormErrors, quantity: null}); }}
                                        className={`w-full bg-[#111] text-white px-4 py-3.5 rounded-xl border transition-all outline-none text-sm ${materialFormErrors.quantity ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/30'}`} />
                                    {materialFormErrors.quantity && <p className="text-red-400 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {materialFormErrors.quantity}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#848484] font-bold uppercase tracking-widest mb-1.5 block">Reason (Optional)</label>
                                    <textarea
                                        placeholder="Explain necessity..."
                                        value={materialForm.reason}
                                        onChange={(e) => setMaterialForm({...materialForm, reason: e.target.value})}
                                        className="w-full bg-[#111] text-white px-4 py-3.5 rounded-xl border border-white/5 focus:border-[#C0DE1B]/30 outline-none text-sm resize-none h-20" />
                                </div>

                                <button type="submit" className="w-full bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] hover:from-[#d6f72f] hover:to-[#C0DE1B] text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#C0DE1B]/20 hover:-translate-y-0.5">Submit Requisition</button>
                            </form>
                        </div>

                        <div className="lg:col-span-3 bg-black/40 p-6 md:p-8 rounded-[32px] border border-white/[0.05] shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Package className="text-[#C0DE1B] w-5 h-5"/> Requisition Log</h3>
                            <div className="space-y-3">
                                {materialRequests.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                                        <Package className="w-10 h-10 text-[#333] mx-auto mb-2" />
                                        <p className="text-[#666] text-sm">No material requests made yet.</p>
                                    </div>
                                ) : (
                                    materialRequests.map(req => (
                                        <div key={req.id} className="bg-[#111] p-4.5 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-bold">{req.item_name} <span className="text-[#848484] text-xs font-normal">x{req.quantity}</span></p>
                                                <p className="text-[11px] text-[#666] mt-1">Date: {req.date}</p>
                                            </div>
                                            <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                                {req.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {resolvedTasks.length > 0 ? (
                            resolvedTasks.map(task => (
                                <GlassCard key={task.id} className="p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between opacity-80 hover:opacity-100 transition-all hover:border-white/10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{task.title}</h3>
                                            <p className="text-[#848484] text-xs mt-0.5 font-medium">Completed: {new Date(task.updated_at || task.created_at).toLocaleDateString()} • Unit {task.unit_no}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openTaskModal(task)} className="bg-[#111] hover:bg-white/5 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-colors border border-white/5 whitespace-nowrap">
                                        View Job Log
                                    </button>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-black/40 border border-white/5 rounded-3xl shadow-xl">
                                <History className="w-12 h-12 text-[#333] mx-auto mb-4" />
                                <p className="text-xl font-bold text-white mb-1">No history yet.</p>
                                <p className="text-gray-500 text-sm">Completed jobs will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {isModalOpen && selectedTaskForModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
                        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-[32px] w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative h-[85vh] flex flex-col overflow-hidden">

                            <div className="p-6 md:p-8 border-b border-white/[0.05] bg-[#111111]/50 flex justify-between items-start shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-extrabold text-white tracking-tight">{selectedTaskForModal.title}</h3>
                                        <span className={`px-2.5 py-1 rounded-[6px] text-[9px] uppercase font-bold tracking-wider border shadow-inner ${
                                            selectedTaskForModal.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                selectedTaskForModal.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                            {selectedTaskForModal.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#A0A0A0] font-medium leading-relaxed">{selectedTaskForModal.description}</p>
                                    <div className="flex gap-4 mt-3">
                                        <p className="text-xs text-[#666666]">Reported by: <span className="text-white">{selectedTaskForModal.resident_name}</span></p>
                                        <p className="text-xs text-[#666666]">Unit: <span className="text-white">{selectedTaskForModal.unit_no || 'N/A'}</span></p>
                                    </div>
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
                                        <p className="text-[#666666] text-xs mt-1">Send a message to the resident or admin.</p>
                                    </div>
                                ) : (
                                    updates.map(update => (
                                        <div key={update.id} className={`flex flex-col w-full ${update.sender_role === 'maintenance' ? 'items-end' : 'items-start'}`}>

                                            <div className="flex items-center gap-2 mb-1.5">
                                                {update.sender_role !== 'maintenance' && <User className="w-3 h-3 text-[#555555]" />}
                                                <span className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">
                                                    {update.sender_role} • {new Date(update.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                {update.sender_role === 'maintenance' && <Wrench className="w-3 h-3 text-[#555555]" />}
                                            </div>

                                            <div className={`relative max-w-[85%] md:max-w-[70%] p-4 rounded-[20px] shadow-lg ${
                                                update.sender_role === 'maintenance'
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
                                {selectedTaskForModal.status !== 'resolved' ? (
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
                                            <CheckCircle2 className="w-4 h-4" /> This task has been marked as resolved.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaintenanceDashboard;