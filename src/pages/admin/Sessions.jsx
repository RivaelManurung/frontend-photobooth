import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Clock, Play, CheckCircle, XCircle, Trash2, Search, Filter, 
  Columns2, Info, Calendar, User, Image as ImageIcon,
  CheckSquare, Square, RefreshCw, StopCircle, Camera, Activity
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Button, Badge, Checkbox, ConfirmDialog,
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination, SearchBar, EmptyState, Spinner, Separator, Skeleton,
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui';

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
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    user: true,
    template: true,
    status: true,
    duration: true,
    created: true,
  });

  // Drawer state


  // Dialogs
  const [endDialog, setEndDialog] = useState({ open: false, session: null, loading: false });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 15 };
      if (activeTab !== 'all') params.status = activeTab;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await adminAPI.getAllSessions(params);
      setSessions(response.data.sessions || []);
      setTotalPages(response.data.total_pages || 1);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      addToast({ title: 'Error', description: 'Gagal memuat daftar sesi', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, filterStatus]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleEndSession = async () => {
    if (!endDialog.session) return;
    setEndDialog((d) => ({ ...d, loading: true }));
    try {
      await adminAPI.endSession(endDialog.session.id);
      addToast({ title: 'Success', description: 'Session berhasil diakhiri', variant: 'success' });
      fetchSessions();
      if (selectedSession?.id === endDialog.session.id) {
        setSelectedSession(p => ({ ...p, status: 'completed', ended_at: new Date().toISOString() }));
      }
    } catch {
      addToast({ title: 'Error', description: 'Gagal mengakhiri session', variant: 'error' });
    } finally {
      setEndDialog({ open: false, session: null, loading: false });
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deleteSession(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} sesi berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      fetchSessions();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa sesi', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSessions.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(session.id).includes(query) ||
      String(session.user_id).includes(query) ||
      session.template_id?.toLowerCase().includes(query)
    );
  });

  const durationText = (s) => {
    if (!s) return '—';
    if (!s.ended_at && !s.completed_at) return s.status === 'active' ? 'Ongoing' : '-';
    const end = s.ended_at || s.completed_at;
    const mins = Math.round((new Date(end) - new Date(s.created_at)) / 60000);
    return `${mins} min`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={fetchSessions} title="Refresh">
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
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Search by session ID, user, or template..." 
                  className="flex-1"
                />
              </div>

              {loading ? (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10"><Checkbox disabled /></TableHead>
                        {columnVisibility.id && <TableHead>Session ID</TableHead>}
                        {columnVisibility.user && <TableHead>User</TableHead>}
                        {columnVisibility.template && <TableHead>Template</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        {columnVisibility.duration && <TableHead>Duration</TableHead>}
                        {columnVisibility.created && <TableHead>Started At</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          {columnVisibility.id && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                          {columnVisibility.user && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                          {columnVisibility.template && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                          {columnVisibility.status && <TableCell><Skeleton className="h-5 w-16" /></TableCell>}
                          {columnVisibility.duration && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                          {columnVisibility.created && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : filteredSessions.length === 0 ? (
                <EmptyState icon={Clock} title="No sessions found" description="No session data matches your criteria." />
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                   <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.id && <TableHead>Session ID</TableHead>}
                        {columnVisibility.user && <TableHead>User</TableHead>}
                        {columnVisibility.template && <TableHead>Template</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        {columnVisibility.duration && <TableHead>Duration</TableHead>}
                        {columnVisibility.created && <TableHead>Started At</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id} className={selectedIds.includes(session.id) ? 'bg-muted/30' : ''}>
                          <TableCell><Checkbox checked={selectedIds.includes(session.id)} onClick={() => toggleSelect(session.id)} /></TableCell>
                          {columnVisibility.id && <TableCell className="font-mono text-sm font-bold text-primary">#{session.id}</TableCell>}
                          {columnVisibility.user && (
                            <TableCell className="text-sm cursor-pointer" onClick={() => navigate(`/admin/sessions/${session.id}`)}>
                              User {session.user_id}
                            </TableCell>
                          )}
                          {columnVisibility.template && <TableCell className="text-sm">{session.template_id}</TableCell>}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge variant={STATUS_COLORS[session.status] || 'secondary'} className="text-[10px]">
                                {session.status}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.duration && <TableCell className="text-xs">{durationText(session)}</TableCell>}
                          {columnVisibility.created && <TableCell className="text-xs text-muted-foreground">{formatDateTime(session.created_at)}</TableCell>}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/sessions/${session.id}`)}><Info className="h-4 w-4" /></Button>
                              {session.status === 'active' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => setEndDialog({ open: true, session, loading: false })}
                                >
                                  <StopCircle className="h-4 w-4 text-orange-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedIds([session.id]); setBulkDeleteDialog({ open: true, loading: false }); }}><Trash2 className="h-4 w-4" /></Button>
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
                  {selectedIds.length} of {filteredSessions.length} selected
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      <ConfirmDialog
        isOpen={endDialog.open}
        onClose={() => setEndDialog({ open: false, session: null, loading: false })}
        onConfirm={handleEndSession}
        isLoading={endDialog.loading}
        title="Akhiri Session"
        description={`Apakah Anda yakin ingin mengakhiri session #${endDialog.session?.id}? Session akan ditandai sebagai selesai.`}
        confirmText="Akhiri"
      />

      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Hapus Sesi"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} sesi yang dipilih? Data ini tidak dapat dikembalikan.`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default Sessions;


