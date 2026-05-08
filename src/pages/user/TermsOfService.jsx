import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Camera, ArrowUpRight } from 'lucide-react';
import '../../styles/LandingPage.css';

const TermsOfService = () => {
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
           <h1 className="text-6xl font-black uppercase">TERMS OF SERVICE</h1>
           <div className="h-4 w-48 bg-neo-yellow mt-2"></div>
           <p className="font-black uppercase text-xs mt-4">LAST UPDATED: MAY 8, 2026</p>
        </div>

        <div className="bg-white border-8 border-black p-10 md:p-16 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto mb-20">
          <div className="flex items-center gap-6 mb-12 pb-6 border-b-4 border-black border-dashed">
            <div className="w-16 h-16 bg-neo-stone border-4 border-black flex items-center justify-center rotate-[-3deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <FileText size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase">THE LEGAL STUFF</h2>
          </div>

          <div className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-cyan pl-4">1. Acceptance of Terms</h3>
              <p className="font-bold text-lg leading-relaxed">
                By accessing and using SNAP! Booth, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the service.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-pink pl-4">2. Use of Service</h3>
              <p className="font-bold text-lg leading-relaxed">
                You may use our service for personal or commercial purposes as permitted by your subscription plan. 
                You are responsible for all content captured and shared through your account.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl font-black uppercase border-l-8 border-neo-yellow pl-4">3. Content Ownership</h3>
              <p className="font-bold text-lg leading-relaxed">
                You retain all rights to the photos you capture using SNAP! Booth. 
                By using the service, you grant us a limited license to process and store your photos 
                for the purpose of providing the service to you.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Legal Dept.</p>
      </footer>
    </div>
  );
};

export default TermsOfService;
