import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Users, Wallet, AlertCircle, ShieldAlert } from 'lucide-react';
import adminBannerImg from '../../assets/admin-banner.png';

const GaugeCard = ({ title, value, max, prefix = '', suffix = '', desc, colorClass, highlightClass, Icon }) => {
    const percentage = Math.min((Number(value) / max) * 100, 100);
    const arcLength = 125.66;
    const strokeOffset = arcLength - (percentage / 100) * arcLength;

    return (
        <div className="group relative bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[28px] p-6 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden flex flex-col items-center justify-between min-h-[250px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.8)] z-10 hover:z-20">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            {Icon && (
                <div className={`absolute top-5 left-5 w-11 h-11 rounded-full bg-[#050505]/80 flex items-center justify-center border border-white/[0.08] backdrop-blur-md z-10 transition-all duration-500 group-hover:scale-110 group-hover:border-white/[0.15] shadow-lg ${colorClass}`}>
                    <Icon className="w-5 h-5 drop-shadow-md" />
                </div>
            )}

            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[70px] opacity-[0.12] group-hover:opacity-[0.25] transition-all duration-700 ${highlightClass} group-hover:scale-150`}></div>

            <div className="relative w-full aspect-[2/1] mt-7">
                <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible drop-shadow-2xl">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#848484"
                        strokeOpacity="0.12"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="1 6"
                    />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        className={colorClass}
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeOffset}
                        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.25, 1, 0.25, 1)' }}
                    />
                </svg>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
                    <p className="text-[#848484] text-[10px] uppercase tracking-[0.25em] mb-1 font-bold group-hover:text-[#A0A0A0] transition-colors">{title}</p>
                    <h3 className="text-[32px] font-extrabold text-[#EAEAEA] tracking-tight flex items-baseline justify-center gap-1">
                        {prefix && <span className="text-sm text-[#848484] font-medium tracking-normal">{prefix}</span>}
                        {Number(value).toLocaleString()}
                        {suffix && <span className={`text-sm tracking-normal ${colorClass}`}>{suffix}</span>}
                    </h3>
                </div>
            </div>

            <p className="text-[#666666] text-xs text-center mt-5 leading-relaxed max-w-[200px] font-medium group-hover:text-[#848484] transition-colors duration-500">
                {desc}
            </p>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalResidents: 0,
        pendingComplaints: 0,
        totalRevenue: 0,
        pendingVisitors: 0,
        recentActivities: []
    });

    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', options));

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/dashboard');
                setStats({
                    totalResidents: response.data.totalResidents || 0,
                    pendingComplaints: response.data.pendingComplaints || 0,
                    totalRevenue: response.data.totalRevenue || 0,
                    pendingVisitors: response.data.pendingVisitors || 0,
                    recentActivities: response.data.recentActivities || []
                });
            } catch (error) { console.error('Error fetching dashboard stats:', error); }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-10">

            {/* Enhanced Cinematic Banner */}
            <div className="relative h-[340px] rounded-[32px] overflow-hidden bg-[#030303] border border-white/[0.04] mb-8 shadow-[0_20px_50px_rgb(0,0,0,0.6)] group">
                <div
                    className="absolute inset-0 bg-center bg-cover blur-[15px] opacity-40 scale-105 transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url(${adminBannerImg})` }}
                ></div>

                {/* Refined Gradients for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/40 to-transparent z-10"></div>

                <img
                    src={adminBannerImg}
                    alt="Workspace"
                    className="h-full w-full object-cover relative z-0 opacity-60 mix-blend-luminosity transition-transform duration-1000 group-hover:scale-105"
                />

                <div className="absolute top-16 left-12 z-20">
                    <h1 className="text-[56px] leading-tight font-extrabold tracking-tighter mb-2 bg-gradient-to-br from-white via-[#EAEAEA] to-[#848484] bg-clip-text text-transparent drop-shadow-lg">
                        System Overview.
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-10 bg-gradient-to-r from-[#C0DE1B] to-transparent"></div>
                        <p className="text-[#A0A0A0] font-medium text-sm tracking-widest uppercase">
                            {currentDate}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-30 -mt-28 px-4">
                <GaugeCard
                    title="Total Residents"
                    value={stats.totalResidents}
                    max={100}
                    desc="Current community occupancy vs estimated capacity."
                    colorClass="text-[#C0DE1B]"
                    highlightClass="bg-[#C0DE1B]"
                    Icon={Users}
                />
                <GaugeCard
                    title="Total Revenue"
                    value={stats.totalRevenue}
                    max={15000000}
                    prefix="LKR "
                    desc="Monthly maintenance fee collection progress."
                    colorClass="text-[#10B981]"
                    highlightClass="bg-[#10B981]"
                    Icon={Wallet}
                />
                <GaugeCard
                    title="Active Issues"
                    value={stats.pendingComplaints}
                    max={20}
                    desc="Unresolved complaints requiring maintenance attention."
                    colorClass="text-[#F59E0B]"
                    highlightClass="bg-[#F59E0B]"
                    Icon={AlertCircle}
                />
                <GaugeCard
                    title="Pending Entries"
                    value={stats.pendingVisitors}
                    max={15}
                    desc="Visitors at the gate waiting for resident approval."
                    colorClass="text-[#EF4444]"
                    highlightClass="bg-[#EF4444]"
                    Icon={ShieldAlert}
                />
            </div>
            <div className="bg-[#080808] rounded-[32px] border border-white/[0.05] p-8 shadow-[0_10px_40px_rgb(0,0,0,0.5)] relative overflow-hidden mx-4">

                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-[#C0DE1B]/[0.05] to-transparent rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-xl font-bold text-[#EAEAEA] flex items-center gap-4 tracking-tight">
                        <div className="w-11 h-11 rounded-[14px] bg-[#121212] flex items-center justify-center border border-white/[0.08] shadow-inner">
                            <Clock className="w-5 h-5 text-[#C0DE1B]" />
                        </div>
                        Recent Activity Log
                    </h3>
                    <div className="px-4 py-1.5 rounded-full bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 flex items-center gap-2 shadow-[0_0_15px_rgba(192,222,24,0.1)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C0DE1B] animate-pulse"></div>
                        <span className="text-[10px] text-[#C0DE1B] uppercase tracking-widest font-bold">Live</span>
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    {stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-transparent hover:border-white/[0.05] hover:bg-[#121212] transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 cursor-default">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/[0.08] flex items-center justify-center text-[#C0DE1B] font-bold text-lg shadow-inner group-hover:scale-105 group-hover:border-[#C0DE1B]/30 transition-all duration-300">
                                        {activity.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[#EAEAEA] font-semibold text-[15px] group-hover:text-white transition-colors">{activity.name}</p>
                                        <p className="text-[12px] text-[#666666] mt-0.5 font-medium group-hover:text-[#848484] transition-colors">Unit: <span className="text-[#A0A0A0]">{activity.unit_number || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-semibold text-[#848484] bg-[#050505] border border-white/[0.05] px-4 py-2 rounded-full shadow-inner group-hover:border-white/[0.1] transition-all">
                                    {new Date(activity.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white/[0.01] rounded-2xl border border-white/[0.05] border-dashed">
                            <p className="text-[#666666] text-sm font-medium tracking-wide">No recent activities found in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;