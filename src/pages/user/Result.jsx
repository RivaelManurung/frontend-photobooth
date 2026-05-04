import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon, Check, Loader2, Cloud } from 'lucide-react';
import { toPng } from 'html-to-image';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { photoAPI } from '../../lib/api';
import '../../styles/ResultPage.css';

// Palette for manual background override
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

// Normalise template object from DB or fallback
function normaliseTemplate(t) {
    if (!t) return { id: null, name: 'Default', bgColor: '#ffffff', textColor: '#2d3436', bgImage: null, width: 1200, height: 1800, zones: [], texts: [] };
    let zones = [], texts = [];
    try { zones = typeof t.photo_zones === 'string' ? JSON.parse(t.photo_zones) : (t.photo_zones || []); } catch {}
    try { texts = typeof t.text_elements === 'string' ? JSON.parse(t.text_elements) : (t.text_elements || []); } catch {}
    return {
        id:        t.id,
        name:      t.name || 'Template',
        bgColor:   t.background_color || '#ffffff',
        textColor: t.text_color       || '#2d3436',
        bgImage:   t.background_url   || t.preview_url || t.thumbnail_url || null,
        width:     t.width  || 1200,
        height:    t.height || 1800,
        zones:     Array.isArray(zones) ? zones : [],
        texts:     Array.isArray(texts) ? texts : [],
    };
}

// How wide the preview pane is in px — zones are scaled proportionally
const PREVIEW_W = 320;

export default function Result() {
    const navigate = useNavigate();
    const { capturedImages, selectedTemplate, session, resetFlow } = usePhotobooth();

    const [tpl, setTpl]               = useState(() => normaliseTemplate(selectedTemplate));
    const [colorOverride, setColorOverride] = useState(null);
    const [filter,        setFilter]   = useState('none');
    const [downloading,   setDownloading] = useState(false);
    const [saved,         setSaved]    = useState(false);
    const [cloudUrl,      setCloudUrl] = useState(null);
    const [uploading,     setUploading] = useState(false);
    const stripRef = useRef(null);

    useEffect(() => {
        if (selectedTemplate) {
            setTpl(normaliseTemplate(selectedTemplate));
            setColorOverride(null);
        }
    }, [selectedTemplate]);

    // Scale factor: preview width / actual template width
    const scale = PREVIEW_W / tpl.width;
    const previewH = Math.round(tpl.height * scale);

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

    // ─── Download: capture the full-size DOM element (before CSS scale) ───────
    const downloadStrip = async () => {
        if (!stripRef.current) return;
        setDownloading(true);
        try {
            // stripRef points to the FULL SIZE element (1200×1800).
            // CSS transform:scale doesn't change layout dimensions,
            // so html-to-image captures at full resolution automatically.
            const dataUrl = await toPng(stripRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                width:  tpl.width,
                height: tpl.height,
            });

            // Local download
            const a = document.createElement('a');
            a.download = `memoria-${tpl.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            a.href = dataUrl;
            a.click();
            setSaved(true);

            // Background upload to Supabase (non-blocking)
            setUploading(true);
            photoAPI.uploadPublicStrip({ image_base64: dataUrl, template_id: tpl.id || 0, filter })
                .then(res => setCloudUrl(res.data?.url))
                .catch(e  => console.warn('Cloud upload failed:', e))
                .finally(() => setUploading(false));

        } catch (err) {
            console.error('Download failed:', err);
            alert('Gagal mengunduh. Coba lagi.');
        } finally {
            setDownloading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="result-wrapper">
            <div className="editor-layout">

                {/* ── Strip Preview ── */}
                <div className="strip-preview-container">
                    {/*
                      Outer "viewport" clipped to preview size.
                      Inner canvas is rendered at FULL template resolution (e.g. 1200×1800px)
                      then visually scaled down with CSS transform.
                      html-to-image targets the inner canvas → full resolution output.
                    */}
                    <div
                        className="strip-viewport"
                        style={{ width: `${PREVIEW_W}px`, height: `${previewH}px` }}
                    >
                        <div
                            ref={stripRef}
                            className="strip-canvas-inner"
                            style={{
                                width:           `${tpl.width}px`,
                                height:          `${tpl.height}px`,
                                transform:       `scale(${scale})`,
                                transformOrigin: 'top left',
                                backgroundColor: activeBg,
                                backgroundImage: activeBgImg ? `url(${activeBgImg})` : 'none',
                                backgroundSize:  '100% 100%',
                                backgroundRepeat:'no-repeat',
                                position:        'relative',
                                overflow:        'hidden',
                            }}
                        >
                            {/* Photo zones — positioned at actual template pixel coords */}
                            {tpl.zones.map((zone, idx) => {
                                const img = capturedImages[idx] ?? capturedImages[0];
                                return (
                                    <div
                                        key={`z-${idx}`}
                                        style={{
                                            position:     'absolute',
                                            left:         `${zone.x}px`,
                                            top:          `${zone.y}px`,
                                            width:        `${zone.width}px`,
                                            height:       `${zone.height}px`,
                                            transform:    `rotate(${zone.rotation || 0}deg)`,
                                            overflow:     'hidden',
                                            border:       zone.border ? `${zone.border.width}px ${zone.border.style} ${zone.border.color}` : 'none',
                                            borderRadius: zone.effects?.rounded ? `${zone.effects.rounded}px` : '0',
                                            boxShadow:    zone.effects?.shadow ? '0 8px 24px rgba(0,0,0,0.25)' : 'none',
                                            zIndex:       (zone.z_index ?? idx) + 2,
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Shot ${idx + 1}`}
                                            className={`filter-${filter}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                );
                            })}

                            {/* Fallback when no zones configured — simple vertical stack */}
                            {tpl.zones.length === 0 && (
                                <div style={{
                                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '60px',
                                    zIndex: 2,
                                }}>
                                    <div style={{ color: activeText, fontSize: '80px', fontWeight: 900, letterSpacing: '6px' }}>MEMORIA</div>
                                    {capturedImages.map((img, i) => (
                                        <div key={i} style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', border: `8px solid ${activeText}` }}>
                                            <img src={img} className={`filter-${filter}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Text elements from Admin */}
                            {tpl.texts.map((text, idx) => (
                                <div key={`t-${idx}`} style={{
                                    position:   'absolute',
                                    left:       `${text.x}px`,
                                    top:        `${text.y}px`,
                                    transform:  'translate(-50%, -50%)',
                                    color:      text.font?.color || activeText,
                                    fontSize:   `${text.font?.size || 40}px`,
                                    fontWeight: text.font?.weight || 'bold',
                                    fontFamily: text.font?.family || 'inherit',
                                    textAlign:  text.align || 'center',
                                    width:      text.max_width ? `${text.max_width}px` : 'auto',
                                    zIndex:     20,
                                    pointerEvents: 'none',
                                }}>
                                    {text.content === '{{date}}'
                                        ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : text.content}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="template-name-badge">
                        <span>{tpl.name}</span>
                        <span className="res-badge">{tpl.width}×{tpl.height}</span>
                    </div>
                </div>

                {/* ── Tools Panel ── */}
                <div className="tools-panel">
                    <div className="tools-header">
                        <h2>Customize Strip</h2>
                        <p>Sesuaikan tampilan akhir fotomu</p>
                    </div>

                    {/* Background colour override */}
                    <div className="tool-section">
                        <label><Palette size={16} /> Warna Background</label>
                        {colorOverride && (
                            <button className="restore-btn" onClick={() => setColorOverride(null)}>
                                ↩ Kembalikan Desain Template
                            </button>
                        )}
                        <div className="template-picker">
                            {COLOR_PALETTE.map(c => (
                                <button
                                    key={c.id}
                                    className={`template-dot ${colorOverride?.id === c.id ? 'active' : ''}`}
                                    style={{ background: c.bg }}
                                    onClick={() => setColorOverride(c)}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Photo filters */}
                    <div className="tool-section">
                        <label><ImageIcon size={16} /> Efek Filter</label>
                        <div className="filter-options">
                            {[{ id: 'none', label: 'Normal' }, { id: 'bw', label: 'B&W' }, { id: 'sepia', label: 'Sepia' }, { id: 'vivid', label: 'Vivid' }].map(f => (
                                <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => { resetFlow(); navigate('/'); }}>
                            <RefreshCw size={18} /> Ulangi Foto
                        </button>
                        <button className={`download-btn ${saved ? 'saved' : ''}`} onClick={downloadStrip} disabled={downloading}>
                            {downloading
                                ? <><Loader2 size={18} className="spin" /> Menyimpan...</>
                                : saved
                                    ? <><Check size={18} /> Tersimpan!</>
                                    : <><Download size={18} /> Download Strip</>
                            }
                        </button>

                        {saved && (
                            <div className="cloud-status">
                                <Cloud size={13} />
                                {uploading
                                    ? <span>Menyimpan ke Cloud...</span>
                                    : cloudUrl
                                        ? <span>✅ Tersimpan di Cloud</span>
                                        : <span style={{ color: '#b2bec3' }}>Upload cloud gagal</span>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
