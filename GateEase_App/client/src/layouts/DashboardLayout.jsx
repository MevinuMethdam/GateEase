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

    // 🛠️ අලුත් කෑල්ල: Token එක නැත්නම් Login එකට යවනවා (Route Protection)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("❌ Token එකක් නෑ! Login පිටුවට යවනවා...");
            navigate('/login');
        }
    }, [navigate]);

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId || payload.adminId || payload.user_id || payload.admin_id || null;
        } catch (e) {
            console.error("Token decode error:", e);
            return null;
        }
    };

    const fetchNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        // Token එක තියෙනවා නම් විතරක් Notifications ගේන්න කතා කරනවා
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
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-dark-bg flex overflow-x-hidden font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-dark-card border border-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Overview</h2>
                            <p className="text-gray-text">Welcome back, Admin</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative z-50">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-black text-[10px] font-bold flex items-center justify-center rounded-full border border-dark-bg shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute top-12 right-0 w-80 bg-dark-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                                        <h3 className="text-white font-bold">Admin Alerts</h3>
                                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md">{unreadCount} New</span>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${notif.is_read ? 'opacity-60' : 'bg-primary/5'}`}>
                                                    <div className="flex justify-between items-start gap-3">
                                                        <Info className={`w-5 h-5 shrink-0 mt-0.5 ${notif.is_read ? 'text-gray-500' : 'text-primary'}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-bold ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-600 mt-2 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <button onClick={() => markAsRead(notif.id)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Mark as read">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center">
                                                <Bell className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
                                                <p className="text-gray-500 text-sm">No new alerts yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => navigate('/profile')}
                            title="Go to Admin Profile"
                            className="w-10 h-10 rounded-full bg-dark-input border border-white/10 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-colors"
                        >
                            AD
                        </div>
                    </div>
                </header>
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;