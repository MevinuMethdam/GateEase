import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BedDouble, Wind, Wifi, CheckCircle2, Sparkles, Send, Clock, XCircle } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop";

const RoomCard = ({ room, onRequest, requestStatus }) => {
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent z-10 opacity-60"></div>

            <div className="absolute top-6 left-6 z-20">
                <div className="px-4 py-2 rounded-full backdrop-blur-2xl bg-black/40 border border-white/[0.1] flex items-center gap-2.5 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-[#C0DE1B] shadow-[0_0_12px_#C0DE1B] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
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
                                    <span key={index} className="px-4 py-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-2xl text-xs font-bold text-[#D0D0D0] flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
                                        <Icon className="w-4 h-4 text-[#C0DE1B] drop-shadow-[0_0_5px_rgba(192,222,24,0.5)]" />
                                        {facility}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="w-full md:w-auto">
                            {requestStatus === 'Pending' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.15)] cursor-not-allowed transition-all duration-300 backdrop-blur-md">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                    <span className="tracking-wide">Pending Approval</span>
                                </button>
                            ) : requestStatus === 'Rejected' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-not-allowed transition-all duration-300 backdrop-blur-md">
                                    <XCircle className="w-5 h-5" />
                                    <span className="tracking-wide">Request Rejected</span>
                                </button>
                            ) : requestStatus === 'Approved' ? (
                                <button disabled className="w-full md:w-auto px-8 py-4 bg-[#C0DE1B]/10 border border-[#C0DE1B]/30 text-[#C0DE1B] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(192,222,24,0.15)] cursor-not-allowed transition-all duration-300 backdrop-blur-md">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="tracking-wide">Approved</span>
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRequest(room.id); }}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold text-[16px] rounded-[20px] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(192,222,24,0.3),inset_0_2px_2px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(192,222,24,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group/btn"
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                                    <Send className="w-5 h-5 relative z-10" />
                                    <span className="relative z-10 tracking-wide">Request Booking</span>
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

    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return 1; // Testing වලට 1 දෙනවා
        try { return JSON.parse(atob(token.split('.')[1])).id; } catch (e) { return 1; }
    };

    const mockRooms = [
        { id: 1, title: 'The Platinum Penthouse', price: '250000', features: '4 Beds, Central AC, WiFi, Ocean View', image: 'https://invalid-image-url.com/photo.jpg', status: 'Available' },
        { id: 2, title: 'Emerald Deluxe Suite', price: '185000', features: '3 Beds, Dual AC, City View', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop', status: 'Available' }
    ];

    useEffect(() => {
        const userId = getUserId();

        axios.get('http://localhost:5000/api/rooms')
            .then(res => setRooms(res.data.length > 0 ? res.data : mockRooms))
            .catch(err => setRooms(mockRooms));

        axios.get(`http://localhost:5000/api/rooms/my-requests/${userId}`)
            .then(res => {
                const statusMap = {};
                res.data.forEach(req => {
                    statusMap[req.room_id] = req.status; // උදා: statusMap[1] = 'Rejected'
                });
                setMyRequests(statusMap);
            })
            .catch(err => console.error("Could not fetch user requests", err));

    }, []);

    const handleRequest = async (roomId) => {
        const userId = getUserId();
        try {
            await axios.post('http://localhost:5000/api/rooms/request', { room_id: roomId, user_id: userId });

            setMyRequests((prev) => ({ ...prev, [roomId]: 'Pending' }));
            setMessage('Booking request sent successfully to Admin!');
            setTimeout(() => setMessage(''), 4000);

        } catch (error) {
            console.error('Request failed:', error);
            if(error.response && error.response.data) alert("Error: " + error.response.data.message);
        }
    };

    return (
        <div className="font-sans pb-16 relative">

            <div className="fixed inset-0 bg-[#030303] overflow-hidden -z-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C0DE1B] opacity-[0.02] blur-[150px] rounded-full animate-[pulse_10s_ease-in-out_infinite]"></div>
            </div>

            <div className="px-6 md:px-12 pt-12 pb-10 relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="px-4 py-1.5 rounded-full bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(192,222,24,0.1)]">
                        <Sparkles className="w-4 h-4 text-[#C0DE1B] drop-shadow-[0_0_8px_#C0DE1B]" />
                        <span className="text-[11px] text-[#C0DE1B] uppercase tracking-widest font-extrabold">Premium Collection</span>
                    </div>
                </div>
                <h1 className="text-5xl md:text-[64px] font-extrabold text-[#EAEAEA] tracking-tighter mb-6 drop-shadow-2xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Find Your Perfect <br/>
                    <span className="bg-gradient-to-r from-[#C0DE1B] via-[#DFFF2E] to-[#9EBA11] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(192,222,24,0.2)]">Living Space.</span>
                </h1>
                <p className="text-[#A0A0A0] text-lg font-medium tracking-wide max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Explore our exclusive selection of apartments. Immerse yourself in luxury, check real-time availability, and request your future home in seconds.
                </p>
            </div>

            {message && (
                <div className="fixed top-6 right-6 z-50 p-5 rounded-[24px] bg-[#C0DE1B]/10 border border-[#C0DE1B]/30 flex items-center gap-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(192,222,24,0.2)] animate-in fade-in slide-in-from-top-4 duration-500 max-w-md">
                    <div className="w-10 h-10 rounded-full bg-[#C0DE1B]/20 flex items-center justify-center border border-[#C0DE1B]/30">
                        <CheckCircle2 className="w-6 h-6 text-[#C0DE1B] drop-shadow-[0_0_10px_#C0DE1B]" />
                    </div>
                    <div>
                        <h4 className="text-[#EAEAEA] font-bold text-lg">System Alert</h4>
                        <span className="text-[#A0A0A0] font-medium tracking-wide text-sm">{message}</span>
                    </div>
                </div>
            )}

            <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-10 relative z-10">
                {rooms.filter(r => r.status === 'Available').map((room, index) => (
                    <div
                        key={room.id}
                        className="animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both"
                        style={{ animationDelay: `${(index + 2) * 150}ms` }}
                    >
                        <RoomCard
                            room={room}
                            onRequest={handleRequest}
                            requestStatus={myRequests[room.id]}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ResidentRooms;