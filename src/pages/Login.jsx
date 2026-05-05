import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Zap, BarChart3, Lock, Mail, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { authAPI } from '../lib/api';
import { useToast } from '../components/ui/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { access_token, user } = response.data;

      if (user.role !== 'admin') {
        addToast({
          title: 'Access Denied',
          description: 'Admin privileges required.',
          variant: 'error'
        });
        setLoading(false);
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      addToast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
        variant: 'success'
      });
      
      navigate('/');
    } catch (err) {
      addToast({
        title: 'Login Failed',
        description: err.response?.data?.error || 'Please check your credentials.',
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
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* ── Left Side: Visual/Feature Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80')] bg-cover opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-slate-900 to-slate-900"></div>
        
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">Memoria<span className="text-primary">Admin</span></span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-black text-white leading-tight">
              Manage your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Photobooth Empire</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Standardized administrative platform for real-time monitoring, 
              session management, and business intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <p className="text-sm font-bold text-white uppercase tracking-wider">Real-time</p>
              <p className="text-xs text-slate-400">Live session tracking & status monitoring</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <p className="text-sm font-bold text-white uppercase tracking-wider">Analytics</p>
              <p className="text-xs text-slate-400">Deep dive into revenue and growth metrics</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-slate-500 text-xs">
          <span>© 2026 Memoria Tech. All rights reserved.</span>
          <div className="flex gap-4 uppercase font-bold tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Memoria Admin</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 font-medium italic">Please enter your administrative credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="admin@photobooth.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 border-slate-200 focus:border-primary bg-white shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Password</label>
                  <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-12 border-slate-200 focus:border-primary bg-white shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In to Dashboard
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Standard Security</p>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  Default credentials for local testing are <span className="font-mono text-slate-600 not-italic">admin@photobooth.com / admin123</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
