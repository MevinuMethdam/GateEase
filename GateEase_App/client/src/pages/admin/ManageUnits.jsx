import React, { useState, useEffect } from 'react';
import axios from 'axios';
// අලුතින් Edit2, Trash2, Check, X අයිකන් ටික Import කළා
import { Building, Plus, Home, Layers, Maximize, Edit2, Trash2, Check, X } from 'lucide-react';

const ManageUnits = () => {
    const [units, setUnits] = useState([]);
    const [formData, setFormData] = useState({
        unit_number: '',
        floor_number: '',
        square_feet: '',
        status: 'vacant'
    });

    // Edit කරන්න තෝරගත්ත Unit එකේ විස්තර තියාගන්න State එක
    const [editingUnit, setEditingUnit] = useState(null);

    // Database එකෙන් Units ටික අරගන්න Function එක
    const fetchUnits = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/units');
            setUnits(response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    // අලුත් Unit එකක් Save කරන Function එක
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/units', formData);
            alert('✅ Unit added successfully!');
            setFormData({ unit_number: '', floor_number: '', square_feet: '', status: 'vacant' });
            fetchUnits(); // අලුත් එක දැම්මට පස්සේ List එක Update කරන්න
        } catch (error) {
            console.error('Error adding unit:', error);
            alert('❌ Failed to add unit. It might already exist.');
        }
    };

    // Delete කිරීමේ Function එක
    const handleDelete = async (id, unitNumber) => {
        if (window.confirm(`Are you sure you want to delete Unit ${unitNumber}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/units/${id}`);
                fetchUnits(); // Table එක අලුත් කරනවා
                alert('✅ Unit removed successfully!');
            } catch (error) {
                alert('❌ Failed to delete unit. It might be assigned to a resident.');
            }
        }
    };

    // Edit කරපු විස්තර Save කිරීමේ Function එක
    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/units/${editingUnit.id}`, {
                unit_number: editingUnit.unit_number,
                floor_number: editingUnit.floor_number,
                square_feet: editingUnit.square_feet,
                status: editingUnit.status
            });
            setEditingUnit(null); // Edit mode එකෙන් අයින් වෙනවා
            fetchUnits(); // Table එක අලුත් කරනවා
            alert('✅ Unit updated successfully!');
        } catch (error) {
            alert('❌ Failed to update unit details');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Building className="text-primary w-6 h-6" />
                Manage Apartment Units
            </h2>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* අලුත් Unit එකක් දාන Form එක (Left Side - කිසිම වෙනසක් නෑ) */}
                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Add New Unit</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Unit Number (e.g. A-101)</label>
                            <div className="relative">
                                <Home className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.unit_number}
                                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                                    className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none"
                                    placeholder="Enter Unit No"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Floor Number</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    required
                                    value={formData.floor_number}
                                    onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                                    className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none"
                                    placeholder="e.g. 1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Square Feet</label>
                            <div className="relative">
                                <Maximize className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    required
                                    value={formData.square_feet}
                                    onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                                    className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none"
                                    placeholder="e.g. 1200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none appearance-none"
                            >
                                <option value="vacant">Vacant</option>
                                <option value="owner_occupied">Owner Occupied</option>
                                <option value="rented">Rented</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
                        >
                            <Plus className="w-5 h-5" /> Add Unit
                        </button>
                    </form>
                </div>

                {/* දැනට තියෙන Units List එක පෙන්වන තැන (Right Side) */}
                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Registered Units ({units.length})</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-2">Unit No</th>
                                <th className="pb-3">Floor</th>
                                <th className="pb-3">Area (Sq.ft)</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 pr-4 text-right">Actions</th> {/* අලුත් Column එක */}
                            </tr>
                            </thead>
                            <tbody>
                            {units.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No units registered yet.</td>
                                </tr>
                            ) : (
                                units.map((unit) => (
                                    <tr key={unit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">

                                        {/* Edit Mode එකේ ඉන්නවද කියලා බලනවා */}
                                        {editingUnit && editingUnit.id === unit.id ? (
                                            // Edit කරන වෙලාවට පේන Inputs
                                            <>
                                                <td className="py-2 pl-2">
                                                    <input type="text" value={editingUnit.unit_number} onChange={(e) => setEditingUnit({...editingUnit, unit_number: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-24 text-sm" />
                                                </td>
                                                <td className="py-2">
                                                    <input type="number" value={editingUnit.floor_number} onChange={(e) => setEditingUnit({...editingUnit, floor_number: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-20 text-sm" />
                                                </td>
                                                <td className="py-2">
                                                    <input type="number" value={editingUnit.square_feet} onChange={(e) => setEditingUnit({...editingUnit, square_feet: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-24 text-sm" />
                                                </td>
                                                <td className="py-2">
                                                    <select value={editingUnit.status} onChange={(e) => setEditingUnit({...editingUnit, status: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-sm appearance-none">
                                                        <option value="vacant">Vacant</option>
                                                        <option value="owner_occupied">Owner Occupied</option>
                                                        <option value="rented">Rented</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-4 text-right flex justify-end gap-2 items-center h-full mt-1.5">
                                                    <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingUnit(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                </td>
                                            </>
                                        ) : (
                                            // සාමාන්‍ය වෙලාවට පේන විස්තර (ඔයාගේ පරණ UI එකමයි)
                                            <>
                                                <td className="py-4 pl-2 font-medium text-white">{unit.unit_number}</td>
                                                <td className="py-4 text-gray-300">Floor {unit.floor_number}</td>
                                                <td className="py-4 text-gray-300">{unit.square_feet}</td>
                                                <td className="py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        unit.status === 'vacant' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            unit.status === 'rented' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-primary/20 text-primary'
                                                    }`}>
                                                        {unit.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-right">
                                                    {/* Hover කරාම පේන Action Buttons */}
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingUnit(unit)} className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit unit">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(unit.id, unit.unit_number)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove unit">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManageUnits;