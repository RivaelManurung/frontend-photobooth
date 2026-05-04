import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/ResultPage.css';

// ─── Colour palette for manual override ───────────────────────────────────────
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

/**
 * Normalises a template object from DB or local fallback into a consistent shape.
 */
function normaliseTemplate(t) {
    if (!t) return { id: null, name: 'Default', bgColor: '#ffffff', textColor: '#2d3436', bgImage: null };
    return {
        id:        t.id,
        name:      t.name || 'Template',
        bgColor:   t.background_color || t.background || '#ffffff',
        textColor: t.text_color       || t.textColor  || '#2d3436',
        bgImage:   t.background_url   || t.preview_url || t.thumbnail_url || null,
    };
}

export default function Result() {
    const navigate  = useNavigate();
    const { capturedImages, selectedTemplate, session, resetFlow } = usePhotobooth();

    // Active template — initialized from context, kept in local state so user can override
    const [tpl, setTpl] = useState(() => normaliseTemplate(selectedTemplate));
    // Manual color override from palette (null = use template colours / image)
    const [colorOverride, setColorOverride] = useState(null);
    const [filter,      setFilter]      = useState('none');
    const [downloading, setDownloading] = useState(false);
    const [saved,       setSaved]       = useState(false);
    const stripRef = useRef(null);

    // Sync when context changes (e.g. user went back and picked a different template)
    useEffect(() => {
        setTpl(normaliseTemplate(selectedTemplate));
        setColorOverride(null); // reset manual override
    }, [selectedTemplate]);

    // Derive display values — manual override wins over template data
    const activeBg    = colorOverride?.bg    ?? tpl.bgColor;
    const activeText  = colorOverride?.text  ?? tpl.textColor;
    const activeBgImg = colorOverride        ? null : tpl.bgImage; // image hidden when user picks a color

    // ─── Guard: no photos ─────────────────────────────────────────────────────
    if (!capturedImages || capturedImages.length === 0) {
        return (
            <div className="result-empty">
                <p>Tidak ada foto yang diambil.</p>
                <button className="retake-btn" onClick={() => navigate('/')}>Kembali ke Beranda</button>
            </div>
        );
    }

    // ─── Download ─────────────────────────────────────────────────────────────
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

                {/* ─── Strip Preview ─────────────────────────────────────── */}
                <div className="strip-preview-container">
                    <div
                        className="photo-strip"
                        ref={stripRef}
                        style={{
                            backgroundColor: activeBg,
                            backgroundImage: activeBgImg ? `url(${activeBgImg})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Semi-transparent overlay so photos are still visible over image bg */}
                        {activeBgImg && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(255,255,255,0.15)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        <div className="strip-content">
                            <div className="branding" style={{ color: activeText }}>MEMORIA</div>

                            {capturedImages.map((img, idx) => (
                                <div key={idx} className="strip-photo-frame">
                                    <img
                                        src={img}
                                        alt={`Capture ${idx + 1}`}
                                        className={`strip-photo filter-${filter}`}
                                    />
                                </div>
                            ))}

                            <div className="date" style={{ color: activeText }}>
                                {new Date().toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </div>

                            {session?.session_id && (
                                <div className="session-watermark" style={{ color: activeText }}>
                                    #{session.session_id.slice(0, 8).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Template name badge */}
                    <div className="template-name-badge">{tpl.name}</div>
                </div>

                {/* ─── Tools Panel ───────────────────────────────────────── */}
                <div className="tools-panel">
                    <h2>Customize Strip</h2>

                    {/* Colour palette */}
                    <div className="tool-section">
                        <label><Palette size={18} /> Change Background</label>

                        {/* Button to restore original template */}
                        {colorOverride && (
                            <button
                                className="restore-btn"
                                onClick={() => setColorOverride(null)}
                                title="Restore template background"
                            >
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
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Photo filter */}
                    <div className="tool-section">
                        <label><ImageIcon size={18} /> Photo Filter</label>
                        <div className="filter-options">
                            {[
                                { key: 'none',  label: 'Normal' },
                                { key: 'bw',    label: 'B&W' },
                                { key: 'sepia', label: 'Sepia' },
                                { key: 'vivid', label: 'Vivid' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    className={filter === key ? 'active' : ''}
                                    onClick={() => setFilter(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-buttons">
                        <button className="retake-btn" onClick={() => { resetFlow(); navigate('/'); }}>
                            <RefreshCw size={18} /> Retake
                        </button>

                        <button
                            className={`download-btn ${saved ? 'saved' : ''}`}
                            onClick={downloadStrip}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <><Loader2 size={18} className="spin" /> Menyimpan...</>
                            ) : saved ? (
                                <><Check size={18} /> Tersimpan!</>
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
