import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import { TEMPLATES } from '../../constants';
import '../../styles/ResultPage.css';
import '../../styles/Templates.css';

export default function Result({ images, selectedTemplate }) {
    const navigate = useNavigate();
    const initialTemplate = selectedTemplate || TEMPLATES[0];

    const [currentTemplate, setCurrentTemplate] = useState(initialTemplate);
    const [filter, setFilter] = useState('none');
    const stripRef = useRef(null);

    const downloadStrip = async () => {
        if (stripRef.current === null) {
            return;
        }

        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `memoria-${currentTemplate.id}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('oops, something went wrong!', err);
        }
    };

    return (
        <div className="result-wrapper">
            <div className="editor-layout">
                <div className="strip-preview-container">
                    <div
                        className={`photo-strip ${currentTemplate.className || ''}`}
                        ref={stripRef}
                        style={{
                            backgroundColor: currentTemplate.background,
                        }}
                    >
                        <div className="strip-content">
                            <div className="branding" style={{ color: currentTemplate.textColor }}>MEMORIA</div>

                            {images.map((img, idx) => (
                                <div key={idx} className="strip-photo-frame">
                                    <img
                                        src={img}
                                        alt={`Capture ${idx}`}
                                        className={`strip-photo filter-${filter}`}
                                    />
                                </div>
                            ))}

                            <div className="date" style={{ color: currentTemplate.textColor }}>
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tools-panel">
                    <h2>Customize Strip</h2>

                    <div className="tool-section">
                        <label><Palette size={18} /> Change Style</label>
                        <div className="template-picker">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    className={`template-dot ${currentTemplate.id === t.id ? 'active' : ''}`}
                                    style={{ background: t.background }}
                                    onClick={() => setCurrentTemplate(t)}
                                    title={t.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="tool-section">
                        <label><ImageIcon size={18} /> Filter</label>
                        <div className="filter-options">
                            <button className={filter === 'none' ? 'active' : ''} onClick={() => setFilter('none')}>Normal</button>
                            <button className={filter === 'bw' ? 'active' : ''} onClick={() => setFilter('bw')}>B&W</button>
                            <button className={filter === 'sepia' ? 'active' : ''} onClick={() => setFilter('sepia')}>Sepia</button>
                            <button className={filter === 'vivid' ? 'active' : ''} onClick={() => setFilter('vivid')}>Vivid</button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => navigate('/')}>
                            <RefreshCw size={18} /> Retake
                        </button>
                        <button className="download-btn" onClick={downloadStrip}>
                            <Download size={18} /> Download Strip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
