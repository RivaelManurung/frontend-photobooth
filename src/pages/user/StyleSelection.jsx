import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
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
                setError('Gagal memuat template. Menggunakan template bawaan.');
                // Fallback to local templates
                setTemplates(LOCAL_FALLBACK_TEMPLATES);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [photoCount]);

    const handleSelect = async (template) => {
        setSelectedId(template.id);
        setSelectedTemplate(template);

        // Create session in backend
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
            navigate('/booth');
        } catch (err) {
            console.error('Failed to create session:', err);
            // Navigate anyway, session will be null — booth still works offline
            navigate('/booth');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="selection-container">
            {creating && (
                <div className="creating-overlay">
                    <Loader2 className="spin" size={40} />
                    <p>Menyiapkan sesi foto...</p>
                </div>
            )}

            <div className="header-title">
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

/** Local fallback templates matching the DB schema structure */
const LOCAL_FALLBACK_TEMPLATES = [
    { id: 'local-1', name: 'CLASSIC WHITE', category: 'classic', background_color: '#ffffff', text_color: '#2d3436', border_style: 'solid', is_premium: false },
    { id: 'local-2', name: 'CHARCOAL', category: 'modern', background_color: '#2d3436', text_color: 'rgba(255,255,255,0.8)', is_premium: false },
    { id: 'local-3', name: 'VINTAGE FILM', category: 'vintage', className: 'theme-film', background_color: '#1a1a1a', text_color: '#ffffff', is_premium: false },
    { id: 'local-4', name: 'POP ART LOVE', category: 'party', className: 'theme-pop', background_color: '#48dbfb', text_color: '#000', is_premium: false },
    { id: 'local-5', name: 'GREEN PICNIC', category: 'classic', className: 'theme-picnic', background_color: '#e3f2fd', text_color: '#2e7d32', is_premium: false },
    { id: 'local-6', name: 'BIRTHDAY PARTY', category: 'party', className: 'theme-birthday', background_color: '#fff3cd', text_color: '#d35400', is_premium: false },
    { id: 'local-7', name: 'SKA CHECKER', category: 'modern', className: 'theme-checker', background_color: '#fff', text_color: '#000', is_premium: false },
    { id: 'local-8', name: 'NEON NIGHTS', category: 'modern', className: 'theme-neon', background_color: '#000', text_color: '#00ff00', is_premium: false },
];
