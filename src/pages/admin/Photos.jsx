import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Image as ImageIcon, Trash2, Heart, Calendar,
  Grid, List, RefreshCw, Download, Eye, X, CheckSquare, Square,
  Columns2, Plus, TrendingUp, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import {
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination, SearchBar, EmptyState, Spinner,
  Separator, Button, Badge, Select, Checkbox, ConfirmDialog,
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui';

import { photoAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const Photos = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [photos, setPhotos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab]     = useState('all');
  const [viewMode, setViewMode]       = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Column visibility for customization
  const [columnVisibility, setColumnVisibility] = useState({
    preview: true,
    id: true,
    user_id: true,
    template: true,
    favorite: true,
    date: true,
  });

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, photo: null, loading: false });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      if (activeTab === 'favorites') params.is_favorite = true;
      const res = await photoAPI.getPhotos(params);
      setPhotos(res.data?.photos || []);
      setTotalPages(res.data?.total_pages || 1);
      setSelectedIds([]);
    } catch (err) {
      console.error('fetchPhotos:', err);
      addToast({ title: 'Error', description: 'Gagal memuat photos', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleDelete = async () => {
    if (!deleteDialog.photo) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await photoAPI.deletePhoto(deleteDialog.photo.id);
      addToast({ title: 'Success', description: 'Foto berhasil dihapus', variant: 'success' });
      fetchPhotos();
      if (detailPhoto?.id === deleteDialog.photo.id) setDetailPhoto(null);
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus foto', variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, photo: null, loading: false });
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => photoAPI.deletePhoto(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} foto berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      fetchPhotos();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa foto', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDownload = async (photo) => {
    try {
      const url = getImageUrl(photo.url || photo.file_path);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${photo.id}.png`;
      a.target = '_blank';
      a.click();
    } catch {
      addToast({ title: 'Error', description: 'Gagal mendownload foto', variant: 'error' });
    }
  };

  const filtered = photos.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return String(p.id).includes(q) || String(p.user_id).includes(q) || p.template_name?.toLowerCase().includes(q);
  });

  const imgSrc = (photo) => {
    if (!photo) return null;
    const raw = photo.url || photo.file_path || photo.thumbnail_url || '';
    return raw ? getImageUrl(raw) : null;
  };

  const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280'%3E%3Crect fill='%23f1f5f9' width='200' height='280'/%3E%3Ctext fill='%2394a3b8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13'%3ENo Image%3C/text%3E%3C/svg%3E`;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">Semua Foto</TabsTrigger>
              <TabsTrigger value="favorites">
                Favorit <Badge variant="secondary" className="ml-2 bg-red-100 text-red-600 border-none px-1.5">{photos.filter(p => p.is_favorite).length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchPhotos} title="Refresh">
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

            <div className="flex rounded-md border bg-card overflow-hidden h-9">
              <button onClick={() => setViewMode('grid')} className={`px-3 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Grid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('list')} className={`px-3 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="mb-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search photos by ID, user, or template..." />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filtered.length === 0 ? (
                <EmptyState icon={ImageIcon} title="Tidak ada foto" description="Data foto tidak ditemukan." />
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filtered.map((photo) => (
                    <div key={photo.id} className={`group relative rounded-xl overflow-hidden border bg-card transition-all hover:shadow-lg ${selectedIds.includes(photo.id) ? 'ring-2 ring-primary' : ''}`}>
                      <div className="aspect-[3/4] overflow-hidden bg-muted">
                        <img
                          src={imgSrc(photo) || placeholder}
                          alt={`Photo #${photo.id}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                          onClick={() => navigate(`/admin/photos/${photo.id}`)}
                        />
                      </div>
                      
                      <div className={`absolute top-2 left-2 z-10 ${selectedIds.includes(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <Checkbox checked={selectedIds.includes(photo.id)} onClick={() => toggleSelect(photo.id)} className="bg-white/90 backdrop-blur" />
                      </div>

                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-primary">#{photo.id}</span>
                          {photo.is_favorite && <Heart className="h-3 w-3 text-red-500 fill-red-500" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">User: {photo.user_id}</p>
                        <div className="mt-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/photos/${photo.id}`)}><Info className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(photo)}><Download className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteDialog({ open: true, photo, loading: false })}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.preview && <TableHead>Preview</TableHead>}
                        {columnVisibility.id && <TableHead>ID</TableHead>}
                        {columnVisibility.user_id && <TableHead>User</TableHead>}
                        {columnVisibility.template && <TableHead>Template</TableHead>}
                        {columnVisibility.favorite && <TableHead>Status</TableHead>}
                        {columnVisibility.date && <TableHead>Tanggal</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((photo) => (
                        <TableRow key={photo.id} className={selectedIds.includes(photo.id) ? 'bg-muted/30' : ''}>
                          <TableCell><Checkbox checked={selectedIds.includes(photo.id)} onClick={() => toggleSelect(photo.id)} /></TableCell>
                          {columnVisibility.preview && (
                            <TableCell>
                              <div className="w-10 h-14 rounded overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/admin/photos/${photo.id}`)}>
                                <img src={imgSrc(photo) || placeholder} alt="" className="w-full h-full object-cover" />
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.id && <TableCell className="font-mono font-medium">#{photo.id}</TableCell>}
                          {columnVisibility.user_id && <TableCell className="text-sm text-muted-foreground">{photo.user_id}</TableCell>}
                          {columnVisibility.template && <TableCell className="text-sm">{photo.template_name || '—'}</TableCell>}
                          {columnVisibility.favorite && (
                            <TableCell>
                              {photo.is_favorite ? <Badge variant="destructive" className="bg-red-50 text-[10px] text-red-600 border-red-100"><Heart className="h-2.5 w-2.5 mr-1 fill-current" />Fav</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                          )}
                          {columnVisibility.date && <TableCell className="text-xs text-muted-foreground">{formatDateTime(photo.created_at)}</TableCell>}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/photos/${photo.id}`)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDialog({ open: true, photo, loading: false })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}


              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedIds.length} of {filtered.length} selected
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {/* ── Dialogs ── */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, photo: null, loading: false })}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        title="Hapus Foto"
        description={`Yakin ingin menghapus foto #${deleteDialog.photo?.id}? Tindakan ini tidak dapat dikembalikan.`}
        confirmText="Hapus"
      />

      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Hapus Terpilih"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} foto yang dipilih? Tindakan ini tidak dapat dikembalikan.`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default Photos;

