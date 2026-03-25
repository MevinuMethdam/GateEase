import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, CreditCard, Wrench, Calendar, ShieldCheck, LogOut, Settings, X } from 'lucide-react';
// 🌟 NEW: Admin Sidebar එකේ තිබ්බ GateEase Logo එක මෙතනටත් ගත්තා
import brandLogo from '../assets/gateease-logo.png';

const ResidentSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    // 🌟 100% SAME TABS: Resident ගේ Tabs කිසිම දෙයක් වෙනස් කරේ නෑ
    const menuItems = [
        { icon: Home, label: 'My Dashboard', path: '/resident' },
        { icon: Compass, label: 'Explore Rooms', path: '/resident/rooms' },
        { icon: CreditCard, label: 'My Bills', path: '/resident/bills' },
        { icon: Wrench, label: 'My Complaints', path: '/resident/complaints' },
        { icon: Calendar, label: 'Book Facility', path: '/resident/bookings' },
        { icon: ShieldCheck, label: 'Gate Approvals', path: '/resident/visitors' },
        { icon: Settings, label: 'Settings', path: '/resident/profile' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        // 🌟 Admin Sidebar UI Styling (Glassmorphism + Dark Base)
        <div className={`h-screen w-[270px] bg-[#0A0A0A] border-r border-white/[0.04] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[4px_0_30px_rgba(0,0,0,0.8)]`}>

            <div className="p-7 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <img
                        src={brandLogo}
                        alt="GateEase Logo"
                        className="w-13 h-13 md:w-14 md:h-14 object-contain brightness-125 contrast-125 drop-shadow-[0_0_18px_rgba(192,222,24,0.6)] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_25px_rgba(192,222,24,0.8)] hover:brightness-150"
                    />
                    <span className="text-[28px] font-extrabold text-white tracking-tight">GateEase</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#666666] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/[0.05] md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-1.5 mt-4 overflow-y-auto px-5">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-all duration-300 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-[#C0DE1B]/15 to-[#C0DE1B]/5 text-[#C0DE1B] font-bold shadow-[inset_0px_0px_16px_rgba(192,222,24,0.08)] border border-[#C0DE1B]/20'
                                    : 'text-[#848484] hover:text-[#EAEAEA] hover:bg-white/[0.03] border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-[22px] h-[22px] shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_10px_rgba(192,222,24,0.5)] scale-110' : 'group-hover:scale-110'}`} />
                                <span className="truncate text-[15px] tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-7 mt-auto bg-gradient-to-t from-[#050505] to-transparent">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-2xl text-red-400/80 border border-red-500/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-bold shadow-sm group"
                >
                    <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                    <span className="tracking-wide">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default ResidentSidebar;