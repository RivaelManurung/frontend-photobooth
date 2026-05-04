import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/ResultPage.css';
import '../../styles/Templates.css';

// Local fallback templates (same as StyleSelection fallbacks)
const LOCAL_FALLBACK_TEMPLATES = [
    { id: 'local-1', name: 'CLASSIC WHITE', background_color: '#ffffff', text_color: '#2d3436', border_style: 'solid' },
    { id: 'local-2', name: 'CHARCOAL', background_color: '#2d3436', text_color: 'rgba(255,255,255,0.8)' },
    { id: 'local-3', name: 'VINTAGE FILM', className: 'theme-film', background_color: '#1a1a1a', text_color: '#ffffff' },
    { id: 'local-4', name: 'POP ART LOVE', className: 'theme-pop', background_color: '#48dbfb', text_color: '#000' },
    { id: 'local-5', name: 'GREEN PICNIC', className: 'theme-picnic', background_color: '#e3f2fd', text_color: '#2e7d32' },
    { id: 'local-6', name: 'BIRTHDAY PARTY', className: 'theme-birthday', background_color: '#fff3cd', text_color: '#d35400' },
    { id: 'local-7', name: 'SKA CHECKER', className: 'theme-checker', background_color: '#fff', text_color: '#000' },
    { id: 'local-8', name: 'NEON NIGHTS', className: 'theme-neon', background_color: '#000', text_color: '#00ff00' },
];

export default function Result() {
    const navigate = useNavigate();
    const { capturedImages, selectedTemplate, session, resetFlow } = usePhotobooth();

    // Normalise template shape from DB or local
    const normalizeTemplate = (t) => ({
        id: t?.id,
        name: t?.name,
        className: t?.className || '',
        background: t?.background_color || t?.background || '#ffffff',
        textColor: t?.text_color || t?.textColor || '#2d3436',
        borderStyle: t?.border_style || null,
    });

    const initial = selectedTemplate
        ? normalizeTemplate(selectedTemplate)
        : normalizeTemplate(LOCAL_FALLBACK_TEMPLATES[0]);

    const [currentTemplate, setCurrentTemplate] = useState(initial);
    const [filter, setFilter] = useState('none');
    const [downloading, setDownloading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const stripRef = useRef(null);

    // Guard: redirect if no images
    if (!capturedImages || capturedImages.length === 0) {
        return (
            <div className="result-empty">
                <p>Tidak ada foto yang diambil.</p>
                <button className="retake-btn" onClick={() => navigate('/')}>Kembali ke Beranda</button>
            </div>
        );
    }

    const downloadStrip = async () => {
        if (!stripRef.current) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(stripRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `memoria-${currentTemplate.id || 'strip'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            setUploaded(true); // visual feedback — strip is "saved"
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleRetake = () => {
        resetFlow();
        navigate('/');
    };

    return (
        <div className="result-wrapper">
            <div className="editor-layout">
                {/* === Strip Preview === */}
                <div className="strip-preview-container">
                    <div
                        className={`photo-strip ${currentTemplate.className}`}
                        ref={stripRef}
                        style={{ backgroundColor: currentTemplate.background }}
                    >
                        <div className="strip-content">
                            <div className="branding" style={{ color: currentTemplate.textColor }}>
                                MEMORIA
                            </div>

                            {capturedImages.map((img, idx) => (
                                <div key={idx} className="strip-photo-frame">
                                    <img
                                        src={img}
                                        alt={`Capture ${idx + 1}`}
                                        className={`strip-photo filter-${filter}`}
                                    />
                                </div>
                            ))}

                            <div className="date" style={{ color: currentTemplate.textColor }}>
                                {new Date().toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>

                            {session?.session_id && (
                                <div className="session-watermark" style={{ color: currentTemplate.textColor }}>
                                    #{session.session_id.slice(0, 8).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === Tools Panel === */}
                <div className="tools-panel">
                    <h2>Customize Strip</h2>

                    {/* Template color picker */}
                    <div className="tool-section">
                        <label><Palette size={18} /> Change Style</label>
                        <div className="template-picker">
                            {LOCAL_FALLBACK_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    className={`template-dot ${currentTemplate.id === t.id ? 'active' : ''}`}
                                    style={{ background: t.background_color }}
                                    onClick={() => setCurrentTemplate(normalizeTemplate(t))}
                                    title={t.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Filter picker */}
                    <div className="tool-section">
                        <label><ImageIcon size={18} /> Filter</label>
                        <div className="filter-options">
                            {['none', 'bw', 'sepia', 'vivid'].map((f) => (
                                <button
                                    key={f}
                                    className={filter === f ? 'active' : ''}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'none' ? 'Normal' : f === 'bw' ? 'B&W' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-buttons">
                        <button className="retake-btn" onClick={handleRetake}>
                            <RefreshCw size={18} /> Retake
                        </button>
                        <button
                            className={`download-btn ${uploaded ? 'saved' : ''}`}
                            onClick={downloadStrip}
                            disabled={downloading}
                        >
                            {uploaded ? (
                                <><Check size={18} /> Tersimpan!</>
                            ) : downloading ? (
                                <>Menyimpan...</>
                            ) : (
                                <><Download size={18} /> Download Strip</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
