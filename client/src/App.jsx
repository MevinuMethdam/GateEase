import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "./pages/LandingPage";
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageResidents from './pages/admin/ManageResidents';
import PaymentsList from './pages/finance/PaymentsList';
import ComplaintsList from './pages/maintenance/ComplaintsList';
import ManageBookings from './pages/bookings/ManageBookings';
import ManageVisitors from './pages/security/ManageVisitors';
import ResidentLayout from './layouts/ResidentLayout';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import MyBills from './pages/resident/MyBills';
import MyComplaints from './pages/resident/MyComplaints';
import ManageUnits from './pages/admin/ManageUnits';
import MyBookings from './pages/resident/MyBookings';
import GateApprovals from './pages/resident/GateApprovals';
import ResidentProfile from './pages/resident/ResidentProfile';
import AdminProfile from './pages/admin/AdminProfile';
import ResidentRooms from './pages/resident/ResidentRooms';
import ManageRooms from './pages/admin/ManageRooms';

import MaintenanceLayout from './layouts/MaintenanceLayout';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* 🌟 ප්‍රධාන පිටුව (Landing Page) - දැන් මේක විතරයි "/" path එකට තියෙන්නේ */}
                <Route path="/" element={<LandingPage />} />

                {/* 🌟 Login පිටුව */}
                <Route path="/login" element={<Login />} />

                {/* 🌟 Admin Dashboard Layout (path="/" අයින් කරලා මේක Pathless Layout එකක් කළා) */}
                <Route element={<DashboardLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/rooms" element={<ManageRooms />} />
                    <Route path="/admin/units" element={<ManageUnits />} />
                    <Route path="/admin/residents" element={<ManageResidents />} />
                    <Route path="/finance/payments" element={<PaymentsList />} />
                    <Route path="/maintenance" element={<ComplaintsList />} />
                    <Route path="/bookings" element={<ManageBookings />} />
                    <Route path="/security" element={<ManageVisitors />} />
                    <Route path="/profile" element={<AdminProfile />} />
                </Route>

                {/* 🌟 Resident Layout */}
                <Route path="/resident" element={<ResidentLayout />}>
                    <Route index element={<ResidentDashboard />} />
                    <Route path="rooms" element={<ResidentRooms />} />
                    <Route path="bills" element={<MyBills />} />
                    <Route path="complaints" element={<MyComplaints />} />
                    <Route path="bookings" element={<MyBookings />} />
                    <Route path="visitors" element={<GateApprovals />} />
                    <Route path="profile" element={<ResidentProfile />} />
                </Route>

                {/* 🌟 Maintenance Layout */}
                <Route path="/maintenance-staff" element={<MaintenanceLayout />}>
                    <Route index element={<MaintenanceDashboard />} />
                </Route>

            </Routes>
        </Router>
    );
}

export default App;