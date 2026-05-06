import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CreditCard, Search, Download, Filter, MoreVertical, Trash2, 
  CheckSquare, Square, Columns2, Info, Calendar, User,
  DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, FileText, Activity
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Button, Badge, Checkbox, ConfirmDialog,
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination, SearchBar, EmptyState, Spinner, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
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

const Payments = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({});

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    user: true,
    amount: true,
    status: true,
    method: true,
    date: true,
  });

  // Drawer state


  // Dialogs
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      if (activeTab !== 'all') params.status = activeTab;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const res = await adminAPI.getOrders(params);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.total_pages || 1);
      setSelectedIds([]);
    } catch (err) {
      console.error('fetchOrders:', err);
      addToast({ title: 'Error', description: 'Gagal memuat data pembayaran', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, filterStatus]);

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

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deleteOrder(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} transaksi berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      handleRefresh();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa transaksi', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return String(o.id).includes(q) || String(o.user_id).includes(q) || o.payment_method?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleRefresh} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns2 className="h-4 w-4 mr-2" />
                  Customize Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.keys(columnVisibility).map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={columnVisibility[col]}
                    onCheckedChange={(val) => setColumnVisibility(p => ({ ...p, [col]: val }))}
                    className="capitalize"
                  >
                    {col.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="mb-4">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Search by Order ID, User, or Method..." 
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filteredOrders.length === 0 ? (
                <EmptyState icon={CreditCard} title="No transactions found" description="Try adjusting your filters." />
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.id && <TableHead>Order ID</TableHead>}
                        {columnVisibility.user && <TableHead>User</TableHead>}
                        {columnVisibility.amount && <TableHead>Amount</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        {columnVisibility.method && <TableHead>Method</TableHead>}
                        {columnVisibility.date && <TableHead>Date</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className={selectedIds.includes(order.id) ? 'bg-muted/30' : ''}>
                          <TableCell><Checkbox checked={selectedIds.includes(order.id)} onClick={() => toggleSelect(order.id)} /></TableCell>
                          {columnVisibility.id && <TableCell className="font-mono text-sm font-bold text-primary">#{order.id}</TableCell>}
                          {columnVisibility.user && (
                            <TableCell className="text-sm cursor-pointer" onClick={() => navigate(`/admin/payments/${order.id}`)}>
                              User {order.user_id}
                            </TableCell>
                          )}
                          {columnVisibility.amount && <TableCell className="font-medium">{formatCurrency(order.amount || order.total_amount || 0)}</TableCell>}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge variant={STATUS_VARIANT[order.status] || 'secondary'} className="text-[10px]">
                                {order.status}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.method && <TableCell className="text-sm uppercase font-medium">{order.payment_method || 'QRIS'}</TableCell>}
                          {columnVisibility.date && <TableCell className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</TableCell>}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/payments/${order.id}`)}><Info className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedIds([order.id]); setBulkDeleteDialog({ open: true, loading: false }); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  {selectedIds.length} of {filteredOrders.length} selected
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Hapus Transaksi"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi yang dipilih? Data ini tidak dapat dikembalikan.`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default Payments;


