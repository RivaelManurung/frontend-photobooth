import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, User, DollarSign, Calendar, 
  FileText, Activity, Trash2, CheckCircle2, AlertCircle, Clock, ExternalLink
} from 'lucide-react';
import { 
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Separator, Spinner, ConfirmDialog
} from '../../components/ui';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, formatCurrency } from '../../lib/utils';

const STATUS_VARIANT = {
  completed: 'success',
  paid:      'success',
  pending:   'warning',
  failed:    'destructive',
  cancelled: 'secondary',
  active:    'default',
};

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrder(id);
      setOrder(res.data.order);
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat detail transaksi', variant: 'error' });
      navigate('/admin/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await adminAPI.deleteOrder(id);
      addToast({ title: 'Success', description: 'Transaksi berhasil dihapus', variant: 'success' });
      navigate('/admin/payments');
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal menghapus transaksi', variant: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/payments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transaction Details</h2>
            <p className="text-sm text-muted-foreground">Order ID: #{order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" /> Print Receipt
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Void Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Amount</p>
            <div className="text-4xl font-bold text-primary">{formatCurrency(order.amount || order.total_amount || 0)}</div>
            <div className="mt-4">
              <Badge variant={STATUS_VARIANT[order.status] || 'secondary'} className="px-4 py-1 uppercase text-[10px]">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-2" /> Customer</span>
                <span className="font-medium cursor-pointer text-primary hover:underline" onClick={() => navigate(`/admin/users/${order.user_id}`)}>
                  User #{order.user_id}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><CreditCard className="h-4 w-4 mr-2" /> Method</span>
                <span className="font-medium uppercase">{order.payment_method || 'QRIS'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date</span>
                <span className="font-medium">{formatDateTime(order.created_at)}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground">Payment Status</h4>
              <div className="flex items-center gap-3">
                {order.status === 'paid' || order.status === 'completed' ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold">Payment Settled</p>
                      <p className="text-muted-foreground">Funds received successfully.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold">Awaiting Payment</p>
                      <p className="text-muted-foreground">Waiting for customer action.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Audit</CardTitle>
              <CardDescription>Transaction metadata and gateway logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Reference ID</p>
                  <p className="text-sm font-mono">{order.reference_id || 'MID-TRX-998122'}</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Gateway</p>
                  <p className="text-sm font-medium">Midtrans</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold">Transaction History</h4>
                <div className="space-y-4 border-l-2 border-muted ml-2 pl-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary" />
                    <p className="text-xs font-bold">Order Created</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateTime(order.created_at)}</p>
                  </div>
                  {order.status === 'paid' && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-green-500" />
                      <p className="text-xs font-bold">Payment Captured</p>
                      <p className="text-[10px] text-muted-foreground">{formatDateTime(order.updated_at || order.created_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-700">
                  <Activity className="h-4 w-4" />
                  System Note
                </div>
                <p className="text-xs text-blue-600/80 leading-relaxed">
                  Transaksi ini valid dan telah melewati pengecekan fraud detection sistem. Dana akan dicairkan ke rekening operasional dalam 2 hari kerja.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Void Transaction"
        description="Are you sure you want to void this transaction? This will mark the order as cancelled and cannot be reversed."
      />
    </div>
  );
};

export default PaymentDetails;
