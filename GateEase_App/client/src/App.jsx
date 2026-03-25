import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminProfile from './pages/admin/AdminProfile';// ⬅️ අලුත් Profile පිටුව Import කළා

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* === ADMIN PORTAL ROUTES === */}
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/admin" replace />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="admin/units" element={<ManageUnits />} />
                    <Route path="admin/residents" element={<ManageResidents />} />
                    <Route path="finance/payments" element={<PaymentsList />} />
                    <Route path="maintenance" element={<ComplaintsList />} />
                    <Route path="bookings" element={<ManageBookings />} />
                    <Route path="security" element={<ManageVisitors />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

                {/* === RESIDENT PORTAL ROUTES === */}
                {/* === RESIDENT PORTAL ROUTES === */}
                <Route path="/resident" element={<ResidentLayout />}>
                    <Route index element={<ResidentDashboard />} />
                    <Route path="bills" element={<MyBills />} />
                    <Route path="complaints" element={<MyComplaints />} />
                    <Route path="bookings" element={<MyBookings />} />

                    {/* මෙන්න අලුත් Gate Approvals Route එක (පරණ එක මැකුවා) */}
                    <Route path="visitors" element={<GateApprovals />} />

                    {/* ⬅️ මෙන්න අලුත් Profile Route එක */}
                    <Route path="profile" element={<ResidentProfile />} />
                </Route>

            </Routes>
        </Router>
    );
}

export default App;