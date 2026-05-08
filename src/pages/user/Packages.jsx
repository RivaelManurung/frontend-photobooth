import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowUpRight, Zap, Star, ShieldCheck } from 'lucide-react';
import UserNavbar from '../../components/layout/UserNavbar';
import '../../styles/LandingPage.css';

const PACKAGES = [
    {
        id: 'basic',
        name: 'Basic Snap',
        price: 'Rp 25.000',
        features: ['3 Poses', 'Digital Softcopy', 'Standard Filters', 'Single Template'],
        color: 'bg-neo-cyan',
        icon: <Zap size={32} />
    },
    {
        id: 'premium',
        name: 'Premium Studio',
        price: 'Rp 50.000',
        features: ['Unlimited Poses', 'Digital Softcopy', 'Premium Filters', 'All Templates', 'Priority Support'],
        color: 'bg-neo-yellow',
        icon: <Star size={32} />,
        popular: true
    },
    {
        id: 'party',
        name: 'Party Bundle',
        price: 'Rp 150.000',
        features: ['Group Session', 'Digital Softcopy', 'Custom Frames', 'GIF Generation', 'QR Download'],
        color: 'bg-neo-pink',
        icon: <ShieldCheck size={32} />
    }
];

export default function Packages() {
    const navigate = useNavigate();

    const handlePurchase = (pkg) => {
        // Navigate to simulated checkout
        navigate(`/checkout/${pkg.id}`);
    };

    return (
        <div className="landing-container">
            <UserNavbar />

            <main className="brutal-main">
                <div className="mt-12 mb-16 text-center">
                    <h1 className="text-7xl font-black uppercase">PICK YOUR VIBE</h1>
                    <div className="h-4 w-64 bg-neo-yellow mx-auto mt-4"></div>
                    <p className="font-black uppercase text-xs mt-6 tracking-widest italic">Choose a package to unlock the photobooth.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {PACKAGES.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            className={`relative bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col ${pkg.popular ? 'scale-105 z-10' : ''}`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 font-black uppercase text-sm rotate-2 border-4 border-white">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-16 h-16 ${pkg.color} border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                                {pkg.icon}
                            </div>

                            <h3 className="text-3xl font-black uppercase mb-2">{pkg.name}</h3>
                            <div className="text-4xl font-black mb-8">{pkg.price}</div>

                            <div className="flex-1 space-y-4 mb-10">
                                {pkg.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 font-bold text-sm">
                                        <div className="bg-black text-white p-1">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => handlePurchase(pkg)}
                                className={`w-full h-16 border-4 border-black font-black uppercase text-xl transition-all flex items-center justify-center gap-2
                                    ${pkg.popular ? 'bg-neo-yellow hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-neo-stone'}`}
                            >
                                BUY NOW <ArrowUpRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 border-8 border-black bg-neo-cyan p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-black uppercase mb-4">Corporate Events?</h2>
                        <p className="font-bold text-lg">We provide custom solutions for weddings, parties, and corporate brand activations. Get a custom quote today.</p>
                    </div>
                    <button className="h-20 px-12 bg-black text-white font-black uppercase text-xl hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]">
                        CONTACT US
                    </button>
                </div>
            </main>

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Keep Snapping</p>
            </footer>
        </div>
    );
}
