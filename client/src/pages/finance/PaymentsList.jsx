import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, DollarSign, Calendar, CheckCircle, Edit2, Trash2, Check, X, FileImage, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PaymentsList = () => {
    const [payments, setPayments] = useState([]);
    const [units, setUnits] = useState([]);
    const [formData, setFormData] = useState({ unit_id: '', amount: '', due_date: '' });
    const [editingPayment, setEditingPayment] = useState(null);

    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [approvedAmount, setApprovedAmount] = useState('');

    // 🌟 NEW: Room Category Prices Mapping
    const ROOM_PRICES = {
        "The Platinum Penthouse": 250000,
        "Emerald Deluxe Suite": 185000,
        "Urban Loft Apartment": 120000,
        "Cozy Studio Unit": 85000
    };

    const fetchData = async () => {
        try {
            const resPayments = await axios.get('http://localhost:5000/api/payments');
            const resUnits = await axios.get('http://localhost:5000/api/units');
            setPayments(resPayments.data);
            setUnits(resUnits.data.filter(u => u.status !== 'vacant'));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/payments', formData);
            alert('✅ Invoice generated!');
            setFormData({ unit_id: '', amount: '', due_date: '' });
            fetchData();
        } catch (error) {
            alert('❌ Failed to generate invoice.');
        }
    };

    const openApproveModal = (payment) => {
        setSelectedPayment(payment);
        setApprovedAmount(payment.submitted_amount || payment.balance || payment.amount);
        setIsApproveModalOpen(true);
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/payments/${selectedPayment.id}/approve`, { approved_amount: approvedAmount });
            alert('✅ Payment approved successfully!');
            setIsApproveModalOpen(false);
            fetchData();
        } catch (error) {
            alert('❌ Failed to approve payment.');
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Are you sure you want to REJECT this payment slip?')) {
            try {
                await axios.put(`http://localhost:5000/api/payments/${id}/reject`);
                alert('✅ Payment rejected. Resident notified.');
                setIsApproveModalOpen(false);
                fetchData();
            } catch (error) {
                alert('❌ Failed to reject payment.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await axios.delete(`http://localhost:5000/api/payments/${id}`);
                fetchData();
                alert('✅ Invoice deleted successfully!');
            } catch (error) {
                alert('❌ Failed to delete invoice');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/payments/${editingPayment.id}`, {
                amount: editingPayment.amount,
                due_date: editingPayment.due_date,
                status: editingPayment.status
            });
            setEditingPayment(null);
            fetchData();
            alert('✅ Invoice updated successfully!');
        } catch (error) {
            alert('❌ Failed to update invoice');
        }
    };

    const getChartData = () => {
        const monthlyRevenue = {};

        payments.forEach(pay => {
            if (pay.status === 'paid' || pay.status === 'partially_paid') {
                const dateStr = pay.submitted_date || pay.updated_at || pay.due_date;
                const date = dateStr ? new Date(dateStr) : new Date();
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                const totalAmount = Number(pay.amount || 0);
                const balance = pay.balance !== undefined ? Number(pay.balance) : 0;

                const paidAmount = pay.status === 'paid' ? totalAmount : (totalAmount - balance);

                if (!monthlyRevenue[monthYear]) {
                    monthlyRevenue[monthYear] = 0;
                }
                monthlyRevenue[monthYear] += paidAmount;
            }
        });

        return Object.keys(monthlyRevenue)
            .map(key => ({ name: key, Revenue: monthlyRevenue[key], dateObj: new Date(key) }))
            .sort((a, b) => a.dateObj - b.dateObj)
            .map(item => ({ name: item.name, Revenue: item.Revenue }));
    };

    const chartData = getChartData();

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-primary w-6 h-6" />
                Billing & Payments
            </h2>

            <div className="bg-dark-card border border-white/5 p-6 rounded-3xl mb-8 shadow-xl animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" /> Revenue Trend
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Monthly collected payments overview</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                        <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-0.5">Total Revenue</p>
                        <p className="text-xl font-bold text-white">
                            LKR {chartData.reduce((sum, item) => sum + item.Revenue, 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C0DE18" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#C0DE18" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `LKR ${value/1000}k`} dx={-10} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.05} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#C0DE18', fontWeight: 'bold' }}
                                    formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Collected']}
                                />
                                <Area type="monotone" dataKey="Revenue" stroke="#C0DE18" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                            <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
                            <p className="text-gray-500 text-sm">No payment data available yet to display graph.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-3xl border border-white/5 h-fit shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Generate Invoice</h3>
                    <form onSubmit={handleGenerateInvoice} className="space-y-4">
                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Select Unit</label>

                            {/* 🌟 UPDATED: Unit Dropdown with Auto-Fill Logic */}
                            <select
                                required
                                value={formData.unit_id}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedUnit = units.find(u => u.id.toString() === selectedId);
                                    let autoAmount = '';

                                    if (selectedUnit && selectedUnit.category) {
                                        autoAmount = ROOM_PRICES[selectedUnit.category] || '';
                                    }

                                    setFormData({ ...formData, unit_id: selectedId, amount: autoAmount });
                                }}
                                className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer focus:border-primary/50"
                            >
                                <option value="">-- Choose Unit --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.unit_number} {u.category ? `- ${u.category}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <label className="text-sm text-gray-400 mb-1 block">Amount (LKR) <span className="text-[10px] text-primary italic ml-1">- Auto Calculated</span></label>
                            <DollarSign className="absolute left-3 top-9 w-5 h-5 text-gray-500" />

                            {/* 🌟 UPDATED: Amount Input made Read-Only */}
                            <input
                                type="number"
                                required
                                placeholder="Select unit to calculate"
                                value={formData.amount}
                                readOnly
                                className="w-full bg-[#050505] text-primary font-bold pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none cursor-not-allowed opacity-90 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Due Date</label>
                            <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="date" required value={formData.due_date}
                                   onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none cursor-pointer" />
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02] shadow-[0_0_15px_rgba(192,222,24,0.2)]">
                            <Plus className="w-5 h-5" /> Generate Bill
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Invoices & Payments</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 pl-2">Unit</th>
                                <th className="pb-4">Resident</th>
                                <th className="pb-4">Balance Due</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((pay) => (
                                <tr key={pay.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    {editingPayment && editingPayment.id === pay.id ? (
                                        <>
                                            <td className="py-2 pl-2 text-white font-medium">{pay.unit_number}</td>
                                            <td className="py-2 text-gray-300">{pay.resident_name || 'N/A'}</td>
                                            <td className="py-2">
                                                <input type="number" value={editingPayment.amount} onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-24 text-sm" />
                                            </td>
                                            <td className="py-2">
                                                <select value={editingPayment.status} onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-sm appearance-none cursor-pointer">
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                </select>
                                            </td>
                                            <td className="py-2 pr-4 text-right flex justify-end gap-2 items-center h-full mt-1.5">
                                                <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingPayment(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 pl-2 font-medium text-white">{pay.unit_number}</td>
                                            <td className="py-4 text-gray-300">{pay.resident_name || 'N/A'}</td>
                                            <td className="py-4 text-white font-bold">LKR {Number(pay.balance || pay.amount).toLocaleString()}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                    pay.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : pay.status === 'under_review' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            : pay.status === 'partially_paid' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                    {pay.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex justify-end items-center gap-3">
                                                    {(pay.status === 'under_review' || pay.status === 'pending' || pay.status === 'partially_paid') ? (
                                                        <button
                                                            onClick={() => openApproveModal(pay)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                                                                pay.status === 'under_review' ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse' : 'bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-black hover:border-primary/50'
                                                            }`}
                                                        >
                                                            {pay.status === 'under_review' ? <FileImage className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                            {pay.status === 'under_review' ? 'Review Slip' : 'Mark Paid'}
                                                        </button>
                                                    ) : (
                                                        <span className="w-[100px]"></span>
                                                    )}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingPayment(pay)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit invoice"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(pay.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete invoice"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-lg">No invoices generated yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isApproveModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-[#111111] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsApproveModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-primary"/> Process Payment
                        </h3>

                        <div className="bg-black/50 p-5 rounded-2xl border border-white/5 mb-6 text-sm">
                            <div className="flex justify-between">
                                <div><p className="text-gray-500 mb-1">Total Bill</p><p className="text-white font-bold text-lg">LKR {Number(selectedPayment.amount).toLocaleString()}</p></div>
                                <div className="text-right"><p className="text-gray-500 mb-1">Balance Due</p><p className="text-red-400 font-bold text-lg">LKR {Number(selectedPayment.balance || selectedPayment.amount).toLocaleString()}</p></div>
                            </div>

                            {selectedPayment.submitted_amount > 0 && (
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <p className="text-primary font-bold mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> Resident Claimed Payment:</p>
                                    <div className="flex justify-between">
                                        <p className="text-white text-base font-medium">LKR {Number(selectedPayment.submitted_amount).toLocaleString()}</p>
                                        <p className="text-gray-400">{selectedPayment.submitted_date ? new Date(selectedPayment.submitted_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedPayment.slip_image && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-400 mb-2">Uploaded Bank Slip:</p>
                                <a href={selectedPayment.slip_image} target="_blank" rel="noreferrer" className="block w-full h-36 bg-black border border-white/10 rounded-2xl overflow-hidden group relative">
                                    <img src={selectedPayment.slip_image} alt="Slip" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" onError={(e) => { e.target.src = "https://via.placeholder.com/400x150?text=Invalid+Image+URL" }} />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                        <span className="text-black font-bold bg-primary px-4 py-2 rounded-xl flex items-center gap-2"><FileImage className="w-4 h-4"/> View Full Image</span>
                                    </div>
                                </a>
                            </div>
                        )}

                        <form onSubmit={handleApprove}>
                            <label className="text-sm text-gray-400 mb-2 block">Amount Received (LKR) <span className="text-xs text-primary italic">- Change this for partial payments</span></label>
                            <div className="relative mb-6">
                                <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    required
                                    max={selectedPayment.balance || selectedPayment.amount}
                                    value={approvedAmount}
                                    onChange={(e) => setApprovedAmount(e.target.value)}
                                    className="w-full bg-black text-white pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-primary/50 outline-none font-bold text-lg"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 bg-primary text-black font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(192,222,24,0.2)]">Approve Payment</button>
                                {selectedPayment.slip_image && (
                                    <button type="button" onClick={() => handleReject(selectedPayment.id)} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-3.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors">Reject Slip</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsList;