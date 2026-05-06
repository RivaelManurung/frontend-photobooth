import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Shield, Calendar, Activity, Trash2, UserCheck, UserX, 
  Clock, MapPin, Phone, CreditCard, Image as ImageIcon, Camera
} from 'lucide-react';
import { 
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Separator, Avatar, AvatarFallback, Spinner, ConfirmDialog,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '../../components/ui';
import { adminAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUser(id);
      setUser(res.data.user);
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat detail pengguna', variant: 'error' });
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminAPI.updateUserStatus(id, { status: newStatus });
      addToast({ title: 'Success', description: 'Status pengguna berhasil diperbarui', variant: 'success' });
      fetchUserDetails();
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memperbarui status', variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await adminAPI.deleteUser(id);
      addToast({ title: 'Success', description: 'Pengguna berhasil dihapus', variant: 'success' });
      navigate('/admin/users');
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal menghapus pengguna', variant: 'error' });
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Details</h2>
            <p className="text-sm text-muted-foreground">Manage user profile and history</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.status === 'active' ? (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('suspended')}>
              <UserX className="h-4 w-4 mr-2" /> Suspend
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('active')}>
              <UserCheck className="h-4 w-4 mr-2" /> Activate
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarFallback className="text-3xl bg-primary/5 text-primary font-bold">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>{user.status}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Email:</span>
                <span className="font-medium truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Joined:</span>
                <span className="font-medium">{formatDateTime(user.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & History */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Photos</p>
                    <p className="text-2xl font-bold">{user.Photos?.length || 0}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Sessions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Camera className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                    <p className="text-2xl font-bold">{user.Orders?.length || 0}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Photos</CardTitle>
              <CardDescription>A collection of photos captured by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.Photos?.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {user.Photos.slice(0, 12).map((photo) => (
                    <Link key={photo.id} to={`/admin/photos/${photo.id}`} className="aspect-[3/4] rounded-lg overflow-hidden border group relative">
                      <img 
                        src={getImageUrl(photo.url || photo.file_path)} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground italic text-sm">
                  No photos found for this user.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete "${user.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UserDetails;
