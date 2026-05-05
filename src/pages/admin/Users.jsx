import { useEffect, useState, useCallback } from 'react';
import {
  Users as UsersIcon, Search, Download, Filter, MoreVertical, UserCheck, UserX, Trash2, 
  CheckSquare, Square, Columns2, Info, Mail, Shield, Calendar, Activity, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Checkbox from '../../components/ui/Checkbox';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  PageHeader, Pagination, SearchBar, EmptyState, Spinner, Separator
} from '../../components/ui/index.jsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const Users = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    user: true,
    email: true,
    role: true,
    subscription: true,
    status: true,
    joined: true,
  });

  // Drawer for user details
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ open: false, loading: false });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
      };
      
      if (activeTab !== 'all') params.role = activeTab;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users || []);
      setTotalPages(response.data.total_pages || 1);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({ title: 'Error', description: 'Gagal memuat daftar pengguna', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, filterStatus]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, { status: newStatus });
      addToast({ title: 'Success', description: 'User status updated successfully', variant: 'success' });
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser(p => ({ ...p, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      addToast({ title: 'Error', description: 'Failed to update user status', variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await adminAPI.deleteUser(userToDelete.id);
      addToast({ title: 'Success', description: 'User deleted successfully', variant: 'success' });
      fetchUsers();
      if (selectedUser?.id === userToDelete.id) setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({ title: 'Error', description: 'Failed to delete user', variant: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await Promise.all(selectedIds.map(id => adminAPI.deleteUser(id)));
      addToast({ title: 'Success', description: `${selectedIds.length} pengguna berhasil dihapus`, variant: 'success' });
      setSelectedIds([]);
      fetchUsers();
    } catch {
      addToast({ title: 'Error', description: 'Gagal menghapus beberapa pengguna', variant: 'error' });
    } finally {
      setBulkDeleteDialog({ open: false, loading: false });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportUsers = async () => {
    try {
      const response = await adminAPI.exportUsers();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast({ title: 'Success', description: 'Users exported successfully', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Error', description: 'Failed to export users', variant: 'error' });
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="user">Customers</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Terpilih ({selectedIds.length})
              </Button>
            )}
            <Button onClick={handleExportUsers} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
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
                  placeholder="Search by name or email..." 
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <div className="w-40">
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none"
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your filters or search query." />
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onClick={toggleSelectAll} />
                        </TableHead>
                        {columnVisibility.user && <TableHead>User</TableHead>}
                        {columnVisibility.email && <TableHead>Email</TableHead>}
                        {columnVisibility.role && <TableHead>Role</TableHead>}
                        {columnVisibility.subscription && <TableHead>Subscription</TableHead>}
                        {columnVisibility.status && <TableHead>Status</TableHead>}
                        {columnVisibility.joined && <TableHead>Joined</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className={cn(selectedIds.includes(user.id) && "bg-muted/30")}>
                          <TableCell><Checkbox checked={selectedIds.includes(user.id)} onClick={() => toggleSelect(user.id)} /></TableCell>
                          {columnVisibility.user && (
                            <TableCell>
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                    {user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="max-w-[150px]">
                                  <div className="font-medium text-sm truncate">{user.name}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono truncate">ID: {user.id}</div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {columnVisibility.email && <TableCell className="text-sm">{user.email}</TableCell>}
                          {columnVisibility.role && (
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                                {user.role}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.subscription && (
                            <TableCell>
                              <Badge variant={user.subscription_tier === 'premium' ? 'warning' : 'outline'} className="text-[10px]">
                                {user.subscription_tier || 'free'}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.status && (
                            <TableCell>
                              <Badge 
                                variant={
                                  user.status === 'active' ? 'success' :
                                  user.status === 'suspended' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-[10px]"
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          )}
                          {columnVisibility.joined && <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.created_at)}</TableCell>}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(user)}><Info className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
                  {selectedIds.length} of {filteredUsers.length} selected
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── User Detail Drawer ── */}
      <Drawer isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DrawerHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary text-xl">
                {selectedUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle>{selectedUser?.name}</DrawerTitle>
              <DrawerDescription>{selectedUser?.email}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <Shield className="h-3 w-3 mr-1.5" /> Role
              </div>
              <p className="text-sm font-medium capitalize">{selectedUser?.role}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
              <div className="flex items-center text-[10px] uppercase font-bold text-muted-foreground">
                <Activity className="h-3 w-3 mr-1.5" /> Status
              </div>
              <Badge 
                variant={selectedUser?.status === 'active' ? 'success' : 'destructive'} 
                className="text-[10px] h-5"
              >
                {selectedUser?.status}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" /> Email
              </div>
              <span className="font-medium">{selectedUser?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" /> Joined Date
              </div>
              <span className="font-medium">{formatDateTime(selectedUser?.created_at)}</span>
            </div>
          </div>

          <Separator />

          <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              User Insights
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pengguna ini telah melakukan 5 sesi foto dalam 30 hari terakhir. Total transaksi mencapai Rp 250.000 dengan metode pembayaran QRIS.
            </p>
          </div>
        </DrawerContent>

        <DrawerFooter>
          {selectedUser?.status === 'active' ? (
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
            >
              <UserX className="h-4 w-4 mr-2" /> Suspend
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
            >
              <UserCheck className="h-4 w-4 mr-2" /> Activate
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={() => { setUserToDelete(selectedUser); setDeleteDialogOpen(true); }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}"? Seluruh data terkait pengguna ini akan dihapus permanen.`}
      />

      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Hapus Terpilih"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} pengguna yang dipilih? Seluruh data terkait mereka akan dihapus permanen.`}
        confirmText="Hapus Semua"
      />
    </div>
  );
};

export default Users;


