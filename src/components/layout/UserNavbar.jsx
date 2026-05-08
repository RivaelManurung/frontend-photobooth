import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import '../../styles/LandingPage.css';

export default function UserNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navLinks = [
        { label: 'HOME', path: '/' },
        { label: 'PACKAGES', path: '/packages' },
        { label: 'GALLERY', path: '/gallery' },
        { label: 'ABOUT', path: '/about' },
        { label: 'CONTACT', path: '/contact' },
    ];

    return (
        <header className="brutal-nav">
            <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
                <h1 className="logo-text">SNAP!</h1>
                <span className="logo-subtext">PHOTOBOOTH</span>
            </div>
            
            <div className="nav-links-center">
                {navLinks.map((link) => (
                    <button 
                        key={link.path}
                        className={`nav-link-btn ${isActive(link.path) ? 'active' : ''}`}
                        onClick={() => navigate(link.path)}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            <div className="nav-cta bg-neo-pink" onClick={() => navigate('/packages')}>
                <span>BOOK NOW</span>
                <ArrowUpRight size={24} strokeWidth={3} />
            </div>
        </header>
    );
}
