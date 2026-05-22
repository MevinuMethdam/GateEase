import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Plus, Home, Layers, Maximize, Edit2, Trash2, Check, X, Crown, Gem, Key, AlertTriangle } from 'lucide-react';

const ManageUnits = () => {
    const [units, setUnits] = useState([]);
    const [inactiveUnitNumbers, setInactiveUnitNumbers] = useState([]);

    const [formData, setFormData] = useState({
        unit_number: '', floor_number: '', square_feet: '', status: 'vacant', category: ''
    });
    const [editingUnit, setEditingUnit] = useState(null);

    const [unitError, setUnitError] = useState('');

    const ROOM_CATEGORIES = [
        { name: "The Platinum Penthouse", icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
        { name: "Emerald Deluxe Suite", icon: Gem, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
        { name: "Urban Loft Apartment", icon: Building, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        { name: "Cozy Studio Unit", icon: Home, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" }
    ];

    const validateUnitNumber = (unitString, currentUnitId = null) => {
        if (!unitString) return null;

        const numbersOnly = unitString.replace(/\D/g, '');
        if (numbersOnly.length < 3) {
            return "Format must include floor and unit (e.g. A-101, B-504)";
        }

        const floorStr = numbersOnly.substring(0, numbersOnly.length - 2);
        const unitPosStr = numbersOnly.substring(numbersOnly.length - 2);

        const floorNum = parseInt(floorStr);
        const unitPos = parseInt(unitPosStr);

        if (floorNum < 1 || floorNum > 20) {
            return `Max 20 floors allowed. You entered Floor ${floorNum}.`;
        }

        if (unitPos < 1 || unitPos > 9) {
            return `Unit position must be between 01-09. You entered ${unitPosStr}.`;
        }

        const unitsOnThisFloor = units.filter(u => {
            if (currentUnitId && u.id === currentUnitId) return false;

            const uNumbersOnly = (u.unit_number || u.unit_no || '').replace(/\D/g, '');
            if (uNumbersOnly.length >= 3) {
                const uFloorNum = parseInt(uNumbersOnly.substring(0, uNumbersOnly.length - 2));
                return uFloorNum === floorNum;
            }
            return false;
        });

        if (unitsOnThisFloor.length >= 9) {
            return `Floor ${floorNum} is full! Maximum 9 units allowed per floor in total.`;
        }

        const isDuplicate = units.some(u =>
            (u.unit_number || u.unit_no || '').toUpperCase().trim() === unitString.toUpperCase().trim() &&
            (!currentUnitId || u.id !== currentUnitId)
        );
        if (isDuplicate) {
            return `Unit ${unitString.toUpperCase()} already exists in the system.`;
        }

        return null;
    };

    useEffect(() => {
        if (formData.unit_number) {
            const errorMsg = validateUnitNumber(formData.unit_number);
            setUnitError(errorMsg || '');

            const numbersOnly = formData.unit_number.replace(/\D/g, '');
            if (numbersOnly.length > 0) {
                let detectedFloor = 1;
                if (numbersOnly.length >= 3) {
                    detectedFloor = parseInt(numbersOnly.substring(0, numbersOnly.length - 2));
                } else {
                    detectedFloor = parseInt(numbersOnly.charAt(0));
                }

                if (detectedFloor > 20) detectedFloor = 20;
                else if (detectedFloor <= 0 || isNaN(detectedFloor)) detectedFloor = 1;

                setFormData(prev => ({ ...prev, floor_number: detectedFloor.toString() }));
            } else {
                setFormData(prev => ({ ...prev, floor_number: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, floor_number: '' }));
            setUnitError('');
        }
    }, [formData.unit_number, units]);

    useEffect(() => {
        if (editingUnit && editingUnit.unit_number) {
            const numbersOnly = editingUnit.unit_number.replace(/\D/g, '');
            if (numbersOnly.length > 0) {
                let detectedFloor = 1;
                if (numbersOnly.length >= 3) {
                    detectedFloor = parseInt(numbersOnly.substring(0, numbersOnly.length - 2));
                } else {
                    detectedFloor = parseInt(numbersOnly.charAt(0));
                }

                if (detectedFloor > 20) detectedFloor = 20;
                else if (detectedFloor <= 0 || isNaN(detectedFloor)) detectedFloor = 1;

                setEditingUnit(prev => ({ ...prev, floor_number: detectedFloor.toString() }));
            }
        }
    }, [editingUnit?.unit_number]);

    const fetchUnits = async () => {
        try {
            const [resUnits, resUsers] = await Promise.all([
                axios.get('http://localhost:5000/api/units'),
                axios.get('http://localhost:5000/api/users/residents')
            ]);

            const dbUnits = resUnits.data || [];
            const dbUsers = resUsers.data || [];

            const lockedSet = new Set();

            dbUsers.forEach(user => {
                const unitNo = user.unit_no || user.unit_number ? String(user.unit_no || user.unit_number).toUpperCase().trim() : null;
                if (user.status === 'inactive' && unitNo) {
                    lockedSet.add(unitNo);
                }
            });

            setInactiveUnitNumbers(Array.from(lockedSet));

            const mappedUnits = dbUnits.map(unit => {
                const unitNoUpper = unit.unit_no || unit.unit_number ? String(unit.unit_no || unit.unit_number).toUpperCase().trim() : null;
                let finalStatus = unit.status ? String(unit.status).toLowerCase() : 'vacant';

                if (lockedSet.has(unitNoUpper)) {
                    finalStatus = 'locked';
                }

                return { ...unit, computedStatus: finalStatus };
            });

            setUnits(mappedUnits);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateUnitNumber(formData.unit_number);
        if (validationError) {
            alert(`Cannot create unit:\n${validationError}`);
            return;
        }

        if (!formData.category) {
            alert('Please select a room category!');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/units', formData);
            alert('✅ Unit added successfully!');
            setFormData({ unit_number: '', floor_number: '', square_feet: '', status: 'vacant', category: '' });
            fetchUnits();
        } catch (error) {
            alert('❌ Failed to add unit. It might already exist.');
        }
    };

    const handleDelete = async (id, unitNumber) => {
        if (window.confirm(`Are you sure you want to delete Unit ${unitNumber}?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/units/${id}`);
                fetchUnits();
                alert('✅ Unit removed successfully!');
            } catch (error) {
                alert('❌ Failed to delete unit. It might be assigned to a resident.');
            }
        }
    };

    const handleUpdate = async () => {
        const validationError = validateUnitNumber(editingUnit.unit_number, editingUnit.id);
        if (validationError) {
            alert(`Cannot update unit:\n${validationError}`);
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/units/${editingUnit.id}`, {
                unit_number: editingUnit.unit_number,
                floor_number: editingUnit.floor_number,
                square_feet: editingUnit.square_feet,
                status: editingUnit.status,
                category: editingUnit.category
            });
            setEditingUnit(null);
            fetchUnits();
            alert('✅ Unit updated successfully!');
        } catch (error) {
            console.error('Unit Update Error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(`❌ Database rejected the update. Error: ${error.response.data.message || error.message}`);
            } else {
                alert('❌ Failed to update unit details. Check Database Schema.');
            }
        }
    };

    const getCategoryStats = (categoryName) => {
        const catUnits = units.filter(u => u.category === categoryName);
        const available = catUnits.filter(u => u.computedStatus === 'vacant').length;
        const booked = catUnits.filter(u => u.computedStatus !== 'vacant' && u.computedStatus !== 'locked').length;

        return { total: catUnits.length, available, booked };
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Building className="text-primary w-6 h-6" />
                Manage Apartment Units
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {ROOM_CATEGORIES.map((cat, index) => {
                    const stats = getCategoryStats(cat.name);
                    const Icon = cat.icon;
                    return (
                        <div key={index} className={`bg-dark-card border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group`}>
                            <div className={`absolute -top-10 -right-10 w-24 h-24 ${cat.bg} rounded-full blur-[30px] pointer-events-none transition-all duration-500 group-hover:scale-150`}></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`w-5 h-5 ${cat.color}`} />
                                    <h3 className="text-white font-bold text-xs leading-tight">{cat.name}</h3>
                                </div>

                                <div className="flex justify-between items-end mt-3">
                                    <div className="bg-dark-input border border-white/5 px-3 py-2 rounded-xl text-center w-[48%]">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Booked</p>
                                        <p className="text-lg font-bold text-white">{stats.booked}</p>
                                    </div>
                                    <div className="bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl text-center w-[48%]">
                                        <p className="text-[9px] text-primary uppercase tracking-widest font-bold mb-0.5">Available</p>
                                        <p className="text-lg font-bold text-primary">{stats.available}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 bg-dark-card p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Add New Unit</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Unit Number (e.g. A-101)</label>
                            <div className="relative">
                                <Home className={`absolute left-3 top-3.5 w-5 h-5 ${unitError ? 'text-red-500' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    required
                                    value={formData.unit_number}
                                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value.toUpperCase() })}
                                    className={`w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border outline-none transition-colors
                                        ${unitError ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}
                                    placeholder="Enter Unit No"
                                />
                            </div>
                            {unitError && (
                                <p className="text-red-400 text-[11px] mt-1.5 flex items-start gap-1 font-medium leading-tight">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {unitError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Room Category</label>
                            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-dark-input text-white px-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none appearance-none cursor-pointer">
                                <option value="" className="text-gray-500">-- Select Category --</option>
                                {ROOM_CATEGORIES.map((cat, idx) => (
                                    <option key={idx} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Floor Number</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    required
                                    value={formData.floor_number}
                                    readOnly
                                    className="w-full bg-dark-input/50 text-gray-400 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none cursor-not-allowed select-none"
                                    placeholder="Auto-detected"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Square Feet</label>
                            <div className="relative">
                                <Maximize className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input type="number" required value={formData.square_feet} onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })} className="w-full bg-dark-input text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:border-primary/50 outline-none" placeholder="e.g. 1200" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Initial Status</label>
                            <input
                                type="text"
                                value="Vacant"
                                readOnly
                                className="w-full bg-dark-input/50 text-gray-400 px-4 py-3 rounded-xl border border-white/5 outline-none cursor-not-allowed select-none font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!!unitError}
                            className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4
                                ${unitError ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-black'}`}
                        >
                            <Plus className="w-5 h-5" /> Add Unit
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-dark-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Registered Units ({units.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-3 pl-2">Unit No</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Floor</th>
                                <th className="pb-3">Area (Sq.ft)</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 pr-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {units.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No units registered yet.</td></tr>
                            ) : (
                                units.map((unit) => {
                                    const currentStatus = unit.computedStatus || 'vacant';

                                    return (
                                        <tr key={unit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            {editingUnit && editingUnit.id === unit.id ? (
                                                <>
                                                    <td className="py-2 pl-2"><input type="text" value={editingUnit.unit_number} onChange={(e) => setEditingUnit({...editingUnit, unit_number: e.target.value.toUpperCase()})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-20 text-sm" /></td>

                                                    <td className="py-2">
                                                        <select value={editingUnit.category || ''} onChange={(e) => setEditingUnit({...editingUnit, category: e.target.value})} className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-xs w-32 appearance-none">
                                                            <option value="">-- Category --</option>
                                                            {ROOM_CATEGORIES.map((cat, idx) => (
                                                                <option key={idx} value={cat.name}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td className="py-2">
                                                        <input
                                                            type="text"
                                                            value={editingUnit.floor_number}
                                                            readOnly
                                                            className="bg-dark-input/30 text-gray-500 px-3 py-1.5 rounded-lg border border-white/5 outline-none w-16 text-sm cursor-not-allowed select-none"
                                                        />
                                                    </td>

                                                    <td className="py-2"><input type="number" value={editingUnit.square_feet} onChange={(e) => setEditingUnit({...editingUnit, square_feet: e.target.value})} className="bg-dark-input text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none w-20 text-sm" /></td>

                                                    <td className="py-2">
                                                        <select
                                                            value={editingUnit.status || 'vacant'}
                                                            onChange={(e) => setEditingUnit({...editingUnit, status: e.target.value})}
                                                            className="bg-dark-input text-white px-2 py-1.5 rounded-lg border border-white/10 outline-none text-sm appearance-none cursor-pointer"
                                                        >
                                                            <option value="vacant">Vacant</option>
                                                            <option value="owner_occupied">Owner Occupied</option>
                                                            <option value="rented">Rented</option>
                                                            <option value="locked">Locked</option>
                                                        </select>
                                                    </td>

                                                    <td className="py-2 pr-4 text-right flex justify-end gap-2 items-center h-full mt-1.5">
                                                        <button onClick={handleUpdate} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingUnit(null)} className="p-1.5 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-4 pl-2 font-medium text-white">{unit.unit_number}</td>
                                                    <td className="py-4">
                                                        <span className="text-gray-300 text-xs bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                            {unit.category || 'Not Assigned'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 text-gray-300">Floor {unit.floor_number}</td>
                                                    <td className="py-4 text-gray-300">{unit.square_feet}</td>
                                                    <td className="py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        currentStatus === 'locked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                            currentStatus === 'vacant' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                currentStatus === 'rented' ? 'bg-blue-500/20 text-blue-400' :
                                                                    currentStatus === 'owner_occupied' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                                        'bg-primary/20 text-primary'
                                                    }`}>
                                                        {currentStatus.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    </td>
                                                    <td className="py-4 pr-4 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => setEditingUnit({...unit, status: currentStatus})}
                                                                className="text-gray-400 hover:text-primary transition-colors p-1"
                                                                title="Edit unit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(unit.id, unit.unit_number)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Remove unit"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    )})
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