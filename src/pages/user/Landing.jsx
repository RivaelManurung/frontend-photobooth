import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, ArrowUpRight, Zap, Camera, Smile, Download } from 'lucide-react';
import '../../styles/LandingPage.css';

export default function Landing({ recentPhotos }) {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* --- HEADER --- */}
            <header className="brutal-nav">
                <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
                    <h1 className="logo-text">SNAP!</h1>
                    <span className="logo-subtext">PHOTOBOOTH</span>
                </div>
                
                <div className="nav-links-center">
                    <button className="nav-link-btn active">HOME</button>
                    <button className="nav-link-btn" onClick={() => navigate('/layout')}>PACKAGES</button>
                    <button className="nav-link-btn" onClick={() => navigate('/gallery')}>GALLERY</button>
                    <button className="nav-link-btn" onClick={() => navigate('/about')}>ABOUT</button>
                    <button className="nav-link-btn" onClick={() => navigate('/contact')}>CONTACT</button>
                </div>

                <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
                    <span>BOOK NOW</span>
                    <ArrowUpRight size={24} strokeWidth={3} />
                </div>
            </header>

            <main className="brutal-main">
                {/* --- HERO SECTION --- */}
                <section className="brutal-hero">
                    <div className="hero-left">
                        <div className="hero-badge border-black">
                            CAPTURE THE MOMENT.
                        </div>
                        <h1 className="hero-giant-title">
                            PHOTO <br/> BOOTH
                        </h1>
                        <div className="hero-description">
                            <p>FUN. SIMPLE. UNFORGETABLE.</p>
                            <p>MAKE EVERY MOMENT COUNT.</p>
                        </div>
                        <div className="hero-actions">
                            <button className="hero-btn-primary bg-neo-yellow" onClick={() => navigate('/layout')}>
                                BOOK NOW <ArrowUpRight size={24} strokeWidth={3} />
                            </button>
                            <button className="hero-btn-secondary" onClick={() => navigate('/layout')}>
                                VIEW PACKAGES
                            </button>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-yellow-blob bg-neo-yellow"></div>
                        <div className="good-vibes-circle bg-neo-pink">
                            GOOD PHOTOS. <br/> GOOD VIBES.
                        </div>
                        
                        {/* Slanted Photo Strips */}
                        <div className="photo-strips-container">
                            <div className="photo-strip strip-1">
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2071&auto=format&fit=crop" alt="vibe"/></div>
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1520850838445-53c18d758c95?q=80&w=2070&auto=format&fit=crop" alt="vibe"/></div>
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop" alt="vibe"/></div>
                            </div>
                            <div className="photo-strip strip-2">
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop" alt="vibe"/></div>
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" alt="vibe"/></div>
                                <div className="strip-photo"><img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop" alt="vibe"/></div>
                            </div>
                        </div>

                        {/* Extra info boxes from image */}
                        <div className="info-box-black">
                            PARTIES. <br/> WEDDINGS. <br/> EVENTS. <br/> CORPORATE. <br/> YOU NAME IT.
                        </div>
                        <div className="info-box-white">
                            <ImageIcon size={32} />
                            ANYWHERE. <br/> ANYTIME.
                        </div>
                    </div>
                </section>

                {/* --- WHY CHOOSE US --- */}
                <section className="brutal-features">
                    <div className="features-label bg-black text-white">
                        <span>WHY CHOOSE US?</span>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon-box bg-neo-pink"><Zap size={24} fill="black" /></div>
                        <h3>INSTANT PRINT</h3>
                        <p>High quality prints in seconds.</p>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon-box bg-neo-yellow"><Camera size={24} fill="black" /></div>
                        <h3>PREMIUM EQUIPMENT</h3>
                        <p>Top-tier cameras and lighting for the best result.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon-box bg-neo-pink"><Smile size={24} fill="black" /></div>
                        <h3>FUN EXPERIENCE</h3>
                        <p>Props, backdrops, and good vibes included.</p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon-box bg-neo-yellow"><Download size={24} fill="black" /></div>
                        <h3>DIGITAL COPY</h3>
                        <p>Get softcopy instantly via online gallery.</p>
                    </div>
                </section>

                {/* --- FOOTER CTA --- */}
                <section className="brutal-cta">
                    <div className="cta-content bg-neo-pink">
                        <h2>LET'S SNAP <br/> SOME MEMORIES!</h2>
                    </div>
                    <div className="cta-stripes"></div>
                    <div className="cta-visual">
                         <div className="booth-preview">
                            <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" alt="booth"/>
                            <div className="booth-label">LOOK HERE!</div>
                         </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
