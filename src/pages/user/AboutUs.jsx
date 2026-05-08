import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, Award, Shield, ArrowLeft, ArrowUpRight } from 'lucide-react';
import UserNavbar from '../../components/layout/UserNavbar';
import '../../styles/LandingPage.css';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* --- HEADER --- */}
      <UserNavbar />

      <main className="brutal-main">
        {/* --- HERO --- */}
        <section className="py-20">
          <div className="hero-badge border-black inline-block">WHO WE ARE</div>
          <h1 className="text-8xl font-black text-black uppercase leading-tight mb-8">
            REDEFINING <br/> THE PHOTO <br/> EXPERIENCE
          </h1>
          <p className="text-2xl font-bold text-black/70 leading-relaxed max-w-3xl border-l-8 border-neo-yellow pl-8">
            Memoria was born from a simple idea: everyone should have access to high-quality, 
            fun, and instant memories without needing a physical booth.
          </p>
        </section>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-20">
          <div className="bg-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-4xl font-black mb-8 uppercase">Our Mission</h2>
            <p className="text-lg font-medium leading-relaxed mb-8">
              We combine cutting-edge browser technology with premium design templates to 
              deliver a studio-like photobooth experience directly to your device. 
              Whether it's a digital party, a corporate event, or just a fun afternoon, 
              we make every snapshot count.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 border-2 border-black bg-neo-stone">
                <Users className="h-8 w-8 mb-4" />
                <h3 className="font-black uppercase text-sm">Community Driven</h3>
              </div>
              <div className="p-6 border-2 border-black bg-neo-pink">
                <Award className="h-8 w-8 mb-4" />
                <h3 className="font-black uppercase text-sm">Premium Quality</h3>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="border-4 border-black overflow-hidden rotate-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
                <img 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80" 
                  alt="Photobooth Experience" 
                  className="w-full aspect-square object-cover"
                />
             </div>
             <div className="absolute -bottom-6 -left-6 bg-neo-yellow border-4 border-black p-6 rotate-[-4deg] max-w-[240px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black italic">"The most seamless digital booth I've ever used."</p>
                <div className="flex gap-1 mt-3">
                  {[1,2,3,4,5].map(i => <Shield key={i} size={14} fill="black" />)}
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Capture Everything</p>
      </footer>
    </div>
  );
};

export default AboutUs;
