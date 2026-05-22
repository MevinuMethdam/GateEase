import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const MaintenanceLayout = () => {
    return (
        <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#C0DE1B] selection:text-black">
            <div className="w-full h-screen overflow-y-auto custom-scrollbar relative">
                <Outlet />
            </div>

        </div>
    );
};

export default MaintenanceLayout;