import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Image as ImageIcon, Edit, Trash2, Power, Copy, 
  BarChart3, RectangleHorizontal, Activity, Info, Calendar, Layout,
  Layers, Palette, Type, Share2
} from 'lucide-react';
import { 
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Separator, Spinner, ConfirmDialog
} from '../../components/ui';
import { adminAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const TemplateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchTemplateDetails();
  }, [id]);

  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTemplate(id);
      setTemplate(res.data.template);
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat detail template', variant: 'error' });
      navigate('/admin/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsToggling(true);
      await adminAPI.toggleTemplateStatus(id);
      addToast({ title: 'Success', description: 'Status template diperbarui', variant: 'success' });
      fetchTemplateDetails();
    } catch {
      addToast({ title: 'Error', description: 'Gagal memperbarui status', variant: 'error' });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      await adminAPI.duplicateTemplate(id);
      addToast({ title: 'Success', description: 'Template berhasil diduplikasi', variant: 'success' });
      navigate('/admin/templates');
    } catch {
      addToast({ title: 'Error', description: 'Gagal menduplikasi template', variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await adminAPI.deleteTemplate(id);
      addToast({ title: 'Success', description: 'Template berhasil dihapus', variant: 'success' });
      navigate('/admin/templates');
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal menghapus template', variant: 'error' });
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/templates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{template.name}</h2>
            <p className="text-sm text-muted-foreground">Template ID: #{template.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/templates/edit/${template.id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Preview */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="aspect-[3/4] relative group bg-muted">
              <img 
                src={getImageUrl(template.preview_url || template.thumbnail_url)} 
                className="w-full h-full object-contain p-4" 
                alt={template.name}
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {template.is_premium && <Badge variant="warning" className="shadow-lg border-none">Premium</Badge>}
                {template.is_featured && <Badge variant="default" className="shadow-lg border-none">Featured</Badge>}
                <Badge variant={template.is_active ? 'success' : 'secondary'} className="shadow-lg border-none uppercase text-[10px]">
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 bg-muted/30">
              <Button 
                variant={template.is_active ? 'outline' : 'default'} 
                className="w-full" 
                onClick={handleToggleStatus}
                isLoading={isToggling}
              >
                <Power className={`h-4 w-4 mr-2 ${template.is_active ? 'text-red-500' : 'text-green-500'}`} />
                {template.is_active ? 'Deactivate Template' : 'Activate Template'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Uses</p>
                  <p className="text-xl font-bold">{template.usage_count || 0}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p>
                  <p className="text-xl font-bold">Rp 0</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] text-blue-700">
                <Activity className="h-4 w-4 shrink-0" />
                Popularity is up 12% this week compared to category average.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Configuration & Meta */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Configuration</CardTitle>
              <CardDescription>Visual and structural properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center"><Layout className="h-4 w-4 mr-2" /> Category</span>
                    <Badge variant="outline" className="capitalize">{template.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center"><Layers className="h-4 w-4 mr-2" /> Photo Slots</span>
                    <span className="font-bold">{template.photo_count} photos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center"><RectangleHorizontal className="h-4 w-4 mr-2" /> Aspect Ratio</span>
                    <span className="font-medium">{(template.width / template.height).toFixed(2)} ({template.width}x{template.height})</span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Palette className="h-4 w-4 mr-2" /> Custom Colors</span>
                    <span className="font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Type className="h-4 w-4 mr-2" /> Custom Text</span>
                    <span className="font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Created</span>
                    <span className="text-muted-foreground">{formatDateTime(template.created_at)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{template.description || 'No description provided for this template.'}"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
              <CardDescription>Overlays and visual assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Layers className="h-8 w-8 opacity-20" />
                <p className="text-xs font-medium">Layer configuration viewer coming soon</p>
              </div>
              
              <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Share2 className="h-4 w-4 text-primary" />
                  Quick Actions
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Test with Camera</Button>
                  <Button variant="outline" size="sm" className="flex-1">Export Config</Button>
                </div>
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
        title="Hapus Template"
        description={`Apakah Anda yakin ingin menghapus template "${template.name}"? Tindakan ini tidak dapat dikembalikan.`}
      />
    </div>
  );
};

export default TemplateDetails;
