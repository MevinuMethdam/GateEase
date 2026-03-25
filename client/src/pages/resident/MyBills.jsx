import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, CheckCircle, AlertCircle, Upload, Clock, Calendar, DollarSign, FileUp, X, BarChart3, TrendingUp, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MyBills = () => {
    const [bills, setBills] = useState([]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedBillId, setSelectedBillId] = useState(null);
    const [slipUrl, setSlipUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [submittedAmount, setSubmittedAmount] = useState('');
    const [submittedDate, setSubmittedDate] = useState('');

    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const [paymentErrors, setPaymentErrors] = useState({});

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const fetchBills = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/payments/resident/${userId}`);
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const openUploadModal = (bill) => {
        setSelectedBillId(bill.id);
        setSlipUrl('');
        setFileName('');
        setSubmittedAmount(bill.balance || bill.amount);
        setSubmittedDate(new Date().toISOString().split('T')[0]);

        setPaymentErrors({});

        setIsUploadModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = () => {
        setFileName('');
        setSlipUrl('');
    };

    const validatePaymentForm = () => {
        const errors = {};

        const currentBill = bills.find(b => b.id === selectedBillId);
        const maxAmount = currentBill ? (currentBill.balance || currentBill.amount) : 0;
        const amountNum = Number(submittedAmount);

        if (!submittedAmount || amountNum <= 0) {
            errors.amount = "Payment amount must be greater than zero.";
        } else if (amountNum > maxAmount) {
            errors.amount = `Payment cannot exceed the due balance of LKR ${maxAmount.toLocaleString()}.`;
        }

        const selectedDate = new Date(submittedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (!submittedDate) {
            errors.date = "Please select a payment date.";
        } else if (selectedDate > today) {
            errors.date = "Payment date cannot be in the future.";
        }

        if (!slipUrl) {
            errors.file = "Please upload a payment slip document (Image or PDF).";
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUploadSlip = async (e) => {
        e.preventDefault();

        if (!validatePaymentForm()) return;

        try {
            await axios.put(`http://localhost:5000/api/payments/${selectedBillId}/upload-slip`, {
                slip_image: slipUrl,
                submitted_amount: submittedAmount,
                submitted_date: submittedDate
            });
            alert('✅ Payment details & slip submitted! Waiting for admin approval.');
            setIsUploadModalOpen(false);
            fetchBills();
        } catch (error) {
            alert('❌ Failed to upload slip. Please try again.');
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const getChartData = () => {
        const dataMap = {};
        bills.forEach(bill => {
            const dateStr = bill.due_date || bill.created_at;
            if (!dateStr) return;
            const date = new Date(dateStr);
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!dataMap[monthYear]) {
                dataMap[monthYear] = { name: monthYear, Paid: 0, Pending: 0, sortDate: date.getTime() };
            }

            const totalAmount = Number(bill.amount) || 0;
            const paidAmount = Number(bill.paid_amount) || 0;
            const balance = bill.balance !== undefined ? Number(bill.balance) : (totalAmount - paidAmount);

            if (bill.status === 'paid') {
                dataMap[monthYear].Paid += totalAmount;
            } else {
                dataMap[monthYear].Paid += paidAmount;
                dataMap[monthYear].Pending += balance;
            }
        });

        return Object.values(dataMap)
            .sort((a, b) => a.sortDate - b.sortDate)
            .map(item => ({ name: item.name, Paid: item.Paid, Pending: item.Pending }));
    };

    const chartData = getChartData();

    return (
        <div className="relative z-10 font-sans print:bg-white print:text-black">
            <div className="print:hidden">
                <h2 className="text-2xl md:text-[32px] font-extrabold text-[#EAEAEA] tracking-tight mb-8 flex items-center gap-3 drop-shadow-sm">
                    <CreditCard className="text-[#C0DE1B] w-8 h-8" />
                    My Payments
                </h2>

                <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.05] p-6 md:p-8 rounded-[32px] mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                    <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-gradient-to-bl from-[#C0DE1B]/[0.05] to-transparent rounded-full blur-[60px] pointer-events-none group-hover:from-[#C0DE1B]/[0.08] transition-colors duration-700"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                                <BarChart3 className="w-5 h-5 text-[#C0DE1B]" /> Payment Analytics
                            </h3>
                            <p className="text-xs text-[#666666] font-bold uppercase tracking-widest mt-1.5">Monthly Paid vs Pending Dues</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative z-10">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#555555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 15px 30px rgba(0,0,0,0.8)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#848484' }}/>
                                    <Bar dataKey="Paid" stackId="a" fill="#C0DE1B" radius={[0, 0, 4, 4]} barSize={35} />
                                    <Bar dataKey="Pending" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111]/30 rounded-[20px] border border-white/[0.02]">
                                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3 shadow-inner">
                                    <TrendingUp className="w-5 h-5 text-[#555555]" />
                                </div>
                                <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No Billing Data Yet</p>
                                <p className="text-[#555555] text-[11px] mt-1 text-center max-w-[250px]">Your monthly payments will be visualized here once an invoice is generated.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/[0.05] text-[#848484] text-[11px] font-bold uppercase tracking-widest">
                                <th className="pb-5 pl-4">Invoice Details</th>
                                <th className="pb-5">Amount & Balance</th>
                                <th className="pb-5">Due Date</th>
                                <th className="pb-5">Status</th>
                                <th className="pb-5 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-6 pl-4 flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shadow-inner ${
                                            bill.status === 'paid' ? 'bg-[#C0DE1B]/10 text-[#C0DE1B] border border-[#C0DE1B]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[#EAEAEA] font-extrabold text-[15px] tracking-tight">Apartment Rent & Maintenance</p>
                                            <p className="text-[12px] text-[#666666] font-medium mt-0.5">Unit: <span className="text-[#A0A0A0]">{bill.unit_number}</span></p>
                                        </div>
                                    </td>

                                    <td className="py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[16px] font-extrabold text-[#EAEAEA] tracking-tight">
                                                LKR {Number(bill.amount).toLocaleString()}
                                            </span>
                                            {bill.paid_amount > 0 && (
                                                <span className="text-[11px] font-bold text-[#C0DE1B]">Paid: LKR {Number(bill.paid_amount).toLocaleString()}</span>
                                            )}
                                            {bill.balance > 0 && (
                                                <span className="text-[11px] font-bold text-red-400">Balance: LKR {Number(bill.balance).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-6 text-[#848484] font-medium text-sm">
                                        {new Date(bill.due_date).toLocaleDateString()}
                                    </td>

                                    <td className="py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center w-fit gap-1.5 shadow-inner ${
                                            bill.status === 'paid' ? 'bg-[#C0DE1B]/10 text-[#C0DE1B] border border-[#C0DE1B]/20'
                                                : bill.status === 'under_review' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : bill.status === 'partially_paid' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {bill.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" />
                                                : bill.status === 'under_review' ? <Clock className="w-3.5 h-3.5" />
                                                    : <AlertCircle className="w-3.5 h-3.5" />}
                                            {bill.status.replace('_', ' ')}
                                        </span>
                                    </td>

                                    <td className="py-6 pr-4 text-right">
                                        {bill.status === 'paid' ? (
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-[#C0DE1B] text-[13px] font-extrabold italic flex items-center gap-1.5 mr-2">
                                                    <CheckCircle className="w-4 h-4"/> Settled
                                                </span>
                                                <button
                                                    onClick={() => setSelectedReceipt(bill)}
                                                    className="bg-[#C0DE1B]/10 hover:bg-[#C0DE1B]/20 border border-[#C0DE1B]/30 text-[#C0DE1B] px-4 py-2 rounded-[12px] text-[12px] font-extrabold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(192,222,24,0.1)]"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Receipt
                                                </button>
                                            </div>
                                        ) : bill.status === 'under_review' ? (
                                            <span className="text-blue-400 text-[13px] font-medium italic">Admin Reviewing...</span>
                                        ) : (
                                            <button
                                                onClick={() => openUploadModal(bill)}
                                                className="bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] hover:scale-105 text-[#050505] font-extrabold px-5 py-2.5 rounded-[14px] transition-all flex items-center gap-2 ml-auto shadow-[0_0_15px_rgba(192,222,24,0.2)] text-[13px]"
                                            >
                                                <Upload className="w-4 h-4" /> Upload Slip
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center bg-[#111111]/30 rounded-[20px] border border-white/[0.02] border-dashed p-8">
                                            <CreditCard className="w-10 h-10 mb-4 text-[#555555]" />
                                            <p className="text-[#A0A0A0] text-sm font-semibold tracking-wide">No bills found</p>
                                            <p className="text-[#666666] text-xs mt-1">You do not have any generated invoices yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 px-4 print:hidden">
                    <div className="bg-[#0A0A0A] border border-white/[0.08] p-8 md:p-10 rounded-[32px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-6 right-6 text-[#666666] hover:text-white transition-colors bg-[#111111] p-2 rounded-full border border-white/[0.05]">
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="text-[22px] font-extrabold text-white mb-2 flex items-center gap-3 tracking-tight">
                            <div className="w-10 h-10 bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 rounded-[12px] flex items-center justify-center">
                                <FileUp className="w-5 h-5 text-[#C0DE1B]"/>
                            </div>
                            Submit Payment
                        </h3>
                        <p className="text-[#848484] text-xs font-medium tracking-wide mb-8">Enter your payment details and upload the slip.</p>

                        <form onSubmit={handleUploadSlip} className="space-y-6" noValidate>

                            <div>
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Amount Paid (LKR)</label>
                                <div className="relative group/input">
                                    <DollarSign className={`absolute left-4 top-4 w-5 h-5 transition-colors ${paymentErrors.amount ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                                    <input
                                        type="number"
                                        value={submittedAmount}
                                        onChange={(e) => { setSubmittedAmount(e.target.value); setPaymentErrors({...paymentErrors, amount: null}); }}
                                        className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border focus:outline-none transition-all shadow-inner font-extrabold tracking-wide ${paymentErrors.amount ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}
                                    />
                                </div>
                                {paymentErrors.amount && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {paymentErrors.amount}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Date of Payment</label>
                                <div className="relative group/input">
                                    <Calendar className={`absolute left-4 top-4 w-5 h-5 transition-colors ${paymentErrors.date ? 'text-red-500' : 'text-[#555555] group-focus-within/input:text-[#C0DE1B]'}`} />
                                    <input
                                        type="date"
                                        value={submittedDate}
                                        onChange={(e) => { setSubmittedDate(e.target.value); setPaymentErrors({...paymentErrors, date: null}); }}
                                        className={`w-full bg-[#111111] text-[#EAEAEA] pl-12 pr-4 py-4 rounded-[16px] border focus:outline-none cursor-pointer transition-all shadow-inner font-medium ${paymentErrors.date ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50' : 'border-white/[0.05] focus:border-[#C0DE1B]/50 focus:ring-1 focus:ring-[#C0DE1B]/50'}`}
                                    />
                                </div>
                                {paymentErrors.date && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {paymentErrors.date}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2 block">Upload Payment Slip</label>
                                {!fileName ? (
                                    <div className={`relative border border-dashed bg-[#111111]/50 rounded-[20px] p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group ${paymentErrors.file ? 'border-red-500/50 hover:bg-red-500/5' : 'border-white/[0.15] hover:border-[#C0DE1B]/50 hover:bg-[#C0DE1B]/[0.02]'}`}>
                                        <input type="file" accept="image/*,application/pdf"
                                               onChange={(e) => { handleFileChange(e); setPaymentErrors({...paymentErrors, file: null}); }}
                                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-4 transition-all duration-300 ${paymentErrors.file ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.05] border-white/[0.05] text-[#848484] group-hover:scale-110 group-hover:bg-[#C0DE1B]/10 group-hover:border-[#C0DE1B]/20 group-hover:text-[#C0DE1B]'}`}>
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm text-[#EAEAEA] font-bold">Click or drag file here</p>
                                        <p className="text-[11px] text-[#666666] mt-1.5 font-medium">Supports JPG, PNG, PDF</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 p-5 rounded-[16px]">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center shrink-0 shadow-inner border border-white/5">
                                                <CheckCircle className="w-4 h-4 text-[#C0DE1B]" />
                                            </div>
                                            <span className="text-white text-sm font-bold truncate">{fileName}</span>
                                        </div>
                                        <button type="button" onClick={removeFile} className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[#848484] hover:text-red-500 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all shrink-0">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                {paymentErrors.file && !fileName && <p className="text-red-400 text-[10px] mt-1.5 ml-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {paymentErrors.file}</p>}
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold py-4 rounded-[20px] transition-all duration-300 shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:shadow-[0_0_30px_rgba(192,222,24,0.5)] hover:-translate-y-1 mt-4">
                                Submit Payment Info
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedReceipt && (
                <>
                    <style type="text/css" media="print">
                        {`
                          @page { size: A4 portrait; margin: 15mm; }
                          body { background-color: white !important; }
                          body * { visibility: hidden !important; }
                          #printable-receipt, #printable-receipt * { visibility: visible !important; }
                          #printable-receipt { 
                              position: absolute !important; 
                              left: 0 !important; 
                              top: 0 !important; 
                              width: 100% !important; 
                              background-color: white !important; 
                              box-shadow: none !important;
                              border: none !important;
                          }
                          .print-hide { display: none !important; }
                          .print-text-black { color: #000000 !important; }
                          .print-text-gray { color: #4B5563 !important; }
                          .print-border { border-color: #E5E7EB !important; }
                          .print-bg-light { background-color: #F9FAFB !important; }
                        `}
                    </style>

                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-300 px-4 py-6">

                        <div id="printable-receipt" className="bg-[#111111] border border-white/[0.05] w-full max-w-xl rounded-[24px] shadow-2xl relative overflow-y-auto max-h-[90vh]">

                            <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-20 print-hide">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 md:p-12 relative">

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-[0.05] pointer-events-none flex flex-col items-center print:opacity-10">
                                    <span className="text-7xl font-black text-[#C0DE1B] tracking-widest border-[12px] border-[#C0DE1B] p-6 rounded-3xl print-text-black print-border">PAID</span>
                                </div>

                                <div className="flex flex-col items-center justify-center mb-8 border-b border-white/10 pb-8 print-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-[#C0DE1B] rounded-xl flex items-center justify-center font-black text-[#050505] text-xl shadow-[0_0_15px_rgba(192,222,24,0.3)] print:shadow-none">GE</div>
                                        <h1 className="text-3xl font-black text-white tracking-tight print-text-black">GateEase</h1>
                                    </div>
                                    <h2 className="text-lg font-bold text-[#C0DE1B] uppercase tracking-widest print-text-gray">Official Payment Receipt</h2>
                                </div>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-semibold print-text-gray">Receipt No.</span>
                                        <span className="text-white font-bold text-lg print-text-black">#REC-{selectedReceipt.id.toString().padStart(6, '0')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-semibold print-text-gray">Date Paid</span>
                                        <span className="text-white font-bold print-text-black">{new Date(selectedReceipt.due_date || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-semibold print-text-gray">Unit Number</span>
                                        <span className="text-white font-bold print-text-black bg-white/5 px-3 py-1 rounded-lg print-bg-light">Unit {selectedReceipt.unit_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-semibold print-text-gray">Payment Method</span>
                                        <span className="text-white font-bold print-text-black capitalize">System Upload</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 print-bg-light print-border">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-400 font-semibold print-text-gray">Total Amount Due</span>
                                        <span className="text-gray-300 font-semibold print-text-black">LKR {Number(selectedReceipt.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 mt-3 flex justify-between items-end print-border">
                                        <span className="text-white font-bold text-lg print-text-black">Amount Settled</span>
                                        <span className="text-3xl font-black text-[#C0DE1B] print-text-black">LKR {Number(selectedReceipt.paid_amount || selectedReceipt.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                </div>

                                <div className="text-center text-xs text-gray-500 mb-8 print-text-gray">
                                    <p>Thank you for your timely payment.</p>
                                    <p>This is a computer-generated digital receipt and does not require a physical signature.</p>
                                </div>

                                <div className="flex gap-4 print-hide">
                                    <button
                                        onClick={handlePrintReceipt}
                                        className="w-full bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] hover:scale-[1.02] font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,222,24,0.2)]"
                                    >
                                        <Printer className="w-5 h-5" /> Download / Print PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyBills;