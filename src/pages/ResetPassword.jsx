import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import '../styles/LandingPage.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      addToast({ title: 'Error', description: 'Invalid or missing reset token.', variant: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({ title: 'Validation Error', description: 'Passwords do not match.', variant: 'error' });
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ token, password: formData.password });
      addToast({ title: 'Success', description: 'Your password has been reset successfully.', variant: 'success' });
      navigate('/login');
    } catch (err) {
      addToast({ title: 'Error', description: err.response?.data?.error || 'Failed to reset password.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container min-h-screen flex items-center justify-center p-6 bg-neo-stone">
      <div className="w-full max-w-[480px] bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center space-y-6 mb-10">
          <div className="mx-auto h-20 w-20 bg-neo-cyan border-4 border-black flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RefreshCw className="h-10 w-10 text-black" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-black">RESET</h2>
            <div className="h-2 w-20 bg-neo-yellow mx-auto"></div>
            <p className="text-black/60 font-black uppercase text-xs">Enter your new secure password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

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

export default ResetPassword;
