import { useEffect, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, CreditCard, RefreshCw, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { StatCard, PageHeader, Pagination, SearchBar, EmptyState, Spinner } from '../../components/ui/index.jsx';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime } from '../../lib/utils';

const STATUS_VARIANT = {
  completed: 'success',
  pending:   'warning',
  failed:    'destructive',
  cancelled: 'secondary',
  active:    'default',
};

const Payments = () => {
  const { addToast } = useToast();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [stats, setStats]             = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await adminAPI.getOrders(params);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error('fetchOrders:', err);
      addToast({ title: 'Error', description: 'Gagal memuat data pembayaran', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data || {});
    } catch (err) {
      console.error('fetchStats:', err);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = () => { fetchOrders(); fetchStats(); };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return String(o.id).includes(q) || String(o.user_id).includes(q) || o.payment_method?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor semua transaksi pembayaran"
        action={
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue || 0)}
          icon={DollarSign}
          iconColor="text-green-600"
          trend="Semua waktu"
        />
        <StatCard
          title="Revenue Bulan Ini"
          value={formatCurrency(stats.monthly_revenue || 0)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          trend="Bulan berjalan"
        />
        <StatCard
          title="Total Orders"
          value={stats.total_orders ?? 0}
          icon={CreditCard}
          iconColor="text-purple-600"
          trend="Semua waktu"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari ID order, user ID..."
              className="flex-1"
            />
            <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState icon={Receipt} title="Tidak ada transaksi" description="Belum ada data pembayaran yang ditemukan." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.user_id}</TableCell>
                        <TableCell className="text-sm">{order.subscription_plan || order.plan || '-'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.amount || order.total_amount || 0)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.payment_method || 'QRIS'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(order.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
