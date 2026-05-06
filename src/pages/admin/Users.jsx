import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon, Search, Download, Filter, MoreVertical, UserCheck, UserX, Trash2, 
  CheckSquare, Square, Columns2, Info, Mail, Shield, Calendar, Activity, TrendingUp
} from 'lucide-react';


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Checkbox } from '../../components/ui/Checkbox';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter, DrawerClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination, SearchBar, EmptyState, Spinner, Separator
} from '../../components/ui/index.jsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

const Users = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [columnVisibility, setColumnVisibility] = useState({
    user: true,
    email: true,
    role: true,
    subscription: true,
    status: true,
    joined: true,
  });


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
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialog({ open: true, loading: false })}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleExportUsers} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="user">Customers</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns2 className="h-4 w-4 mr-2" />
                Columns
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

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center gap-4">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Search users..." 
                  className="flex-1"
                />
                <div className="w-48">
                  <select 
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none"
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
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your filters or search query." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onClick={toggleSelectAll} />
                      </TableHead>
                      {columnVisibility.user && <TableHead>User</TableHead>}
                      {columnVisibility.email && <TableHead>Email</TableHead>}
                      {columnVisibility.role && <TableHead>Role</TableHead>}
                      {columnVisibility.subscription && <TableHead>Plan</TableHead>}
                      {columnVisibility.status && <TableHead>Status</TableHead>}
                      {columnVisibility.joined && <TableHead>Joined</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell><Checkbox checked={selectedIds.includes(user.id)} onClick={() => toggleSelect(user.id)} /></TableCell>
                        {columnVisibility.user && (
                          <TableCell>
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/admin/users/${user.id}`)}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                  {user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="max-w-[150px]">
                                <div className="font-medium text-sm truncate">{user.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.email && <TableCell className="text-sm">{user.email}</TableCell>}
                        {columnVisibility.role && (
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                        )}
                        {columnVisibility.subscription && (
                          <TableCell>
                            <Badge variant={user.subscription_tier === 'premium' ? 'warning' : 'outline'}>
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
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                        )}
                        {columnVisibility.joined && <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.created_at)}</TableCell>}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/users/${user.id}`)}><Info className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {selectedIds.length} of {filteredUsers.length} selected
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>



      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={bulkDeleteDialog.open}
        onClose={() => setBulkDeleteDialog({ open: false, loading: false })}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteDialog.loading}
        title="Delete Selected"
        description={`Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`}
        confirmText="Delete All"
      />
    </div>
  );
};

export default Users;



