import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import '../../styles/LandingPage.css';
import '../../styles/GalleryPage.css';

export default function Gallery() {
    const navigate = useNavigate();
    
    const galleryItems = [
        { id: 1, color: '#ff7675', date: '2023-11-01' },
        { id: 2, color: '#74b9ff', date: '2023-11-02' },
        { id: 3, color: '#55efc4', date: '2023-11-03' },
        { id: 4, color: '#a29bfe', date: '2023-11-04' },
        { id: 5, color: '#fd79a8', date: '2023-11-05' },
        { id: 6, color: '#ffeaa7', date: '2023-11-06' },
    ];

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

                <div className="gallery-grid">
                    {galleryItems.map((item) => (
                        <div key={item.id} className="gallery-item glass-effect">
                            <div className="gallery-image-placeholder" style={{ backgroundColor: item.color }}>
                                <span className="emoji-pose">📸</span>
                            </div>
                            <div className="gallery-item-footer">
                                <span className="date">{item.date}</span>
                                <div className="actions">
                                    <button className="icon-btn"><Heart size={16} /></button>
                                    <button className="icon-btn"><Share2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
