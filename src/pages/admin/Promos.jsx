import { useEffect, useState, useCallback } from 'react';
import {
  Tag, Search, Plus, Trash2, CheckSquare, Square, 
  Columns2, Info, Calendar, Percent, RefreshCw, Activity,
  Users, BarChart3, Clock, Edit, ToggleLeft, ToggleRight, Eye, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  PageHeader, Pagination, SearchBar, EmptyState, Spinner, Separator, FormField, Textarea, Switch
} from '../../components/ui/index.jsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, formatDate } from '../../lib/utils';

const EMPTY_FORM = {
  code: '', description: '', type: 'percentage',
  discount_percent: '', discount_amount: '',
  max_uses: '', expires_at: '', is_active: true,
};

const Promos = () => {
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

  // Drawer/Modal state
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialogs
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      const response = await adminAPI.getPromoCodes(params);
      const data = response.data?.promo_codes || [];
      setPromos(data);
      setTotalPages(response.data?.total_pages || 1);
      setSelectedIds([]);

      // Update stats locally
      setStats({
        total: data.length,
        active: data.filter(p => p.is_active).length,
        used: data.reduce((a, p) => a + (p.used_count || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching promos:', error);
      addToast({ title: 'Error', description: 'Gagal memuat daftar promo', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

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

  const validateForm = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = 'Kode promo wajib diisi';
    if (!form.description.trim()) errors.description = 'Deskripsi wajib diisi';
    if (form.type === 'percentage' && (!form.discount_percent || Number(form.discount_percent) <= 0))
      errors.discount_percent = 'Persentase diskon wajib diisi';
    if (form.type === 'fixed' && (!form.discount_amount || Number(form.discount_amount) <= 0))
      errors.discount_amount = 'Jumlah diskon wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      discount_percent: form.type === 'percentage' ? Number(form.discount_percent) : 0,
      discount_amount:  form.type === 'fixed'      ? Number(form.discount_amount)  : 0,
      max_uses:    form.max_uses ? Number(form.max_uses) : null,
      expires_at:  form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active:   form.is_active,
    };
    try {
      if (formMode === 'create') {
        await adminAPI.createPromoCode(payload);
        addToast({ title: 'Success', description: 'Promo code berhasil dibuat', variant: 'success' });
      } else {
        await adminAPI.updatePromoCode(selectedPromo.id, payload);
        addToast({ title: 'Success', description: 'Promo code berhasil diupdate', variant: 'success' });
      }
      setIsFormDrawerOpen(false);
      fetchPromos();
    } catch (err) {
      addToast({ title: 'Error', description: err.response?.data?.error || 'Operasi gagal', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (promo) => {
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

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormMode('create');
    setIsFormDrawerOpen(true);
  };

  const openEdit = (promo) => {
    setForm({
      code: promo.code || '',
      description: promo.description || '',
      type: promo.type || 'percentage',
      discount_percent: promo.discount_percent ?? '',
      discount_amount: promo.discount_amount ?? '',
      max_uses: promo.max_uses ?? '',
      expires_at: promo.expires_at ? promo.expires_at.substring(0, 10) : '',
      is_active: promo.is_active ?? true,
    });
    setFormErrors({});
    setFormMode('edit');
    setSelectedPromo(promo);
    setIsFormDrawerOpen(true);
  };

  const filteredPromos = promos.filter(p => {
    const matchSearch = !searchQuery || p.code?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = activeTab === 'all' || (activeTab === 'active' ? p.is_active : !p.is_active);
    return matchSearch && matchStatus;
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
            <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Buat Promo</Button>
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
                        <TableRow key={promo.id} className={selectedIds.includes(promo.id) ? 'bg-muted/30' : ''}>
                          <TableCell><Checkbox checked={selectedIds.includes(promo.id)} onClick={() => toggleSelect(promo.id)} /></TableCell>
                          {columnVisibility.code && (
                            <TableCell className="font-mono text-sm font-bold text-primary cursor-pointer" onClick={() => setSelectedPromo(promo)}>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedPromo(promo)}><Info className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(promo)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedIds([promo.id]); setBulkDeleteDialog({ open: true, loading: false }); }}><Trash2 className="h-4 w-4" /></Button>
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

      {/* ── Promo Detail/Analytics Drawer ── */}
      <Drawer isOpen={!!selectedPromo && !isFormDrawerOpen} onClose={() => setSelectedPromo(null)}>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100 text-orange-700">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle>Promo Analytics</DrawerTitle>
              <DrawerDescription>Internal ID: #{selectedPromo?.id}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerContent className="space-y-6">
          <div className="p-6 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Active Code</span>
            <div className="text-4xl font-black text-primary tracking-tighter">{selectedPromo?.code}</div>
            <p className="text-xs text-muted-foreground italic px-4">"{selectedPromo?.description}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <Users className="h-3 w-3 mr-1.5" /> Total Usage
              </div>
              <p className="text-lg font-bold">{selectedPromo?.used_count || 0}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <BarChart3 className="h-3 w-3 mr-1.5" /> Conversions
              </div>
              <p className="text-lg font-bold">12.4%</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center"><Tag className="h-3.5 w-3.5 mr-2" /> Discount</span>
              <span className="font-bold text-green-600">
                {selectedPromo?.type === 'percentage' ? `${selectedPromo?.discount_percent}%` : `Rp ${Number(selectedPromo?.discount_amount).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center"><Clock className="h-3.5 w-3.5 mr-2" /> Valid Until</span>
              <span className="font-medium">{selectedPromo?.expires_at ? formatDate(selectedPromo?.expires_at) : 'Never Expire'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center"><Activity className="h-3.5 w-3.5 mr-2" /> Status</span>
              <Badge variant={selectedPromo?.is_active ? 'success' : 'secondary'}>{selectedPromo?.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>

          <Separator />

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-blue-700">
              <Activity className="h-4 w-4" />
              Campaign Performance
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-blue-600/60 uppercase font-bold">Global Usage</p>
                <p className="text-sm font-bold text-blue-800">{stats.used} total</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-600/60 uppercase font-bold">Active Promos</p>
                <p className="text-sm font-bold text-blue-800">{stats.active} campaigns</p>
              </div>
            </div>
          </div>
        </DrawerContent>

        <DrawerFooter>
          <Button variant="outline" className="flex-1" onClick={() => openEdit(selectedPromo)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Details
          </Button>
          <Button variant="destructive" onClick={() => { setSelectedIds([selectedPromo.id]); setBulkDeleteDialog({ open: true, loading: false }); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* ── Create / Edit Form Drawer ── */}
      <Drawer isOpen={isFormDrawerOpen} onClose={() => setIsFormDrawerOpen(false)}>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle>{formMode === 'create' ? 'Create New Promo' : 'Edit Promo Code'}</DrawerTitle>
              <DrawerDescription>Configure discount parameters and limits</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Promo Code" required error={formErrors.code}>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER25" />
            </FormField>
            <FormField label="Discount Type" required>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={form.type} 
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rp)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Description" required error={formErrors.description}>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
              placeholder="e.g. Special summer discount for standard plan..." 
              rows={3} 
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            {form.type === 'percentage' ? (
              <FormField label="Discount %" required error={formErrors.discount_percent}>
                <Input type="number" min="1" max="100" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} placeholder="10" />
              </FormField>
            ) : (
              <FormField label="Amount (Rp)" required error={formErrors.discount_amount}>
                <Input type="number" min="1" value={form.discount_amount} onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))} placeholder="5000" />
              </FormField>
            )}
            <FormField label="Usage Limit">
              <Input type="number" min="1" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="50" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField label="Expiration Date">
              <Input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
            </FormField>
            <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/10 h-10">
              <span className="text-xs font-medium text-muted-foreground">Active Campaign</span>
              <Switch checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
          </div>
        </DrawerContent>

        <DrawerFooter>
          <Button variant="outline" className="flex-1" onClick={() => setIsFormDrawerOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmitForm} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            {formMode === 'create' ? 'Create Campaign' : 'Update Promo'}
          </Button>
        </DrawerFooter>
      </Drawer>

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

