import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, AlertCircle, ShieldAlert, FileText, ArrowRight, Bell, Home, Key, Sparkles, TrendingUp, BarChart3, Receipt
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ResidentDashboard = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Resident';

    const [stats, setStats] = useState({
        totalDue: 0,
        activeComplaints: 0,
        pendingVisitors: 0,
        recentBills: []
    });
    const [notifications, setNotifications] = useState([]);
    const [approvedRooms, setApprovedRooms] = useState([]);

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

    const fetchNotifications = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
            setNotifications(response.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchApprovedRooms = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const reqRes = await axios.get(`http://localhost:5000/api/rooms/my-requests/${userId}`);
            const approvedReqs = reqRes.data.filter(r => r.status === 'Approved');

            if (approvedReqs.length > 0) {
                const roomRes = await axios.get('http://localhost:5000/api/rooms');
                const myApprovedRoomsList = approvedReqs.map(req => {
                    const myRoom = roomRes.data.find(r => r.id === req.room_id);
                    return myRoom ? { ...myRoom, unitNumber: req.assigned_unit || "Pending Assignment", reqId: req.id } : null;
                }).filter(room => room !== null);

                setApprovedRooms(myApprovedRoomsList);
            }
        } catch (error) {
            console.error("Error fetching approved rooms:", error);
        }
    };

    useEffect(() => {
        fetchResidentData();
        fetchNotifications();
        fetchApprovedRooms();
        const interval = setInterval(() => {
            fetchResidentData();
            fetchNotifications();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const [currentDate, setCurrentDate] = useState('');
    useEffect(() => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', options).toUpperCase());
    }, []);

    const getExpenseChartData = () => {
        if (!stats.recentBills || stats.recentBills.length === 0) return [];

        const dataMap = {};

        stats.recentBills.forEach(bill => {
            const dateStr = bill.due_date || bill.created_at;
            const date = dateStr ? new Date(dateStr) : new Date();
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!dataMap[monthYear]) {
                dataMap[monthYear] = { name: monthYear, Paid: 0, Pending: 0, sortDate: date.getTime() };
            }

            const amount = Number(bill.amount);
            if (bill.status === 'paid') {
                dataMap[monthYear].Paid += amount;
            } else {
                const balance = bill.balance !== undefined ? Number(bill.balance) : amount;
                dataMap[monthYear].Pending += balance;
                if (bill.status === 'partially_paid') {
                    dataMap[monthYear].Paid += (amount - balance);
                }
            }
        });

        return Object.values(dataMap)
            .sort((a, b) => a.sortDate - b.sortDate)
            .map(item => ({ name: item.name, Paid: item.Paid, Pending: item.Pending }));
    };

    const expenseData = getExpenseChartData();

    return (
        <div className="pb-10 max-w-7xl mx-auto font-sans relative z-10">

            <div className="mb-10 p-8 bg-black/40 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col items-start animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-[36px] md:text-[44px] font-extrabold text-[#EAEAEA] tracking-tight mb-3 drop-shadow-lg">
                    Hello, {userName}.
                </h1>
                <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-[#C0DE1B]"></div>
                    <p className="text-[#848484] text-xs font-medium tracking-widest uppercase">
                        <span className="text-white font-bold mr-2">{currentDate}</span>
                        | Here is your apartment overview
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">

                <div className="bg-[#0A0A0A] rounded-[24px] p-8 border border-white/[0.04] shadow-lg flex flex-col h-[320px] hover:border-white/[0.08] transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[17px] font-bold text-white flex items-center gap-2 tracking-tight">
                                <BarChart3 className="w-5 h-5 text-[#C0DE1B]" /> Monthly Expenses
                            </h3>
                            <p className="text-[11px] text-[#666666] uppercase tracking-widest font-bold mt-1.5">Payment History vs Pending</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        {expenseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenseData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#555555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#848484' }}/>
                                    <Bar dataKey="Paid" stackId="a" fill="#C0DE1B" radius={[0, 0, 4, 4]} barSize={24} />
                                    <Bar dataKey="Pending" stackId="a" fill="#222222" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111]/40 rounded-[16px] border border-white/[0.02]">
                                <div className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3 border border-white/[0.05] shadow-inner">
                                    <Receipt className="w-6 h-6 text-[#444444]" />
                                </div>
                                <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No Billing Data Yet</p>
                                <p className="text-[#555555] text-[11px] mt-1 text-center max-w-[200px]">Your monthly expense charts will appear here once an invoice is generated.</p>
                            </div>
                        )}
                    </div>
                </div>

                {approvedRooms.length > 0 ? (
                    approvedRooms.map((room, index) => (
                        <div key={room.reqId || index} className="bg-[#0A0A0A] rounded-[24px] p-8 border border-white/[0.04] shadow-lg flex flex-col relative overflow-hidden group hover:border-[#C0DE1B]/30 transition-all duration-500 h-[320px]">

                            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-bl from-[#C0DE1B]/[0.08] to-transparent rounded-full blur-[50px] pointer-events-none group-hover:from-[#C0DE1B]/[0.12] transition-colors duration-700"></div>

                            <div className="flex items-center gap-5 relative z-10 mb-auto">
                                <div className="w-14 h-14 bg-[#111111] border border-[#C0DE1B]/20 rounded-[16px] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(192,222,24,0.15)] transition-all duration-500">
                                    <Key className="w-6 h-6 text-[#C0DE1B]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-3 h-3 text-[#C0DE1B]" />
                                        <p className="text-[#848484] text-[10px] font-bold uppercase tracking-widest">Primary Residence</p>
                                    </div>
                                    <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#EAEAEA] tracking-tight leading-tight">{room.title}</h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10 mt-6">
                                <div className="bg-[#111111]/80 flex-1 px-5 py-4 rounded-[16px] border border-white/[0.03] flex justify-between items-center group-hover:bg-[#111111] transition-colors">
                                    <p className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C0DE1B] shadow-[0_0_5px_#C0DE1B] animate-pulse"></div>
                                        <p className="text-[#C0DE1B] text-xs font-extrabold tracking-wide">ACTIVE</p>
                                    </div>
                                </div>

                                <div className="bg-[#111111]/80 flex-1 px-5 py-4 rounded-[16px] border border-white/[0.03] flex justify-between items-center group-hover:bg-[#111111] transition-colors">
                                    <p className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">Unit</p>
                                    <p className="text-[#EAEAEA] text-sm font-extrabold tracking-tight">{room.unitNumber}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-[#0A0A0A] rounded-[24px] p-8 border border-white/[0.04] shadow-lg flex flex-col items-center justify-center text-center h-[320px]">
                        <div className="w-14 h-14 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 border border-white/[0.05]">
                            <Home className="w-6 h-6 text-[#555555]" />
                        </div>
                        <h3 className="text-[#EAEAEA] font-bold text-[17px] tracking-tight">No Active Residence</h3>
                        <p className="text-[#666666] text-[13px] mt-1.5 max-w-[250px]">You haven't been assigned an apartment unit by the admin yet.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-30">
                <div onClick={() => navigate('/resident/bills')} className="group relative bg-[#0A0A0A] rounded-[24px] p-6 border border-white/[0.04] hover:border-red-500/20 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[180px] shadow-lg cursor-pointer">
                    <div className="flex justify-between items-start z-10">
                        <div className="w-10 h-10 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center group-hover:border-red-500/30 transition-colors">
                            <Wallet className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-red-500 blur-[70px] opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none"></div>
                    <div className="mt-auto pt-6 z-10">
                        <p className="text-[#666666] text-[10px] uppercase tracking-widest mb-1.5 font-bold">Total Due to Pay</p>
                        <h3 className="text-[28px] font-extrabold text-[#EAEAEA] tracking-tight flex items-baseline gap-1.5">
                            <span className="text-[11px] text-[#555555] font-semibold tracking-widest uppercase">LKR</span> {Number(stats.totalDue).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div onClick={() => navigate('/resident/complaints')} className="group relative bg-[#0A0A0A] rounded-[24px] p-6 border border-white/[0.04] hover:border-yellow-500/20 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[180px] shadow-lg cursor-pointer">
                    <div className="flex justify-between items-start z-10">
                        <div className="w-10 h-10 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center group-hover:border-yellow-500/30 transition-colors">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-yellow-500 blur-[70px] opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none"></div>
                    <div className="mt-auto pt-6 z-10">
                        <p className="text-[#666666] text-[10px] uppercase tracking-widest mb-1.5 font-bold">Active Complaints</p>
                        <h3 className="text-[28px] font-extrabold text-[#EAEAEA] tracking-tight">
                            {stats.activeComplaints}
                        </h3>
                    </div>
                </div>

                <div onClick={() => navigate('/resident/visitors')} className="group relative bg-[#0A0A0A] rounded-[24px] p-6 border border-white/[0.04] hover:border-[#C0DE1B]/20 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[180px] shadow-lg cursor-pointer">
                    <div className="flex justify-between items-start z-10">
                        <div className="w-10 h-10 rounded-full bg-[#111111] border border-white/[0.05] flex items-center justify-center group-hover:border-[#C0DE1B]/30 transition-colors">
                            <ShieldAlert className="w-4 h-4 text-[#C0DE1B]" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#C0DE1B] blur-[70px] opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none"></div>
                    <div className="mt-auto pt-6 z-10">
                        <p className="text-[#666666] text-[10px] uppercase tracking-widest mb-1.5 font-bold">Pending Entries</p>
                        <h3 className="text-[28px] font-extrabold text-[#EAEAEA] tracking-tight">
                            {stats.pendingVisitors}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0A0A0A] rounded-[24px] border border-white/[0.04] p-8 shadow-lg relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-[17px] font-bold text-[#EAEAEA] flex items-center gap-3 tracking-tight">
                            <FileText className="w-4 h-4 text-[#C0DE1B]" />
                            Recent Invoices
                        </h3>
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        {stats.recentBills.length > 0 ? (
                            stats.recentBills.map((bill, index) => (
                                <div key={index} onClick={() => navigate('/resident/bills')} className="flex items-center justify-between p-4 rounded-[16px] bg-[#111111]/50 border border-white/[0.02] hover:bg-[#111111] hover:border-white/[0.05] transition-all duration-300 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-[9px] shadow-inner transition-transform duration-300 ${
                                            bill.status === 'paid' ? 'bg-[#0A0A0A] border-green-500/20 text-green-500' : 'bg-[#0A0A0A] border-red-500/20 text-red-500'
                                        }`}>
                                            LKR
                                        </div>
                                        <div>
                                            <p className="text-[#EAEAEA] font-semibold text-[14px] leading-none mb-1.5">Rent Fee</p>
                                            <p className="text-[11px] text-[#666666] font-medium leading-none">Due: <span className="text-[#848484]">{new Date(bill.due_date).toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <h4 className="text-[15px] font-extrabold text-[#EAEAEA] leading-none">LKR {Number(bill.amount).toLocaleString()}</h4>
                                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                            bill.status === 'paid' ? 'bg-[#0A0A0A] text-green-400 border-green-500/20' : 'bg-[#0A0A0A] text-red-400 border-red-500/20'
                                        }`}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-[#111111]/30 rounded-[16px] border border-white/[0.02] border-dashed h-full flex flex-col items-center justify-center">
                                <p className="text-[#666666] text-sm font-medium tracking-wide">No recent bills found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-[24px] border border-white/[0.04] p-8 shadow-lg relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-[17px] font-bold text-[#EAEAEA] flex items-center gap-3 tracking-tight">
                            <Bell className="w-4 h-4 text-blue-500" />
                            Activity Stream
                        </h3>
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-[#111111]/50 border border-white/[0.02] hover:bg-[#111111] hover:border-white/[0.05] transition-all duration-300 gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full bg-[#0A0A0A] border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bell className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[#EAEAEA] font-semibold text-[13px] leading-tight mb-1">{notif.title}</p>
                                            <p className="text-[11px] text-[#666666] leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                    <div className="sm:text-right shrink-0 ml-12 sm:ml-0">
                                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#0A0A0A] border border-white/[0.05] text-[#848484]">
                                            {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just Now'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-[#111111]/30 rounded-[16px] border border-white/[0.02] border-dashed h-full flex items-center justify-center">
                                <p className="text-[#666666] text-sm font-medium tracking-wide">No new notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentDashboard;