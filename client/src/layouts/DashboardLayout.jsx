import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Check, Info } from 'lucide-react';
import axios from 'axios';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload.id || payload.userId || payload.user_id || payload.adminId || payload.admin_id || (payload.user && payload.user.id) || null;
        } catch (e) {
            console.error("Token decode error:", e);
            return null;
        }
    };

    const fetchNotifications = async () => {
        const userId = getUserId();

        if (!userId) {
            console.log("⚠️ Admin User ID not found in token!");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) { console.error('Failed to mark as read', error); }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-[#050505] flex overflow-x-hidden relative font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className={`flex-1 transition-all duration-300 ease-in-out relative z-10 ${isSidebarOpen ? 'ml-[270px]' : 'ml-0'}`}>
                <header className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-2xl border-b border-white/[0.04] px-10 py-4 flex justify-between items-center mb-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[#848484] hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all focus:outline-none shadow-sm"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col justify-center hidden sm:block">
                            <p className="text-[13px] font-medium text-[#848484] tracking-wide mb-0.5">Welcome back,</p>
                            <h2 className="text-[19px] font-bold text-[#EAEAEA] tracking-tight">System Administrator</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-7">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-3 text-[#848484] hover:text-[#C0DE1B] bg-white/[0.02] border border-white/[0.05] hover:border-[#C0DE1B]/30 hover:bg-[#C0DE1B]/5 rounded-xl transition-all focus:outline-none shadow-sm group"
                            >
                                <Bell className="w-[22px] h-[22px] transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-[#C0DE1B] text-[#0A0A0A] text-[11px] font-bold flex items-center justify-center rounded-full border-[3px] border-[#050505] shadow-[0_0_12px_rgba(192,222,24,0.6)]">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute top-16 right-0 w-80 bg-[#0A0A0A]/95 border border-white/[0.08] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl transform transition-all">
                                    <div className="p-5 border-b border-white/[0.05] flex justify-between items-center bg-[#121212]/50">
                                        <h3 className="text-[#EAEAEA] font-bold tracking-wide">Admin Alerts</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[11px] text-[#0A0A0A] font-extrabold bg-[#C0DE1B] px-2.5 py-1 rounded-md uppercase tracking-wider">{unreadCount} New</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={`p-5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${notif.is_read ? 'opacity-60' : 'bg-[#C0DE1B]/[0.03]'}`}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <Info className={`w-5 h-5 shrink-0 mt-0.5 ${notif.is_read ? 'text-[#666666]' : 'text-[#C0DE1B]'}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-[14px] font-bold tracking-wide ${notif.is_read ? 'text-[#848484]' : 'text-[#EAEAEA]'}`}>{notif.title}</p>
                                                            <p className="text-[12px] text-[#848484] mt-1.5 leading-relaxed font-medium">{notif.message}</p>
                                                            <p className="text-[10px] text-[#666666] uppercase tracking-widest mt-2.5 font-bold">{new Date(notif.created_at).toLocaleString()}</p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <button onClick={() => markAsRead(notif.id)} className="text-[#666666] hover:text-[#C0DE1B] hover:bg-[#C0DE1B]/10 p-1.5 rounded-lg transition-all" title="Mark as read">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center flex flex-col items-center">
                                                <Bell className="w-10 h-10 text-[#333333] mb-3" />
                                                <p className="text-[#848484] text-sm font-medium tracking-wide">No new alerts yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-8 bg-white/[0.06]"></div>

                        <div
                            onClick={() => navigate('/profile')}
                            title="Go to Admin Profile"
                            className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/[0.08] flex items-center justify-center text-[#EAEAEA] font-extrabold text-[15px] cursor-pointer hover:border-[#C0DE1B]/50 hover:text-[#C0DE1B] hover:shadow-[0_0_20px_rgba(192,222,24,0.2)] transition-all shadow-md transform hover:-translate-y-0.5"
                        >
                            AD
                        </div>
                    </div>
                </header>

                <main className="px-10 pb-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;