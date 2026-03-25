import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Wrench, LogOut } from 'lucide-react';

const MaintenanceLayout = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-dark-bg">
            {/* Sidebar */}
            <div className="w-64 bg-dark-card border-r border-white/5 p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-8 px-2 mt-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                        <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg tracking-wide block leading-tight">GateEase</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Maintenance</span>
                    </div>
                </div>

                <div className="px-3 mb-8 bg-white/5 py-3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">Logged in as</p>
                    <p className="text-white font-medium text-sm truncate">{userName}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 transition-all">
                        <Wrench className="w-5 h-5" /> My Tasks
                    </button>
                </nav>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors mt-auto font-medium">
                    <LogOut className="w-5 h-5" /> Log Out
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-dark-bg p-6 lg:p-10">
                <Outlet />
            </div>
        </div>
    );
};

export default MaintenanceLayout;