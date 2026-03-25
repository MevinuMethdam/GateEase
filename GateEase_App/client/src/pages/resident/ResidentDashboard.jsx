import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, AlertCircle, ShieldAlert, FileText, ArrowRight, Bell } from 'lucide-react'; // Bell අයිකන් එක අලුතින් ගත්තා
import { useNavigate } from 'react-router-dom';

const ResidentDashboard = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Resident';

    const [stats, setStats] = useState({
        totalDue: 0,
        activeComplaints: 0,
        pendingVisitors: 0,
        recentBills: []
    });

    // අලුතින් Notifications ගබඩා කරන්න State එකක්
    const [notifications, setNotifications] = useState([]);

    // Token එකෙන් User ID එක හොයාගන්නා ක්‍රමය (JWT Decode)
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const fetchResidentData = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/dashboard/resident/${userId}`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching resident stats:', error);
        }
    };

    // අලුතින් Notifications Fetch කරන Function එක
    const fetchNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            // මෙන්න මේ URL එකට තමයි 'user/' කියන කෑල්ල අලුතින් දැම්මේ
            const response = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
            // අලුත්ම Notifications 5 විතරක් Dashboard එකේ පෙන්වන්න වෙන් කරගන්නවා
            setNotifications(response.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchResidentData();
        fetchNotifications(); // Load වෙද්දිම Notifications ගන්නවා

        const interval = setInterval(() => {
            fetchResidentData();
            fetchNotifications(); // තත්පර 5න් 5ට අලුත් Notifications ආවද බලනවා
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Hello, {userName}! 👋</h2>
                <p className="text-gray-400">Here is what's happening in your apartment today.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Unpaid Bills Card */}
                <div className="bg-dark-card rounded-3xl p-6 border border-red-500/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] transition-all group-hover:bg-red-500/20"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Due to Pay</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
                                <span className="text-lg text-gray-400">LKR</span> {Number(stats.totalDue).toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                    <button onClick={() => navigate('/resident/bills')} className="mt-6 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                        Pay Now <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Active Complaints Card */}
                <div className="bg-dark-card rounded-3xl p-6 border border-yellow-500/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] transition-all group-hover:bg-yellow-500/20"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Active Complaints</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.activeComplaints}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <button onClick={() => navigate('/resident/complaints')} className="mt-6 text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                        View Status <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Pending Visitors Card */}
                <div className="bg-dark-card rounded-3xl p-6 border border-primary/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] transition-all group-hover:bg-primary/20"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Gate Approvals</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.pendingVisitors}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                    </div>
                    <button onClick={() => navigate('/resident/visitors')} className="mt-6 text-sm text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                        Review Entries <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>

            {/* Recent Bills Section */}
            <div className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-2xl mb-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    Recent Invoices
                </h3>

                <div className="space-y-3">
                    {stats.recentBills.length > 0 ? (
                        stats.recentBills.map((bill, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-dark-bg/50 border border-white/5 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                        bill.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        LKR
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-base">Maintenance Fee</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <h4 className="text-lg font-bold text-white">LKR {Number(bill.amount).toLocaleString()}</h4>
                                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                                        bill.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {bill.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-dark-bg/30 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-gray-500 text-sm">No recent bills found. You are all caught up!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔔 අලුතින් එකතු කළ Recent Notifications Section එක */}
            <div className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-500" />
                    </div>
                    Recent Notifications
                </h3>

                <div className="space-y-3">
                    {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-dark-bg/50 border border-white/5 hover:bg-white/5 transition-all gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                                        <Bell className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-base">{notif.title}</p>
                                        <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right shrink-0 ml-14 sm:ml-0">
                                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400">
                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just Now'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-dark-bg/30 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-gray-500 text-sm">You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ResidentDashboard;