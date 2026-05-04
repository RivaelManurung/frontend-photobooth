import React, { useState, useRef, useEffect } from 'react';
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
    if (!t) return { id: null, name: 'Default', bgColor: '#ffffff', textColor: '#2d3436', bgImage: null, width: 1200, height: 1800, zones: [], texts: [] };
    
    let zones = [];
    try {
        zones = typeof t.photo_zones === 'string' ? JSON.parse(t.photo_zones) : (t.photo_zones || []);
    } catch (e) { console.error("Parse zones error", e); }

    let texts = [];
    try {
        texts = typeof t.text_elements === 'string' ? JSON.parse(t.text_elements) : (t.text_elements || []);
    } catch (e) { console.error("Parse texts error", e); }

    return {
        id:        t.id,
        name:      t.name || 'Template',
        bgColor:   t.background_color || t.background || '#ffffff',
        textColor: t.text_color       || t.textColor  || '#2d3436',
        bgImage:   t.background_url   || t.preview_url || t.thumbnail_url || null,
        width:     t.width || 1200,
        height:    t.height || 1800,
        zones:     Array.isArray(zones) ? zones : [],
        texts:     Array.isArray(texts) ? texts : []
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
        if (selectedTemplate) {
            setTpl(normaliseTemplate(selectedTemplate));
            setColorOverride(null);
        }
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
            // High quality capture
            const dataUrl = await toPng(stripRef.current, { 
                cacheBust: true, 
                pixelRatio: 3, // Even higher for printing
                style: {
                    transform: 'scale(1)', // Ensure it captures at full size
                }
            });
            const a = document.createElement('a');
            a.download = `memoria-${tpl.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            a.href = dataUrl;
            a.click();
            setSaved(true);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Gagal mengunduh. Pastikan semua gambar sudah dimuat.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="result-wrapper">
            <div className="editor-layout">
                <div className="strip-preview-container">
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
                        {/* 1. Background Image Overlay (Subtle) */}
                        {activeBgImg && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.02)', pointerEvents: 'none', zIndex: 1 }} />
                        )}

                        {/* 2. Photo Zones (Synchronized with Admin) */}
                        {tpl.zones.map((zone, idx) => {
                            const img = capturedImages[idx] || capturedImages[0];
                            return (
                                <div
                                    key={`zone-${idx}`}
                                    className="photo-zone-rendered"
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
                                        boxShadow: zone.effects?.shadow ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`Capture ${idx + 1}`}
                                        className={`filter-${filter}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            );
                        })}

                        {/* 3. Text Elements (Synchronized with Admin) */}
                        {tpl.texts.map((text, idx) => (
                            <div
                                key={`text-${idx}`}
                                style={{
                                    position: 'absolute',
                                    left: `${text.x}px`,
                                    top: `${text.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10,
                                    color: text.font?.color || activeText,
                                    fontSize: `${text.font?.size || 40}px`,
                                    fontWeight: text.font?.weight || 'bold',
                                    fontFamily: text.font?.family || 'inherit',
                                    textAlign: text.align || 'center',
                                    pointerEvents: 'none',
                                    width: text.max_width ? `${text.max_width}px` : 'auto'
                                }}
                            >
                                {text.content === '{{date}}' 
                                    ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : text.content}
                            </div>
                        ))}

                        {/* 4. Fallback Branding (if no text elements exist) */}
                        {tpl.texts.length === 0 && (
                             <div className="fallback-meta" style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', zIndex: 11, color: activeText }}>
                                <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '4px' }}>MEMORIA</div>
                                <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="template-name-badge">
                        <span>{tpl.name}</span>
                        <span className="res-badge">{tpl.width} x {tpl.height} PX</span>
                    </div>
                </div>

                <div className="tools-panel">
                    <div className="tools-header">
                        <h2>Customize Strip</h2>
                        <p>Sesuaikan tampilan akhir fotomu</p>
                    </div>

                    <div className="tool-section">
                        <label><Palette size={18} /> Warna Background</label>
                        <div className="template-picker">
                            {COLOR_PALETTE.map((c) => (
                                <button
                                    key={c.id}
                                    className={`template-dot ${colorOverride?.id === c.id ? 'active' : ''}`}
                                    style={{ background: c.bg }}
                                    onClick={() => setColorOverride(c)}
                                    title={c.label}
                                />
                            ))}
                        </div>
                        {colorOverride && (
                            <button className="restore-btn" onClick={() => setColorOverride(null)}>
                                ↩ Gunakan Desain Asli Template
                            </button>
                        )}
                    </div>

                    <div className="tool-section">
                        <label><ImageIcon size={18} /> Efek Filter</label>
                        <div className="filter-options">
                            {[
                                { id: 'none',  label: 'Normal' },
                                { id: 'bw',    label: 'B&W' },
                                { id: 'sepia', label: 'Sepia' },
                                { id: 'vivid', label: 'Vivid' }
                            ].map((f) => (
                                <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => { resetFlow(); navigate('/'); }}>
                            <RefreshCw size={18} /> Ulangi Foto
                        </button>
                        <button 
                            className={`download-btn ${saved ? 'saved' : ''}`} 
                            onClick={downloadStrip} 
                            disabled={downloading}
                        >
                            {downloading ? <Loader2 size={18} className="spin" /> : saved ? <Check size={18} /> : <Download size={18} />}
                            <span>{downloading ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Download Strip'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
