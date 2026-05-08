import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Loader2, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { photoAPI, getImageUrl } from '../../lib/api';
import '../../styles/LandingPage.css';

export default function Gallery() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await photoAPI.getPhotos({ limit: 12 });
                setPhotos(res.data.photos || []);
            } catch (err) {
                // Fallback for demo
                setPhotos([
                    { id: 1, url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2071&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 2, url: 'https://images.unsplash.com/photo-1520850838445-53c18d758c95?q=80&w=2070&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 3, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 4, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop', created_at: new Date().toISOString() },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

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
                    <button className="nav-link-btn active">GALLERY</button>
                </div>

                <div className="nav-cta bg-neo-pink" onClick={() => navigate('/packages')}>
                    <span>BOOK NOW</span>
                    <ArrowUpRight size={24} strokeWidth={3} />
                </div>
            </header>

            <main className="brutal-main">
                <div className="mt-12 mb-16 text-center">
                    <h1 className="text-7xl font-black uppercase">COMMUNITY SNAPS</h1>
                    <div className="h-4 w-64 bg-neo-pink mx-auto mt-4"></div>
                    <p className="font-black uppercase text-xs mt-6 tracking-widest italic">Recent memories from our photobooth community.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin inline-block w-12 h-12 border-8 border-black border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {photos.map((photo) => (
                            <div key={photo.id} className="bg-white border-8 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
                                <div className="aspect-square bg-neo-stone border-4 border-black overflow-hidden mb-4 relative">
                                    <img 
                                        src={photo.url.startsWith('http') ? photo.url : getImageUrl(photo.url)} 
                                        alt="Snap" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute top-2 right-2 bg-neo-pink border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Heart size={16} fill="black" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="font-black text-[10px] uppercase">{new Date(photo.created_at).toLocaleDateString()}</span>
                                    <button className="p-2 hover:bg-neo-cyan border-2 border-transparent hover:border-black transition-all">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20 text-center">
                    <div className="bg-black text-white p-12 border-8 border-neo-yellow shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto rotate-[-1deg]">
                        <h2 className="text-4xl font-black uppercase mb-6">WANT TO BE HERE?</h2>
                        <button 
                            onClick={() => navigate('/layout')}
                            className="px-10 h-16 bg-neo-cyan text-black border-4 border-black font-black uppercase text-xl hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all"
                        >
                            START YOUR SESSION
                        </button>
                    </div>
                </div>
            </main>

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Community Driven</p>
            </footer>
        </div>
    );
}
