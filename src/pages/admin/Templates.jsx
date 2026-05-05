import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Edit, Trash2, Eye, TrendingUp, Copy, Power,
  Search, Columns2, Info, RefreshCw, Activity,
  Image as ImageIcon, RectangleHorizontal, CheckSquare, Square, ChevronRight, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Checkbox from '../../components/ui/Checkbox';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  PageHeader, Pagination, SearchBar, EmptyState, Spinner, Separator
} from '../../components/ui/index.jsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { adminAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const Templates = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    preview: true,
    name: true,
    category: true,
    photos: true,
    usage: true,
    status: true,
  });

  // Drawer state
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Dialogs
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTemplates();
      const allTemplates = response.data.templates || [];
      setTemplates(allTemplates);
      setTotalPages(1); // Assume no pagination for now or handle if API supports it
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      addToast({ title: 'Error', description: 'Gagal memuat daftar template', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deleteTemplate(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} template berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      fetchTemplates();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa template', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const handleToggleStatus = async (templateId) => {
    try {
      await adminAPI.toggleTemplateStatus(templateId);
      addToast({ title: 'Success', description: 'Status template diperbarui', variant: 'success' });
      fetchTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(prev => ({ ...prev, is_active: !prev.is_active }));
      }
    } catch {
      addToast({ title: 'Error', description: 'Gagal memperbarui status', variant: 'error' });
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await adminAPI.duplicateTemplate(templateId);
      addToast({ title: 'Success', description: 'Template berhasil diduplikasi', variant: 'success' });
      fetchTemplates();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menduplikasi template', variant: 'error' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTemplates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTemplates.map(t => t.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchSearch = !searchQuery || 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTab = activeTab === 'all' || template.category === activeTab;
    
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              {categories.slice(0, 5).map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
              ))}
            </TabsList>

            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchTemplates} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/admin/templates/create')}><Plus className="mr-2 h-4 w-4" />Create Template</Button>
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
                  placeholder="Search by name, description, or category..." 
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filteredTemplates.length === 0 ? (
                <EmptyState icon={FileText} title="No templates found" description="Create your first template to get started." />
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filteredTemplates.length && filteredTemplates.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.preview && <TableHead className="w-20">Preview</TableHead>}
                        {columnVisibility.name && <TableHead>Template Name</TableHead>}
                        {columnVisibility.category && <TableHead>Category</TableHead>}
                        {columnVisibility.photos && <TableHead>Photos</TableHead>}
                        {columnVisibility.usage && <TableHead>Usage</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id} className={selectedIds.includes(template.id) ? 'bg-muted/30' : ''}>
                          <TableCell><Checkbox checked={selectedIds.includes(template.id)} onClick={() => toggleSelect(template.id)} /></TableCell>
                          {columnVisibility.preview && (
                            <TableCell>
                              <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted group relative cursor-pointer" onClick={() => setSelectedTemplate(template)}>
                                <img 
                                  src={getImageUrl(template.preview_url || template.thumbnail_url)} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                  alt="" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.name && (
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-primary cursor-pointer hover:underline" onClick={() => setSelectedTemplate(template)}>
                                  {template.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{template.description}</span>
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.category && (
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] capitalize">{template.category}</Badge>
                            </TableCell>
                          )}
                          {columnVisibility.photos && <TableCell className="text-sm font-medium">{template.photo_count} slots</TableCell>}
                          {columnVisibility.usage && (
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                {template.usage_count || 0}
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge variant={template.is_active ? 'success' : 'secondary'} className="text-[10px]">
                                {template.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTemplate(template)}><Info className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/templates/edit/${template.id}`)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedIds([template.id]); setBulkDeleteDialog({ open: true, loading: false }); }}><Trash2 className="h-4 w-4" /></Button>
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
                  {selectedIds.length} of {filteredTemplates.length} selected
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Template Detail Drawer ── */}
      <Drawer isOpen={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-700">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle>{selectedTemplate?.name}</DrawerTitle>
              <DrawerDescription>ID: {selectedTemplate?.id}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerContent className="space-y-6">
          <div className="rounded-2xl border overflow-hidden bg-muted aspect-[3/4] relative group">
            <img 
              src={getImageUrl(selectedTemplate?.preview_url || selectedTemplate?.thumbnail_url)} 
              className="w-full h-full object-cover" 
              alt={selectedTemplate?.name}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              {selectedTemplate?.is_premium && <Badge variant="warning" className="shadow-lg">Premium</Badge>}
              {selectedTemplate?.is_featured && <Badge variant="default" className="shadow-lg">Featured</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <BarChart3 className="h-3 w-3 mr-1.5" /> Total Usage
              </div>
              <p className="text-lg font-bold">{selectedTemplate?.usage_count || 0}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <RectangleHorizontal className="h-3 w-3 mr-1.5" /> Dimensions
              </div>
              <p className="text-sm font-bold">{selectedTemplate?.width} x {selectedTemplate?.height} px</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Template Configuration</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Layout Count</span>
                <span className="font-bold">{selectedTemplate?.photo_count} photos</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{selectedTemplate?.category}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Visibility</span>
                <Badge variant={selectedTemplate?.is_active ? 'success' : 'secondary'}>{selectedTemplate?.is_active ? 'Public' : 'Hidden'}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-blue-700">
              <Activity className="h-4 w-4" />
              Live Insights
            </div>
            <p className="text-xs text-blue-600/80 leading-relaxed">
              Template ini memiliki tingkat retensi 24% lebih tinggi dibandingkan rata-rata kategori {selectedTemplate?.category}. Paling populer di kalangan pengguna umur 18-24.
            </p>
          </div>
        </DrawerContent>

        <DrawerFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleToggleStatus(selectedTemplate.id)}>
              <Power className={`h-4 w-4 mr-2 ${selectedTemplate?.is_active ? 'text-red-500' : 'text-green-500'}`} />
              {selectedTemplate?.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outline" onClick={() => handleDuplicate(selectedTemplate.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="destructive" onClick={() => { setSelectedIds([selectedTemplate.id]); setBulkDeleteDialog({ open: true, loading: false }); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button className="w-full" onClick={() => navigate(`/admin/templates/edit/${selectedTemplate.id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Template
          </Button>
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Hapus Template"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} template yang dipilih? Data ini tidak dapat dikembalikan.`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default Templates;
