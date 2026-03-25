import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Mail, Phone, Lock, User, Edit2, Trash2, X, Check } from 'lucide-react';

const ManageResidents = () => {
    const [residents, setResidents] = useState([]);
    const [units, setUnits] = useState([]); // Assign කරන්න Units පෙන්නන්න
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', unit_id: '', status: 'owner_occupied'
    });

    // Edit කරන්න තෝරගත්ත Resident ගේ විස්තර තියාගන්න State එක
    const [editingUser, setEditingUser] = useState(null);

    const fetchData = async () => {
        try {
            const resResidents = await axios.get('http://localhost:5000/api/users/residents');
            const resUnits = await axios.get('http://localhost:5000/api/units');
            setResidents(resResidents.data);
            // හිස් ගෙවල් (vacant) විතරක් තෝරගන්න දෙනවා
            setUnits(resUnits.data.filter(u => u.status === 'vacant'));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users/residents', formData);
            alert('✅ Resident added successfully!');
            setFormData({ name: '', email: '', password: '', phone: '', unit_id: '', status: 'owner_occupied' });
            fetchData();
        } catch (error) {
            alert('❌ Failed to add resident. Email might exist.');
        }
    };

    // Delete කිරීමේ Function එක (Soft Delete)
    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to remove ${name}? This action will mark their unit as vacant.`)) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                fetchData(); // Table එක අලුත් කරනවා
                alert('✅ Resident removed successfully!');
            } catch (error) {
                alert('❌ Failed to delete resident');
            }
        }
    };

    // Edit කරපු විස්තර Save කිරීමේ Function එක
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, {
                name: editingUser.name,
                email: editingUser.email,
                phone: editingUser.phone
            });
            setEditingUser(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchData(); // Table එක අලුත් කරනවා
            alert('✅ Details updated successfully!');
        } catch (error) {
            alert('❌ Failed to update details');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-primary w-6 h-6" />
                Manage Residents
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Add Resident Form (කිසිම වෙනසක් කරලා නෑ) */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Register Resident</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input type="text" required placeholder="Full Name" value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input type="email" required placeholder="Email Address" value={formData.email}
                                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input type="text" required placeholder="Phone Number" value={formData.phone}
                                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input type="password" required placeholder="Create Password" value={formData.password}
                                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                   className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" />
                        </div>

                        <div className="pt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Assign Unit (Optional)</label>
                            <select value={formData.unit_id} onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none mb-2">
                                <option value="">-- Select Vacant Unit --</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.unit_number} (Floor {u.floor_number})</option>)}
                            </select>

                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 outline-none">
                                <option value="owner_occupied">Owner</option>
                                <option value="rented">Tenant</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02]">
                            <Plus className="w-5 h-5" /> Register Resident
                        </button>
                    </form>
                </div>

                {/* Residents List */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Registered Residents ({residents.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-2">Name</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Phone</th>
                                <th className="pb-3 pr-4 text-right">Actions</th> {/* අලුතින් ආපු Column එක */}
                            </tr>
                            </thead>
                            <tbody>
                            {residents.map((res) => (
                                <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                    {/* Edit Mode එකේ ඉන්නවද කියලා බලනවා */}
                                    {editingUser && editingUser.id === res.id ? (
                                        // Edit කරන වෙලාවට පේන Inputs
                                        <>
                                            <td className="py-3 pl-2">
                                                <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-full text-sm" />
                                            </td>
                                            <td className="py-3">
                                                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-full text-sm" />
                                            </td>
                                            <td className="py-3">
                                                <input type="text" value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-full text-sm" />
                                            </td>
                                            <td className="py-3 pr-4 text-right flex justify-end gap-2 items-center h-full mt-1">
                                                <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingUser(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                            </td>
                                        </>
                                    ) : (
                                        // සාමාන්‍ය වෙලාවට පේන විස්තර
                                        <>
                                            <td className="py-4 pl-2 font-medium text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                                                    {res.name.charAt(0).toUpperCase()}
                                                </div>
                                                {res.name}
                                            </td>
                                            <td className="py-4 text-gray-300 text-sm">{res.email}</td>
                                            <td className="py-4 text-gray-300 text-sm">{res.phone}</td>
                                            <td className="py-4 pr-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingUser(res)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit details">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(res.id, res.name)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove resident">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {residents.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500 text-sm">
                                        No residents registered yet.
                                    </td>
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

export default ManageResidents;