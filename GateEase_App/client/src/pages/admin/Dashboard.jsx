import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Users, Wallet, AlertCircle, ShieldAlert } from 'lucide-react';
// ⬇️ අලුත් Banner පින්තූරය Import කළා
import adminBannerImg from '../../assets/admin-banner.png';

// --- අලුතින් හදපු ලස්සන Gauge Chart Component එක (Icon එකත් එක්ක) ---
const GaugeCard = ({ title, value, max, prefix = '', suffix = '', desc, colorClass, highlightClass, Icon }) => {
    const percentage = Math.min((Number(value) / max) * 100, 100);
    const arcLength = 125.66;
    const strokeOffset = arcLength - (percentage / 100) * arcLength;

    return (
        <div className="bg-dark-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col items-center justify-between min-h-[250px] shadow-2xl transition-transform hover:scale-[1.02]">

            {/* Top Left Icon Badge (ඔයා ඉල්ලපු අලුත් කෑල්ල) */}
            {Icon && (
                <div className={`absolute top-5 left-5 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md z-10 ${colorClass}`}>
                    <Icon className="w-5 h-5 drop-shadow-lg" />
                </div>
            )}

            {/* Background Glow Effect */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[70px] opacity-20 ${highlightClass}`}></div>

            {/* SVG Semi-Circle Chart */}
            <div className="relative w-full aspect-[2/1] mt-4">
                <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible drop-shadow-lg">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#ffffff10"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="2 6"
                    />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        className={colorClass}
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeOffset}
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>

                {/* මැද තියෙන අකුරු සහ ගණන් */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full mt-2">
                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">{title}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight flex items-baseline justify-center gap-1">
                        {prefix && <span className="text-lg text-gray-400">{prefix}</span>}
                        {Number(value).toLocaleString()}
                        {suffix && <span className="text-lg text-primary">{suffix}</span>}
                    </h3>
                </div>
            </div>

            {/* යටින් තියෙන විස්තරය */}
            <p className="text-gray-500 text-xs text-center mt-6 leading-relaxed max-w-[200px]">
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
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-8 font-sans">

            {/* ================================================================================== */}
            {/* ⬇️ අලුතින් එකතු කළ BANNER කොටස (Sonola Style) ⬇️ */}
            {/* ================================================================================== */}
            <div className="mb-8 relative h-56 rounded-[32px] overflow-hidden bg-[#0A0A0A] flex items-center justify-center shadow-2xl border border-white/5 group">

                {/* A. පසුබිම් Blur Effect එක (රූපයම පාවිච්චි කරලා හදන Glow එක) */}
                <div
                    className="absolute inset-0 bg-center bg-cover blur-[60px] opacity-40 scale-110 transition-transform duration-700 group-hover:scale-125"
                    style={{ backgroundImage: `url(${adminBannerImg})` }}
                ></div>

                {/* B. දාරවල් Blend කරන්න දාන සියුම් කළු Gradient එක */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-dark-bg/80 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg/80 z-10"></div>

                {/* C. මැද තියෙන ප්‍රධාන පින්තූරය (පැහැදිලිව පෙනෙන) */}
                <img
                    src={adminBannerImg}
                    alt="Admin Workspace"
                    // ⬇️ මෙන්න මෙතන 'object-contain' වෙනුවට 'object-cover' දැම්මා, සහ 'w-full' එකතු කළා
                    className="h-full w-full object-cover relative z-20 transition-transform duration-700 group-hover:scale-105 rounded-[32px]"
                />
            </div>
            {/* ================================================================================== */}
            {/* ⬆️ BANNER කොටස අවසන් ⬆️ */}
            {/* ================================================================================== */}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <GaugeCard
                    title="Total Residents"
                    value={stats.totalResidents}
                    max={100}
                    desc="Current community occupancy out of 100 estimated capacity."
                    colorClass="text-primary"
                    highlightClass="bg-primary"
                    Icon={Users}
                />

                <GaugeCard
                    title="Total Revenue"
                    value={stats.totalRevenue}
                    max={150000}
                    prefix="LKR "
                    desc="Monthly maintenance fee collection progress."
                    colorClass="text-green-400"
                    highlightClass="bg-green-400"
                    Icon={Wallet}
                />

                <GaugeCard
                    title="Active Issues"
                    value={stats.pendingComplaints}
                    max={20}
                    desc="Unresolved complaints that require maintenance attention."
                    colorClass="text-yellow-400"
                    highlightClass="bg-yellow-400"
                    Icon={AlertCircle}
                />

                <GaugeCard
                    title="Pending Gate Entries"
                    value={stats.pendingVisitors}
                    max={15}
                    desc="Visitors at the gate waiting for resident approval."
                    colorClass="text-red-400"
                    highlightClass="bg-red-400"
                    Icon={ShieldAlert}
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                    </div>
                    Community Join Logs
                </h3>

                <div className="space-y-3 relative z-10">
                    {stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-dark-bg/50 border border-white/5 hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                        {activity.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-base group-hover:text-primary transition-colors">{activity.name}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">Assigned to: <span className="text-gray-400">{activity.unit_number || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-medium text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                                    {new Date(activity.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-dark-bg/30 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-gray-500 text-sm">No recent activities found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;