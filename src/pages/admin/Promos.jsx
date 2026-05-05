import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import { StatCard, PageHeader, Pagination, SearchBar, EmptyState, Spinner, FormField, Textarea, Switch } from '../../components/ui/index.jsx';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';

const EMPTY_FORM = {
  code: '', description: '', type: 'percentage',
  discount_percent: '', discount_amount: '',
  max_uses: '', expires_at: '', is_active: true,
};

const Promos = () => {
  const { addToast } = useToast();
  const [promos, setPromos]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  // Modal states
  const [formModal, setFormModal]   = useState({ open: false, mode: 'create', data: null, loading: false });
  const [usageModal, setUsageModal] = useState({ open: false, promo: null, usages: [], loading: false });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, promo: null, loading: false });

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      const res = await adminAPI.getPromoCodes(params);
      setPromos(res.data?.promo_codes || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error('fetchPromos:', err);
      addToast({ title: 'Error', description: 'Gagal memuat promo codes', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  // ── Form helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormModal({ open: true, mode: 'create', data: null, loading: false });
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
    setFormModal({ open: true, mode: 'edit', data: promo, loading: false });
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
    setFormModal((d) => ({ ...d, loading: true }));
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
      if (formModal.mode === 'create') {
        await adminAPI.createPromoCode(payload);
        addToast({ title: 'Success', description: 'Promo code berhasil dibuat', variant: 'success' });
      } else {
        await adminAPI.updatePromoCode(formModal.data.id, payload);
        addToast({ title: 'Success', description: 'Promo code berhasil diupdate', variant: 'success' });
      }
      setFormModal({ open: false, mode: 'create', data: null, loading: false });
      fetchPromos();
    } catch (err) {
      addToast({ title: 'Error', description: err.response?.data?.error || 'Operasi gagal', variant: 'error' });
      setFormModal((d) => ({ ...d, loading: false }));
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

  const handleDelete = async () => {
    if (!deleteDialog.promo) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await adminAPI.deletePromoCode(deleteDialog.promo.id);
      addToast({ title: 'Success', description: 'Promo code dihapus', variant: 'success' });
      fetchPromos();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus promo', variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, promo: null, loading: false });
    }
  };

  const openUsage = async (promo) => {
    setUsageModal({ open: true, promo, usages: [], loading: true });
    try {
      const res = await adminAPI.getPromoUsage(promo.id);
      setUsageModal((d) => ({ ...d, usages: res.data?.usages || [], loading: false }));
    } catch {
      setUsageModal((d) => ({ ...d, loading: false }));
    }
  };

  const filteredPromos = promos.filter((p) => {
    const matchSearch = !searchQuery || p.code?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? p.is_active : !p.is_active);
    return matchSearch && matchStatus;
  });

  const stats = {
    total:  promos.length,
    active: promos.filter((p) => p.is_active).length,
    used:   promos.reduce((a, p) => a + (p.used_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Codes"
        description="Kelola kode promosi dan diskon"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPromos}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Buat Promo</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Promo"  value={stats.total}  icon={Tag} iconColor="text-muted-foreground" />
        <StatCard title="Aktif"        value={stats.active} icon={ToggleRight} iconColor="text-green-600" />
        <StatCard title="Total Penggunaan" value={stats.used} icon={Tag} iconColor="text-blue-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari kode atau deskripsi..." className="flex-1" />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Daftar Promo ({filteredPromos.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : filteredPromos.length === 0 ? (
            <EmptyState icon={Tag} title="Tidak ada promo" description="Buat promo code pertama Anda." action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Buat Promo</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Diskon</TableHead>
                      <TableHead>Penggunaan</TableHead>
                      <TableHead>Kadaluarsa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromos.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-bold text-primary">{promo.code}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{promo.description}</TableCell>
                        <TableCell className="font-medium">
                          {promo.type === 'percentage' ? `${promo.discount_percent}%` : `Rp ${Number(promo.discount_amount).toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium">{promo.used_count ?? 0}</span>
                          <span className="text-muted-foreground"> / {promo.max_uses ?? '∞'}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{promo.expires_at ? formatDate(promo.expires_at) : '—'}</TableCell>
                        <TableCell>
                          <Badge variant={promo.is_active ? 'success' : 'secondary'}>
                            {promo.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" title="Lihat penggunaan" onClick={() => openUsage(promo)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title={promo.is_active ? 'Nonaktifkan' : 'Aktifkan'} onClick={() => handleToggle(promo)}>
                              {promo.is_active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(promo)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Hapus" onClick={() => setDeleteDialog({ open: true, promo, loading: false })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={formModal.open}
        onClose={() => !formModal.loading && setFormModal({ open: false, mode: 'create', data: null, loading: false })}
        title={formModal.mode === 'create' ? 'Buat Promo Code' : 'Edit Promo Code'}
        description="Isi form di bawah untuk menyimpan promo code"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Kode Promo" required error={formErrors.code}>
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" />
            </FormField>
            <FormField label="Tipe Diskon" required>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Deskripsi" required error={formErrors.description}>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Diskon spesial..." rows={2} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            {form.type === 'percentage' ? (
              <FormField label="Diskon (%)" required error={formErrors.discount_percent}>
                <Input type="number" min="1" max="100" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} placeholder="20" />
              </FormField>
            ) : (
              <FormField label="Diskon (Rp)" required error={formErrors.discount_amount}>
                <Input type="number" min="1" value={form.discount_amount} onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))} placeholder="10000" />
              </FormField>
            )}
            <FormField label="Maks. Penggunaan (kosong = ∞)">
              <Input type="number" min="1" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="100" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField label="Tanggal Kadaluarsa">
              <Input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
            </FormField>
            <div className="pb-1">
              <Switch checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Aktif" />
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setFormModal({ open: false, mode: 'create', data: null, loading: false })} disabled={formModal.loading}>Batal</Button>
          <Button onClick={handleSubmitForm} disabled={formModal.loading}>
            {formModal.loading ? <><span className="animate-spin mr-2">⏳</span>Menyimpan...</> : formModal.mode === 'create' ? 'Buat Promo' : 'Simpan'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Usage History Modal ── */}
      <Modal isOpen={usageModal.open} onClose={() => setUsageModal({ open: false, promo: null, usages: [], loading: false })} title={`Riwayat Penggunaan — ${usageModal.promo?.code}`} size="md">
        {usageModal.loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : usageModal.usages.length === 0 ? (
          <EmptyState icon={Tag} title="Belum ada penggunaan" description="Kode ini belum pernah digunakan." />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Tanggal</TableHead><TableHead>Order</TableHead></TableRow></TableHeader>
            <TableBody>
              {usageModal.usages.map((u, i) => (
                <TableRow key={i}>
                  <TableCell>{u.user_id}</TableCell>
                  <TableCell className="text-sm">{formatDate(u.used_at)}</TableCell>
                  <TableCell className="font-mono">#{u.order_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, promo: null, loading: false })}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        title="Hapus Promo Code"
        description={`Yakin ingin menghapus promo "${deleteDialog.promo?.code}"? Pengguna tidak dapat lagi menggunakannya.`}
        confirmText="Hapus"
      />
    </div>
  );
};

export default Promos;
