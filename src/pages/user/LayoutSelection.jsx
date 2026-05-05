import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { templatesAPI } from '../../lib/api';
import '../../styles/SelectionScreens.css';

export default function LayoutSelection() {
    const navigate = useNavigate();
    const { setPhotoCount, setSelectedTemplate, setSession, setCapturedImages } = usePhotobooth();
    const [availableCounts, setAvailableCounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLayouts = async () => {
            try {
                const res = await templatesAPI.getTemplates();
                const templates = res.data.templates || [];
                // Extract unique photo_count from templates
                const counts = [...new Set(templates.map(t => t.photo_count))].sort((a, b) => a - b);
                setAvailableCounts(counts);
            } catch (err) {
                console.error('Failed to fetch layouts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLayouts();
    }, []);

    const handleSelect = (count) => {
        setPhotoCount(count);
        setSelectedTemplate(null);
        setSession(null);
        setCapturedImages([]);
        navigate('/style');
    };

    const getLayoutName = (count) => {
        if (count === 1) return 'SINGLE';
        if (count === 2) return 'CLASSIC';
        if (count === 3) return 'TIMELINE';
        if (count === 4) return 'STORY';
        return `${count} POSES`;
    };

    return (
        <div className="selection-container">
            <div className="header-title">
                <div className="title-box">
                    <h1>LAYOUT</h1>
                </div>
                <div className="subtitle-badge">
                    Mau berapa pose?
                </div>
            </div>

            {loading ? (
                <div className="loading-state flex flex-col items-center justify-center py-20">
                    <Loader2 className="spin text-primary" size={48} />
                    <p className="text-white/60 mt-4">Memeriksa ketersediaan layout...</p>
                </div>
            ) : availableCounts.length === 0 ? (
                <div className="empty-state text-center py-20">
                    <p className="text-white/80">Maaf, belum ada template yang tersedia.</p>
                    <button className="primary-btn mt-6" onClick={() => navigate('/')}>KEMBALI</button>
                </div>
            ) : (
                <div className="options-grid">
                    {availableCounts.map((count) => (
                        <div
                            key={count}
                            className="option-card"
                            onClick={() => handleSelect(count)}
                        >
                            <div className="card-preview">
                                <div className={`preview-layout layout-${count}`}>
                                    {[...Array(count)].map((_, i) => (
                                        <div key={i} className="preview-frame"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-label">
                                <span className="big-number">{count}</span>
                                <span className="layout-name">{getLayoutName(count)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="back-button" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
                KEMBALI
            </button>
        </div>
    );
}
