import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Percent, Tag, Clock, Save, 
  AlertCircle, Info, ChevronRight, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, FormField, Textarea, Switch, Spinner,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
  Separator
} from '../../components/ui';

import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'percentage',
  discount_percent: '',
  discount_amount: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

const PromoCreate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await adminAPI.createPromoCode(payload);
      addToast({ title: 'Success', description: 'Promo code berhasil dibuat', variant: 'success' });
      navigate('/admin/promos');
    } catch (err) {
      addToast({ 
        title: 'Error', 
        description: err.response?.data?.error || 'Gagal membuat promo', 
        variant: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <BreadcrumbPage>Create New Promo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="text-3xl font-black tracking-tight">CREATE CAMPAIGN</h2>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/promos')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Define the code and general description of this promo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Promo Code" required error={errors.code} hint="This is what users will type (e.g. SUMMER25)">
                  <Input 
                    value={form.code} 
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                    placeholder="E.g. SUMMER25" 
                    className="font-mono font-bold"
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
                  placeholder="Describe what this promo is for..." 
                  rows={4} 
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Discount Values & Limits
              </CardTitle>
              <CardDescription>Set the monetary value and usage restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.type === 'percentage' ? (
                  <FormField label="Discount Percentage (%)" required error={errors.discount_percent}>
                    <div className="relative">
                      <Input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={form.discount_percent} 
                        onChange={(e) => setForm(f => ({ ...f, discount_percent: e.target.value }))} 
                        placeholder="10" 
                      />
                      <div className="absolute right-3 top-2 text-muted-foreground">%</div>
                    </div>
                  </FormField>
                ) : (
                  <FormField label="Discount Amount (Rp)" required error={errors.discount_amount}>
                    <div className="relative">
                      <div className="absolute left-3 top-2 text-muted-foreground">Rp</div>
                      <Input 
                        type="number" 
                        min="1" 
                        className="pl-9"
                        value={form.discount_amount} 
                        onChange={(e) => setForm(f => ({ ...f, discount_amount: e.target.value }))} 
                        placeholder="5000" 
                      />
                    </div>
                  </FormField>
                )}

                <FormField label="Total Usage Limit" hint="Leave empty for unlimited usage">
                  <Input 
                    type="number" 
                    min="1" 
                    value={form.max_uses} 
                    onChange={(e) => setForm(f => ({ ...f, max_uses: e.target.value }))} 
                    placeholder="e.g. 100" 
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Expiration Date" hint="When this promo should stop working">
                  <Input 
                    type="date" 
                    value={form.expires_at} 
                    onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} 
                  />
                </FormField>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Campaign Status</span>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 h-10">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wider">Active Immediately</span>
                    </div>
                    <Switch 
                      checked={form.is_active} 
                      onChange={(v) => setForm(f => ({ ...f, is_active: v }))} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-xl font-black">SUMMARY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <p className="text-[10px] uppercase font-bold opacity-70">Calculated Discount</p>
                <p className="text-2xl font-black">
                  {form.type === 'percentage' 
                    ? `${form.discount_percent || 0}% OFF` 
                    : `Rp ${Number(form.discount_amount || 0).toLocaleString()} OFF`}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Code:</span>
                  <span className="font-mono font-bold">{form.code || '----'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Expires:</span>
                  <span className="font-bold">{form.expires_at || 'Never'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Usage:</span>
                  <span className="font-bold">{form.max_uses || 'Unlimited'}</span>
                </div>
              </div>

              <Separator className="bg-white/20" />

              <Button 
                type="submit" 
                className="w-full bg-white text-primary hover:bg-white/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                CREATE PROMO
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border bg-orange-50 border-orange-200 flex gap-3 text-orange-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold uppercase">Important Note</p>
              <p className="leading-relaxed opacity-80">
                Promo codes are unique and case-insensitive. Once created, users can immediately apply them if the status is active and the date is valid.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromoCreate;
