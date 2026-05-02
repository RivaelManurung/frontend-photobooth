import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { FileText, Plus, Edit, Trash2, Eye, TrendingUp, Copy, Power } from 'lucide-react';
import { adminAPI, templatesAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Templates = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTemplates();
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await adminAPI.deleteTemplate(templateId);
      addToast({
        title: 'Success',
        description: 'Template deleted successfully',
        variant: 'success'
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'error'
      });
    }
  };

  const handleToggleStatus = async (templateId) => {
    try {
      await adminAPI.toggleTemplateStatus(templateId);
      addToast({
        title: 'Success',
        description: 'Template status updated',
        variant: 'success'
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling status:', error);
      addToast({
        title: 'Error',
        description: 'Failed to toggle status',
        variant: 'error'
      });
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await adminAPI.duplicateTemplate(templateId);
      addToast({
        title: 'Success',
        description: 'Template duplicated successfully',
        variant: 'success'
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      addToast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Manage photo booth templates from Canva</p>
        </div>
        <Button onClick={() => navigate('/admin/templates/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.is_premium).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map(t => t.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <div className="aspect-video bg-muted relative">
              <img 
                src={getImageUrl(template.preview_url || template.thumbnail_url)} 
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20"%3E' + template.name + '%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {template.is_premium && (
                  <Badge variant="warning">Premium</Badge>
                )}
                {!template.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {template.is_featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{template.category}</Badge>
                  <span className="text-muted-foreground">
                    {template.photo_count} photos
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Used: {template.usage_count || 0} times</span>
                  <span>{template.width}x{template.height}px</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/templates/edit/${template.id}`)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleStatus(template.id)}
                    title={template.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <Power className={`h-3 w-3 ${template.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDuplicate(template.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button onClick={() => navigate('/admin/templates/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Templates;
