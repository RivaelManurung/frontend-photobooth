import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Save, Trash2, Tag, Clock, Percent, 
  BarChart3, Users, Activity, Info, Calendar, 
  AlertCircle, History, Calculator, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, FormField, Textarea, Switch, Spinner,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
  Separator, Badge, ConfirmDialog, Table,
  TableHeader, TableBody, TableHead, TableRow, TableCell, Tabs, TabsList, TabsTrigger, TabsContent
} from '../../components/ui';

import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatDateTime } from '../../lib/utils';

const PromoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageHistory, setUsageHistory] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  
  const [form, setForm] = useState({
    code: '', description: '', type: 'percentage',
    discount_percent: '', discount_amount: '',
    max_uses: '', expires_at: '', is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, loading: false });

  const fetchPromo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPromoCode(id);
      const data = response.data?.promo_code;
      setPromo(data);
      
      // Initialize form
      setForm({
        code: data.code || '',
        description: data.description || '',
        type: data.type || 'percentage',
        discount_percent: data.discount_percent ?? '',
        discount_amount: data.discount_amount ?? '',
        max_uses: data.max_uses ?? '',
        expires_at: data.expires_at ? data.expires_at.substring(0, 10) : '',
        is_active: data.is_active ?? true,
      });
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat data promo', variant: 'error' });
      navigate('/admin/promos');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchUsage = useCallback(async () => {
    try {
      setUsageLoading(true);
      const response = await adminAPI.getPromoUsage(id);
      setUsageHistory(response.data?.usage_history || []);
    } catch (err) {
      console.error('Error fetching usage:', err);
    } finally {
      setUsageLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPromo();
    fetchUsage();
  }, [fetchPromo, fetchUsage]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = 'Kode promo wajib diisi';
    if (!form.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    
    if (form.type === 'percentage') {
      if (!form.discount_percent || Number(form.discount_percent) <= 0) {
        newErrors.discount_percent = 'Persentase diskon wajib diisi';
      } else if (Number(form.discount_percent) > 100) {
        newErrors.discount_percent = 'Diskon tidak boleh lebih dari 100%';
      }
    }
    
    if (form.type === 'fixed' && (!form.discount_amount || Number(form.discount_amount) <= 0)) {
      newErrors.discount_amount = 'Jumlah diskon wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      discount_percent: form.type === 'percentage' ? Number(form.discount_percent) : 0,
      discount_amount:  form.type === 'fixed' ? Number(form.discount_amount) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    try {
      await adminAPI.updatePromoCode(id, payload);
      addToast({ title: 'Success', description: 'Promo code berhasil diperbarui', variant: 'success' });
      fetchPromo();
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memperbarui promo', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialog(d => ({ ...d, loading: true }));
    try {
      await adminAPI.deletePromoCode(id);
      addToast({ title: 'Deleted', description: 'Promo code berhasil dihapus', variant: 'success' });
      navigate('/admin/promos');
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus promo', variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, loading: false });
    }
  };

  const handleToggleStatus = async () => {
    try {
      await adminAPI.togglePromoStatus(id);
      addToast({ title: 'Success', description: 'Status promo diperbarui', variant: 'success' });
      fetchPromo();
    } catch {
      addToast({ title: 'Error', description: 'Gagal mengubah status', variant: 'error' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/promos">Promos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{promo.code}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight uppercase">{promo.code}</h2>
            <Badge variant={promo.is_active ? 'success' : 'secondary'}>
              {promo.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/promos')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialog({ open: true, loading: false })}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Stats/Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase opacity-70">Overall Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-black">{promo.used_count || 0}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70">Limit:</span>
                <span className="font-bold">{promo.max_uses || '∞'}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full transition-all" 
                  style={{ width: promo.max_uses ? `${(promo.used_count / promo.max_uses) * 100}%` : '10%' }}
                />
              </div>
              <p className="text-[10px] italic opacity-60 text-center">
                {promo.max_uses ? `${promo.max_uses - promo.used_count} uses remaining` : 'Unlimited uses available'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Promo Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Value</p>
                <p className="text-sm font-bold text-green-600">
                  {promo.type === 'percentage' ? `${promo.discount_percent}% OFF` : `Rp ${Number(promo.discount_amount).toLocaleString()} OFF`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Expires At</p>
                <p className="text-sm font-medium">{promo.expires_at ? formatDate(promo.expires_at) : 'Never'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Created</p>
                <p className="text-sm font-medium">{formatDate(promo.created_at)}</p>
              </div>
              <Separator />
              <Button 
                variant="ghost" 
                className="w-full justify-between text-xs" 
                onClick={handleToggleStatus}
              >
                <span>Status: {promo.is_active ? 'Active' : 'Inactive'}</span>
                {promo.is_active ? <ToggleRight className="text-green-500" /> : <ToggleLeft className="text-muted-foreground" />}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="edit" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto h-12">
              <TabsTrigger value="edit" className="flex items-center gap-2 px-6">
                <Save className="h-4 w-4" /> Edit Campaign
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 px-6">
                <History className="h-4 w-4" /> Usage History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="m-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Campaign Settings
                    </CardTitle>
                    <CardDescription>Modify the code, description and discount rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Promo Code" required error={errors.code}>
                        <Input 
                          value={form.code} 
                          onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                        />
                      </FormField>
                      
                      <FormField label="Discount Type" required>
                        <select 
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={form.type} 
                          onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (Rp)</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Description" required error={errors.description}>
                      <Textarea 
                        value={form.description} 
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
                        rows={3} 
                      />
                    </FormField>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {form.type === 'percentage' ? (
                        <FormField label="Discount %" required error={errors.discount_percent}>
                          <Input type="number" value={form.discount_percent} onChange={(e) => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
                        </FormField>
                      ) : (
                        <FormField label="Amount (Rp)" required error={errors.discount_amount}>
                          <Input type="number" value={form.discount_amount} onChange={(e) => setForm(f => ({ ...f, discount_amount: e.target.value }))} />
                        </FormField>
                      )}
                      
                      <FormField label="Usage Limit">
                        <Input type="number" value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="∞" />
                      </FormField>

                      <FormField label="Expiration">
                        <Input type="date" value={form.expires_at} onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                      </FormField>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Recent Redemptions
                    </span>
                    <Badge variant="outline">{usageHistory.length} total uses</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {usageLoading ? (
                    <div className="flex items-center justify-center py-20"><Spinner /></div>
                  ) : usageHistory.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">No usage recorded yet.</div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usageHistory.map((usage) => (
                          <TableRow key={usage.id}>
                            <TableCell>
                              <div className="font-bold">{usage.user?.full_name || 'Guest User'}</div>
                              <div className="text-[10px] text-muted-foreground">{usage.user?.email || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">#{usage.order_id}</TableCell>
                            <TableCell className="text-green-600 font-bold">Rp {usage.discount_amount?.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{formatDateTime(usage.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, loading: false })}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        title="Delete Promo Campaign"
        description={`Are you sure you want to delete ${promo.code}? This action cannot be undone and will prevent any future usage of this code.`}
        confirmText="Yes, Delete Campaign"
      />
    </div>
  );
};

export default PromoDetails;
