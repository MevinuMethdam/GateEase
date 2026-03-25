import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ResidentSidebar from '../components/ResidentSidebar';
import { Bell, Check, Info, Menu } from 'lucide-react'; // ⬅️ Menu අයිකන් එක එකතු කළා
import axios from 'axios';

const ResidentLayout = () => {
    const userName = localStorage.getItem('userName') || 'Resident';
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // ⬅️ Sidebar එක අරින්න/වහන්න අලුතින් State එකක් හැදුවා
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
        const interval = setInterval(fetchNotifications, 10000); // තත්පර 10න් 10ට අලුත් ඒවා බලනවා
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications(); // Refresh the list
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-dark-bg flex overflow-x-hidden">
            {/* ⬅️ Sidebar එකට isOpen State එක යවනවා, එතකොට ඒකත් හැංගෙන්න දන්නවා */}
            <ResidentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* ⬅️ Sidebar එක වැහුවම පිටුව Full Width වෙන්න ml-64 / ml-0 මාරු වෙන්න හැදුවා */}
            <div className={`flex-1 p-8 relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <header className="flex justify-between items-center mb-8">

                    {/* ⬅️ මෙතන තමයි අලුත් Menu Button එක දැම්මේ */}
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-dark-card border border-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Resident Portal</h2>
                            <p className="text-gray-500">Manage your apartment lifestyle</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-black text-[10px] font-bold flex items-center justify-center rounded-full border border-dark-bg">
                    {unreadCount}
                  </span>
                                )}
                            </button>

                            {/* Notification Dropdown Panel */}
                            {showNotifications && (
                                <div className="absolute top-12 right-0 w-80 bg-dark-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                                        <h3 className="text-white font-bold">Notifications</h3>
                                        <span className="text-xs text-primary font-medium">{unreadCount} New</span>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${notif.is_read ? 'opacity-60' : 'bg-primary/5'}`}>
                                                    <div className="flex justify-between items-start gap-3">
                                                        <Info className={`w-5 h-5 shrink-0 mt-0.5 ${notif.is_read ? 'text-gray-500' : 'text-primary'}`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-600 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <button onClick={() => markAsRead(notif.id)} className="text-gray-400 hover:text-primary transition-colors" title="Mark as read">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-gray-500 text-sm">No notifications yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Icon */}
                        <div
                            onClick={() => navigate('/resident/profile')}
                            title="Go to My Profile"
                            className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/30 transition-colors"
                        >
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <Outlet />
            </div>
        </div>
    );
};

export default ResidentLayout;