import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Search, Plus, Trash2, CheckSquare, Square, 
  Columns2, Info, Calendar, Percent, RefreshCw, Activity,
  Users, BarChart3, Clock, Edit, ToggleLeft, ToggleRight, Eye, ChevronRight
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Button, Badge, Input, Checkbox, ConfirmDialog,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination, SearchBar, EmptyState, Spinner, Separator,
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui';

import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, formatDate } from '../../lib/utils';

const Promos = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, used: 0 });

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    code: true,
    discount: true,
    usage: true,
    expiry: true,
    status: true,
  });

  // Dialogs
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15, q: searchQuery };
      const response = await adminAPI.getPromoCodes(params);
      const data = response.data?.promo_codes || [];
      setPromos(data);
      setTotalPages(response.data?.total_pages || 1);
      setSelectedIds([]);

      // Update stats locally
      setStats({
        total: response.data?.total || data.length,
        active: data.filter(p => p.is_active).length,
        used: data.reduce((a, p) => a + (p.used_count || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching promos:', error);
      addToast({ title: 'Error', description: 'Gagal memuat daftar promo', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, addToast]);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deletePromoCode(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} promo berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      fetchPromos();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa promo', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const handleToggle = async (e, promo) => {
    e.stopPropagation();
    try {
      await adminAPI.togglePromoStatus(promo.id);
      addToast({ title: 'Success', description: `Promo ${promo.is_active ? 'dinonaktifkan' : 'diaktifkan'}`, variant: 'success' });
      fetchPromos();
    } catch {
      addToast({ title: 'Error', description: 'Gagal mengubah status promo', variant: 'error' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPromos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPromos.map(p => p.id));
    }
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredPromos = promos.filter(p => {
    const matchStatus = activeTab === 'all' || (activeTab === 'active' ? p.is_active : !p.is_active);
    return matchStatus;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">All Promos</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchPromos} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/admin/promos/create')}><Plus className="mr-2 h-4 w-4" />Buat Promo</Button>
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
                  placeholder="Search by promo code or description..." 
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filteredPromos.length === 0 ? (
                <EmptyState icon={Tag} title="No promos found" description="No promotional data matches your criteria." />
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filteredPromos.length && filteredPromos.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.code && <TableHead>Code</TableHead>}
                        {columnVisibility.discount && <TableHead>Discount</TableHead>}
                        {columnVisibility.usage && <TableHead>Usage</TableHead>}
                        {columnVisibility.expiry && <TableHead>Expiry</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPromos.map((promo) => (
                        <TableRow 
                          key={promo.id} 
                          className={`cursor-pointer transition-colors ${selectedIds.includes(promo.id) ? 'bg-muted/30' : 'hover:bg-muted/50'}`}
                          onClick={() => navigate(`/admin/promos/${promo.id}`)}
                        >
                          <TableCell><Checkbox checked={selectedIds.includes(promo.id)} onClick={(e) => toggleSelect(e, promo.id)} /></TableCell>
                          {columnVisibility.code && (
                            <TableCell className="font-mono text-sm font-bold text-primary">
                              {promo.code}
                            </TableCell>
                          )}
                          {columnVisibility.discount && (
                            <TableCell className="text-sm font-medium">
                              {promo.type === 'percentage' ? `${promo.discount_percent}%` : `Rp ${Number(promo.discount_amount).toLocaleString()}`}
                            </TableCell>
                          )}
                          {columnVisibility.usage && (
                            <TableCell className="text-sm">
                              <span className="font-bold">{promo.used_count || 0}</span>
                              <span className="text-muted-foreground text-[10px]"> / {promo.max_uses || '∞'}</span>
                            </TableCell>
                          )}
                          {columnVisibility.expiry && <TableCell className="text-xs text-muted-foreground">{promo.expires_at ? formatDate(promo.expires_at) : 'No Expiry'}</TableCell>}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge variant={promo.is_active ? 'success' : 'secondary'} className="text-[10px]">
                                {promo.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/admin/promos/${promo.id}`); }}><Info className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/admin/promos/${promo.id}?tab=edit`); }}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setSelectedIds([promo.id]); setBulkDeleteDialog({ open: true, loading: false }); }}><Trash2 className="h-4 w-4" /></Button>
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
                  {selectedIds.length} of {filteredPromos.length} selected
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
        title="Delete Campaigns"
        description={`Are you sure you want to delete ${selectedIds.length} promotional codes? This cannot be undone.`}
        confirmText="Delete All"
      />
    </div>
  );
};

export default Promos;

