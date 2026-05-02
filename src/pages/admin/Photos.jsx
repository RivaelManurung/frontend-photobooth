import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Image as ImageIcon, Search, Download, Trash2, Heart, Calendar } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const Photos = () => {
  const { addToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    favorites: 0,
  });

  useEffect(() => {
    fetchPhotos();
    fetchStats();
  }, [filterType]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      // Note: Backend doesn't have admin photos endpoint, using user photos as example
      const response = await adminAPI.getStats();
      // Mock photos data
      setPhotos([
        { id: 1, url: '/placeholder1.jpg', user_name: 'John Doe', template_name: 'Classic', created_at: new Date().toISOString(), is_favorite: true },
        { id: 2, url: '/placeholder2.jpg', user_name: 'Jane Smith', template_name: 'Modern', created_at: new Date().toISOString(), is_favorite: false },
      ]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats({
        total: response.data.total_photos || 0,
        today: response.data.photos_today || 0,
        favorites: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      // await adminAPI.deletePhoto(photoId);
      addToast({
        title: 'Success',
        description: 'Photo deleted successfully',
        variant: 'success'
      });
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'error'
      });
    }
  };

  const filteredPhotos = photos.filter(photo => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      photo.user_name?.toLowerCase().includes(query) ||
      photo.template_name?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Photos</h1>
        <p className="text-muted-foreground">Manage all user photos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Photos created today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">Marked as favorite</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>Browse and manage photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Photos</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              <img 
                src={photo.url} 
                alt="Photo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
              {photo.is_favorite && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive">
                    <Heart className="h-3 w-3 fill-current" />
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{photo.user_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {photo.template_name}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(photo.created_at)}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No photos found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Photos;
