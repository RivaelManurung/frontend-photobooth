import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Smartphone, Share2, Printer } from 'lucide-react';
import '../../styles/LandingPage.css';
import '../../styles/FeaturesPage.css';

export default function Features() {
    const navigate = useNavigate();
    
    const features = [
        {
            icon: <Zap size={40} color="#ff7675" />,
            title: "Instant Capture",
            desc: "Zero lag processing meant for high quality instant results right in your browser."
        },
        {
            icon: <Smartphone size={40} color="#74b9ff" />,
            title: "Mobile Ready",
            desc: "Optimized for all devices. Take your photobooth anywhere you go."
        },
        {
            icon: <Share2 size={40} color="#55efc4" />,
            title: "Easy Sharing",
            desc: "Share directly to social media or download to your device in seconds."
        },
        {
            icon: <Printer size={40} color="#a29bfe" />,
            title: "Print Friendly",
            desc: "High resolution output suitable for physical printing."
        }
    ];

    return (
        <div className="features-container">
            <header className="navbar glass-effect">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span>MEMORIA.</span>
                </div>
                <div className="nav-actions">
                    <button className="secondary-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
            </header>

            <main className="features-content">
                <div className="features-header">
                    <h1>Why <span className="text-gradient">Memoria?</span></h1>
                    <p>Everything you need for the perfect photo experience.</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, idx) => (
                        <div key={idx} className="feature-card glass-effect">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
