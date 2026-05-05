import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Loader2, Image as ImageIcon } from 'lucide-react';
import { photoAPI, getImageUrl } from '../../lib/api';
import '../../styles/LandingPage.css';
import '../../styles/GalleryPage.css';

export default function Gallery() {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                // Currently getPhotos might require auth, 
                // so if it fails, we show empty state as per "no DB connection" rule
                const res = await photoAPI.getPhotos({ limit: 12 });
                setPhotos(res.data.photos || []);
            } catch (err) {
                console.error('Failed to fetch gallery:', err);
                setPhotos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    return (
        <div className="gallery-container">
            <header className="navbar glass-effect">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span>MEMORIA.</span>
                </div>
                <div className="nav-actions">
                    <button className="secondary-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} />
                        Back to Home
                    </button>
                </div>
            </header>

            <main className="gallery-content">
                <div className="gallery-header">
                    <h1>Community <span className="text-gradient">Gallery</span></h1>
                    <p>Explore recent snaps from our photobooth community.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="spin text-primary" size={48} />
                        <p className="text-white/60 mt-4">Memuat galeri...</p>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ImageIcon className="text-white/20" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white/80">Galeri Masih Kosong</h3>
                        <p className="text-white/40 mt-2 max-w-xs mx-auto">
                            Jadilah yang pertama untuk mengabadikan momen di photobooth kami!
                        </p>
                        <button className="primary-btn mt-8" onClick={() => navigate('/layout')}>
                            MULAI FOTO SEKARANG
                        </button>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {photos.map((photo) => (
                            <div key={photo.id} className="gallery-item glass-effect animate-in fade-in zoom-in duration-500">
                                <div className="gallery-image-wrapper">
                                    <img src={getImageUrl(photo.url)} alt="Snap" className="gallery-img" />
                                </div>
                                <div className="gallery-item-footer">
                                    <span className="date">{new Date(photo.created_at).toLocaleDateString()}</span>
                                    <div className="actions">
                                        <button className="icon-btn"><Heart size={16} /></button>
                                        <button className="icon-btn"><Share2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
