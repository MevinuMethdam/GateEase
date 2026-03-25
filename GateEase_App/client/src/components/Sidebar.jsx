import Logo from './Logo';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// ⬅️ මෙතනට X (Close) අයිකන් එක අලුතින් Import කළා
import { LayoutDashboard, Users, CreditCard, Wrench, Calendar, ShieldCheck, LogOut, Settings, X } from 'lucide-react';

// ⬅️ Layout එකෙන් එවන isOpen සහ setIsOpen Props විදියට ගත්තා
const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Residents & Units', path: '/admin/units' },
        { icon: Users, label: 'Residents', path: '/admin/residents' },// Member 1
        { icon: CreditCard, label: 'Payments', path: '/finance/payments' },    // Member 2
        { icon: Wrench, label: 'Maintenance', path: '/maintenance' },          // Member 3
        { icon: Calendar, label: 'Bookings', path: '/bookings' },              // Member 4
        { icon: ShieldCheck, label: 'Gate Security', path: '/security' },      // Member 5
        // ⬅️ මෙන්න අලුත් Settings Tab එක (Admin Profile එකට ලින්ක් කරලා)
        { icon: Settings, label: 'Settings', path: '/profile' },
    ];

    const handleLogout = () => {
        // Logout logic here
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        // ⬅️ CSS transitions (translate-x) දාලා ලස්සනට Slide වෙන්න හැදුවා, z-50 දැම්මා
        <div className={`h-screen w-64 bg-dark-card border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">GateEase</span>
                </div>
                {/* ⬅️ Sidebar එක ඇතුලෙන් වහන්න පුළුවන් Close Button එක දැම්මා */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
                    title="Close Sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? 'bg-primary text-black font-semibold shadow-[0_0_15px_rgba(192,222,24,0.4)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        {/* ⬅️ shrink-0 දැම්මේ Animation වෙද්දී අයිකන් එක පොඩි නොවී තියෙන්නයි */}
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;