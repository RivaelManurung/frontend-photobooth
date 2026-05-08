import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, 
  Camera, History, CreditCard, Settings,
  Edit2, Save, X, LogOut, ArrowUpRight
} from 'lucide-react';
import { authAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import '../../styles/LandingPage.css';

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      setUser(res.data?.data || null);
      setFormData({
        name: res.data?.data?.name || '',
        email: res.data?.data?.email || '',
        phone: res.data?.data?.phone || '',
      });
    } catch (error) {
      const mockUser = JSON.parse(localStorage.getItem('user') || '{"name":"User Demo", "email":"user@example.com"}');
      setUser(mockUser);
      setFormData({
        name: mockUser.name || '',
        email: mockUser.email || '',
        phone: '+1 234 567 890',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(formData);
      addToast({ title: 'Profile updated', variant: 'success' });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      addToast({ title: 'Update failed', variant: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
              <button className="nav-link-btn active">PROFILE</button>
          </div>

          <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
              <span>BOOK NOW</span>
              <ArrowUpRight size={24} strokeWidth={3} />
          </div>
      </header>

      <main className="brutal-main">
        <div className="flex flex-col md:flex-row gap-12 mt-12">
          {/* Sidebar Nav */}
          <div className="w-full md:w-80 space-y-4">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="w-24 h-24 bg-neo-cyan border-4 border-black flex items-center justify-center text-4xl font-black mb-4 mx-auto rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {user?.name?.substring(0, 1).toUpperCase()}
               </div>
               <h3 className="text-center font-black uppercase truncate">{user?.name}</h3>
            </div>

            <div className="bg-black text-white border-4 border-black p-4 space-y-2">
              <button className="w-full text-left p-3 font-black uppercase text-xs flex items-center gap-3 bg-neo-pink text-black border-2 border-white">
                <User size={16} /> Profile Information
              </button>
              <button onClick={() => navigate('/order-history')} className="w-full text-left p-3 font-black uppercase text-xs flex items-center gap-3 hover:bg-white hover:text-black transition-colors">
                <History size={16} /> Order History
              </button>
              <button onClick={handleLogout} className="w-full text-left p-3 font-black uppercase text-xs flex items-center gap-3 text-neo-red hover:bg-neo-red hover:text-black transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-10 pb-6 border-b-4 border-black border-dashed">
              <div>
                <h2 className="text-3xl font-black uppercase">ACCOUNT DETAILS</h2>
                <div className="h-2 w-20 bg-neo-yellow mt-1"></div>
              </div>
              <button 
                onClick={() => setEditing(!editing)}
                className="bg-black text-white p-4 font-black uppercase text-xs flex items-center gap-2 hover:bg-neo-yellow hover:text-black transition-colors"
              >
                {editing ? <><X size={16}/> Cancel</> : <><Edit2 size={16}/> Edit</>}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black">Full Name</label>
                  <input 
                    className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone disabled:opacity-50" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black">Email Address</label>
                  <input 
                    className="w-full h-14 border-4 border-black px-4 font-bold bg-neo-stone opacity-50 cursor-not-allowed" 
                    value={formData.email}
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-black">Phone Number</label>
                  <input 
                    className="w-full h-14 border-4 border-black px-4 font-bold focus:outline-none focus:bg-neo-stone disabled:opacity-50" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing} 
                  />
                </div>
              </div>

              {editing && (
                <button 
                  type="submit" 
                  className="w-full h-16 bg-neo-cyan border-4 border-black text-black font-black uppercase tracking-widest text-xl flex items-center justify-center gap-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Save size={24} /> Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm">© 2026 Memoria Tech / Keep Snapping</p>
      </footer>
    </div>
  );
};

export default Profile;
