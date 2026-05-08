import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, CreditCard, Download, ExternalLink, 
  Calendar, Camera, FileText, ArrowLeft, Search, ArrowUpRight
} from 'lucide-react';
import { paymentAPI } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import '../../styles/LandingPage.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getPayments();
      setOrders(res.data?.data || []);
    } catch (error) {
      setOrders([
        { id: 'PAY-1001', amount: 25, status: 'completed', createdAt: new Date().toISOString(), session: { id: 'SESS-2026-0501', template: 'Minimalist' } },
        { id: 'PAY-1002', amount: 30, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString(), session: { id: 'SESS-2026-0498', template: 'Retro' } },
        { id: 'PAY-1003', amount: 15, status: 'refunded', createdAt: new Date(Date.now() - 172800000).toISOString(), session: { id: 'SESS-2026-0495', template: 'Party' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-neo-cyan';
      case 'pending': return 'bg-neo-yellow';
      case 'refunded': return 'bg-neo-red';
      default: return 'bg-neo-stone';
    }
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
              <button className="nav-link-btn active">ORDERS</button>
          </div>

          <div className="nav-cta bg-neo-pink" onClick={() => navigate('/layout')}>
              <span>BOOK NOW</span>
              <ArrowUpRight size={24} strokeWidth={3} />
          </div>
      </header>

      <main className="brutal-main">
        <div className="mt-12 mb-8">
           <button onClick={() => navigate('/profile')} className="flex items-center gap-2 font-black uppercase text-xs mb-4 hover:translate-x-1 transition-transform">
              <ArrowLeft size={16} strokeWidth={3}/> BACK TO PROFILE
           </button>
           <h1 className="text-6xl font-black uppercase">ORDER HISTORY</h1>
           <div className="h-4 w-40 bg-neo-cyan mt-2"></div>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-20">
               <div className="animate-spin inline-block w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b-4 border-black border-dashed">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-neo-stone border-4 border-black flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       <CreditCard size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black uppercase">{order.id}</span>
                        <span className={`px-3 py-1 border-2 border-black font-black uppercase text-[10px] ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="font-bold text-black/60 uppercase text-xs">{formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <div className="text-3xl font-black">${order.amount}</div>
                    <div className="font-black uppercase text-[10px] text-black/50">VIA CREDIT CARD</div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neo-yellow border-2 border-black flex items-center justify-center rotate-[-3deg]">
                       <Camera size={20} />
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs">Session: {order.session?.id || 'N/A'}</p>
                      <p className="font-bold text-black/50 uppercase text-[10px]">Template: {order.session?.template || 'Classic'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button className="h-12 px-6 border-4 border-black font-black uppercase text-xs hover:bg-neo-stone transition-colors">
                      INVOICE
                    </button>
                    <button 
                      onClick={() => navigate(`/result?session=${order.session?.id}`)}
                      className="h-12 px-6 bg-black text-white font-black uppercase text-xs flex items-center gap-2 hover:bg-neo-pink hover:text-black transition-colors border-4 border-black"
                    >
                      VIEW PHOTOS <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-4 border-black p-20 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <History size={64} className="mx-auto mb-6 text-black/20" />
              <h3 className="text-2xl font-black uppercase">NO ORDERS YET</h3>
              <p className="font-bold text-black/50 uppercase mb-8">You haven't made any sessions yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="px-10 h-16 bg-neo-cyan border-4 border-black font-black uppercase text-lg hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                START A SESSION
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-12 border-t-4 border-black bg-black text-white text-center">
        <p className="font-black uppercase tracking-widest text-sm italic">"Keep making memories."</p>
      </footer>
    </div>
  );
};

export default OrderHistory;
