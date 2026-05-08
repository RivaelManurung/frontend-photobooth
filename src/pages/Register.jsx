import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, ShieldCheck, Zap, BarChart3, Lock, Mail, User, ChevronRight, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authAPI } from '../lib/api';
import { useToast } from '../components/ui/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      addToast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Assuming register endpoint exists
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      addToast({
        title: 'Registration Successful',
        description: 'Your account has been created. Please login.',
        variant: 'success'
      });
      
      navigate('/login');
    } catch (err) {
      addToast({
        title: 'Registration Failed',
        description: err.response?.data?.error || 'Something went wrong. Please try again.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 font-['Lexend'] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-20 w-24 h-24 bg-neo-yellow border-4 border-black rotate-45 opacity-20 -z-10"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-neo-purple border-4 border-black rounded-xl -rotate-12 opacity-20 -z-10"></div>

      <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 duration-500">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black/40 hover:text-black mb-8 group transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          BACK TO LOGIN
        </Link>

        <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">JOIN THE REVOLUTION</h2>
            <div className="h-2 w-24 bg-neo-pink mt-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Confirm
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="group relative w-full h-14 bg-neo-cyan border-4 border-black text-sm font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-black">
                {loading ? 'Creating Account...' : 'Get Started Now'}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </span>
            </button>
          </form>

          <p className="text-center mt-8 text-xs font-bold text-black/60 uppercase">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-black hover:text-neo-yellow underline decoration-2">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
          POWERED BY MEMORIA ENGINE / © 2026
        </p>
      </div>
    </div>
  );
};

export default Register;
