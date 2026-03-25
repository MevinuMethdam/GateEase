import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ResidentSidebar from '../components/ResidentSidebar';
import { Bell, Check, Info, Menu, Home } from 'lucide-react';
import axios from 'axios';

// 🌟 NEW: අපි හදපු Chatbot Component එක Import කරනවා
import Chatbot from '../components/Chatbot';

// 🌟 ඔයාගේ Apartment Background එකට අදාළ Image URL එක
const topBannerImg = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop';

const ResidentLayout = () => {
    const userName = localStorage.getItem('userName') || 'Resident';
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigate = useNavigate();

    const getUserId = () => {
        const token = localStorage.getItem('token');
        return token ? JSON.parse(atob(token.split('.')[1])).id : null;
    };

    const fetchNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-[#030303] flex overflow-x-hidden font-sans text-[#EAEAEA] relative">

            {/* 🌟 IMAGE MOVED HERE: දැන් මේක මුළු Screen එකටම අදාළයි! */}
            <div className="fixed top-0 left-0 w-full h-[450px] overflow-hidden z-0 pointer-events-none">
                <img
                    src={topBannerImg}
                    alt="Apartment Background"
                    className="w-full h-full object-cover opacity-50 blur-[2px] scale-105 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/50 to-transparent"></div>
            </div>

            <ResidentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className={`flex-1 relative z-10 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>

                <div className="p-6 md:p-10">
                    <header className="flex justify-between items-center mb-10 bg-black/40 backdrop-blur-2xl p-4 md:px-8 md:py-5 rounded-[32px] border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.6)] sticky top-4 z-40 transition-all duration-500 hover:border-white/[0.08]">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-3 bg-black/50 border border-white/[0.05] rounded-[16px] text-[#848484] hover:text-[#C0DE1B] hover:border-[#C0DE1B]/30 hover:shadow-[0_0_15px_rgba(192,222,24,0.15)] transition-all duration-300 focus:outline-none"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl md:text-[22px] font-extrabold text-white tracking-tight flex items-center gap-2">
                                    <Home className="w-5 h-5 text-[#C0DE1B]" /> Resident Portal
                                </h2>
                                <p className="text-[#848484] text-[12px] md:text-xs font-medium tracking-wide mt-0.5">Manage your apartment lifestyle</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-3 bg-black/50 border border-white/[0.05] rounded-[16px] text-[#848484] hover:text-white transition-all duration-300 hover:border-white/[0.1]"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#C0DE1B] to-[#9EBA11] text-[#050505] text-[11px] font-extrabold flex items-center justify-center rounded-full border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(192,222,24,0.4)]">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute top-16 right-0 w-80 md:w-96 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/[0.08] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-5 border-b border-white/[0.05] flex justify-between items-center bg-[#111111]/50">
                                            <h3 className="text-white font-extrabold tracking-tight">Notifications</h3>
                                            <span className="px-2.5 py-1 bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 text-[#C0DE1B] text-[10px] uppercase tracking-widest font-extrabold rounded-full">
                                                {unreadCount} New
                                            </span>
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div key={notif.id} className={`p-5 border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group ${notif.is_read ? 'opacity-60' : 'bg-[#C0DE1B]/[0.02]'}`}>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${notif.is_read ? 'bg-[#111111] border-white/5 text-[#666666]' : 'bg-[#C0DE1B]/10 border-[#C0DE1B]/20 text-[#C0DE1B]'}`}>
                                                                <Info className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-[14px] font-bold ${notif.is_read ? 'text-[#A0A0A0]' : 'text-white'} leading-tight`}>{notif.title}</p>
                                                                <p className="text-[12px] text-[#848484] mt-1.5 leading-relaxed">{notif.message}</p>
                                                                <p className="text-[10px] text-[#555555] font-bold uppercase tracking-wider mt-2.5">{new Date(notif.created_at).toLocaleString()}</p>
                                                            </div>
                                                            {!notif.is_read && (
                                                                <button onClick={() => markAsRead(notif.id)} className="w-7 h-7 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center text-[#848484] hover:text-[#C0DE1B] hover:border-[#C0DE1B]/30 hover:bg-[#C0DE1B]/10 transition-all" title="Mark as read">
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-[#666666] text-sm font-medium">No notifications yet.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => navigate('/resident/profile')}
                                title="Go to My Profile"
                                className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#C0DE1B] to-[#9EBA11] flex items-center justify-center text-[#050505] font-extrabold text-lg cursor-pointer shadow-[0_0_20px_rgba(192,222,24,0.2)] hover:shadow-[0_0_30px_rgba(192,222,24,0.4)] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 border-2 border-white/5"
                            >
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </header>

                    <Outlet />
                </div>
            </div>

            {/* 🌟 NEW: මෙන්න Chatbot එක පාවෙන විදියට දැම්මා */}
            <Chatbot />

        </div>
    );
};

export default ResidentLayout;