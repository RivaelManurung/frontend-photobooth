import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, MapPin, Phone, Send, ArrowLeft, Camera, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import '../../styles/LandingPage.css';

const ContactUs = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addToast({
        title: 'Message Sent',
        description: "We've received your message and will get back to you soon.",
        variant: 'success'
      });
      setLoading(false);
      e.target.reset();
    }, 1500);
  };

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
              <button className="nav-link-btn active">CONTACT</button>
          </div>

          <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
              <span>BOOK NOW</span>
              <ArrowUpRight size={24} strokeWidth={3} />
          </div>
      </header>

      <main className="brutal-main">
        <section className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="hero-badge border-black inline-block">SAY HELLO</div>
            <h1 className="text-8xl font-black text-black uppercase leading-tight">GET IN <br/> TOUCH</h1>
            <p className="text-2xl font-bold text-black/70 leading-relaxed max-w-md">
                Have a question? Our team is here to help you capture perfection.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 border-4 border-black bg-neo-cyan shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Mail className="h-8 w-8" />
                <span className="font-black uppercase">support@snap-booth.com</span>
              </div>
              <div className="flex items-center gap-6 p-6 border-4 border-black bg-neo-yellow shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Phone className="h-8 w-8" />
                <span className="font-black uppercase">+1 (555) 000-SNAP</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black">Your Name</label>
                  <input className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black">Email Address</label>
                  <input className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone" type="email" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black">Message</label>
                <textarea 
                  className="w-full min-h-[200px] border-4 border-black p-4 font-bold focus:outline-none focus:bg-neo-stone resize-none"
                  placeholder="Type your message here..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full h-16 bg-black text-white font-black uppercase tracking-widest text-xl flex items-center justify-center gap-4 hover:bg-neo-pink hover:text-black transition-colors"
                disabled={loading}
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Message
                    <Send className="h-6 w-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm italic">"Always happy to chat memories."</p>
      </footer>
    </div>
  );
};

export default ContactUs;
