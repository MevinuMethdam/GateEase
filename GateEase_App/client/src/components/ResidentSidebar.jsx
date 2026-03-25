import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// ⬅️ මෙතනට X (Close) අයිකන් එක අලුතින් Import කළා
import { Home, CreditCard, Wrench, Calendar, ShieldCheck, LogOut, Settings, X } from 'lucide-react';

// ⬅️ Layout එකෙන් එවන isOpen සහ setIsOpen Props විදියට ගත්තා
const ResidentSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'My Dashboard', path: '/resident' },
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
        // ⬅️ CSS transitions (translate-x) දාලා ලස්සනට Slide වෙන්න හැදුවා
        <div className={`h-screen w-64 bg-dark-card border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-black" />
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

export default ResidentSidebar;