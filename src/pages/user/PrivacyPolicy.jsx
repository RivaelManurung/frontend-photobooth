import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Camera, ArrowUpRight } from 'lucide-react';
import '../../styles/LandingPage.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* --- HEADER --- */}
      <header className="brutal-nav">
          <div className="nav-brand bg-neo-yellow" onClick={() => navigate('/')}>
              <h1 className="logo-text">SNAP!</h1>
              <span className="logo-subtext">PHOTOBOOTH</span>
          </div>
          
          <div className="nav-links-center">
              <button className="nav-link-btn" onClick={() => navigate('/')}>HOME</button>
              <button className="nav-link-btn" onClick={() => navigate('/layout')}>PACKAGES</button>
              <button className="nav-link-btn" onClick={() => navigate('/gallery')}>GALLERY</button>
          </div>

          <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
              <span>BOOK NOW</span>
              <ArrowUpRight size={24} strokeWidth={3} />
          </div>
      </header>

      <main className="brutal-main">
        <div className="mt-12 mb-12">
           <h1 className="text-6xl font-black uppercase">PRIVACY POLICY</h1>
           <div className="h-4 w-48 bg-neo-pink mt-2"></div>
           <p className="font-black uppercase text-xs mt-4">LAST UPDATED: MAY 8, 2026</p>
        </div>

        <div className="bg-white border-8 border-black p-10 md:p-16 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto mb-20">
          <div className="flex items-center gap-6 mb-12 pb-6 border-b-4 border-black border-dashed">
            <div className="w-16 h-16 bg-neo-cyan border-4 border-black flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase">YOUR DATA IS SAFE</h2>
          </div>

          <div className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-yellow pl-4">1. Data We Collect</h3>
              <p className="font-bold text-lg leading-relaxed">
                We collect information you provide directly to us, such as your name, email address, 
                and the photos you capture using our service. We also collect technical data about 
                your device and how you interact with our platform.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-cyan pl-4">2. How We Use Your Data</h3>
              <p className="font-bold text-lg leading-relaxed">
                We use your data to provide, maintain, and improve our services. 
                Your photos are stored securely and only accessible to you and the people you share them with.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-pink pl-4">3. Data Security</h3>
              <p className="font-bold text-lg leading-relaxed">
                We implement industry-standard security measures to protect your personal information 
                from unauthorized access, disclosure, or destruction.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Privacy First</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
