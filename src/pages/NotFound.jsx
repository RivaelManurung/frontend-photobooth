import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import '../styles/LandingPage.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container min-h-screen flex flex-col items-center justify-center p-6 text-center bg-neo-stone">
      <div className="relative mb-12">
        <div className="text-[12rem] font-black text-black/10 select-none leading-none rotate-3">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-neo-pink border-8 border-black flex items-center justify-center rotate-[-6deg] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
             <Ghost size={64} className="text-black" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-8 bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black text-black uppercase tracking-tight">PAGE LOST!</h1>
        <div className="h-2 w-20 bg-neo-cyan mx-auto"></div>
        <p className="font-bold text-black/60 uppercase text-xs">
          The page you are looking for might have been removed or captured by another camera.
        </p>

        <div className="flex flex-col gap-4 pt-4">
          <button 
            onClick={() => navigate('/')}
            className="w-full h-16 bg-neo-yellow border-4 border-black font-black uppercase tracking-widest text-lg flex items-center justify-center gap-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Home size={24} /> BACK HOME
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full h-12 border-4 border-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-neo-stone transition-colors"
          >
            <ArrowLeft size={16} /> GO BACK
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 font-black text-black uppercase tracking-[0.2em] text-xs">
        SNAP! PHOTOBOOTH / SYSTEM ERROR
      </div>
    </div>
  );
};

export default NotFound;
