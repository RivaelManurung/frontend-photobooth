import { useEffect, useState, useCallback } from 'react';
import {
  Image as ImageIcon, Trash2, Heart, Calendar,
  Grid, List, RefreshCw, Download, Eye, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import {
  StatCard, PageHeader, Pagination,
  SearchBar, EmptyState, Spinner
} from '../../components/ui/index.jsx';
import { photoAPI, adminAPI } from '../../lib/api';
import { getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const Photos = () => {
  const { addToast } = useToast();

  const [photos, setPhotos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [stats, setStats]             = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [viewMode, setViewMode]       = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Preview modal
  const [preview, setPreview] = useState(null);

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open: false, photo: null, loading: false });

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      if (filterType === 'favorites') params.is_favorite = true;
      const res = await photoAPI.getPhotos(params);
      setPhotos(res.data?.photos || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error('fetchPhotos:', err);
      addToast({ title: 'Error', description: 'Gagal memuat photos', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data || {});
    } catch (err) {
      console.error('fetchStats:', err);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleDelete = async () => {
    if (!deleteDialog.photo) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await photoAPI.deletePhoto(deleteDialog.photo.id);
      addToast({ title: 'Success', description: 'Foto berhasil dihapus', variant: 'success' });
      fetchPhotos();
      fetchStats();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus foto', variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, photo: null, loading: false });
    }
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
    const raw = photo.url || photo.file_path || photo.thumbnail_url || '';
    return raw ? getImageUrl(raw) : null;
  };

  // ── Placeholder SVG ──────────────────────────────────────────────────────
  const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280'%3E%3Crect fill='%23f1f5f9' width='200' height='280'/%3E%3Ctext fill='%2394a3b8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13'%3ENo Image%3C/text%3E%3C/svg%3E`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photos"
        description="Kelola semua foto yang telah diambil pengguna"
        action={
          <Button variant="outline" onClick={() => { fetchPhotos(); fetchStats(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Photos" value={stats.total_photos ?? 0} icon={ImageIcon} iconColor="text-muted-foreground" />
        <StatCard title="Hari Ini" value={stats.photos_today ?? 0} icon={Calendar} iconColor="text-green-600" trend="Diambil hari ini" />
        <StatCard title="Favorit" value={photos.filter((p) => p.is_favorite).length} icon={Heart} iconColor="text-red-500" />
      </div>

      {/* Filters + view toggle */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari ID foto, user ID..." className="flex-1" />
            <Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="all">Semua Foto</option>
              <option value="favorites">Favorit</option>
            </Select>
            <div className="flex rounded-md border overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Galeri Foto ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-0'}>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Tidak ada foto" description="Belum ada foto yang diambil oleh pengguna." />
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((photo) => (
                  <div key={photo.id} className="group relative rounded-lg overflow-hidden border bg-muted aspect-[3/4]">
                    <img
                      src={imgSrc(photo) || placeholder}
                      alt={`Photo #${photo.id}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => { e.target.src = placeholder; }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end">
                      <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform flex gap-1 justify-end">
                        <button
                          onClick={() => setPreview(photo)}
                          className="rounded-md bg-white/20 backdrop-blur p-1.5 text-white hover:bg-white/40"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(photo)}
                          className="rounded-md bg-white/20 backdrop-blur p-1.5 text-white hover:bg-white/40"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, photo, loading: false })}
                          className="rounded-md bg-red-500/70 backdrop-blur p-1.5 text-white hover:bg-red-600/80"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {photo.is_favorite && (
                      <div className="absolute top-1.5 left-1.5">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">#{photo.id}</p>
                      <p className="text-white/70 text-[10px]">User {photo.user_id}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </>
          ) : (
            // List View
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Favorit</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((photo) => (
                      <TableRow key={photo.id}>
                        <TableCell>
                          <div className="w-10 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={imgSrc(photo) || placeholder}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = placeholder; }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{photo.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{photo.user_id ?? '—'}</TableCell>
                        <TableCell className="text-sm">{photo.template_name ?? photo.template_id ?? '—'}</TableCell>
                        <TableCell>
                          {photo.is_favorite
                            ? <Badge variant="destructive"><Heart className="h-3 w-3 fill-current mr-1" />Favorit</Badge>
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDateTime(photo.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setPreview(photo)} title="Preview"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(photo)} title="Download"><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: true, photo, loading: false })} title="Hapus"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      {/* ── Preview Modal ── */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setPreview(null)}>
            <X className="h-8 w-8" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={imgSrc(preview) || placeholder}
              alt={`Photo #${preview.id}`}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
              onError={(e) => { e.target.src = placeholder; }}
            />
            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/60 px-4 py-2 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Photo #{preview.id}</p>
                <p className="text-white/60 text-xs">{formatDateTime(preview.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={() => handleDownload(preview)}>
                  <Download className="h-4 w-4 mr-1" />Download
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setDeleteDialog({ open: true, photo: preview, loading: false }); setPreview(null); }}>
                  <Trash2 className="h-4 w-4 mr-1" />Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, photo: null, loading: false })}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        title="Hapus Foto"
        description={`Yakin ingin menghapus foto #${deleteDialog.photo?.id}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
      />
    </div>
  );
};

export default Photos;
