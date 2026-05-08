import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Smartphone, Share2, Printer, ArrowUpRight } from 'lucide-react';
import '../../styles/LandingPage.css';

export default function Features() {
    const navigate = useNavigate();
    
    const features = [
        {
            icon: <Zap size={40} />,
            title: "Instant Capture",
            desc: "Zero lag processing meant for high quality instant results right in your browser.",
            color: "bg-neo-cyan"
        },
        {
            icon: <Smartphone size={40} />,
            title: "Mobile Ready",
            desc: "Optimized for all devices. Take your photobooth anywhere you go.",
            color: "bg-neo-yellow"
        },
        {
            icon: <Share2 size={40} />,
            title: "Easy Sharing",
            desc: "Share directly to social media or download to your device in seconds.",
            color: "bg-neo-pink"
        },
        {
            icon: <Printer size={40} />,
            title: "Print Friendly",
            desc: "High resolution output suitable for physical printing.",
            color: "bg-neo-stone"
        }
    ];

    return (
        <div className="landing-container">
            <header className="brutal-nav">
                <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
                    <h1 className="logo-text">SNAP!</h1>
                    <span className="logo-subtext">PHOTOBOOTH</span>
                </div>
                
                <div className="nav-links-center">
                    <button className="nav-link-btn" onClick={() => navigate('/')}>HOME</button>
                    <button className="nav-link-btn" onClick={() => navigate('/packages')}>PACKAGES</button>
                    <button className="nav-link-btn" onClick={() => navigate('/gallery')}>GALLERY</button>
                </div>

                <div className="nav-cta bg-neo-pink" onClick={() => navigate('/packages')}>
                    <span>BOOK NOW</span>
                    <ArrowUpRight size={24} strokeWidth={3} />
                </div>
            </header>

            <main className="brutal-main">
                <div className="mt-12 mb-16 text-center">
                    <h1 className="text-7xl font-black uppercase">Why SNAP!?</h1>
                    <div className="h-4 w-64 bg-neo-cyan mx-auto mt-4"></div>
                    <p className="font-black uppercase text-xs mt-6 tracking-widest italic">Everything you need for the perfect photo experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <div className={`w-20 h-20 ${feature.color} border-4 border-black flex items-center justify-center mb-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4">{feature.title}</h3>
                            <p className="font-bold text-lg text-black/60">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <button 
                        onClick={() => navigate('/layout')}
                        className="px-12 h-20 bg-neo-yellow border-8 border-black font-black uppercase text-2xl hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        TRY IT NOW
                    </button>
                </div>
            </main>

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <p className="font-black uppercase tracking-widest text-sm italic">"Keep making memories."</p>
            </footer>
        </div>
    );
}
