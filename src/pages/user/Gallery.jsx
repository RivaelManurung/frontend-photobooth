import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Loader2, Image as ImageIcon, ArrowUpRight, X, Calendar, Download, Zap } from 'lucide-react';
import { photoAPI, getImageUrl } from '../../lib/api';
import UserNavbar from '../../components/layout/UserNavbar';
import '../../styles/LandingPage.css';

export default function Gallery() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await photoAPI.getPhotos({ limit: 12 });
                const fetchedPhotos = res.data.photos || [];
                
                if (fetchedPhotos.length > 0) {
                    setPhotos(fetchedPhotos);
                } else {
                    // Force fallback if empty
                    throw new Error('Empty gallery');
                }
            } catch (err) {
                // Fallback for demo
                setPhotos([
                    { id: 1, url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2071&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 2, url: 'https://images.unsplash.com/photo-1520850838445-53c18d758c95?q=80&w=2070&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 3, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 4, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 5, url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2071&auto=format&fit=crop', created_at: new Date().toISOString() },
                    { id: 6, url: 'https://images.unsplash.com/photo-1520850838445-53c18d758c95?q=80&w=2070&auto=format&fit=crop', created_at: new Date().toISOString() },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    const openDetail = (photo) => {
        setSelectedPhoto(photo);
        document.body.style.overflow = 'hidden';
    };

    const closeDetail = () => {
        setSelectedPhoto(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="landing-container">
            <UserNavbar />

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
                            <div 
                                key={photo.id} 
                                className="bg-white border-8 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group cursor-pointer"
                                onClick={() => openDetail(photo)}
                            >
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

            {/* --- DETAIL MODAL --- */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeDetail}></div>
                    
                    <div className="relative bg-neo-stone border-8 border-black w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-300">
                        <button 
                            onClick={closeDetail}
                            className="absolute top-4 right-4 z-10 w-12 h-12 bg-neo-red border-4 border-black flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <X size={24} strokeWidth={4} />
                        </button>

                        <div className="flex flex-col lg:flex-row h-full">
                            {/* Image Part */}
                            <div className="lg:w-2/3 bg-black flex items-center justify-center p-4 min-h-[300px] lg:min-h-0 border-b-8 lg:border-b-0 lg:border-r-8 border-black">
                                <img 
                                    src={selectedPhoto.url.startsWith('http') ? selectedPhoto.url : getImageUrl(selectedPhoto.url)} 
                                    alt="Detail Snap" 
                                    className="max-w-full max-h-[70vh] border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)]"
                                />
                            </div>

                            {/* Info Part */}
                            <div className="lg:w-1/3 p-10 flex flex-col justify-between">
                                <div>
                                    <div className="bg-neo-cyan border-4 border-black p-4 inline-block font-black uppercase text-xs mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        PHOTO DETAILS
                                    </div>
                                    
                                    <h2 className="text-5xl font-black uppercase leading-none mb-10">THE PERFECT SNAP</h2>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neo-yellow border-2 border-black flex items-center justify-center">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-black/40">Captured On</p>
                                                <p className="font-black uppercase">{new Date(selectedPhoto.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-neo-pink border-2 border-black flex items-center justify-center">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-black/40">Session ID</p>
                                                <p className="font-black uppercase">#SNAP-{selectedPhoto.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 space-y-4">
                                    <button className="w-full h-16 bg-black text-white border-4 border-black font-black uppercase flex items-center justify-center gap-4 hover:bg-neo-cyan hover:text-black transition-colors group">
                                        <Download size={24} /> DOWNLOAD
                                        <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:translate-y-[-4px] transition-transform" />
                                    </button>
                                    
                                    <button className="w-full h-16 bg-white border-4 border-black font-black uppercase flex items-center justify-center gap-4 hover:bg-neo-pink transition-colors">
                                        <Share2 size={24} /> SHARE LINK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Community Driven</p>
            </footer>
        </div>
    );
}
