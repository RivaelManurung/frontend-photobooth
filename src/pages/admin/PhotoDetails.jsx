import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Trash2, Heart, Calendar, User, 
  FileText, Info, Share2, Eye, Layout, ExternalLink
} from 'lucide-react';
import { 
  Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Separator, Avatar, AvatarFallback, Spinner, ConfirmDialog
} from '../../components/ui';
import { photoAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';

const PhotoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPhotoDetails();
  }, [id]);

  const fetchPhotoDetails = async () => {
    try {
      setLoading(true);
      const res = await photoAPI.getPhoto(id);
      setPhoto(res.data.photo);
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal memuat detail foto', variant: 'error' });
      navigate('/admin/photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const url = getImageUrl(photo.url || photo.file_path);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-${photo.id}.png`;
    a.target = '_blank';
    a.click();
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await photoAPI.deletePhoto(id);
      addToast({ title: 'Success', description: 'Foto berhasil dihapus', variant: 'success' });
      navigate('/admin/photos');
    } catch (err) {
      addToast({ title: 'Error', description: 'Gagal menghapus foto', variant: 'error' });
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

  const imageUrl = getImageUrl(photo.url || photo.file_path);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/photos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Photo Details</h2>
            <p className="text-sm text-muted-foreground">Asset ID: #{photo.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Preview Section */}
        <Card className="lg:col-span-3 overflow-hidden bg-muted/30">
          <CardContent className="p-0 flex items-center justify-center min-h-[500px]">
            <div className="relative group max-w-md w-full p-6">
              <img 
                src={imageUrl} 
                alt={`Photo #${photo.id}`} 
                className="w-full h-auto rounded-lg shadow-2xl border bg-white"
              />
              <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10" onClick={() => window.open(imageUrl, '_blank')}>
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status</p>
                  <Badge variant={photo.is_favorite ? 'destructive' : 'secondary'} className="h-6">
                    {photo.is_favorite ? <Heart className="h-3 w-3 mr-1.5 fill-current" /> : null}
                    {photo.is_favorite ? 'Favorite' : 'Normal'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">ID</p>
                  <p className="text-sm font-mono font-medium">#{photo.id}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" /> User
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 font-medium" onClick={() => navigate(`/admin/users/${photo.user_id}`)}>
                    User #{photo.user_id}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Layout className="h-4 w-4 mr-2" /> Template
                  </div>
                  <span className="font-medium">{photo.template_name || 'Standard'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" /> Captured
                  </div>
                  <span className="font-medium text-xs">{formatDateTime(photo.created_at)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Storage Path</p>
                <code className="block p-2 rounded bg-muted text-[10px] break-all border">
                  {photo.url || photo.file_path}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full justify-start text-xs h-9" onClick={() => {
                navigator.clipboard.writeText(imageUrl);
                addToast({ title: 'Copied', description: 'Image link copied to clipboard' });
              }}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" /> Copy Link
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <Share2 className="h-3.5 w-3.5 mr-2" /> Share
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Photo"
        description="Are you sure you want to delete this photo? This will remove the asset from storage and cannot be undone."
      />
    </div>
  );
};

export default PhotoDetails;
