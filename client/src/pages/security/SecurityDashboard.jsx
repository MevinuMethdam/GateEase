import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import { ShieldCheck, UserPlus, User, Car, Edit2, Trash2, Check, X, CreditCard, AlertCircle, QrCode, CheckCircle, XCircle, Search, LogOut, UserCircle, Key, Eye, EyeOff } from 'lucide-react';

const SecurityDashboard = () => {

    const [visitors, setVisitors] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({
        resident_id: '', visitor_name: '', vehicle_number: '', nic: ''
    });
    const [editingVisitor, setEditingVisitor] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [manualToken, setManualToken] = useState('');

    // Profile & Password Update States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

    // Show/Hide Password States
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fetchData = async () => {
        try {
            const resVisitors = await axios.get('http://localhost:5000/api/visitors');
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            setVisitors(resVisitors.data);
            setResidents(resResidents.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const validateForm = () => {
        const errors = {};
        if (!formData.visitor_name.trim()) errors.visitor_name = "Visitor name is required";
        const nicRegex = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;
        if (!formData.nic) {
            errors.nic = "NIC number is required";
        } else if (!nicRegex.test(formData.nic)) {
            errors.nic = "Invalid NIC format (Should be 123456789V or 12 digits)";
        }
        if (!formData.resident_id) errors.resident_id = "Please select a resident";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            await axios.post('http://localhost:5000/api/visitors', formData);
            alert('✅ Visitor logged successfully! Pending resident approval.');
            setFormData({ resident_id: '', visitor_name: '', vehicle_number: '', nic: '' });
            setFormErrors({});
            fetchData();
        } catch (error) {
            alert('❌ Failed to log visitor.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gate log?')) {
            try {
                await axios.delete(`http://localhost:5000/api/visitors/${id}`);
                fetchData();
                alert('✅ Gate log deleted successfully!');
            } catch (error) {
                alert('❌ Failed to delete gate log');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/visitors/${editingVisitor.id}`, {
                visitor_name: editingVisitor.visitor_name,
                vehicle_number: editingVisitor.vehicle_number,
                approval_status: editingVisitor.approval_status
            });
            setEditingVisitor(null);
            fetchData();
            alert('✅ Gate log updated successfully!');
        } catch (error) {
            alert('❌ Failed to update gate log');
        }
    };

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const scanLock = useRef(false);

    const verifyPassToken = async (tokenStr) => {
        if (!tokenStr) return;

        scanLock.current = true;
        setIsCaptured(true);

        try {
            const res = await axios.post('http://localhost:5000/api/visitors/passes/verify', {
                pass_token: tokenStr
            });

            setScanResult({
                success: true,
                message: res.data.message,
                visitor: res.data.visitor,
                unit: res.data.unit,
                resident: res.data.resident
            });
            fetchData();

        } catch (err) {
            setScanResult({
                success: false,
                message: err.response?.data?.message || 'Verification Failed'
            });
        }
    };

    const handleScan = async (result, error) => {
        const token = result?.text || result?.data || (typeof result === 'string' ? result : null);
        if (token && !scanLock.current) {
            verifyPassToken(token);
        }
    };

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (manualToken.trim() && !scanLock.current) {
            verifyPassToken(manualToken.trim());
        }
    };

    const handleScanAnother = () => {
        setScanResult(null);
        setIsCaptured(false);
        setManualToken('');
        setTimeout(() => {
            scanLock.current = false;
        }, 1000);
    };

    const closeScanner = () => {
        setIsScannerOpen(false);
        setScanResult(null);
        setIsCaptured(false);
        setManualToken('');
        scanLock.current = false;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login';
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match!' });
            return;
        }

        setIsUpdatingPwd(true);
        setPasswordStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put('http://localhost:5000/api/users/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, config);

            setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            setPasswordStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update password.' });
        } finally {
            setIsUpdatingPwd(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#EAEAEA] p-4 md:p-8 font-sans selection:bg-[#C0DE1B] selection:text-black">

            <div className="max-w-[1600px] mx-auto">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-[#0A0A0A] p-6 md:px-8 rounded-[24px] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 ease-out">

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-transparent border border-[#C0DE1B]/30 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck className="text-[#C0DE1B] w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gate Security Terminal</h1>
                            <p className="text-[#888] text-[10px] font-bold uppercase tracking-widest mt-1">ACTIVE DUTY: SECURITY PERSONNEL</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => { setIsScannerOpen(true); setIsCaptured(false); scanLock.current = false; setManualToken(''); }}
                            className="bg-[#C0DE1B] hover:bg-[#aacc15] text-black font-extrabold px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:-translate-y-0.5 mr-2"
                        >
                            <QrCode className="w-5 h-5" /> Scan VIP Pass
                        </button>

                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="p-3.5 bg-white/5 border border-white/10 rounded-[14px] hover:bg-white/10 transition-colors text-[#888] hover:text-white"
                            title="Security Profile"
                        >
                            <UserCircle className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-3.5 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-[14px] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
                            title="Log Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative w-full h-48 md:h-64 rounded-[32px] overflow-hidden mb-10 border border-white/5 shadow-2xl group animate-in fade-in zoom-in-95 duration-1000 ease-out">
                    <div className="absolute inset-0 bg-[#050505]">
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40 z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=2070&auto=format&fit=crop"
                            alt="Operations Background"
                            className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-1000"
                        />
                    </div>

                    <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg animate-in slide-in-from-left-8 duration-1000 delay-150">
                            Security Command.
                        </h1>
                        <div className="flex items-center gap-4 animate-in slide-in-from-left-8 duration-1000 delay-300">
                            <div className="w-12 h-1 bg-[#C0DE1B] rounded-full shadow-[0_0_15px_#C0DE1B] relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 w-full h-full animate-pulse"></div>
                            </div>
                            <p className="text-[#C0DE1B] font-bold text-xs md:text-sm uppercase tracking-[0.3em]">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5 h-fit">
                        <h3 className="text-xl font-extrabold text-white mb-6">Log Manual Entry</h3>
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Visitor Name</label>
                                <div className="relative group">
                                    <User className={`absolute left-4 top-4 w-5 h-5 transition-colors ${formErrors.visitor_name ? 'text-red-500' : 'text-gray-500'}`} />
                                    <input type="text" placeholder="e.g. Nimal Perera" value={formData.visitor_name}
                                           onChange={(e) => {setFormData({ ...formData, visitor_name: e.target.value }); setFormErrors({...formErrors, visitor_name: null});}}
                                           className={`w-full bg-[#050505] text-white pl-12 pr-4 py-4 rounded-xl border outline-none transition-all ${formErrors.visitor_name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/50 shadow-inner'}`} />
                                </div>
                                {formErrors.visitor_name && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.visitor_name}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">NIC Number</label>
                                <div className="relative group">
                                    <CreditCard className={`absolute left-4 top-4 w-5 h-5 transition-colors ${formErrors.nic ? 'text-red-500' : 'text-gray-500'}`} />
                                    <input type="text" placeholder="e.g. 981234567V or 12 digits" value={formData.nic}
                                           onChange={(e) => {setFormData({ ...formData, nic: e.target.value }); setFormErrors({...formErrors, nic: null});}}
                                           className={`w-full bg-[#050505] text-white pl-12 pr-4 py-4 rounded-xl border outline-none transition-all ${formErrors.nic ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/50 shadow-inner'}`} />
                                </div>
                                {formErrors.nic && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.nic}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vehicle Number (Optional)</label>
                                <div className="relative">
                                    <Car className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                    <input type="text" placeholder="e.g. CBA-1234" value={formData.vehicle_number}
                                           onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                           className="w-full bg-[#050505] text-white pl-12 pr-4 py-4 rounded-xl border border-white/5 outline-none focus:border-[#C0DE1B]/50 shadow-inner" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Visiting Whom?</label>
                                <select value={formData.resident_id} onChange={(e) => {setFormData({ ...formData, resident_id: e.target.value }); setFormErrors({...formErrors, resident_id: null});}}
                                        className={`w-full bg-[#050505] text-white px-4 py-4 rounded-xl border outline-none appearance-none cursor-pointer transition-all shadow-inner ${formErrors.resident_id ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#C0DE1B]/50'}`}>
                                    <option value="">-- Select Resident --</option>
                                    {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                {formErrors.resident_id && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.resident_id}</p>}
                            </div>

                            <button type="submit" className="w-full bg-[#C0DE1B] hover:bg-[#aacc15] text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(192,222,24,0.3)]">
                                <UserPlus className="w-5 h-5" /> Request Entry
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5">
                        <h3 className="text-xl font-extrabold text-white mb-6">Today's Gate Log</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                    <th className="pb-4 pl-2">Visitor Details</th>
                                    <th className="pb-4">Visiting</th>
                                    <th className="pb-4">Time</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 pr-4 text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visitors.map((vis) => (
                                    <tr key={vis.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        {editingVisitor && editingVisitor.id === vis.id ? (
                                            <>
                                                <td className="py-2 pl-2 flex flex-col gap-1 mt-1.5">
                                                    <input type="text" value={editingVisitor.visitor_name} onChange={(e) => setEditingVisitor({...editingVisitor, visitor_name: e.target.value})} className="bg-[#050505] text-white px-3 py-2 rounded-lg border border-white/10 outline-none w-36 text-sm" placeholder="Name" />
                                                    <input type="text" value={editingVisitor.vehicle_number} onChange={(e) => setEditingVisitor({...editingVisitor, vehicle_number: e.target.value})} className="bg-[#050505] text-gray-400 px-3 py-2 rounded-lg border border-white/10 outline-none w-36 text-xs" placeholder="Vehicle No" />
                                                </td>
                                                <td className="py-2 text-gray-400 text-sm">{vis.resident_name || 'N/A'}</td>
                                                <td className="py-2 text-gray-500 text-xs">{new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="py-2">
                                                    <select value={editingVisitor.approval_status} onChange={(e) => setEditingVisitor({...editingVisitor, approval_status: e.target.value})} className="bg-[#050505] text-white px-3 py-2 rounded-lg border border-white/10 outline-none text-xs appearance-none cursor-pointer">
                                                        <option value="pending">Pending</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-4 text-right">
                                                    <div className="flex justify-end items-center gap-2 h-full mt-4">
                                                        <button onClick={handleUpdate} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingVisitor(null)} className="p-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-5 pl-2">
                                                    <p className="font-extrabold text-white text-sm">{vis.visitor_name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{vis.vehicle_number || 'Walk-in'}</p>
                                                </td>
                                                <td className="py-5 text-gray-300 text-sm">{vis.resident_name || 'N/A'}</td>
                                                <td className="py-5 text-gray-400 text-sm font-medium">
                                                    {new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                                        vis.approval_status === 'approved' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20' :
                                                            vis.approval_status === 'rejected' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                                                                'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20'
                                                    }`}>
                                                        {vis.approval_status}
                                                    </span>
                                                </td>
                                                <td className="py-5 pr-4 text-right">
                                                    <div className="flex justify-end items-center gap-4">
                                                        <span className="text-gray-500 text-xs italic font-semibold">
                                                            {vis.approval_status === 'pending' ? 'Waiting...' : 'Action taken'}
                                                        </span>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => setEditingVisitor(vis)} className="text-[#888] hover:text-[#C0DE1B] transition-colors p-1.5 bg-white/5 hover:bg-[#C0DE1B]/10 rounded-lg" title="Edit gate log">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(vis.id)} className="text-[#888] hover:text-[#EF4444] transition-colors p-1.5 bg-white/5 hover:bg-[#EF4444]/10 rounded-lg" title="Delete log">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}

                                {visitors.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-500 text-sm">
                                            <div className="flex flex-col items-center justify-center">
                                                <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="font-bold">No visitors logged today.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {isProfileOpen && (
                <div className="fixed inset-0 bg-[#000]/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-[#050505] border border-white/10 p-8 rounded-[32px] w-full max-w-sm shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
                        <button onClick={() => { setIsProfileOpen(false); setPasswordStatus({type: '', message: ''}); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors bg-[#111] hover:bg-white/10 p-2.5 rounded-full z-10 border border-white/5">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center mb-8 mt-2">
                            <div className="w-20 h-20 bg-transparent border-2 border-[#C0DE1B]/30 rounded-full flex items-center justify-center mb-4">
                                <User className="w-10 h-10 text-[#C0DE1B]" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{localStorage.getItem('userName') || 'Main Gate Security'}</h2>
                            <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Gate Security Division</p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-extrabold text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
                                <Key className="w-4 h-4 text-[#C0DE1B]" /> Update Password
                            </h3>

                            {passwordStatus.message && (
                                <div className={`p-4 rounded-xl mb-5 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 border ${passwordStatus.type === 'success' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'}`}>
                                    {passwordStatus.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                    {passwordStatus.message}
                                </div>
                            )}

                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        placeholder="Current Password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        className="w-full bg-[#111] text-white px-5 py-4 pr-12 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none text-sm placeholder:text-[#555] transition-colors shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#C0DE1B] transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        placeholder="New Password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        className="w-full bg-[#111] text-white px-5 py-4 pr-12 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none text-sm placeholder:text-[#555] transition-colors shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#C0DE1B] transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        placeholder="Confirm New Password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        className="w-full bg-[#111] text-white px-5 py-4 pr-12 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none text-sm placeholder:text-[#555] transition-colors shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#C0DE1B] transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button type="submit" disabled={isUpdatingPwd} className="w-full bg-[#C0DE1B] hover:bg-[#aacc15] text-black font-extrabold py-4 rounded-xl transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(192,222,24,0.3)]">
                                    {isUpdatingPwd ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><Check className="w-4 h-4" /> Save Password</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isScannerOpen && (
                <div className="fixed inset-0 bg-[#000]/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-[#050505] border border-white/10 p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-2xl relative flex flex-col items-center max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

                        <button onClick={closeScanner} className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors bg-[#111] hover:bg-white/10 p-2.5 rounded-full z-10 border border-white/5">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-extrabold text-white mb-8 flex items-center gap-2 shrink-0">
                            <QrCode className="text-[#C0DE1B] w-6 h-6"/> Pass Verification
                        </h3>

                        {!scanResult ? (
                            <div className="w-full flex flex-col gap-6">
                                <div className="w-full relative rounded-[24px] overflow-hidden border-4 border-[#111] shadow-2xl bg-black shrink-0">
                                    {isCaptured ? (
                                        <div className="flex flex-col items-center justify-center p-12 bg-black/90 aspect-square w-full">
                                            <div className="w-16 h-16 border-4 border-[#C0DE1B] border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <h3 className="text-white font-extrabold text-xl tracking-wide mb-1">Pass Captured!</h3>
                                            <p className="text-[#C0DE1B] font-bold text-sm tracking-widest animate-pulse">VERIFYING...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <QrReader
                                                onResult={handleScan}
                                                constraints={{ facingMode: 'environment' }}
                                                containerStyle={{ width: '100%', paddingTop: '100%' }}
                                                videoContainerStyle={{ paddingTop: '100%' }}
                                                videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                scanDelay={500}
                                            />

                                            <div className="absolute inset-0 z-10 pointer-events-none m-8">
                                                <style>{`
                                                    @keyframes scanLaser {
                                                        0% { top: 0%; opacity: 0; }
                                                        10% { opacity: 1; }
                                                        50% { top: 100%; opacity: 1; }
                                                        90% { opacity: 1; }
                                                        100% { top: 0%; opacity: 0; }
                                                    }
                                                `}</style>
                                                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#C0DE1B] rounded-tl-2xl shadow-[0_0_15px_rgba(192,222,24,0.4)]"></div>
                                                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#C0DE1B] rounded-tr-2xl shadow-[0_0_15px_rgba(192,222,24,0.4)]"></div>
                                                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#C0DE1B] rounded-bl-2xl shadow-[0_0_15px_rgba(192,222,24,0.4)]"></div>
                                                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#C0DE1B] rounded-br-2xl shadow-[0_0_15px_rgba(192,222,24,0.4)]"></div>
                                                <div className="absolute inset-0 flex items-center justify-center gap-5 opacity-80">
                                                    <div className="w-2.5 h-2.5 bg-[#C0DE1B] rounded-full animate-ping shadow-[0_0_10px_#C0DE1B]" style={{ animationDuration: '1.2s' }}></div>
                                                    <div className="w-2 h-2 bg-[#C0DE1B] rounded-full animate-ping shadow-[0_0_10px_#C0DE1B]" style={{ animationDuration: '1.2s', animationDelay: '300ms' }}></div>
                                                    <div className="w-2.5 h-2.5 bg-[#C0DE1B] rounded-full animate-ping shadow-[0_0_10px_#C0DE1B]" style={{ animationDuration: '1.2s', animationDelay: '600ms' }}></div>
                                                </div>
                                                <div className="w-full h-[3px] bg-[#C0DE1B] shadow-[0_0_20px_#C0DE1B] absolute rounded-full" style={{ animation: 'scanLaser 2.5s ease-in-out infinite' }}></div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!isCaptured && (
                                    <div className="w-full bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl flex flex-col gap-4 shrink-0">
                                        <p className="text-[#888] text-xs font-bold uppercase tracking-widest text-center">Or Enter Token Manually</p>
                                        <form onSubmit={handleManualVerify} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder="e.g. CD960F63"
                                                value={manualToken}
                                                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                                                className="w-full bg-[#111] text-[#C0DE1B] font-mono font-bold tracking-widest px-4 py-4 rounded-xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none text-center uppercase shadow-inner placeholder:text-[#444] placeholder:font-sans placeholder:tracking-normal text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!manualToken.trim()}
                                                className="bg-[#C0DE1B] hover:bg-[#aacc15] text-black px-6 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-extrabold hover:shadow-[0_0_15px_rgba(192,222,24,0.2)]"
                                            >
                                                Verify
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center w-full animate-in zoom-in-95 duration-300">
                                {scanResult.success ? (
                                    <>
                                        <div className="w-24 h-24 bg-[#4ADE80]/10 border-2 border-[#4ADE80]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(74,222,128,0.1)]">
                                            <CheckCircle className="w-12 h-12 text-[#4ADE80]" />
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-1 tracking-tight">Access Granted</h2>
                                        <p className="text-[#4ADE80] font-bold text-xs uppercase tracking-[0.2em] mb-8">VIP Pass Verified</p>

                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-left space-y-4 mb-8">
                                            <div><p className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-1">Visitor Name</p><p className="text-white font-bold text-lg">{scanResult.visitor}</p></div>
                                            <div className="h-px w-full bg-white/5"></div>
                                            <div><p className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-1">Resident / Host</p><p className="text-white font-bold text-lg">{scanResult.resident}</p></div>
                                            <div className="h-px w-full bg-white/5"></div>
                                            <div><p className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-2">Unit Number</p><p className="text-[#C0DE1B] font-black text-xl bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 w-fit px-4 py-1.5 rounded-xl">{scanResult.unit}</p></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-[#EF4444]/10 border-2 border-[#EF4444]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                            <XCircle className="w-12 h-12 text-[#EF4444]" />
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-1 tracking-tight">Access Denied</h2>
                                        <p className="text-[#EF4444] font-bold text-xs uppercase tracking-[0.2em] mb-8">{scanResult.message}</p>
                                    </>
                                )}

                                <button onClick={handleScanAnother} className="w-full bg-[#111] hover:bg-white/10 border border-white/5 text-white font-bold py-4 rounded-xl transition-all">
                                    Verify Another Pass
                                </button>
                            </div>
                        )}

                        {(!scanResult && !isCaptured) && (
                            <p className="text-[#666] text-xs mt-8 text-center shrink-0">Point the camera at the visitor's QR code.<br/>(Keep the phone ~10 inches away from camera)</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default SecurityDashboard;