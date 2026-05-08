import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ArrowUpRight } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { templatesAPI } from '../../lib/api';
import UserNavbar from '../../components/layout/UserNavbar';
import '../../styles/LandingPage.css';

export default function LayoutSelection() {
    const navigate = useNavigate();
    const { setPhotoCount, setSelectedTemplate, setSession, setCapturedImages } = usePhotobooth();
    const [availableCounts, setAvailableCounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLayouts = async () => {
            try {
                const res = await templatesAPI.getTemplates();
                const templates = res.data.templates || [];
                const counts = [...new Set(templates.map(t => t.photo_count))].sort((a, b) => a - b);
                setAvailableCounts(counts.length > 0 ? counts : [1, 2, 3, 4]); // Fallback for demo
            } catch (err) {
                setAvailableCounts([1, 2, 3, 4]); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchLayouts();
    }, []);

    const handleSelect = (count) => {
        setPhotoCount(count);
        setSelectedTemplate(null);
        setSession(null);
        setCapturedImages([]);
        navigate('/style');
    };

    const getLayoutName = (count) => {
        if (count === 1) return 'SINGLE';
        if (count === 2) return 'CLASSIC';
        if (count === 3) return 'TIMELINE';
        if (count === 4) return 'STORY';
        return `${count} POSES`;
    };

    const getLayoutColor = (count) => {
        const colors = ['bg-neo-cyan', 'bg-neo-yellow', 'bg-neo-pink', 'bg-neo-stone'];
        return colors[(count - 1) % colors.length];
    };

    return (
        <div className="landing-container">
            <UserNavbar />

            <main className="brutal-main">
                <div className="mt-12 mb-12">
                   <button onClick={() => navigate('/')} className="flex items-center gap-2 font-black uppercase text-xs mb-4 hover:translate-x-1 transition-transform">
                      <ArrowLeft size={16} strokeWidth={3}/> BACK TO HOME
                   </button>
                   <h1 className="text-7xl font-black uppercase">CHOOSE LAYOUT</h1>
                   <div className="h-4 w-48 bg-neo-yellow mt-2"></div>
                   <p className="font-black uppercase text-xs mt-4 tracking-widest italic">How many poses do you want to capture?</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin inline-block w-12 h-12 border-8 border-black border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {availableCounts.map((count) => (
                            <div
                                key={count}
                                className="bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all cursor-pointer group"
                                onClick={() => handleSelect(count)}
                            >
                                <div className={`aspect-[3/4] ${getLayoutColor(count)} border-4 border-black mb-6 p-4 flex flex-col gap-2 group-hover:rotate-1 transition-transform`}>
                                    {[...Array(count)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-white border-2 border-black"></div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="block text-6xl font-black leading-none">{count}</span>
                                        <span className="block font-black uppercase text-sm mt-1">{getLayoutName(count)}</span>
                                    </div>
                                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                                        <ArrowUpRight size={24} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
                <p className="font-black uppercase tracking-widest text-sm italic">"One snap is never enough."</p>
            </footer>
        </div>
    );
}
