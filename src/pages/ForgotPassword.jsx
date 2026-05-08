import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Mail, ChevronRight, ArrowLeft, KeyRound } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import '../styles/LandingPage.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setIsSent(true);
      addToast({
        title: 'Email Sent',
        description: 'Password reset link has been sent to your email.',
        variant: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Request Failed',
        description: err.response?.data?.error || 'Something went wrong.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container min-h-screen flex items-center justify-center p-6 bg-neo-stone">
      <div className="w-full max-w-[480px] bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center space-y-6 mb-10">
          <div className="mx-auto h-20 w-20 bg-neo-yellow border-4 border-black flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <KeyRound className="h-10 w-10 text-black" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-black">Forgot?</h2>
            <div className="h-2 w-20 bg-neo-cyan mx-auto"></div>
            <p className="text-black/60 font-black uppercase text-xs">Enter your email for a reset link</p>
          </div>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@snap-booth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-16 bg-black text-white font-black uppercase tracking-widest text-xl flex items-center justify-center gap-4 hover:bg-neo-pink hover:text-black transition-colors"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Link'}
            </button>
          </form>
        ) : (
          <div className="p-8 border-4 border-black bg-neo-cyan/10 text-center space-y-6">
            <p className="font-bold text-black">
              A link has been sent to <br/><span className="text-neo-pink underline">{email}</span>.
            </p>
            <button 
                onClick={() => setIsSent(false)} 
                className="w-full h-12 border-2 border-black font-black uppercase text-xs hover:bg-neo-stone transition-colors"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-10 pt-6 border-t-4 border-black border-dashed">
            <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-black hover:text-neo-pink transition-colors group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
              Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
