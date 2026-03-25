import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Home, CheckCircle, XCircle, User, ChevronDown, MapPin, Search, Info } from 'lucide-react';

const ManageRooms = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [approvedBookings, setApprovedBookings] = useState([]);
    const [unitInputs, setUnitInputs] = useState({});

    const [allDbUnits, setAllDbUnits] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Global state for tooltip to prevent clipping/overlapping
    const [hoveredUnit, setHoveredUnit] = useState(null);

    const CATEGORIES = [
        "All",
        "The Platinum Penthouse",
        "Emerald Deluxe Suite",
        "Urban Loft Apartment",
        "Cozy Studio Unit"
    ];

    // Position mapping for isometric grid
    const getCubePosition = (uIdx) => {
        const gridX = uIdx % 3;
        const gridZ = Math.floor(uIdx / 3);
        const offX = gridX * 90 + gridZ * -90;
        const offY = gridX * 45 + gridZ * 45;
        return { x: offX, y: offY };
    }

    useEffect(() => {
        fetchRequests();
        fetchUnits();
        fetchApprovedBookings();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms/requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests from DB:', err);
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            if (Array.isArray(res.data)) {
                setAllDbUnits(res.data);
                const vacantUnits = res.data.filter(
                    unit => unit.status && unit.status.trim().toLowerCase() === 'vacant'
                );
                setAvailableUnits(vacantUnits);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const fetchApprovedBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms/approved');
            setApprovedBookings(res.data);
        } catch (err) {
            console.error('Error fetching approved bookings:', err);
        }
    };

    const handleApprove = async (reqId) => {
        const unit_number = unitInputs[reqId];
        if (!unit_number || unit_number.trim() === '') {
            alert("Please select a Unit Number from the dropdown before approving.");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/rooms/requests/${reqId}/approve`, { unit_number });
            setRequests(requests.filter(req => req.id !== reqId));
            fetchUnits();
            fetchApprovedBookings();
            alert(`Request Approved! Unit ${unit_number} assigned successfully.`);
        } catch (error) {
            console.error('Approval API failed:', error);
            alert('Failed to approve request. Check backend console.');
        }
    };

    const handleReject = async (reqId) => {
        if (window.confirm("Are you sure you want to reject this booking request?")) {
            try {
                await axios.put(`http://localhost:5000/api/rooms/requests/${reqId}/reject`);
                setRequests(requests.filter(req => req.id !== reqId));
                alert('Request Rejected.');
            } catch (error) {
                console.error('Reject API failed:', error);
                alert('Failed to reject request.');
            }
        }
    };

    const filteredBookings = approvedBookings.filter((booking) => {
        const matchesCategory = activeCategory === 'All' || (booking.roomName && booking.roomName.trim() === activeCategory);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            (booking.residentName && booking.residentName.toLowerCase().includes(searchLower)) ||
            (booking.unitNumber && booking.unitNumber.toLowerCase().includes(searchLower));
        return matchesCategory && matchesSearch;
    });

    const systemUnits = useMemo(() => {
        const map = new Map();
        allDbUnits.forEach(u => {
            const id = u.unit_no || u.unit_number || u.unitNo || '';
            if(id) {
                const isRented = u.status && ['rented', 'booked', 'occupied'].includes(u.status.trim().toLowerCase());
                map.set(id.toUpperCase(), { id, type: u.category || 'Unit', status: isRented ? 'booked' : 'vacant', res: 'Occupied' });
            }
        });
        approvedBookings.forEach(b => {
            const id = b.unitNumber || '';
            if(id) {
                map.set(id.toUpperCase(), { id, type: b.roomName || 'Unit', status: 'booked', res: b.residentName });
            }
        });
        const arr = Array.from(map.values());
        const grouped = {};
        arr.forEach(u => {
            const match = u.id.match(/\d+/);
            const floorNum = match ? parseInt(match[0].charAt(0)) : 1;
            if(!grouped[floorNum]) grouped[floorNum] = [];
            grouped[floorNum].push(u);
        });
        return grouped;
    }, [allDbUnits, approvedBookings]);

    // ========================================================= //
    // 🌟 FUTURISTIC SVG 3D BLOCK COMPONENT 🌟
    // ========================================================= //
    const SvgCube = ({ id, type, x, y, isBooked, residentName }) => {

        // 🌟 The exact visual style from your uploaded image
        const topFill = isBooked ? '#C0DE1B' : 'rgba(15, 30, 60, 0.4)';
        const leftFill = isBooked ? '#9dbd00' : 'rgba(20, 40, 80, 0.6)';
        const rightFill = isBooked ? '#7a9600' : 'rgba(10, 20, 45, 0.8)';

        // Wireframe borders
        const strokeColor = isBooked ? '#E2F75E' : 'rgba(56, 189, 248, 0.4)';
        const textColor = isBooked ? '#000000' : 'rgba(186, 230, 253, 0.8)';

        // Polygons for the 3D isometric cube
        const pTop = "-50,0 0,-25 50,0 0,25";
        const pLeft = "-50,0 0,25 0,75 -50,50";
        const pRight = "0,25 50,0 50,50 0,75";
        const pHitbox = "-50,0 0,-25 50,0 50,50 0,75 -50,50";

        // Extra wireframe details for vacant units (X-cross on top)
        const topCross = "-50,0 50,0 M 0,-25 0,25";

        const [isHovered, setIsHovered] = useState(false);

        return (
            <g
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={() => isBooked && setSearchQuery(id)}
                onMouseEnter={() => {
                    setIsHovered(true);
                    setHoveredUnit({ id, type, isBooked, residentName, x, y });
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setHoveredUnit(null);
                }}
            >
                {/* Hitbox */}
                <polygon points={pHitbox} fill="transparent" className="pointer-events-auto" />

                {/* Animated Cube Group */}
                <g
                    style={{ transform: isHovered ? 'translateY(-15px)' : 'translateY(0px)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    className="pointer-events-none"
                >
                    {/* Add Glow Filter to Booked Units */}
                    {isBooked && (
                        <polygon points={pHitbox} fill="#C0DE1B" filter="url(#neon-glow)" opacity="0.4" />
                    )}

                    <polygon points={pLeft} fill={leftFill} stroke={strokeColor} strokeWidth="1.5" />
                    <polygon points={pRight} fill={rightFill} stroke={strokeColor} strokeWidth="1.5" />
                    <polygon points={pTop} fill={topFill} stroke={strokeColor} strokeWidth="1.5" />

                    {/* Internal Wireframe details for vacant units to match your design */}
                    {!isBooked && (
                        <path d={topCross} stroke={strokeColor} strokeWidth="0.5" opacity="0.5" />
                    )}

                    <text x={0} y={8} fill={textColor} fontSize="14" fontWeight="900" textAnchor="middle" className="font-mono tracking-wider">
                        {id.replace(/[^0-9]/g, '')}
                    </text>
                </g>
            </g>
        );
    };

    const SvgFloor = ({ x, y }) => (
        <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
            <polygon
                points="-350,0 0,-175 350,0 0,175"
                fill="rgba(14, 165, 233, 0.02)"
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="2"
            />
            {/* Grid lines on the floor */}
            <polygon points="-250,0 0,-125 250,0 0,125" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" />
            <polygon points="-150,0 0,-75 150,0 0,75" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" />
        </g>
    );

    return (
        <div className="max-w-7xl mx-auto font-sans pb-12 px-4">
            <style dangerouslySetInlineStyle={{__html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#EAEAEA] tracking-tight mb-2">Manage Rooms</h1>
                    <p className="text-[#848484] text-[15px]">Manage apartments and resident booking requests.</p>
                </div>

                <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/10">
                    <button onClick={() => setActiveTab('rooms')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'rooms' ? 'bg-[#C0DE1B] text-black shadow-[0_0_15px_rgba(192,222,24,0.3)]' : 'text-[#848484] hover:text-white'}`}>
                        All Rooms
                    </button>
                    <button onClick={() => setActiveTab('requests')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-[#C0DE1B] text-black shadow-[0_0_15px_rgba(192,222,24,0.3)]' : 'text-[#848484] hover:text-white'}`}>
                        Booking Requests {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
                    </button>
                </div>
            </div>

            {activeTab === 'rooms' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* ========================================================= */}
                    {/* 🌟 THE FUTURISTIC 3D BUILDING DASHBOARD WIDGET 🌟 */}
                    {/* ========================================================= */}
                    <div className="mb-8 p-6 md:p-8 rounded-[32px] bg-[#030712] border border-white/5 shadow-2xl relative overflow-hidden">

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-[#C0DE1B]" /> Live 3D Building Layout
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Hover & click glowing units to view resident details.</p>
                            </div>

                            <div className="flex gap-5 text-xs font-bold uppercase tracking-widest bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#C0DE1B] shadow-[0_0_15px_rgba(192,222,27,0.8)]"></div> <span className="text-white">Occupied</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[rgba(15,30,60,0.8)] border border-[rgba(56,189,248,0.5)]"></div> <span className="text-slate-400">Vacant</span></div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center overflow-x-auto no-scrollbar pb-10 relative">
                            <div className="relative w-[800px] h-[750px] shrink-0">

                                <svg width="100%" height="100%" viewBox="0 0 800 750" className="overflow-visible">
                                    <defs>
                                        {/* Super clean neon glow filter for the booked units */}
                                        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {
                                        Object.keys(systemUnits).sort((a,b) => a - b).map((floorNum, fIdx) => {
                                            const unitsOnFloor = systemUnits[floorNum];
                                            unitsOnFloor.sort((a, b) => a.id.localeCompare(b.id));

                                            const baseX = 400; // Center of 800px width
                                            const baseY = 650 - (fIdx * 170); // Taller stacking

                                            return (
                                                <g key={`floor-${floorNum}`}>
                                                    <SvgFloor x={baseX} y={baseY} />
                                                    {unitsOnFloor.slice(0, 9).map((unit, uIdx) => {
                                                        const pos = getCubePosition(uIdx);
                                                        return (
                                                            <SvgCube
                                                                key={unit.id}
                                                                id={unit.id}
                                                                type={unit.type}
                                                                x={baseX + pos.x}
                                                                y={baseY + pos.y}
                                                                isBooked={unit.status === 'booked'}
                                                                residentName={unit.res}
                                                            />
                                                        );
                                                    })}
                                                </g>
                                            );
                                        })
                                    }
                                </svg>

                                {/* 🌟 FUTURISTIC GLOBAL TOOLTIP OVERLAY 🌟 */}
                                {hoveredUnit && (
                                    <div
                                        className="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
                                        style={{
                                            left: hoveredUnit.x,
                                            top: hoveredUnit.y - 40,
                                            transform: 'translate(-50%, -100%)'
                                        }}
                                    >
                                        <div className="bg-slate-900/95 border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl p-3 flex items-center gap-4 w-max backdrop-blur-xl">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${hoveredUnit.isBooked ? 'bg-[#C0DE1B]/20' : 'bg-blue-500/10'}`}>
                                                <Info className={`w-5 h-5 ${hoveredUnit.isBooked ? 'text-[#C0DE1B]' : 'text-blue-400'}`} />
                                            </div>
                                            <div className="text-left pr-4">
                                                <div className="text-white font-bold text-[15px] tracking-wide leading-tight">{hoveredUnit.id} • {hoveredUnit.type}</div>
                                                <div className={`text-[11px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5 ${hoveredUnit.isBooked ? 'text-[#C0DE1B]' : 'text-slate-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${hoveredUnit.isBooked ? 'bg-[#C0DE1B] animate-pulse' : 'bg-slate-500'}`}></span>
                                                    {hoveredUnit.isBooked ? `Resident: ${hoveredUnit.residentName}` : 'Status: Vacant'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 bg-slate-900/95 border-b border-r border-slate-700 rotate-45 mx-auto -mt-2.5 backdrop-blur-xl"></div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                    {/* ========================================================= */}

                    {/* EXISTING: Search and Filters Section */}
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-5 mb-8 shadow-lg flex flex-col md:flex-row gap-5 items-center justify-between">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] group-focus-within:text-[#C0DE1B] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or unit no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#111111] text-white pl-11 pr-4 py-3 rounded-2xl border border-white/5 focus:border-[#C0DE1B]/50 outline-none text-sm shadow-inner transition-all placeholder:text-[#555]"
                            />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap w-full">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 border ${
                                        activeCategory === cat
                                            ? 'bg-white text-black border-white shadow-[0_4px_15px_rgba(255,255,255,0.2)]'
                                            : 'bg-[#111111] text-[#848484] border-white/5 hover:bg-white/5 hover:text-[#EAEAEA]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* EXISTING: Approved Bookings Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredBookings.length === 0 ? (
                            <div className="col-span-1 lg:col-span-2 text-center py-16 bg-white/[0.01] rounded-[32px] border border-white/5 border-dashed">
                                <Search className="w-12 h-12 text-[#333333] mx-auto mb-4" />
                                <p className="text-[#848484] font-medium text-lg tracking-wide">No assigned rooms match your search.</p>
                            </div>
                        ) : (
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="bg-[#0A0A0A] backdrop-blur-xl rounded-[28px] p-6 border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col hover:border-[#C0DE1B]/30 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(192,222,24,0.1)] transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C0DE1B] opacity-0 blur-[50px] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-[16px] flex items-center justify-center group-hover:bg-[#C0DE1B]/10 group-hover:border-[#C0DE1B]/30 transition-colors duration-300">
                                                <Home className="w-6 h-6 text-[#C0DE1B]" />
                                            </div>
                                            <div>
                                                <h4 className="text-[#EAEAEA] font-extrabold text-xl tracking-tight leading-tight group-hover:text-white transition-colors">{booking.roomName}</h4>
                                                <p className="text-[#666666] text-xs font-medium mt-0.5">Approved: {new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase tracking-widest font-bold rounded-full">Booked</span>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[#666666] text-[10px] uppercase tracking-widest font-bold mb-1">Resident</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-[#A0A0A0]" />
                                                </div>
                                                <p className="text-[#EAEAEA] font-bold text-sm">{booking.residentName}</p>
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-white/[0.05]"></div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[#666666] text-[10px] uppercase tracking-widest font-bold mb-1">Assigned Unit</span>
                                            <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1 rounded-lg border border-white/[0.05]">
                                                <MapPin className="w-3.5 h-3.5 text-[#C0DE1B]" />
                                                <p className="text-white font-extrabold text-sm tracking-wide">{booking.unitNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* EXISTING: Booking Requests Tab */}
            {activeTab === 'requests' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.length === 0 ? (
                        <div className="col-span-2 text-center py-12 bg-white/[0.01] rounded-3xl border border-white/5 border-dashed">
                            <p className="text-[#848484] font-medium">No pending requests at the moment.</p>
                        </div>
                    ) : null}

                    {requests.map((req) => {
                        const matchingUnits = availableUnits.filter(
                            unit => unit.category && req.roomName && unit.category.trim().toLowerCase() === req.roomName.trim().toLowerCase()
                        );

                        return (
                            <div key={req.id} className="bg-[#070707]/90 backdrop-blur-xl rounded-[24px] p-6 border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between hover:border-white/[0.1] transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#111111] rounded-[14px] flex items-center justify-center border border-white/5 shadow-inner">
                                            <User className="w-5 h-5 text-[#C0DE1B] drop-shadow-[0_0_8px_rgba(192,222,24,0.5)]" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{req.residentName}</h4>
                                            <p className="text-[#848484] text-xs">Requested on: {req.date}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase tracking-wider font-extrabold rounded-full">Pending</span>
                                </div>

                                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05] mb-5 shadow-inner">
                                    <p className="text-[#848484] text-[11px] font-bold uppercase tracking-widest mb-1.5">Requested Property:</p>
                                    <p className="text-[#C0DE1B] font-extrabold text-[19px] tracking-tight">{req.roomName}</p>
                                </div>

                                <div className="mb-6 relative">
                                    <label className="text-[#848484] text-[11px] font-bold uppercase tracking-widest mb-2 block">Assign Unit Number</label>
                                    <div className="relative group">
                                        <select
                                            value={unitInputs[req.id] || ''}
                                            onChange={(e) => setUnitInputs({ ...unitInputs, [req.id]: e.target.value })}
                                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-[#C0DE1B] focus:shadow-[0_0_15px_rgba(192,222,24,0.2)] transition-all appearance-none cursor-pointer hover:border-white/20"
                                        >
                                            <option value="" disabled className="text-[#666666]">-- Select an available unit --</option>
                                            {matchingUnits.length > 0 ? (
                                                matchingUnits.map((unit, index) => {
                                                    const displayUnit = unit.unit_no || unit.unit_number || unit.unitNo || "Unknown Unit";
                                                    return (
                                                        <option key={index} value={displayUnit} className="bg-[#111111] text-white">
                                                            {displayUnit}
                                                        </option>
                                                    );
                                                })
                                            ) : (
                                                <option value="" disabled className="text-red-400 font-bold bg-[#111111]">
                                                    ⚠️ No vacant {req.roomName} available
                                                </option>
                                            )}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#848484] group-hover:text-white transition-colors">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-auto">
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        disabled={matchingUnits.length === 0}
                                        className={`flex-1 py-3.5 font-extrabold rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 
                                            ${matchingUnits.length === 0
                                            ? 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#C0DE1B]/10 to-[#C0DE1B]/5 hover:from-[#C0DE1B] hover:to-[#9EBA11] text-[#C0DE1B] hover:text-black border-[#C0DE1B]/30 hover:border-transparent shadow-[0_0_15px_rgba(192,222,24,0.1)]'
                                        }`}
                                    >
                                        <CheckCircle className="w-5 h-5" /> Approve
                                    </button>
                                    <button onClick={() => handleReject(req.id)} className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-extrabold rounded-xl border border-red-500/30 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2">
                                        <XCircle className="w-5 h-5" /> Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ManageRooms;