import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, FileSignature, CheckCircle } from 'lucide-react';

const ResidentAgreementGate = ({ residentId, children }) => {
    const [isGateOpen, setIsGateOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [pendingOffer, setPendingOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [signatureName, setSignatureName] = useState('');
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPendingAgreement = async () => {
            console.log("🔍 DEBUG [Gate]: Received residentId ->", residentId);

            if (!residentId) {
                console.warn("⚠️ DEBUG [Gate]: No residentId provided! Opening gate directly.");
                setIsLoading(false);
                setIsGateOpen(false);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:5000/api/rooms/my-requests/${residentId}`);
                console.log("🔍 DEBUG [Gate]: API Response Data ->", res.data);

                const offer = res.data.find(req => req.status === 'Offer Made');
                console.log("🔍 DEBUG [Gate]: Found 'Offer Made' Request? ->", offer);

                if (offer) {
                    setPendingOffer({
                        requestId: offer.id,
                        residentName: offer.residentName || 'Resident',
                        nic: offer.residentNIC || 'Not Provided',
                        unitNo: offer.assigned_unit || 'Unknown',
                        startDate: offer.lease_start ? new Date(offer.lease_start).toLocaleDateString() : 'TBD',
                        endDate: offer.lease_end ? new Date(offer.lease_end).toLocaleDateString() : 'TBD',
                        dateToday: new Date().toLocaleDateString()
                    });
                    setIsGateOpen(true);
                } else {
                    console.log("✅ DEBUG [Gate]: No pending offers. Opening dashboard.");
                    setIsGateOpen(false);
                }
            } catch (err) {
                console.error("❌ DEBUG [Gate]: Error fetching agreement:", err);
                setIsGateOpen(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingAgreement();
    }, [residentId]);

    const handleSignAgreement = async () => {
        if (!signatureName || !isAcknowledged || !pendingOffer) return;
        setIsSubmitting(true);

        const now = new Date();
        const mysqlFormattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

        try {
            await axios.put(`http://localhost:5000/api/rooms/requests/${pendingOffer.requestId}/sign`, {
                signature_text: signatureName,
                signed_timestamp: mysqlFormattedDate,
                status: 'Rented'
            });

            alert('Agreement Successfully Signed! Welcome to GateEase.');
            setIsGateOpen(false);
        } catch (error) {
            console.error('Failed to sign:', error);
            alert('Failed to submit signature. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md">
                <div className="w-10 h-10 border-4 border-[#C0DE1B] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isGateOpen) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden">

            <div className="w-full h-full pointer-events-none select-none">
                {children}
            </div>

            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-xl p-4 transition-all duration-500">

                {step === 1 && (
                    <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 max-w-[450px] w-full shadow-2xl text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px rgba(192,222,24,0.05)' }}></div>

                        <div className="relative w-16 h-16 bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-[#9EBA11]" />
                        </div>

                        <h2 className="text-2xl font-extrabold text-white mb-3 relative">Welcome to GateEase</h2>

                        <p className="text-gray-300 text-sm leading-relaxed mb-6 relative">
                            Before you access your portal and move into Unit <span className="font-bold text-white">{pendingOffer.unitNo}</span>, please confirm that you agree to our building policies and lease terms.
                        </p>

                        <div className="bg-black/20 border border-white/5 rounded-xl p-5 mb-8 text-left relative">
                            <p className="text-xs text-zinc-500 mb-3">By clicking "Review & Continue", you acknowledge that:</p>
                            <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-4 marker:text-gray-400">
                                <li>You will review the terms carefully.</li>
                                <li>You accept our <span className="text-[#C0DE1B] font-bold cursor-pointer hover:underline">Privacy Policy</span>.</li>
                                <li>
                                    You agree to digitally sign the{' '}
                                    <button onClick={() => setStep(2)} className="text-[#C0DE1B] font-extrabold underline hover:text-white transition-colors">
                                        Official Lease Agreement
                                    </button>.
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] font-extrabold rounded-xl shadow-[0_0_20px_rgba(192,222,24,0.3)] hover:scale-[1.02] transition-all duration-300 relative"
                        >
                            Review & Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500">

                        <div className="p-6 border-b border-white/10 flex items-center gap-4 shrink-0 bg-black/30 rounded-t-3xl">
                            <div className="w-12 h-12 bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 rounded-xl flex items-center justify-center">
                                <FileSignature className="w-6 h-6 text-[#9EBA11]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white">Digital Lease Agreement</h2>
                                <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-1">Unit {pendingOffer.unitNo} • GateEase Management</p>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-black/20">
                            <div className="border border-white/5 rounded-2xl p-8 text-zinc-300 text-sm leading-loose text-justify font-serif bg-black/20 shadow-sm">
                                <h3 className="text-center text-white text-lg font-bold mb-6 underline">RESIDENTIAL LEASE CONTRACT</h3>

                                <p className="mb-4">
                                    This agreement is made on the <strong className="text-white bg-white/5 px-2 py-0.5 rounded">{pendingOffer.dateToday}</strong>, between <strong>GateEase Management</strong> (hereinafter referred to as the "Landlord") and <strong className="text-white bg-[#C0DE1B]/10 px-2 py-0.5 rounded">{pendingOffer.residentName}</strong> bearing NIC/Passport Number <strong className="text-white bg-white/5 px-2 py-0.5 rounded">{pendingOffer.nic}</strong> (hereinafter referred to as the "Tenant").
                                </p>

                                <p className="mb-4">
                                    <strong>1. PROPERTY:</strong> The Landlord agrees to lease to the Tenant, and the Tenant agrees to lease from the Landlord, the premises identified as Unit <strong className="text-white">{pendingOffer.unitNo}</strong> within the GateEase Luxury Apartment Complex.
                                </p>

                                <p className="mb-4">
                                    <strong>2. TERM:</strong> The lease will commence on <strong className="text-white bg-white/5 px-2 py-0.5 rounded">{pendingOffer.startDate}</strong> and expire on <strong className="text-white bg-white/5 px-2 py-0.5 rounded">{pendingOffer.endDate}</strong>. Upon expiration, this agreement may be renewed upon mutual consent.
                                </p>

                                <p className="mb-4">
                                    <strong>3. RENT, MAINTENANCE & FACILITIES:</strong> The Tenant agrees to pay the stipulated monthly rent along with a mandatory monthly maintenance fee. Furthermore, usage of premium building facilities (e.g., Gym, Pool, Event Spaces) will be billed separately based on actual usage, as recorded in the GateEase Booking System.
                                </p>

                                <p className="mb-4">
                                    <strong>4. SECURITY DEPOSIT:</strong> A standard security deposit is held by the Landlord. Any damages beyond normal wear and tear, or any unpaid utility/facility invoices, will be deducted from this deposit upon move-out.
                                </p>

                                <p className="mb-4">
                                    <strong>5. COMPLIANCE & TERMINATION:</strong> The Tenant agrees to abide by all building rules and HOA guidelines. The Landlord reserves the right to terminate this agreement in the event of repeated policy violations, illegal activities, or failure to settle monthly dues in a timely manner.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/30 shrink-0 rounded-b-3xl">
                            <div className="mb-6 relative">
                                <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 block">Type your full legal name to electronically sign this document</label>

                                <div className="absolute right-6 top-7 h-12 flex items-center pointer-events-none">
                                    <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '28px', color: '#C0DE1B' }}>
                                        {signatureName}
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="e.g. Kalhara Silva"
                                    value={signatureName}
                                    onChange={(e) => setSignatureName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 focus:border-[#C0DE1B] focus:ring-4 focus:ring-[#C0DE1B]/20 rounded-xl px-5 py-3.5 text-white font-bold outline-none transition-all text-lg shadow-sm"
                                />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group mb-6">
                                <div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={isAcknowledged}
                                        onChange={(e) => setIsAcknowledged(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-white/10 rounded bg-white/5 checked:border-[#C0DE1B] checked:bg-[#C0DE1B] transition-all cursor-pointer"
                                    />
                                    <CheckCircle className="absolute w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-zinc-400 text-sm group-hover:text-white transition-colors leading-tight">
                                    I acknowledge that this electronic signature is legally binding and carries the same validity as my handwritten signature.
                                </span>
                            </label>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">Go Back</button>
                                <button
                                    onClick={handleSignAgreement}
                                    disabled={!signatureName || !isAcknowledged || isSubmitting}
                                    className={`flex-1 py-3.5 font-extrabold rounded-xl transition-all flex justify-center items-center gap-2 ${(!signatureName || !isAcknowledged) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#C0DE1B] to-[#9EBA11] text-[#050505] hover:scale-[1.02] shadow-[0_0_20px_rgba(192,222,24,0.3)]'}`}
                                >
                                    {isSubmitting ? 'Signing...' : 'I Accept & Sign Agreement'}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidentAgreementGate;