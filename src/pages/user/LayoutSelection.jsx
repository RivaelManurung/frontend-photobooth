import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/SelectionScreens.css';

export default function LayoutSelection({ onSelect }) {
    const navigate = useNavigate();
    
    const layouts = [
        { id: 2, name: 'CLASSIC', count: 2 },
        { id: 3, name: 'TIMELINE', count: 3 },
        { id: 4, name: 'STORY', count: 4 },
    ];

    const handleSelect = (count) => {
        onSelect(count);
        navigate('/style');
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

            <div className="options-grid">
                {layouts.map((layout) => (
                    <div
                        key={layout.id}
                        className="option-card"
                        onClick={() => handleSelect(layout.count)}
                    >
                        <div className="card-preview">
                            <div className={`preview-layout layout-${layout.count}`}>
                                {[...Array(layout.count)].map((_, i) => (
                                    <div key={i} className="preview-frame"></div>
                                ))}
                            </div>
                        </div>
                        <div className="card-label">
                            <span className="big-number">{layout.count}</span>
                            <span className="layout-name">{layout.name}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="back-button" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
                KEMBALI
            </button>
        </div>
    );
}
