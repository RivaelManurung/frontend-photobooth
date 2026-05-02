import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TEMPLATES } from '../../constants';
import '../../styles/SelectionScreens.css';
import '../../styles/Templates.css';

export default function StyleSelection({ layoutCount, onSelect }) {
    const navigate = useNavigate();

    const handleSelect = (template) => {
        onSelect(template);
        navigate('/booth');
    };

    return (
        <div className="selection-container">
            <div className="header-title">
                <div className="title-box wide">
                    <h1>PICK YOUR STYLE</h1>
                </div>
                <div className="subtitle-badge">
                    Koleksi Frame Kece untuk {layoutCount} Pose
                </div>
            </div>

            <div className="styles-grid">
                {TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        className="style-card"
                        onClick={() => handleSelect(template)}
                    >
                        <div className="style-preview-wrapper">
                            <div
                                className={`preview-strip layout-${layoutCount} ${template.className || ''}`}
                                style={{
                                    backgroundColor: template.background,
                                    border: template.border || 'none'
                                }}
                            >
                                <div className="strip-content">
                                    {[...Array(layoutCount)].map((_, i) => (
                                        <div key={i} className="mini-frame">
                                            <div className="placeholder-face">:)</div>
                                        </div>
                                    ))}
                                    <div className="mini-brand" style={{ color: template.textColor }}>MEMORIA</div>
                                </div>
                            </div>
                        </div>
                        <div className="style-label">
                            {template.name}
                        </div>
                    </div>
                ))}
            </div>

            <button className="back-button" onClick={() => navigate('/layout')}>
                <ArrowLeft size={20} />
                KEMBALI
            </button>
        </div>
    );
}
