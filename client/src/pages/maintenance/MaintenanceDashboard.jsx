import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, AlertCircle, MapPin, Calendar as CalendarIcon, MessageSquare, Send, Camera, X, Image as ImageIcon, User, Shield, Wrench, LayoutDashboard, ClipboardList, History, Star, Activity, TrendingUp, ChevronDown, Bell, LogOut } from 'lucide-react';

const MaintenanceDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const userName = localStorage.getItem('userName');

    const [activeTab, setActiveTab] = useState('overview');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [photoName, setPhotoName] = useState('');

    const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login';
    };

    const TabButton = ({ id, icon: Icon, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 border ${
                activeTab === id
                    ? 'bg-[#C0DE1B] text-black border-[#C0DE1B] shadow-[0_0_20px_rgba(192,222,24,0.2)]'
                    : 'bg-[#0A0A0A] text-[#888] hover:text-white border-white/5 hover:border-white/10 hover:bg-[#111]'
            }`}
        >
            <Icon className="w-4 h-4" /> {label}
            {count !== undefined && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${activeTab === id ? 'bg-black/20 text-black' : 'bg-white/10 text-white'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    const StatCard = ({ title, value, icon: Icon, colorClass, borderClass, bgGlow }) => (
        <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${bgGlow} rounded-[24px] blur opacity-0 group-hover:opacity-30 transition duration-500`}></div>
            <div className={`relative bg-gradient-to-b from-[#111] to-[#050505] p-7 rounded-[24px] border border-white/5 flex items-center gap-6 h-full`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} ${borderClass} border bg-[#000] shadow-inner`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{title}</p>
                    <p className="text-4xl font-black text-white tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#C0DE1B] selection:text-black relative overflow-x-hidden">

            {activeTab !== 'overview' && (
                <div className="fixed inset-0 z-0 pointer-events-none animate-in fade-in duration-[1500ms] ease-out">
                    <div
                        className="absolute top-0 left-0 w-full h-[70vh] bg-cover bg-center grayscale opacity-[0.15]"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/90 to-[#000000]"></div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-24 relative z-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 bg-[#0A0A0A] p-6 md:px-8 rounded-[24px] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 ease-out">

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-transparent border border-[#C0DE1B]/30 rounded-full flex items-center justify-center shrink-0">
                            <Wrench className="text-[#C0DE1B] w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Maintenance Terminal</h1>
                            <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest mt-1">ACTIVE DUTY: {userName || 'MAINTENANCE STAFF'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-3 bg-white/5 border border-white/10 rounded-[14px] hover:bg-white/10 transition-colors text-[#888] hover:text-white group">
                            <Bell className="w-5 h-5" />
                            {activeTasks.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#C0DE1B] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(192,222,24,0.5)]">
                                    {activeTasks.length}
                                </span>
                            )}
                        </button>

                        <button className="p-3 bg-white/5 border border-white/10 rounded-[14px] hover:bg-white/10 transition-colors text-[#888] hover:text-white">
                            <User className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[14px] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
                            title="Log Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="relative w-full h-[260px] rounded-[32px] overflow-hidden mb-10 border border-white/5 shadow-2xl animate-in fade-in zoom-in-[0.98] duration-700 ease-out bg-[#0A0A0A]">
                        <div
                            className="absolute inset-0 bg-cover bg-center grayscale opacity-50 transition-transform duration-1000 hover:scale-105"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-[#000000]/10"></div>
                        <div className="absolute inset-0 p-10 md:p-12 flex flex-col justify-center">
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                                Operations Hub.
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="h-[2px] w-12 bg-[#C0DE1B] shadow-[0_0_10px_#C0DE1B]"></div>
                                <p className="text-[#C0DE1B] text-[11px] font-extrabold tracking-[0.2em]">{todayFormatted}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 overflow-x-auto pb-6 mb-8 custom-scrollbar hide-scrollbar-on-mobile animate-in fade-in duration-700">
                    <TabButton id="overview" icon={LayoutDashboard} label="Dashboard" />
                    <TabButton id="tasks" icon={ClipboardList} label="Active Tasks" count={activeTasks.length} />
                    <TabButton id="schedule" icon={Clock} label="Schedule" />
                    <TabButton id="history" icon={History} label="History" />
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in zoom-in-[0.99] slide-in-from-bottom-4 duration-700 ease-out">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Active Jobs" value={activeTasks.length} icon={Activity} colorClass="text-[#60A5FA]" borderClass="border-[#60A5FA]/20" bgGlow="from-[#60A5FA] to-transparent" />
                            <StatCard title="Resolved" value={resolvedTasks.length} icon={CheckCircle2} colorClass="text-[#4ADE80]" borderClass="border-[#4ADE80]/20" bgGlow="from-[#4ADE80] to-transparent" />
                            <StatCard title="Avg Rating" value="4.8" icon={Star} colorClass="text-[#C0DE1B]" borderClass="border-[#C0DE1B]/20" bgGlow="from-[#C0DE1B] to-transparent" />
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="space-y-5 animate-in fade-in zoom-in-[0.99] slide-in-from-bottom-6 duration-700 ease-out">
                        {activeTasks.map(task => (
                            <div key={task.id} className="bg-gradient-to-b from-[#0A0A0A] to-[#050505] border border-white/5 rounded-[24px] p-7 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:border-[#C0DE1B]/30 hover:shadow-[0_0_30px_rgba(192,222,24,0.05)] transition-all duration-300 relative overflow-hidden">

                                <div className="absolute inset-0 bg-gradient-to-r from-[#C0DE1B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                <div className="flex-1 cursor-pointer relative z-10" onClick={() => openTaskModal(task)}>
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-[#C0DE1B] transition-colors">{task.title}</h3>
                                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-[#000] ${
                                            task.priority === 'high' ? 'text-[#EF4444] border-[#EF4444]/30' :
                                                task.priority === 'medium' ? 'text-[#F97316] border-[#F97316]/30' :
                                                    'text-[#60A5FA] border-[#60A5FA]/30'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    <p className="text-[#888] text-sm mb-6 leading-relaxed line-clamp-2 max-w-4xl">{task.description}</p>

                                    <div className="flex flex-wrap gap-3">
                                        <span className="flex items-center gap-2 text-xs font-bold text-[#AAA] bg-[#0A0A0A] border border-white/5 px-3.5 py-2 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-[#C0DE1B]" /> {task.unit_no || 'Common Area'}
                                        </span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-[#AAA] bg-[#0A0A0A] border border-white/5 px-3.5 py-2 rounded-lg">
                                            <AlertCircle className="w-3.5 h-3.5 text-[#C0DE1B]" /> {task.resident_name}
                                        </span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-[#AAA] bg-[#0A0A0A] border border-white/5 px-3.5 py-2 rounded-lg">
                                            <CalendarIcon className="w-3.5 h-3.5 text-[#C0DE1B]" /> {new Date(task.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto shrink-0 relative z-10">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                        className={`appearance-none w-full md:w-48 px-5 py-4 rounded-xl text-xs font-black outline-none cursor-pointer uppercase tracking-widest transition-all border shadow-inner ${
                                            task.status === 'open' ? 'bg-[#000] text-[#EAB308] border-[#EAB308]/30 focus:border-[#EAB308]' :
                                                task.status === 'in_progress' ? 'bg-[#000] text-[#60A5FA] border-[#60A5FA]/30 focus:border-[#60A5FA]' :
                                                    'bg-[#000] text-[#4ADE80] border-[#4ADE80]/30 focus:border-[#4ADE80]'
                                        }`}
                                    >
                                        <option value="open">OPEN</option>
                                        <option value="in_progress">IN PROGRESS</option>
                                        <option value="resolved">RESOLVED</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                                </div>
                            </div>
                        ))}

                        {activeTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 bg-[#050505] border border-white/5 rounded-[32px]">
                                <div className="w-20 h-20 bg-[#C0DE1B]/10 rounded-full flex items-center justify-center mb-6 border border-[#C0DE1B]/20 shadow-[0_0_30px_rgba(192,222,24,0.1)]">
                                    <CheckCircle2 className="w-10 h-10 text-[#C0DE1B]" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Inbox Zero!</h3>
                                <p className="text-[#888] font-medium">All tasks are completed. You're fully caught up.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="bg-gradient-to-b from-[#0A0A0A] to-[#050505] p-10 rounded-[32px] border border-white/5 animate-in fade-in zoom-in-[0.99] slide-in-from-bottom-6 duration-700 ease-out">
                        <div className="flex items-center gap-3 mb-10">
                            <Clock className="text-[#C0DE1B] w-6 h-6" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Today's Itinerary</h3>
                        </div>

                        {activeTasks.length > 0 ? (
                            <div className="relative border-l-2 border-white/10 ml-4 space-y-10 pb-4">
                                {activeTasks.map((task) => (
                                    <div key={task.id} className="relative pl-10 group">
                                        <div className="absolute -left-[11px] top-1.5 w-5 h-5 bg-[#000] border-2 border-[#333] group-hover:border-[#C0DE1B] transition-colors rounded-full flex items-center justify-center z-10">
                                            <div className="w-2 h-2 bg-[#C0DE1B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_#C0DE1B]"></div>
                                        </div>
                                        <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all shadow-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-lg font-bold text-white">{task.title}</h4>
                                                <span className="text-[9px] text-[#888] font-bold uppercase tracking-widest bg-[#000] px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-[#C0DE1B]"/> {task.unit_no || 'Common Area'}
                                                </span>
                                            </div>
                                            <p className="text-[#888] text-sm leading-relaxed line-clamp-2">{task.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[#888] font-medium text-center py-10 border border-dashed border-white/10 rounded-2xl">Your schedule is clear for today.</p>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-[0.99] slide-in-from-bottom-6 duration-700 ease-out">
                        {resolvedTasks.length > 0 ? (
                            resolvedTasks.map(task => (
                                <div key={task.id} className="bg-[#0A0A0A] p-6 rounded-[24px] border border-white/5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-white/10 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#4ADE80]/30 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 text-[#444] group-hover:text-[#4ADE80] transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{task.title}</h3>
                                            <p className="text-[#666] text-xs mt-1 font-bold uppercase tracking-wider">Resolved: {new Date(task.updated_at || task.created_at).toLocaleDateString()} • Unit {task.unit_no}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openTaskModal(task)} className="w-full md:w-auto bg-[#000] hover:bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors border border-white/5">
                                        View Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-[#0A0A0A] border border-white/5 rounded-[32px]">
                                <History className="w-12 h-12 text-[#333] mx-auto mb-4" />
                                <p className="text-xl font-bold text-white mb-2">No history found</p>
                                <p className="text-[#666] font-medium">Completed jobs will be archived here.</p>
                            </div>
                        )}
                    </div>
                )}

                {isModalOpen && selectedTaskForModal && (
                    <div className="fixed inset-0 bg-[#000]/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 ease-out p-4">
                        <div className="bg-[#050505] border border-white/10 rounded-[32px] w-full max-w-3xl shadow-2xl relative h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 ease-out">

                            <div className="p-8 border-b border-white/5 bg-[#0A0A0A] flex justify-between items-start shrink-0">
                                <div className="pr-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-2xl font-black text-white tracking-tight">{selectedTaskForModal.title}</h3>
                                        <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase font-black tracking-widest border ${
                                            selectedTaskForModal.status === 'resolved' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20' :
                                                selectedTaskForModal.status === 'in_progress' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' :
                                                    'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20'
                                        }`}>
                                            {selectedTaskForModal.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#888] font-medium leading-relaxed">{selectedTaskForModal.description}</p>
                                    <div className="flex flex-wrap gap-3 mt-5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] bg-[#000] px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2"><User className="w-3 h-3 text-[#C0DE1B]"/> {selectedTaskForModal.resident_name}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] bg-[#000] px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2"><MapPin className="w-3 h-3 text-[#C0DE1B]"/> {selectedTaskForModal.unit_no || 'N/A'}</span>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="absolute top-6 right-6 text-[#666] hover:text-white bg-[#000] hover:bg-white/10 transition-colors p-2.5 rounded-full border border-white/5">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#000] relative">
                                {updates.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-[#0A0A0A] rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                                            <MessageSquare className="w-6 h-6 text-[#444]" />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-1">Start the conversation</p>
                                        <p className="text-[#666] text-sm">Send an update or ask a question about this task.</p>
                                    </div>
                                ) : (
                                    updates.map(update => (
                                        <div key={update.id} className={`flex flex-col w-full ${update.sender_role === 'maintenance' ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] text-[#666] font-bold uppercase tracking-widest mb-1.5 mx-1 flex items-center gap-1.5">
                                                {update.sender_role === 'maintenance' ? <Wrench className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {update.sender_role} • {new Date(update.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>

                                            <div className={`relative max-w-[85%] md:max-w-[70%] p-5 shadow-xl ${
                                                update.sender_role === 'maintenance'
                                                    ? 'bg-[#C0DE1B] text-black rounded-2xl rounded-tr-sm'
                                                    : 'bg-[#0A0A0A] border border-white/5 text-[#EAEAEA] rounded-2xl rounded-tl-sm'
                                            }`}>
                                                {update.message && <p className={`text-sm leading-relaxed ${update.sender_role === 'maintenance' ? 'font-bold' : 'font-medium'}`}>{update.message}</p>}
                                                {update.image_url && (
                                                    <div className="mt-3 relative group rounded-xl overflow-hidden border border-black/10">
                                                        <a href={update.image_url} target="_blank" rel="noreferrer">
                                                            <img src={update.image_url} alt="Attachment" className="w-full max-h-[250px] object-cover" />
                                                            <div className="absolute inset-0 bg-[#000]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <span className="bg-[#000] text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/10">View Full Image</span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 bg-[#0A0A0A] border-t border-white/5 shrink-0">
                                {selectedTaskForModal.status !== 'resolved' ? (
                                    <form onSubmit={handleSendUpdate} className="flex flex-col gap-3">
                                        {photoName && (
                                            <div className="flex items-center justify-between bg-[#000] border border-white/5 p-3 rounded-xl w-fit">
                                                <div className="flex items-center gap-2.5">
                                                    <ImageIcon className="w-4 h-4 text-[#C0DE1B]" />
                                                    <span className="text-xs text-white font-medium">{photoName}</span>
                                                </div>
                                                <button type="button" onClick={removePhoto} className="text-[#666] hover:text-[#EF4444] ml-4 transition-colors"><X className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                        <div className="flex gap-3 items-end">
                                            <div className="relative flex-1 bg-[#050505] border border-white/10 rounded-2xl focus-within:border-[#C0DE1B]/50 transition-all shadow-inner">
                                                <textarea
                                                    placeholder="Type your message here..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="w-full bg-transparent text-white pl-5 pr-14 py-4 outline-none text-sm font-medium placeholder-[#555] resize-none h-[52px] max-h-[120px]"
                                                    rows={1}
                                                />
                                                <label className="absolute right-3 top-[50%] -translate-y-[50%] p-2 text-[#666] hover:text-[#C0DE1B] hover:bg-[#C0DE1B]/10 rounded-xl cursor-pointer transition-all">
                                                    <Camera className="w-5 h-5" />
                                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                                </label>
                                            </div>
                                            <button type="submit" disabled={!newMessage.trim() && !newPhotoUrl}
                                                    className="bg-[#C0DE1B] hover:bg-[#aacc15] disabled:opacity-50 disabled:cursor-not-allowed text-black p-4 rounded-2xl transition-all shrink-0 h-[52px] w-[52px] flex items-center justify-center hover:shadow-[0_0_15px_rgba(192,222,24,0.3)]">
                                                <Send className="w-5 h-5 ml-1" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 p-4 rounded-xl text-center flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                                        <p className="text-[#4ADE80] font-bold text-sm">This task is resolved and closed for new updates.</p>
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