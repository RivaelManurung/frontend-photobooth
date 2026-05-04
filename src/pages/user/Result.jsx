import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/ResultPage.css';

const COLOR_PALETTE = [
    { id: 'c1', label: 'Classic White', bg: '#ffffff',   text: '#2d3436' },
    { id: 'c2', label: 'Charcoal',      bg: '#2d3436',   text: '#ffffff' },
    { id: 'c3', label: 'Rose Pink',     bg: '#ffb3c1',   text: '#5c0020' },
    { id: 'c4', label: 'Mint',          bg: '#b2f5ea',   text: '#1a4a3a' },
    { id: 'c5', label: 'Sky Blue',      bg: '#bde0fe',   text: '#023e8a' },
    { id: 'c6', label: 'Cream',         bg: '#fff3cd',   text: '#7d4e00' },
    { id: 'c7', label: 'Lavender',      bg: '#e9d8fd',   text: '#44337a' },
    { id: 'c8', label: 'Neon Dark',     bg: '#0d0d0d',   text: '#39ff14' },
];

function normaliseTemplate(t) {
    if (!t) return { id: null, name: 'Default', bgColor: '#ffffff', textColor: '#2d3436', bgImage: null, width: 1200, height: 1800, zones: [] };
    
    let zones = [];
    if (t.photo_zones) {
        try {
            zones = typeof t.photo_zones === 'string' ? JSON.parse(t.photo_zones) : t.photo_zones;
        } catch (e) {
            console.error("Failed to parse zones", e);
        }
    }

    return {
        id:        t.id,
        name:      t.name || 'Template',
        bgColor:   t.background_color || t.background || '#ffffff',
        textColor: t.text_color       || t.textColor  || '#2d3436',
        bgImage:   t.background_url   || t.preview_url || t.thumbnail_url || null,
        width:     t.width || 1200,
        height:    t.height || 1800,
        zones:     Array.isArray(zones) ? zones : []
    };
}

export default function Result() {
    const navigate  = useNavigate();
    const { capturedImages, selectedTemplate, session, resetFlow } = usePhotobooth();

    const [tpl, setTpl] = useState(() => normaliseTemplate(selectedTemplate));
    const [colorOverride, setColorOverride] = useState(null);
    const [filter,      setFilter]      = useState('none');
    const [downloading, setDownloading] = useState(false);
    const [saved,       setSaved]       = useState(false);
    const stripRef = useRef(null);

    useEffect(() => {
        setTpl(normaliseTemplate(selectedTemplate));
        setColorOverride(null);
    }, [selectedTemplate]);

    const activeBg    = colorOverride?.bg    ?? tpl.bgColor;
    const activeText  = colorOverride?.text  ?? tpl.textColor;
    const activeBgImg = colorOverride        ? null : tpl.bgImage;

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
            const a = document.createElement('a');
            a.download = `memoria-${Date.now()}.png`;
            a.href = dataUrl;
            a.click();
            setSaved(true);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Gagal mengunduh. Coba lagi.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="result-wrapper">
            <div className="editor-layout">
                <div className="strip-preview-container">
                    {/* The main canvas area that represents the actual template size */}
                    <div
                        className="photo-strip-canvas"
                        ref={stripRef}
                        style={{
                            width: `${tpl.width}px`,
                            height: `${tpl.height}px`,
                            backgroundColor: activeBg,
                            backgroundImage: activeBgImg ? `url(${activeBgImg})` : 'none',
                            backgroundSize: '100% 100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Overlay if image exists */}
                        {activeBgImg && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', pointerEvents: 'none', zIndex: 1 }} />
                        )}

                        {/* Rendering photos inside their defined zones */}
                        {tpl.zones.map((zone, idx) => {
                            const img = capturedImages[idx] || capturedImages[0]; // fallback to first image if index missing
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: `${zone.x}px`,
                                        top: `${zone.y}px`,
                                        width: `${zone.width}px`,
                                        height: `${zone.height}px`,
                                        transform: `rotate(${zone.rotation || 0}deg)`,
                                        zIndex: 2,
                                        overflow: 'hidden',
                                        border: zone.border ? `${zone.border.width}px ${zone.border.style} ${zone.border.color}` : 'none',
                                        borderRadius: zone.effects?.rounded ? `${zone.effects.rounded}px` : '0px',
                                        boxShadow: zone.effects?.shadow ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`Capture ${idx + 1}`}
                                        className={`filter-${filter}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            );
                        })}

                        {/* If no zones defined (fallback), use default vertical stack */}
                        {tpl.zones.length === 0 && (
                             <div className="strip-content-fallback" style={{ position: 'relative', zIndex: 3, padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                                <div className="branding" style={{ color: activeText, fontSize: '48px', fontWeight: 900, marginBottom: '20px' }}>MEMORIA</div>
                                {capturedImages.map((img, idx) => (
                                    <div key={idx} style={{ width: '80%', aspectRatio: '3/2', overflow: 'hidden', border: `10px solid ${activeText === '#ffffff' ? '#ffffff' : '#f0f0f0'}` }}>
                                        <img src={img} className={`filter-${filter}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>

                    <div className="template-name-badge">{tpl.name} ({tpl.width}x{tpl.height})</div>
                </div>

                <div className="tools-panel">
                    <h2>Customize Strip</h2>
                    <div className="tool-section">
                        <label><Palette size={18} /> Change Background</label>
                        {colorOverride && (
                            <button className="restore-btn" onClick={() => setColorOverride(null)}>
                                ↩ Kembalikan Template Asli
                            </button>
                        )}
                        <div className="template-picker">
                            {COLOR_PALETTE.map((c) => (
                                <button
                                    key={c.id}
                                    className={`template-dot ${colorOverride?.id === c.id ? 'active' : ''}`}
                                    style={{ background: c.bg, border: '2px solid #ccc' }}
                                    onClick={() => setColorOverride(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="tool-section">
                        <label><ImageIcon size={18} /> Photo Filter</label>
                        <div className="filter-options">
                            {['none', 'bw', 'sepia', 'vivid'].map((f) => (
                                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                                    {f === 'none' ? 'Normal' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => { resetFlow(); navigate('/'); }}>
                            <RefreshCw size={18} /> Retake
                        </button>
                        <button className={`download-btn ${saved ? 'saved' : ''}`} onClick={downloadStrip} disabled={downloading}>
                            {downloading ? <Loader2 size={18} className="spin" /> : saved ? <Check size={18} /> : <Download size={18} />}
                            {downloading ? ' Menyimpan...' : saved ? ' Tersimpan!' : ' Download Strip'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
