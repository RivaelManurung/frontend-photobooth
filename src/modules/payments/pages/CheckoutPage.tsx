import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { orderService } from '@/modules/orders/order.service';
import { paymentService } from '../payment.service';
import { Button } from '@/components/ui';
import { useSocket } from '@/providers/SocketProvider';
import { toast } from 'sonner';

const PACKAGES = {
  basic: { name: 'Basic Snap', price: 25000 },
  premium: { name: 'Premium Studio', price: 50000 },
  party: { name: 'Party Bundle', price: 150000 }
} as const;

const CheckoutPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { setPaymentVerified, setSessionId } = usePhotoboothStore();
  
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [qris, setQris] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);

  const pkg = PACKAGES[packageId as keyof typeof PACKAGES] || PACKAGES.premium;

  useEffect(() => {
    if (order?.id) {
      // Listen for payment success via websocket
      socket.on(`payment_success_${order.id}`, (data) => {
        setIsPaid(true);
        setPaymentVerified(true);
        setSessionId(data.sessionId);
        toast.success('Payment Received!');
        setTimeout(() => navigate('/layout'), 2000);
      });
    }
    return () => {
      if (order?.id) socket.off(`payment_success_${order.id}`);
    };
  }, [order?.id, socket, navigate, setPaymentVerified, setSessionId]);

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await orderService.createOrder({ packageId: packageId || 'premium' });
      setOrder(orderRes);
      
      const qrisRes = await paymentService.createQRIS({ orderId: orderRes.id });
      setQris(qrisRes);
    } catch (err) {
      toast.error('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPaid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neo-green p-6">
        <div className="bg-white border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
          <CheckCircle2 size={80} className="mx-auto mb-8 text-neo-green" />
          <h1 className="text-4xl font-black uppercase mb-4">PAYMENT SUCCESS!</h1>
          <p className="font-bold mb-8">Unlocking booth...</p>
          <Loader2 className="animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-stone p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
            <ArrowLeft className="mr-2" /> Back
          </Button>

          <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-4">
            <CreditCard /> Checkout
          </h2>

          {!qris ? (
            <div className="space-y-6">
              <div className="p-6 border-4 border-black bg-stone-100">
                <p className="font-bold uppercase text-xs mb-2">Selected Package</p>
                <p className="text-2xl font-black">{pkg.name}</p>
                <p className="text-xl font-bold">IDR {pkg.price.toLocaleString()}</p>
              </div>
              <Button 
                onClick={handleCreateOrder} 
                className="w-full h-16 text-xl font-black bg-neo-yellow"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'GENERATE QRIS'}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <p className="font-black uppercase tracking-widest">Scan to Pay</p>
              <img src={qris.qrImage} alt="QRIS" className="mx-auto border-4 border-black" />
              <div className="p-4 border-4 border-black bg-neo-yellow/20">
                <p className="text-sm font-bold">Waiting for payment...</p>
                <p className="text-xs text-muted-foreground italic">Powered by SNAP! Pay</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-black text-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
          <h3 className="text-xl font-black uppercase mb-6">Order Summary</h3>
          <div className="flex justify-between font-bold mb-4">
            <span>{pkg.name}</span>
            <span>{pkg.price.toLocaleString()}</span>
          </div>
          <div className="border-t-2 border-white/20 pt-4 flex justify-between text-2xl font-black">
            <span>TOTAL</span>
            <span className="text-neo-yellow">IDR {pkg.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
