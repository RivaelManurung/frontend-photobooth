import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon, Check, Loader2, Cloud } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { photoAPI } from '../../lib/api';
import '../../styles/ResultPage.css';

const COLOR_PALETTE = [
    { id: 'c1', label: 'White',    bg: '#ffffff', text: '#2d3436' },
    { id: 'c2', label: 'Charcoal', bg: '#2d3436', text: '#ffffff' },
    { id: 'c3', label: 'Pink',     bg: '#ffb3c1', text: '#5c0020' },
    { id: 'c4', label: 'Mint',     bg: '#b2f5ea', text: '#1a4a3a' },
    { id: 'c5', label: 'Sky',      bg: '#bde0fe', text: '#023e8a' },
    { id: 'c6', label: 'Cream',    bg: '#fff3cd', text: '#7d4e00' },
    { id: 'c7', label: 'Lavender', bg: '#e9d8fd', text: '#44337a' },
    { id: 'c8', label: 'Dark',     bg: '#0d0d0d', text: '#39ff14' },
];

const FILTERS = {
    none:  null,
    bw:    'grayscale(100%)',
    sepia: 'sepia(0.85) contrast(1.15)',
    vivid: 'saturate(1.6) contrast(1.1)',
};

function parseTemplate(t) {
    if (!t) return { id: null, name: 'Default', bgColor: '#ffffff', textColor: '#2d3436', bgImage: null, width: 1200, height: 1800, zones: [], texts: [] };
    let zones = [], texts = [];
    try { zones = typeof t.photo_zones === 'string' ? JSON.parse(t.photo_zones) : (t.photo_zones || []); } catch {}
    try { texts = typeof t.text_elements === 'string' ? JSON.parse(t.text_elements) : (t.text_elements || []); } catch {}
    return {
        id:       t.id,
        name:     t.name || 'Template',
        bgColor:  t.background_color || '#ffffff',
        textColor:t.text_color || '#2d3436',
        bgImage:  t.background_url || t.preview_url || null,
        width:    t.width  || 1200,
        height:   t.height || 1800,
        zones:    Array.isArray(zones) ? zones : [],
        texts:    Array.isArray(texts) ? texts : [],
    };
}

/** Load an image as a Promise, trying crossOrigin=anonymous first */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => {
            // retry without crossOrigin (will taint canvas but at least shows)
            const img2 = new Image();
            img2.onload  = () => resolve(img2);
            img2.onerror = reject;
            img2.src = src;
        };
        img.src = src;
    });
}

/** Draw image with object-fit: cover into a rectangle */
function drawCover(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    const sx = (img.width  - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Compose the final strip onto a <canvas> — avoids html-to-image CORS issues */
async function composeCanvas(tpl, capturedImages, activeBg, activeBgImg, filter, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width  = tpl.width;
    canvas.height = tpl.height;
    const ctx = canvas.getContext('2d');

    // 1. Background fill
    ctx.fillStyle = activeBg;
    ctx.fillRect(0, 0, tpl.width, tpl.height);

    // 2. Background image
    if (activeBgImg) {
        try {
            const bg = await loadImage(activeBgImg);
            ctx.drawImage(bg, 0, 0, tpl.width, tpl.height);
        } catch (e) {
            console.warn('BG image failed to load:', e);
        }
    }

    // 3. Photo zones
    const canvasFilter = FILTERS[filter] || null;
    for (let i = 0; i < tpl.zones.length; i++) {
        const zone = tpl.zones[i];
        const src  = capturedImages[i] ?? capturedImages[0];
        if (!src) continue;

        let photo;
        try { photo = await loadImage(src); } catch { continue; }

        ctx.save();

        // Rotate around zone centre
        const cx = zone.x + zone.width  / 2;
        const cy = zone.y + zone.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(((zone.rotation || 0) * Math.PI) / 180);
        ctx.translate(-zone.width / 2, -zone.height / 2);

        // Rounded clip
        const r = zone.effects?.rounded || 0;
        if (r > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, zone.width, zone.height, r);
            ctx.clip();
        } else {
            ctx.beginPath();
            ctx.rect(0, 0, zone.width, zone.height);
            ctx.clip();
        }

        // Apply CSS-style filter on canvas
        if (canvasFilter) ctx.filter = canvasFilter;
        drawCover(ctx, photo, 0, 0, zone.width, zone.height);
        ctx.filter = 'none';

        // Border
        if (zone.border?.width > 0) {
            ctx.strokeStyle = zone.border.color || '#ffffff';
            ctx.lineWidth   = zone.border.width;
            if (r > 0) {
                ctx.beginPath();
                ctx.roundRect(0, 0, zone.width, zone.height, r);
                ctx.stroke();
            } else {
                ctx.strokeRect(0, 0, zone.width, zone.height);
            }
        }

        ctx.restore();
    }

    // Fallback: no zones → draw photos in vertical stack
    if (tpl.zones.length === 0) {
        const padX = tpl.width * 0.08;
        const photoH = (tpl.height * 0.8) / capturedImages.length;
        const photoW = tpl.width - padX * 2;
        const gap    = (tpl.height * 0.2) / (capturedImages.length + 1);
        for (let i = 0; i < capturedImages.length; i++) {
            let photo;
            try { photo = await loadImage(capturedImages[i]); } catch { continue; }
            const y = gap * (i + 1) + photoH * i;
            if (canvasFilter) ctx.filter = canvasFilter;
            drawCover(ctx, photo, padX, y, photoW, photoH);
            ctx.filter = 'none';
        }
        // Branding
        ctx.fillStyle = textColor;
        ctx.font = `900 ${tpl.width * 0.06}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('MEMORIA', tpl.width / 2, tpl.height * 0.05);
    }

    // 4. Text elements
    for (const t of tpl.texts) {
        ctx.save();
        ctx.font      = `${t.font?.weight || 'bold'} ${t.font?.size || 40}px ${t.font?.family || 'Arial'}`;
        ctx.fillStyle = t.font?.color || textColor;
        ctx.textAlign = t.align || 'center';
        const content = t.content === '{{date}}'
            ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : t.content;
        ctx.fillText(content, t.x, t.y);
        ctx.restore();
    }

    return canvas.toDataURL('image/png');
}

// ─── Component ────────────────────────────────────────────────────────────────
const PREVIEW_W = 320;

export default function Result() {
    const navigate = useNavigate();
    const { capturedImages, selectedTemplate, resetFlow } = usePhotobooth();

    const [tpl,           setTpl]           = useState(() => parseTemplate(selectedTemplate));
    const [colorOverride, setColorOverride] = useState(null);
    const [filter,        setFilter]        = useState('none');
    const [downloading,   setDownloading]   = useState(false);
    const [saved,         setSaved]         = useState(false);
    const [uploading,     setUploading]     = useState(false);
    const [cloudUrl,      setCloudUrl]      = useState(null);

    useEffect(() => {
        if (selectedTemplate) { setTpl(parseTemplate(selectedTemplate)); setColorOverride(null); }
    }, [selectedTemplate]);

    const activeBg    = colorOverride?.bg   ?? tpl.bgColor;
    const activeText  = colorOverride?.text ?? tpl.textColor;
    const activeBgImg = colorOverride       ? null : tpl.bgImage;

    const scale    = PREVIEW_W / tpl.width;
    const previewH = Math.round(tpl.height * scale);

    if (!capturedImages?.length) {
        return (
            <div className="result-empty">
                <p>Tidak ada foto yang diambil.</p>
                <button className="retake-btn" onClick={() => navigate('/')}>Kembali</button>
            </div>
        );
    }

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const dataUrl = await composeCanvas(tpl, capturedImages, activeBg, activeBgImg, filter, activeText);

            const a = document.createElement('a');
            a.download = `memoria-${tpl.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
            a.href = dataUrl;
            a.click();
            setSaved(true);

            // Upload to Supabase (background)
            setUploading(true);
            photoAPI.uploadPublicStrip({ image_base64: dataUrl, template_id: tpl.id || 0, filter })
                .then(r => setCloudUrl(r.data?.url))
                .catch(e => console.warn('Cloud upload:', e))
                .finally(() => setUploading(false));
        } catch (err) {
            console.error(err);
            alert('Gagal membuat gambar. Coba lagi.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="result-wrapper">
            <div className="editor-layout">

                {/* ── Preview ── */}
                <div className="strip-preview-container">
                    {/* Viewport clips the scaled canvas */}
                    <div className="strip-viewport" style={{ width: PREVIEW_W, height: previewH }}>
                        <div
                            className="strip-canvas-inner"
                            style={{
                                width: tpl.width, height: tpl.height,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                backgroundColor: activeBg,
                                backgroundImage: activeBgImg ? `url(${activeBgImg})` : 'none',
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Render zones */}
                            {tpl.zones.map((zone, idx) => {
                                const img = capturedImages[idx] ?? capturedImages[0];
                                return (
                                    <div key={idx} style={{
                                        position: 'absolute',
                                        left: zone.x, top: zone.y,
                                        width: zone.width, height: zone.height,
                                        transform: `rotate(${zone.rotation || 0}deg)`,
                                        overflow: 'hidden',
                                        border: zone.border?.width > 0 ? `${zone.border.width}px ${zone.border.style} ${zone.border.color}` : 'none',
                                        borderRadius: zone.effects?.rounded ? zone.effects.rounded : 0,
                                        zIndex: (zone.z_index ?? idx) + 2,
                                    }}>
                                        <img src={img} alt="" className={`filter-${filter}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    </div>
                                );
                            })}

                            {/* Fallback stack */}
                            {tpl.zones.length === 0 && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 60, zIndex: 2 }}>
                                    <div style={{ color: activeText, fontSize: 80, fontWeight: 900 }}>MEMORIA</div>
                                    {capturedImages.map((img, i) => (
                                        <div key={i} style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden' }}>
                                            <img src={img} className={`filter-${filter}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Text elements */}
                            {tpl.texts.map((t, i) => (
                                <div key={i} style={{
                                    position: 'absolute', left: t.x, top: t.y,
                                    transform: 'translate(-50%,-50%)',
                                    color: t.font?.color || activeText,
                                    fontSize: t.font?.size || 40,
                                    fontWeight: t.font?.weight || 'bold',
                                    fontFamily: t.font?.family || 'inherit',
                                    textAlign: t.align || 'center',
                                    zIndex: 20, pointerEvents: 'none',
                                }}>
                                    {t.content === '{{date}}'
                                        ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : t.content}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="template-name-badge">{tpl.name} · {tpl.width}×{tpl.height}</div>
                </div>

                {/* ── Tools ── */}
                <div className="tools-panel">
                    <div className="tools-header">
                        <h2>Customize Strip</h2>
                        <p>Sesuaikan tampilan akhir fotomu</p>
                    </div>

                    <div className="tool-section">
                        <label><Palette size={16} /> Warna Background</label>
                        {colorOverride && (
                            <button className="restore-btn" onClick={() => setColorOverride(null)}>
                                ↩ Kembali ke Template
                            </button>
                        )}
                        <div className="template-picker">
                            {COLOR_PALETTE.map(c => (
                                <button key={c.id} className={`template-dot ${colorOverride?.id === c.id ? 'active' : ''}`}
                                    style={{ background: c.bg }} onClick={() => setColorOverride(c)} title={c.label} />
                            ))}
                        </div>
                    </div>

                    <div className="tool-section">
                        <label><ImageIcon size={16} /> Efek Filter</label>
                        <div className="filter-options">
                            {[['none','Normal'],['bw','B&W'],['sepia','Sepia'],['vivid','Vivid']].map(([id, label]) => (
                                <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => { resetFlow(); navigate('/'); }}>
                            <RefreshCw size={18} /> Ulangi Foto
                        </button>
                        <button className={`download-btn ${saved ? 'saved' : ''}`} onClick={handleDownload} disabled={downloading}>
                            {downloading ? <><Loader2 size={18} className="spin" /> Memproses...</>
                                : saved    ? <><Check size={18} /> Tersimpan!</>
                                           : <><Download size={18} /> Download Strip</>}
                        </button>
                        {saved && (
                            <div className="cloud-status">
                                <Cloud size={13} />
                                {uploading ? <span>Menyimpan ke Cloud...</span>
                                    : cloudUrl ? <span>✅ Tersimpan di Cloud</span>
                                              : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
