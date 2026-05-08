import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { templatesAPI, sessionAPI } from '../../lib/api';
import { usePhotobooth } from '../../context/PhotoboothContext';
import '../../styles/SelectionScreens.css';
import '../../styles/Templates.css';
import '../../styles/StyleSelection.css';

export default function StyleSelection() {
    const navigate = useNavigate();
    const { photoCount, selectedTemplate, setSelectedTemplate, setSession } = usePhotobooth();

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const [selectedId, setSelectedId] = useState(selectedTemplate?.id || null);

    // Fetch templates from backend, filtered by photo_count
    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await templatesAPI.getTemplates({ photo_count: photoCount });
                const data = res.data;
                // Fallback: if backend doesn't support photo_count filter, filter client-side
                let list = data.templates || [];
                if (list.length === 0) {
                    // Try fetching all and filter
                    const all = await templatesAPI.getTemplates();
                    list = (all.data.templates || []).filter(
                        (t) => !t.photo_count || t.photo_count === photoCount
                    );
                }
                setTemplates(list);
            } catch (err) {
                console.error('Failed to fetch templates:', err);
                setError('Gagal memuat template dari server.');
                setTemplates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [photoCount]);

    const handleSelect = async (template) => {
        setSelectedId(template.id);
        setSelectedTemplate(template);

        const token = localStorage.getItem('token');

        // Only create session if user is logged in (has token)
        if (token) {
            setCreating(true);
            try {
                const res = await sessionAPI.createSession({
                    template_id: template.id,
                    layout_count: photoCount,
                    duration: 24,
                });
                setSession(res.data.session);
                // Increment usage counter (fire and forget)
                templatesAPI.incrementUsage(template.id).catch(() => {});
            } catch (err) {
                console.error('Failed to create session:', err);
                // Navigate anyway — booth still works offline
            } finally {
                setCreating(false);
            }
        }

        navigate('/booth');
    };

    return (
        <div className="selection-container">
            <header className="brutal-nav w-full">
                <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
                    <h1 className="logo-text">SNAP!</h1>
                    <span className="logo-subtext">PHOTOBOOTH</span>
                </div>
                
                <div className="nav-links-center">
                    <button className="nav-link-btn" onClick={() => navigate('/')}>HOME</button>
                    <button className="nav-link-btn active">PACKAGES</button>
                    <button className="nav-link-btn" onClick={() => navigate('/gallery')}>GALLERY</button>
                </div>

                <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
                    <span>BOOK NOW</span>
                    <ArrowUpRight size={24} strokeWidth={3} />
                </div>
            </header>

            <div className="header-title mt-12">
                <div className="title-box wide">
                    <h1>PICK YOUR STYLE</h1>
                </div>
                <div className="subtitle-badge">
                    Koleksi Frame Kece untuk {photoCount} Pose
                </div>
            </div>

            {error && (
                <div className="error-notice">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spin" size={48} />
                    <p>Memuat template...</p>
                </div>
            ) : (
                <div className="styles-grid">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            layoutCount={photoCount}
                            isSelected={selectedId === template.id}
                            onClick={() => handleSelect(template)}
                        />
                    ))}
                </div>
            )}

            <button className="back-button" onClick={() => navigate('/layout')}>
                <ArrowLeft size={20} />
                KEMBALI
            </button>
        </div>
    );
}

/** Renders one template card — handles both DB templates and local fallbacks */
function TemplateCard({ template, layoutCount, isSelected, onClick }) {
    const hasThumbnail = template.thumbnail_url || template.preview_url;
    const bgColor = template.background_color || template.background || '#ffffff';
    const textColor = template.text_color || template.textColor || '#2d3436';
    const isPremium = template.is_premium;

    return (
        <div
            className={`style-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            {isPremium && (
                <span className="premium-badge">
                    <Sparkles size={10} /> PREMIUM
                </span>
            )}

            <div className="style-preview-wrapper">
                {hasThumbnail ? (
                    <img
                        src={hasThumbnail}
                        alt={template.name}
                        className="template-thumbnail"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}

                {/* CSS preview strip (shown when no image or image fails) */}
                <div
                    className={`preview-strip ${template.className || ''}`}
                    style={{
                        backgroundColor: bgColor,
                        border: template.border_style ? `2px solid ${textColor}` : 'none',
                        display: hasThumbnail ? 'none' : 'flex',
                    }}
                >
                    <div className="strip-content">
                        {[...Array(layoutCount)].map((_, i) => (
                            <div key={i} className="mini-frame">
                                <div className="placeholder-face">:)</div>
                            </div>
                        ))}
                        <div className="mini-brand" style={{ color: textColor }}>MEMORIA</div>
                    </div>
                </div>
            </div>

            <div className="style-label">{template.name}</div>
            {template.category && (
                <div className="style-category">{template.category}</div>
            )}
        </div>
    );
}
