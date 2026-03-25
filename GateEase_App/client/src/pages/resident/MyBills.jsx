import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const MyBills = () => {
    const [bills, setBills] = useState([]);

    // Token එකෙන් User ID එක ගන්නවා
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

    // සල්ලි ගෙවන Button එක එබුවම වෙන දේ (Mock Payment Gateway)
    const handlePayNow = () => {
        alert('💳 Payment Gateway Integration is required to process online payments. \n\n(For now, please hand over the cash to the admin to mark this as PAID).');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-primary w-6 h-6" />
                My Maintenance Bills
            </h2>

            <div className="bg-dark-card p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="pb-4 pl-4">Invoice Details</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Due Date</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 pr-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <td className="py-5 pl-4 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        bill.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-base">Monthly Maintenance</p>
                                        <p className="text-sm text-gray-500">Unit: {bill.unit_number}</p>
                                    </div>
                                </td>

                                <td className="py-5">
                    <span className="text-lg font-bold text-white tracking-tight">
                      LKR {Number(bill.amount).toLocaleString()}
                    </span>
                                </td>

                                <td className="py-5 text-gray-400">
                                    {new Date(bill.due_date).toLocaleDateString()}
                                </td>

                                <td className="py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 ${
                        bill.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {bill.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {bill.status.toUpperCase()}
                    </span>
                                </td>

                                <td className="py-5 pr-4 text-right">
                                    {bill.status === 'pending' ? (
                                        <button
                                            onClick={handlePayNow}
                                            className="bg-primary hover:bg-primary-hover text-black font-bold px-5 py-2 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 ml-auto shadow-[0_0_15px_rgba(192,222,24,0.3)]"
                                        >
                                            <DollarSign className="w-4 h-4" /> Pay Now
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 text-sm font-medium italic">Payment Settled</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {bills.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <CreditCard className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-lg">No bills found.</p>
                                        <p className="text-sm">You do not have any generated invoices yet.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyBills;