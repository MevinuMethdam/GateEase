import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import { ShieldCheck, UserPlus, User, Car, Edit2, Trash2, Check, X, CreditCard, AlertCircle, QrCode, CheckCircle, XCircle } from 'lucide-react';

const ManageVisitors = () => {

    const [visitors, setVisitors] = useState([]);
    const [residents, setResidents] = useState([]);
    const [formData, setFormData] = useState({
        resident_id: '', visitor_name: '', vehicle_number: '', nic: ''
    });
    const [editingVisitor, setEditingVisitor] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [manualToken, setManualToken] = useState('');

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

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-primary w-6 h-6" />
                    Gate Security & Visitors
                </h2>

                <button
                    onClick={() => { setIsScannerOpen(true); setIsCaptured(false); scanLock.current = false; setManualToken(''); }}
                    className="bg-[#111] border border-[#C0DE1B]/50 hover:bg-[#C0DE1B]/10 text-[#C0DE1B] font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all w-fit shadow-[0_0_15px_rgba(192,222,24,0.1)]"
                >
                    <QrCode className="w-5 h-5" /> Scan VIP Pass
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Log New Visitor</h3>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Visitor Name</label>
                            <div className="relative group">
                                <User className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${formErrors.visitor_name ? 'text-red-500' : 'text-gray-500'}`} />
                                <input type="text" placeholder="e.g. Nimal Perera" value={formData.visitor_name}
                                       onChange={(e) => {setFormData({ ...formData, visitor_name: e.target.value }); setFormErrors({...formErrors, visitor_name: null});}}
                                       className={`w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${formErrors.visitor_name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`} />
                            </div>
                            {formErrors.visitor_name && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.visitor_name}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">NIC Number</label>
                            <div className="relative group">
                                <CreditCard className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${formErrors.nic ? 'text-red-500' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="e.g. 981234567V or 12 digits"
                                    value={formData.nic}
                                    onChange={(e) => {setFormData({ ...formData, nic: e.target.value }); setFormErrors({...formErrors, nic: null});}}
                                    className={`w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${formErrors.nic ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}
                                />
                            </div>
                            {formErrors.nic && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.nic}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Vehicle Number (Optional)</label>
                            <div className="relative">
                                <Car className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input type="text" placeholder="e.g. CBA-1234" value={formData.vehicle_number}
                                       onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                       className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Visiting Whom?</label>
                            <select value={formData.resident_id} onChange={(e) => {setFormData({ ...formData, resident_id: e.target.value }); setFormErrors({...formErrors, resident_id: null});}}
                                    className={`w-full bg-dark-input text-white px-4 py-3 rounded-xl border outline-none appearance-none cursor-pointer transition-all ${formErrors.resident_id ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}>
                                <option value="">-- Select Resident --</option>
                                {residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            {formErrors.resident_id && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.resident_id}</p>}
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(207,255,4,0.2)]">
                            <UserPlus className="w-5 h-5" /> Request Entry
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Today's Gate Log</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Visitor Details</th>
                                <th className="pb-4">Visiting</th>
                                <th className="pb-4">Time</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 pr-4 text-right">Resident Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {visitors.map((vis) => (
                                <tr key={vis.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {editingVisitor && editingVisitor.id === vis.id ? (
                                        <>
                                            <td className="py-2 pl-2 flex flex-col gap-1 mt-1.5">
                                                <input type="text" value={editingVisitor.visitor_name} onChange={(e) => setEditingVisitor({...editingVisitor, visitor_name: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-sm" placeholder="Name" />
                                                <input type="text" value={editingVisitor.vehicle_number} onChange={(e) => setEditingVisitor({...editingVisitor, vehicle_number: e.target.value})} className="bg-dark-input text-gray-400 px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-xs" placeholder="Vehicle No" />
                                            </td>
                                            <td className="py-2 text-gray-400 text-sm">{vis.resident_name || 'N/A'}</td>
                                            <td className="py-2 text-gray-500 text-xs">{new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-2">
                                                <select value={editingVisitor.approval_status} onChange={(e) => setEditingVisitor({...editingVisitor, approval_status: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-xs appearance-none cursor-pointer">
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="py-2 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-1.5 h-full mt-4">
                                                    <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingVisitor(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 pl-2">
                                                <p className="font-bold text-white">{vis.visitor_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{vis.vehicle_number || 'Walk-in'}</p>
                                            </td>
                                            <td className="py-4 text-gray-300 text-sm">{vis.resident_name || 'N/A'}</td>
                                            <td className="py-4 text-gray-400 text-sm">
                                                {new Date(vis.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    vis.approval_status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        vis.approval_status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                    {vis.approval_status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end items-center gap-3">

                                                    <span className="text-gray-500 text-xs italic">
                                                        {vis.approval_status === 'pending' ? 'Waiting...' : 'Action taken'}
                                                    </span>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingVisitor(vis)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit gate log">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(vis.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete log">
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
                                    <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                                        No visitors logged today.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {isScannerOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4 py-6">
                    <div className="bg-[#111111] border border-white/[0.08] p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-2xl relative flex flex-col items-center max-h-[90vh] overflow-y-auto">

                        <button onClick={closeScanner} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-10">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2 shrink-0">
                            <QrCode className="text-[#C0DE1B] w-6 h-6"/> Pass Verification
                        </h3>

                        {!scanResult ? (
                            <div className="w-full flex flex-col gap-6">

                                <div className="w-full relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black shrink-0">
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
                                    <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shrink-0">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">Or Enter Token Manually</p>
                                        <form onSubmit={handleManualVerify} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. CD960F63"
                                                value={manualToken}
                                                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                                                className="w-full bg-[#050505] text-[#C0DE1B] font-mono font-bold tracking-widest px-4 py-3.5 rounded-xl border border-white/10 focus:border-[#C0DE1B]/50 outline-none text-center uppercase shadow-inner placeholder:text-[#555] placeholder:font-sans placeholder:tracking-normal text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!manualToken.trim()}
                                                className="bg-[#C0DE1B] hover:bg-[#9EBA11] text-black px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-extrabold shadow-[0_0_15px_rgba(192,222,24,0.2)]"
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
                                        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white mb-1">Access Granted</h2>
                                        <p className="text-green-400 font-bold text-sm uppercase tracking-widest mb-6">VIP Pass Verified</p>

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3 mb-8">
                                            <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Visitor Name</p><p className="text-white font-bold">{scanResult.visitor}</p></div>
                                            <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Resident / Host</p><p className="text-white font-bold">{scanResult.resident}</p></div>
                                            <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Unit Number</p><p className="text-[#C0DE1B] font-black text-lg bg-[#C0DE1B]/10 w-fit px-3 py-1 rounded-lg mt-1">{scanResult.unit}</p></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <XCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white mb-1">Access Denied</h2>
                                        <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-6">{scanResult.message}</p>
                                    </>
                                )}

                                <button onClick={handleScanAnother} className="w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all">
                                    Verify Another Pass
                                </button>
                            </div>
                        )}

                        {(!scanResult && !isCaptured) && (
                            <p className="text-gray-500 text-xs mt-6 text-center shrink-0">Point the camera at the visitor's QR code.<br/>(Keep the phone ~10 inches away from camera)</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageVisitors;