import React, { useState, useEffect } from 'react';
import axios from 'axios';
// අලුතින් Edit2, Trash2, Check, X අයිකන් ටික Import කළා
import { CreditCard, Plus, DollarSign, Calendar, CheckCircle, Edit2, Trash2, Check, X } from 'lucide-react';

const PaymentsList = () => {
    const [payments, setPayments] = useState([]);
    const [units, setUnits] = useState([]);
    const [formData, setFormData] = useState({ unit_id: '', amount: '', due_date: '' });

    // Edit කරන්න තෝරගත්ත Payment එකේ විස්තර තියාගන්න State එක
    const [editingPayment, setEditingPayment] = useState(null);

    const fetchData = async () => {
        try {
            const resPayments = await axios.get('http://localhost:5000/api/payments');
            const resUnits = await axios.get('http://localhost:5000/api/units');
            setPayments(resPayments.data);
            // Rented හෝ Owner Occupied ගෙවල් වලට විතරක් බිල් හදන්න දෙනවා
            setUnits(resUnits.data.filter(u => u.status !== 'vacant'));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // අලුත් බිලක් හදන්න
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

    // බිලක් Approve කරන්න
    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/payments/${id}/approve`);
            fetchData(); // List එක Refresh කරනවා
        } catch (error) {
            alert('❌ Failed to approve payment.');
        }
    };

    // බිලක් Delete කිරීම
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

    // බිල Edit කරලා Save කිරීම
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/payments/${editingPayment.id}`, {
                amount: editingPayment.amount,
                due_date: editingPayment.due_date,
                status: editingPayment.status
            });
            setEditingPayment(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchData();
            alert('✅ Invoice updated successfully!');
        } catch (error) {
            alert('❌ Failed to update invoice');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-primary w-6 h-6" />
                Billing & Payments
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Invoice Generate කරන Form එක (කිසිම වෙනසක් නෑ) */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Generate Invoice</h3>
                    <form onSubmit={handleGenerateInvoice} className="space-y-4">

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Select Unit</label>
                            <select required value={formData.unit_id} onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none appearance-none cursor-pointer">
                                <option value="">-- Choose Unit --</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Amount (LKR)</label>
                            <DollarSign className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="number" required placeholder="e.g. 5000" value={formData.amount}
                                   onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Due Date</label>
                            <Calendar className="absolute left-3 top-9 w-5 h-5 text-gray-500" />
                            <input type="date" required value={formData.due_date}
                                   onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none cursor-pointer" />
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02]">
                            <Plus className="w-5 h-5" /> Generate Bill
                        </button>
                    </form>
                </div>

                {/* Payments List එක */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Invoices & Payments</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-2">Unit</th>
                                <th className="pb-3">Resident</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Due Date</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 pr-4 text-right">Action</th> {/* Action Column එක Right Align කළා */}
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((pay) => (
                                <tr key={pay.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {/* Edit Mode එකේ ඉන්නවද කියලා බලනවා */}
                                    {editingPayment && editingPayment.id === pay.id ? (
                                        // Edit කරන වෙලාවට පේන Inputs
                                        <>
                                            <td className="py-2 pl-2 text-white font-medium">{pay.unit_number}</td>
                                            <td className="py-2 text-gray-300">{pay.resident_name || 'N/A'}</td>
                                            <td className="py-2">
                                                <input type="number" value={editingPayment.amount} onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-24 text-sm" />
                                            </td>
                                            <td className="py-2">
                                                <input type="date" value={editingPayment.due_date.split('T')[0]} onChange={(e) => setEditingPayment({...editingPayment, due_date: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none w-32 text-sm cursor-pointer" />
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
                                        // සාමාන්‍ය වෙලාවට පේන විස්තර
                                        <>
                                            <td className="py-4 pl-2 font-medium text-white">{pay.unit_number}</td>
                                            <td className="py-4 text-gray-300">{pay.resident_name || 'N/A'}</td>
                                            <td className="py-4 text-white font-bold">LKR {Number(pay.amount).toLocaleString()}</td>
                                            <td className="py-4 text-gray-300">{new Date(pay.due_date).toLocaleDateString()}</td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                                                    pay.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex justify-end items-center gap-3">

                                                    {/* Approve Button එක (පරණ විදියටම තියෙනවා) */}
                                                    {pay.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleApprove(pay.id)}
                                                            className="flex items-center gap-1.5 bg-white/10 hover:bg-primary hover:text-black text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Approve
                                                        </button>
                                                    ) : (
                                                        <span className="w-[94px]"></span> // Approve බටන් එක නැති වෙලාවට ඉඩ තියාගන්න
                                                    )}

                                                    {/* Hover කරාම පේන Action Buttons (Edit & Delete) */}
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingPayment(pay)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit invoice">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(pay.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete invoice">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No invoices generated yet.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentsList;