import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, ShieldCheck, Mail, Lock, ChevronRight } from 'lucide-react';
import { loginSchema, LoginRequest } from '../auth.types';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '../auth.service';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.token);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error: any) {
      // Error handled by interceptor toast
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 font-['Lexend'] relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-neo-cyan border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 rotate-3">
             <Camera className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic">MEMORIA</h1>
          <p className="text-xs font-black uppercase tracking-widest text-black/40 mt-1">Administrative Portal</p>
        </div>

        <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-black uppercase">LOGIN</h2>
            <div className="h-2 w-16 bg-neo-yellow mt-1"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@photobooth.com"
                className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
              />
              {errors.email && <p className="text-xs font-bold text-red-500 uppercase">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-black/50 hover:text-black uppercase tracking-widest underline decoration-2">Forgot?</Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full h-14 border-4 border-black bg-white px-4 text-sm font-bold focus:outline-none focus:bg-neo-cyan/10 transition-colors placeholder:text-black/30"
              />
              {errors.password && <p className="text-xs font-bold text-red-500 uppercase">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              className="group relative w-full h-14 bg-neo-yellow border-4 border-black text-sm font-black uppercase tracking-widest hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? 'Processing...' : 'Sign In'}
                {!isSubmitting && <ChevronRight className="h-4 w-4" />}
              </span>
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
             <p className="text-xs font-bold text-black/60 uppercase">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-black hover:text-neo-pink underline decoration-2">
                Register
              </Link>
            </p>

            <div className="w-full p-4 border-2 border-black border-dashed bg-stone-100 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-black shrink-0" />
              <p className="text-[10px] font-bold text-black/60 leading-tight">
                <span className="font-black text-black block mb-1 uppercase tracking-tighter">Security Note</span>
                All sessions are monitored and recorded for security purposes.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
          © 2026 Memoria Tech / v3.0-enterprise
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
