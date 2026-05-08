import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, Loader2, CheckCircle2, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import UserNavbar from '../../components/layout/UserNavbar';
import '../../styles/LandingPage.css';

const PACKAGES = {
    basic: { name: 'Basic Snap', price: 25000 },
    premium: { name: 'Premium Studio', price: 50000 },
    party: { name: 'Party Bundle', price: 150000 }
};

export default function Checkout() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { setPaymentVerified } = usePhotobooth();
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const pkg = PACKAGES[packageId] || PACKAGES.premium;

    const handlePayment = () => {
        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setPaymentVerified(true);
            // Auto redirect after success
            setTimeout(() => {
                navigate('/layout');
            }, 2000);
        }, 2000);
    };

    if (success) {
        return (
            <div className="landing-container min-h-screen flex items-center justify-center bg-neo-green p-6">
                <div className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center max-w-md animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-neo-green border-4 border-black flex items-center justify-center mx-auto mb-8 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CheckCircle2 size={60} strokeWidth={3} />
                    </div>
                    <h1 className="text-5xl font-black uppercase mb-4">PAYMENT SUCCESS!</h1>
                    <p className="font-bold text-lg mb-8">Your session is now unlocked. Redirecting to the booth...</p>
                    <div className="flex justify-center">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-container bg-neo-stone">
            <UserNavbar />

            <main className="brutal-main flex flex-col lg:flex-row gap-12 mt-12">
                {/* Left: Payment Form */}
                <div className="flex-1 bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <button onClick={() => navigate('/packages')} className="flex items-center gap-2 font-black uppercase text-xs mb-8 hover:translate-x-[-4px] transition-transform">
                        <ArrowLeft size={16} /> BACK TO PACKAGES
                    </button>

                    <h2 className="text-4xl font-black uppercase mb-10 flex items-center gap-4">
                        <CreditCard size={40} /> PAYMENT METHOD
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block font-black uppercase text-xs mb-2">Card Number</label>
                            <input 
                                type="text" 
                                placeholder="4242 4242 4242 4242"
                                className="w-full h-16 border-4 border-black p-4 font-bold text-xl focus:bg-neo-stone outline-none transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block font-black uppercase text-xs mb-2">Expiry</label>
                                <input 
                                    type="text" 
                                    placeholder="MM/YY"
                                    className="w-full h-16 border-4 border-black p-4 font-bold text-xl focus:bg-neo-stone outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block font-black uppercase text-xs mb-2">CVC</label>
                                <input 
                                    type="text" 
                                    placeholder="123"
                                    className="w-full h-16 border-4 border-black p-4 font-bold text-xl focus:bg-neo-stone outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-8">
                            <button 
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full h-20 bg-neo-yellow border-4 border-black font-black uppercase text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>PAY {pkg.price.toLocaleString()} IDR <ArrowUpRight size={24} strokeWidth={3}/></>}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-black/40 font-bold uppercase text-[10px]">
                        <ShieldCheck size={14} /> Powerd by SNAP! Pay Infrastructure
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-black text-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] rotate-2">
                        <h3 className="text-2xl font-black uppercase mb-6 border-b-2 border-white/20 pb-4">ORDER SUMMARY</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between font-bold">
                                <span>{pkg.name}</span>
                                <span>{pkg.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-white/60">
                                <span>Tax (0%)</span>
                                <span>0</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-3xl font-black border-t-2 border-white/20 pt-4">
                            <span>TOTAL</span>
                            <span className="text-neo-yellow">{pkg.price.toLocaleString()}</span>
                        </div>
                        <div className="mt-10 font-black uppercase text-[10px] tracking-widest text-white/40">
                            * Non-refundable after session start
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
