import { useEffect, useState, useCallback } from 'react';
import { Camera, Trash2, StopCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { StatCard, PageHeader, Pagination, SearchBar, EmptyState, Spinner } from '../../components/ui/index.jsx';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const STATUS_COLORS = {
  active:    'success',
  paused:    'warning',
  completed: 'default',
  cancelled: 'secondary',
};

const Sessions = () => {
  const { addToast } = useToast();
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Confirm dialogs
  const [endDialog, setEndDialog]     = useState({ open: false, session: null, loading: false });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, session: null, loading: false });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await adminAPI.getAllSessions(params);
      setSessions(res.data?.sessions || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      console.error('fetchSessions:', err);
      addToast({ title: 'Error', description: 'Gagal memuat sessions', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleEndSession = async () => {
    if (!endDialog.session) return;
    setEndDialog((d) => ({ ...d, loading: true }));
    try {
      await adminAPI.endSession(endDialog.session.id);
      addToast({ title: 'Success', description: 'Session berhasil diakhiri', variant: 'success' });
      fetchSessions();
    } catch {
      addToast({ title: 'Error', description: 'Gagal mengakhiri session', variant: 'error' });
    } finally {
      setEndDialog({ open: false, session: null, loading: false });
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteDialog.session) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await adminAPI.deleteSession(deleteDialog.session.id);
      addToast({ title: 'Success', description: 'Session berhasil dihapus', variant: 'success' });
      fetchSessions();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus session', variant: 'error' });
    } finally {
      setDeleteDialog({ open: false, session: null, loading: false });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return String(s.id).includes(q) || String(s.user_id).includes(q);
  });

  // Stats
  const stats = {
    total:     sessions.length,
    active:    sessions.filter((s) => s.status === 'active').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    cancelled: sessions.filter((s) => s.status === 'cancelled').length,
  };

  const durationText = (s) => {
    if (!s.completed_at) return s.status === 'active' ? 'Ongoing' : '-';
    const mins = Math.round((new Date(s.completed_at) - new Date(s.created_at)) / 60000);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        description="Monitor dan kelola semua sesi foto booth"
        action={
          <Button variant="outline" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Sessions"   value={stats.total}     icon={Camera}    iconColor="text-muted-foreground" />
        <StatCard title="Active"           value={stats.active}    icon={Clock}     iconColor="text-green-600" />
        <StatCard title="Completed"        value={stats.completed} icon={Camera}    iconColor="text-blue-600" />
        <StatCard title="Cancelled"        value={stats.cancelled} icon={StopCircle} iconColor="text-red-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari ID session atau user ID..."
              className="flex-1"
            />
            <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sessions ({filteredSessions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <EmptyState icon={Camera} title="Tidak ada session" description="Belum ada sesi foto yang dibuat." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Template ID</TableHead>
                      <TableHead>Layout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-sm">#{session.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{session.user_id ?? '-'}</TableCell>
                        <TableCell className="text-sm">{session.template_id ?? '-'}</TableCell>
                        <TableCell className="text-sm">{session.layout_count ?? '-'} foto</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_COLORS[session.status] ?? 'secondary'}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{durationText(session)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(session.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {session.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Akhiri session"
                                onClick={() => setEndDialog({ open: true, session, loading: false })}
                              >
                                <StopCircle className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Hapus session"
                              onClick={() => setDeleteDialog({ open: true, session, loading: false })}
                            >
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

      {/* End Session Dialog */}
      <ConfirmDialog
        isOpen={endDialog.open}
        onClose={() => setEndDialog({ open: false, session: null, loading: false })}
        onConfirm={handleEndSession}
        isLoading={endDialog.loading}
        variant="default"
        title="Akhiri Session"
        description={`Apakah Anda yakin ingin mengakhiri session #${endDialog.session?.id}? Session akan ditandai sebagai selesai.`}
        confirmText="Akhiri"
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, session: null, loading: false })}
        onConfirm={handleDeleteSession}
        isLoading={deleteDialog.loading}
        title="Hapus Session"
        description={`Apakah Anda yakin ingin menghapus session #${deleteDialog.session?.id}? Data ini tidak dapat dikembalikan.`}
        confirmText="Hapus"
      />
    </div>
  );
};

export default Sessions;
