import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BedDouble, Wind, Wifi, CheckCircle2, Sparkles, Send, Clock, XCircle, FileSignature, Home } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop";
const RoomCard = ({ room, onRequest, requestStatus, userStatus }) => {
    const facilities = room.features ? room.features.split(',').map(f => f.trim()) : [];

    return (
        <div className="relative w-full min-h-[400px] md:min-h-[480px] rounded-[36px] overflow-hidden group cursor-pointer bg-[#070707]/30 backdrop-blur-2xl border-t border-l border-white/[0.1] border-b-0 border-r-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_rgba(192,222,24,0.15)] transition-all duration-700 transform hover:-translate-y-2 flex flex-col justify-end">

            <img
                src={room.image_url || room.image}
                alt={room.title}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#050505]/70 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-90"></div>

            <div className="absolute top-6 left-6 z-20">
                <div className="px-4 py-2 rounded-full backdrop-blur-2xl bg-black/40 border border-white/[0.1] flex items-center gap-2.5 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-[#C0DE1B] shadow-[0_0_12px_#C0DE1B] animate-pulse"></div>
                    <span className="text-[11px] text-[#EAEAEA] uppercase tracking-widest font-extrabold">Available Now</span>
                </div>
            </div>

            <div className="relative z-20 p-8 md:p-12 w-full max-w-4xl mx-auto flex flex-col justify-end">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

                    <div className="flex-1">
                        <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-2xl group-hover:text-[#C0DE1B] transition-colors duration-500 leading-tight">
                            {room.title}
                        </h3>

                        <p className="flex items-baseline gap-1.5 mb-6 md:mb-0">
                            <span className="text-[#A0A0A0] text-sm font-bold tracking-wider uppercase">LKR</span>
                            <span className="text-3xl md:text-[40px] font-extrabold text-[#EAEAEA] tracking-tighter drop-shadow-md">{Number(room.price).toLocaleString()}</span>
                            <span className="text-[#A0A0A0] text-sm font-medium tracking-wide">/ month</span>
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-6">
                        <div className="flex flex-wrap gap-2.5 justify-start md:justify-end">
                            {facilities.map((facility, index) => {
                                let Icon = CheckCircle2;
                                if(facility.toLowerCase().includes('bed')) Icon = BedDouble;
                                if(facility.toLowerCase().includes('ac')) Icon = Wind;
                                if(facility.toLowerCase().includes('wifi')) Icon = Wifi;

                                return (
                                    <span key={index} className="px-4 py-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl text-xs font-bold text-[#D0D0D0] flex items-center gap-2 shadow-sm">
                                        <Icon className="w-4 h-4 text-[#C0DE1B]" />
                                        {facility}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="w-full md:w-auto">
                            {userStatus === 'inactive' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                                    <XCircle className="w-5 h-5" />
                                    <span>Account Deactivated</span>
                                </button>
                            ) : requestStatus === 'Pending' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                    <span>Pending Approval</span>
                                </button>
                            ) : requestStatus === 'Rejected' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                                    <XCircle className="w-5 h-5" />
                                    <span>Rejected</span>
                                </button>
                            ) : requestStatus === 'Offer Made' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-orange-500/10 border border-orange-500/30 text-orange-500 font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                                    <FileSignature className="w-5 h-5 animate-pulse" />
                                    <span>Pending Signature</span>
                                </button>
                            ) : requestStatus === 'Rented' || requestStatus === 'Approved' || requestStatus === 'Owner Occupied' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-[#C0DE1B]/10 border border-[#C0DE1B]/30 text-[#C0DE1B] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 cursor-not-allowed">
                                    <Home className="w-5 h-5" />
                                    <span>Your Active Property</span>
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRequest(room.id); }}
                                    className="w-full md:w-auto px-8 py-4 bg-[#C0DE1B] text-[#050505] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 hover:bg-[#DFFF2E] transition-all duration-300"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>Request Booking</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResidentRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [myRequests, setMyRequests] = useState({});
    const [message, setMessage] = useState('');
    const [userStatus, setUserStatus] = useState('active');

    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (userId) return userId;
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(window.atob(base64));
                return decoded.id || decoded._id;
            } catch (e) { console.error("Token decode error", e); }
        }
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                return parsedUser.id || parsedUser._id;
            } catch (e) { console.error(e); }
        }
        return null;
    };

    useEffect(() => {
        const userId = getUserId();

        const loadData = async () => {
            try {
                const roomsRes = await axios.get('http://localhost:5000/api/rooms');
                const allRooms = roomsRes.data;
                setRooms(allRooms);

                if (userId) {
                    const userRes = await axios.get('http://localhost:5000/api/users/residents');
                    const me = userRes.data.find(u => u.id === parseInt(userId) || u.id === userId);

                    if (me) {
                        setUserStatus(me.status);
                    }

                    const reqRes = await axios.get(`http://localhost:5000/api/rooms/my-requests/${userId}`);
                    const statusMap = {};
                    reqRes.data.forEach(req => { statusMap[req.room_id] = req.status; });

                    if (me && me.unit_no) {
                        const unitsRes = await axios.get('http://localhost:5000/api/units');
                        const myUnit = unitsRes.data.find(u => (u.unit_no === me.unit_no || u.unit_number === me.unit_no || u.unitNo === me.unit_no));
                        if (myUnit) {
                            const myRoom = allRooms.find(r => r.title === myUnit.category);
                            if (myRoom) {
                                statusMap[myRoom.id] = me.status === 'owner_occupied' ? 'Owner Occupied' : 'Rented';
                            }
                        }
                    }
                    setMyRequests(statusMap);
                }
            } catch (err) { console.error("Data fetch error:", err); }
        };

        loadData();
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleRequest = async (roomId) => {
        const userId = getUserId();
        if(!userId) return alert("Please login again.");

        if (userStatus === 'inactive') {
            return alert("Your account is deactivated. You cannot request rooms.");
        }

        try {
            await axios.post('http://localhost:5000/api/rooms/request', { room_id: roomId, user_id: userId });
            setMyRequests((prev) => ({ ...prev, [roomId]: 'Pending' }));
            setMessage('Booking request sent successfully!');
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            console.error('Request failed:', error);
            alert("Error submitting request. Please ensure the room exists.");
        }
    };

    return (
        <div className="font-sans pb-16 relative min-h-screen bg-[#030303]">
            <div className="px-6 md:px-12 pt-12 pb-10 max-w-7xl mx-auto">
                <h1 className="text-5xl md:text-[64px] font-extrabold text-[#EAEAEA] tracking-tighter mb-6">
                    Find Your Perfect <br/>
                    <span className="text-[#C0DE1B]">Living Space.</span>
                </h1>
            </div>

            {message && (
                <div className="fixed top-6 right-6 z-50 p-5 rounded-2xl bg-[#C0DE1B]/10 border border-[#C0DE1B]/30 text-[#C0DE1B] backdrop-blur-xl shadow-2xl">
                    {message}
                </div>
            )}

            <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-10">
                {rooms.length > 0 ? (
                    rooms
                        .filter(room => {
                            const reqStatus = myRequests[room.id];
                            const isMyActiveRoom = reqStatus === 'Rented' || reqStatus === 'Offer Made' || reqStatus === 'Approved' || reqStatus === 'Owner Occupied';
                            return room.status === 'Available' || isMyActiveRoom;
                        })
                        .map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onRequest={handleRequest}
                                requestStatus={myRequests[room.id]}
                                userStatus={userStatus}
                            />
                        ))
                ) : (
                    <div className="text-center py-20 text-[#666666]">
                        <p className="text-xl">No rooms found in the database.</p>
                        <p className="text-sm">Please add rooms via the Admin panel.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentRooms;