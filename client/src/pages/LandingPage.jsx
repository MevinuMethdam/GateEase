import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// මෙතන අගට User කියන icon එක import කරගත්තා
import { Home, Bell, Search, ChevronRight, Star, Layers, Sparkles, Check, Eye, Maximize, Mic, ScanFace, Wifi, Thermometer, Lightbulb, ShieldCheck, MapPin, Users, Building, Calendar, User } from 'lucide-react';
import brandLogo from '../assets/gateease-logo.png';

// Data arrays
const amenities = [
    { title: "Infinity Pool", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=600&auto=format&fit=crop" },
    { title: "Pro Gym", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop" },
    { title: "Rooftop Lounge", img: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=600&auto=format&fit=crop" },
    { title: "Private Cinema", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop" },
    { title: "Smart Co-working", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" },
    { title: "Yoga Studio", img: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=600&auto=format&fit=crop" },
];

const smartFeatures = [
    { title: "Voice Control", icon: Mic, desc: "Control home with AI.", color: "text-[#C0DE1B]" },
    { title: "Gigabit Wifi", icon: Wifi, desc: "Ultra-fast connection.", color: "text-purple-400" },
    { title: "Smart Climate", icon: Thermometer, desc: "Eco-adaptive HVAC.", color: "text-orange-400" },
    { title: "Mood Lighting", icon: Lightbulb, desc: "Philips Hue ready.", color: "text-yellow-400" },
    { title: "Biometric Entry", icon: ScanFace, desc: "FaceID door locks.", color: "text-blue-400" },
    { title: "Security Feed", icon: ShieldCheck, desc: "24/7 internal cams.", color: "text-red-400" },
];

const locationData = [
    { name: "Colombo 07", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 15+" },
    { name: "Kandy City", img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 12+" },
    { name: "Galle Fort", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 8+" },
    { name: "Negombo Beach", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 20+" },
    { name: "Nuwara Eliya", img: "https://images.unsplash.com/photo-1620023023214-cb803a58bf95?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 10+" },
    { name: "Batticaloa", img: "https://images.unsplash.com/photo-1625805562095-d05562723bb7?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 5+" },
    { name: "Jaffna Central", img: "https://images.unsplash.com/photo-1605330364654-2b6348f0761e?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 7+" },
    { name: "Mirissa", img: "https://images.unsplash.com/photo-1563205086-f6ab09dd2144?q=80&w=600&auto=format&fit=crop", units: "Premium Residencies: 18+" }
];

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    // State for Counters
    const [residents, setResidents] = useState(0);
    const [rooms, setRooms] = useState(0);

    // Live Stats Counter Logic
    useEffect(() => {
        let resCount = 0;
        let roomCount = 0;

        const resInterval = setInterval(() => {
            if (resCount < 100) {
                resCount += 2;
                setResidents(resCount > 100 ? 100 : resCount);
            } else {
                clearInterval(resInterval);
            }
        }, 30);

        const roomInterval = setInterval(() => {
            if (roomCount < 150) {
                roomCount += 3;
                setRooms(roomCount > 150 ? 150 : roomCount);
            } else {
                clearInterval(roomInterval);
            }
        }, 30);

        return () => { clearInterval(resInterval); clearInterval(roomInterval); };
    }, []);

    const onScroll = useCallback(() => {
        setScrolled(window.scrollY > 50);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    return (
        <div className="min-h-screen bg-[#030303] text-[#EAEAEA] font-sans selection:bg-[#C0DE1B]/30 selection:text-[#C0DE1B] overflow-x-hidden">

            <style dangerouslySetInlineStyle={{__html: `
                @keyframes image-pan {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.08); }
                }
                .animate-image-pan { animation: image-pan 40s linear infinite alternate; }
                
                @keyframes eq-play {
                    0%, 100% { height: 8px; }
                    50% { height: 24px; }
                }
                .animate-eq { animation: eq-play 1s ease-in-out infinite; }
                .animate-eq-delayed { animation: eq-play 1s ease-in-out infinite 0.2s; }
                .animate-eq-slow { animation: eq-play 1.2s ease-in-out infinite 0.4s; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                .netflix-card { transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease-out; }
                .netflix-card:hover { transform: scale(1.03); z-index: 10; border-color: rgba(192, 222, 27, 0.5); }

                .glass-panel {
                    background: rgba(15, 15, 15, 0.4);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                .image-zoom-hover:hover .zoom-img { transform: scale(1.05); }
                
                html { scroll-behavior: smooth; }
            `}} />

            {/* --- Premium Header Navigation --- */}
            <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'bg-[#030303]/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-[1600px] mx-auto px-8 md:px-16 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <img
                                src={brandLogo}
                                alt="GateEase Logo"
                                className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-125 contrast-125 drop-shadow-[0_0_18px_rgba(192,222,24,0.6)] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_25px_rgba(192,222,24,0.8)] hover:brightness-150"
                            />
                            <span className="text-2xl font-bold text-white tracking-tight">Gate<span className="text-[#C0DE1B]">Ease</span></span>
                        </div>
                        <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-wider uppercase text-gray-300">
                            {['Home', 'Amenities', 'Services', 'News', 'Portal'].map(item => (
                                <a
                                    key={item}
                                    href={item === 'Portal' ? '#portal' : `#${item.toLowerCase()}`}
                                    onClick={(e) => {
                                        if (item === 'Portal') {
                                            e.preventDefault();
                                            navigate('/login');
                                        }
                                    }}
                                    className="hover:text-white transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C0DE1B] hover:after:w-full after:transition-all after:duration-300"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button aria-label="Search" className="hidden sm:block text-gray-300 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button aria-label="Notifications" className="text-gray-300 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#C0DE1B] rounded-full"></span>
                        </button>
                        <div onClick={() => navigate('/login')} className="flex items-center gap-3 cursor-pointer pl-6 border-l border-white/20 group">
                            {/* R අකුර අයින් කරලා ඒ රවුම ඇතුලටම User icon එක දැම්මා */}
                            <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-white/10 group-hover:border-[#C0DE1B]/70 transition-all flex items-center justify-center font-bold text-sm text-white">
                                <User className="w-[18px] h-[18px] text-white group-hover:text-[#C0DE1B] transition-colors" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1 hidden sm:block" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Ultra Premium Billboard Hero Section --- */}
            <div id="home" className="relative min-h-[90vh] flex items-center pt-32 pb-32 px-8 md:px-16 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#030303]">
                    <img
                        src="https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2075&auto=format&fit=crop"
                        alt="High-end Modern Interior"
                        className="w-full h-full object-cover opacity-70 animate-image-pan"
                        fetchpriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/60 to-transparent"></div>
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#030303] to-transparent"></div>
                    <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-3xl text-left mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
                        <Star className="w-3.5 h-3.5 text-[#C0DE1B] fill-[#C0DE1B]" />
                        Premium Managed Residence
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-8">
                        Smart Living.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C0DE1B] to-[#E2F75E]">Elevated.</span>
                    </h1>

                    <p className="text-gray-300 text-lg md:text-xl font-light max-w-xl mb-12 leading-relaxed">
                        Seamlessly manage your luxurious residential ecosystem. Facilities, maintenance, and home controls all unified within our secure, intuitive portal.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 bg-[#C0DE1B] text-black px-6 py-3 rounded-full font-bold text-[13px] transition-all duration-300 hover:bg-[#d4f03a] hover:shadow-[0_0_20px_rgba(192,222,27,0.3)] w-full sm:w-auto">
                            <Home className="w-4 h-4" />
                            Access Resident Portal
                        </button>
                        <button onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-6 py-3 rounded-full font-bold text-[13px] transition-all duration-300 hover:bg-white/10 hover:border-white/50 w-full sm:w-auto">
                            <Layers className="w-4 h-4" />
                            Explore Amenities
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 🌟 LIVE STATS COUNTER SECTION --- */}
            <div className="relative z-20 px-8 md:px-16 -mt-16 mb-24">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-panel rounded-[32px] p-8 text-center border border-white/10 hover:border-[#C0DE1B]/30 transition-colors duration-500 group">
                        <Users className="w-8 h-8 text-white group-hover:text-[#C0DE1B] transition-colors mx-auto mb-4" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{residents}{residents >= 100 ? '+' : ''}</div>
                        <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold">Happy Residents</div>
                    </div>
                    <div className="glass-panel rounded-[32px] p-8 text-center border border-white/10 hover:border-blue-400/30 transition-colors duration-500 group">
                        <Building className="w-8 h-8 text-white group-hover:text-blue-400 transition-colors mx-auto mb-4" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{rooms}{rooms >= 150 ? '+' : ''}</div>
                        <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold">Units Available</div>
                    </div>
                    <div className="glass-panel rounded-[32px] p-8 text-center border border-white/10 hover:border-red-400/30 transition-colors duration-500 group">
                        <MapPin className="w-8 h-8 text-white group-hover:text-red-400 transition-colors mx-auto mb-4" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">08</div>
                        <div className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-bold">Prime Locations</div>
                    </div>
                </div>
            </div>

            {/* --- Amenities Section --- */}
            <main id="amenities" className="relative z-10 space-y-12 pb-12 px-8 md:px-16">
                <div className="w-full max-w-[1600px] mx-auto">
                    <div className="mb-12">
                        <div className="text-[10px] text-[#888] font-bold uppercase tracking-[0.15em] mb-2">
                            FEATURED FACILITIES
                        </div>
                        <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-white tracking-tight">Explore Our Amenities</h2>
                    </div>

                    <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
                        {amenities.map((item, index) => (
                            <div key={index} className="flex-none w-[280px] md:w-[380px] h-[220px] md:h-[260px] rounded-[24px] overflow-hidden cursor-pointer netflix-card border border-white/10 snap-start shadow-2xl relative group bg-[#111]">
                                <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h4 className="text-2xl font-extrabold text-white mb-2">{item.title}</h4>
                                    <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium">
                                        <Check className="w-3.5 h-3.5 text-[#C0DE1B]" />
                                        <p>Real-time booking ready</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* --- Visual Showcase (Services) --- */}
            <section id="services" className="relative z-10 py-20 px-8 max-w-[1600px] mx-auto border-t border-white/[0.05]">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Eye className="w-3.5 h-3.5 text-[#C0DE1B]" /> Visual Showcase
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                        Impeccable Design. <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C0DE1B] to-[#7A9010]">Infinite Comfort.</span>
                    </h2>
                    <p className="text-[#888] text-lg font-light max-w-2xl mx-auto leading-relaxed">
                        Experience the epitome of modern luxury. Every inch of your future home is crafted with premium materials and breathtaking aesthetics.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
                    {/* Main Showcase Image */}
                    <div className="lg:col-span-2 relative rounded-[32px] overflow-hidden image-zoom-hover cursor-pointer border border-white/5 shadow-2xl h-[400px] lg:h-full group bg-[#0A0A0A]">
                        <img
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                            alt="Luxury Living Room"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover zoom-img transition-transform duration-1000 ease-out opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/80 via-transparent to-transparent"></div>

                        <div className="absolute top-8 left-8 flex flex-wrap gap-3">
                            <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-[#C0DE1B]" /> Spacious Layout</span>
                            <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" /> Nordic Minimalism</span>
                        </div>

                        <div className="absolute bottom-10 left-10 right-10">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">The Living Spaces</h3>
                            <p className="text-gray-400 text-base md:text-lg font-light max-w-xl leading-relaxed">
                                Fully furnished with premium materials, featuring natural light optimization and intelligent ambient lighting.
                            </p>
                        </div>
                    </div>

                    {/* Side Details */}
                    <div className="flex flex-col gap-6 h-full">
                        <div className="flex-1 relative rounded-[32px] overflow-hidden image-zoom-hover cursor-pointer border border-white/5 shadow-xl group min-h-[250px] bg-[#0A0A0A]">
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                                alt="Modern Architecture"
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover zoom-img transition-transform duration-1000 ease-out opacity-70 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <h4 className="text-2xl font-extrabold text-white mb-2">Breathtaking Vistas</h4>
                                <p className="text-gray-400 text-sm font-light leading-relaxed">Panoramic cityscapes visible through floor-to-ceiling smart glass windows.</p>
                            </div>
                        </div>

                        <div className="flex-1 glass-panel rounded-[32px] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group hover:border-[#C0DE1B]/30 transition-colors duration-500">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C0DE1B]/5 rounded-full blur-[50px] group-hover:bg-[#C0DE1B]/15 transition-all duration-700"></div>
                            <h4 className="text-[11px] font-bold text-[#C0DE1B] uppercase tracking-[0.2em] mb-6">Unmatched Quality</h4>
                            <ul className="space-y-5 relative z-10">
                                {['12ft High Ceilings', 'Italian Marble Countertops', 'Acoustic Soundproofing', 'Eco-Friendly Insulation'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-[15px] text-gray-300 font-light">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#C0DE1B] transition-colors"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Smart Features Bento Grid --- */}
            <section className="relative z-10 py-32 px-8 max-w-[1600px] mx-auto border-t border-white/[0.05]">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                        <Layers className="w-3.5 h-3.5" /> Inside The Units
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
                        Step Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C0DE1B] to-[#E2F75E]">Tomorrow's</span> Living Space.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-panel rounded-[40px] p-10 md:p-14 hover:border-[#C0DE1B]/30 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C0DE1B]/5 rounded-full blur-[120px] group-hover:bg-[#C0DE1B]/10 transition-all duration-1000"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center h-full">
                            <div className="flex-1">
                                <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-[20px] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                                    <Mic className="w-7 h-7 text-[#C0DE1B]" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">AI Voice Command Integration</h3>
                                <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
                                    "Turn off the living room lights." Control your entire apartment's ecosystem hands-free using built-in smart assistant compatibility.
                                </p>
                            </div>
                            <div className="w-full md:w-64 h-40 bg-black/40 rounded-[30px] border border-white/5 flex items-center justify-center gap-2.5 p-8 relative overflow-hidden shadow-inner">
                                <div className="w-2 bg-[#C0DE1B] rounded-full animate-eq h-8"></div>
                                <div className="w-2 bg-[#C0DE1B] rounded-full animate-eq-delayed h-12"></div>
                                <div className="w-2 bg-[#C0DE1B] rounded-full animate-eq-slow h-16"></div>
                                <div className="w-2 bg-[#C0DE1B] rounded-full animate-eq-delayed h-10"></div>
                                <div className="w-2 bg-[#C0DE1B] rounded-full animate-eq h-14"></div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-[40px] p-10 md:p-12 hover:border-purple-500/20 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-all duration-1000"></div>
                        <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Wifi className="w-7 h-7 text-purple-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Gigabit Wifi</h3>
                            <p className="text-gray-400 text-base font-light leading-relaxed">
                                Experience ultra-fast, seamless connectivity with pre-installed enterprise-grade mesh networks.
                            </p>
                        </div>
                    </div>

                    {[
                        { title: "Smart Climate", icon: Thermometer, desc: "Eco-adaptive HVAC systems that learn your daily patterns.", color: "text-orange-400", glow: "bg-orange-500/5" },
                        { title: "Mood Lighting", icon: Lightbulb, desc: "Fully customizable Philips Hue ecosystem for every occasion.", color: "text-yellow-400", glow: "bg-yellow-500/5" },
                        { title: "Biometric Entry", icon: ScanFace, desc: "Encrypted facial recognition and mobile keys for secure access.", color: "text-blue-400", glow: "bg-blue-500/5" }
                    ].map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div key={idx} className="glass-panel rounded-[40px] p-10 md:p-12 hover:border-white/10 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                                <div className={`absolute -top-20 -right-20 w-64 h-64 ${feature.glow} rounded-full blur-[80px] group-hover:opacity-100 transition-all duration-1000 opacity-50`}></div>
                                <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-400 text-base font-light leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- 🌟 SRI LANKA LOCATIONS DISCOVERY CAROUSEL (News/Locations) --- */}
            <section id="news" className="relative z-10 py-24 px-8 max-w-[1600px] mx-auto border-t border-white/[0.05]">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-left">
                    <div>
                        <div className="text-[10px] text-[#C0DE1B] font-bold uppercase tracking-[0.2em] mb-4">OUR PRESENCE</div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Locations across Sri Lanka</h2>
                    </div>
                    <p className="text-gray-400 max-w-md font-light text-lg">Find your dream home in the most prestigious neighborhoods across the island.</p>
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory px-2" style={{ scrollBehavior: 'smooth' }}>
                    {locationData.map((loc, i) => (
                        <div key={i} className="flex-none w-[260px] md:w-[320px] h-[350px] md:h-[450px] rounded-[30px] overflow-hidden cursor-pointer border border-white/10 snap-start shadow-2xl relative group bg-[#0A0A0A] hover:border-[#C0DE1B]/50 hover:shadow-[0_0_30px_rgba(192,222,27,0.15)] transition-all duration-500">
                            {/* Background Image */}
                            <img src={loc.img} alt={loc.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-transform duration-700 ease-out" />

                            {/* Gradient Overlays for smooth blend */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-between p-8">
                                {/* Top Glowing Pin */}
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#C0DE1B] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full scale-150"></div>
                                        <MapPin className="w-10 h-10 text-[#C0DE1B] drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500 relative z-10" />
                                    </div>
                                </div>

                                {/* Bottom Text */}
                                <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h4 className="text-xl md:text-2xl font-extrabold text-white mb-4 tracking-wider uppercase drop-shadow-lg">{loc.name}</h4>
                                    <div className="w-8 h-[2px] bg-[#C0DE1B]/50 mx-auto mb-4 group-hover:w-20 transition-all duration-500"></div>
                                    <p className="text-[11px] text-gray-300 font-bold tracking-[0.1em]">{loc.units}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 🌟 ABOUT US / FOUNDERS STORY --- */}
            <section className="relative z-10 py-32 px-8 max-w-[1600px] mx-auto border-t border-white/[0.05]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative rounded-[40px] overflow-hidden h-[600px] border border-white/10 shadow-2xl group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Founder" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-12 left-12">
                            <div className="text-[#C0DE1B] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Founded in 2018</div>
                            <h3 className="text-4xl font-black text-white tracking-tight">Crafting Excellence.</h3>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                            <Calendar className="w-3.5 h-3.5 text-[#C0DE1B]" /> Since 2018
                        </div>
                        <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">Our Journey to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Modern Living.</span></h2>
                        <div className="space-y-6">
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                GateEase was founded in 2018 by a team of visionary architects and tech enthusiasts. Our mission was simple: to redefine the residential experience in Sri Lanka by merging luxury architecture with smart home technology.
                            </p>
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                Today, we manage over 150 units across the island, providing a sanctuary for modern families and professionals. Every GateEase apartment is a testament to our commitment to quality, security, and innovation. We don't just build apartments; we engineer lifestyles.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="relative z-10 border-t border-white/[0.05] bg-[#030303] pt-20 pb-12 px-8">
                <div className="max-w-[1600px] mx-auto flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img
                            src={brandLogo}
                            alt="GateEase Logo"
                            className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-125 contrast-125 drop-shadow-[0_0_18px_rgba(192,222,24,0.6)] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(192,222,24,0.8)] group-hover:brightness-150"
                        />
                        <span className="text-3xl font-bold text-white tracking-tight">Gate<span className="text-[#C0DE1B]">Ease</span></span>
                    </div>

                    <p className="text-[#666] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-center">
                        Trusted by modern apartment communities worldwide
                    </p>
                    <div className="flex items-center gap-2 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} GateEase Management. Engineered with <Sparkles className="w-3.5 h-3.5 text-[#C0DE1B]" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;