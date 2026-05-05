import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import '../../styles/LandingPage.css';

export default function Landing({ recentPhotos }) {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <main className="hero-section">
                <div className="hero-content">
                    <div className="badge-pill">
                        <Sparkles size={14} />
                        <span>New Templates Available</span>
                    </div>
                    <h1 className="hero-title">
                        Capture Real <br />
                        <span className="text-gradient">Memories</span>
                    </h1>
                    <p className="hero-subtitle">
                        The instant virtual photobooth for your browser.
                        Choose your layout, strike a pose, and save the moment forever.
                    </p>
                    <div className="hero-cta">
                        <button className="primary-btn" onClick={() => navigate('/layout')}>
                            Start Capturing
                        </button>
                        <button className="secondary-btn" onClick={() => navigate('/gallery')}>
                            <ImageIcon size={20} />
                            View Gallery
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    {recentPhotos && recentPhotos.length > 0 && (
                        <>
                            <div className="visual-card main-card" style={{ transform: 'rotate(0deg)' }}>
                                <img src={recentPhotos[0]} alt="Recent" />
                            </div>
                            {recentPhotos[1] && (
                                <div className="visual-card floating-card card-1">
                                    <img src={recentPhotos[1]} alt="Recent 2" />
                                </div>
                            )}
                            {recentPhotos[2] && (
                                <div className="visual-card floating-card card-2">
                                    <img src={recentPhotos[2]} alt="Recent 3" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <div className="pattern-bg"></div>
        </div>
    );
}
