import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { ArrowLeft, Plus, Trash2, Upload, Eye } from 'lucide-react';
import { adminAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DraggablePhotoZone from '../../components/DraggablePhotoZone';

const TemplateCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get template ID for edit mode
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const isEditMode = !!id;
  const initialLoadDone = useRef(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'classic',
    layout_type: 'strip',
    photo_count: 4,
    width: 1200,
    height: 1800,
    is_premium: false,
    price: 0,
    background: null,
  });

  const [photoZones, setPhotoZones] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const previewRef = useRef(null);

  // Generate photo zones based on count
  const generatePhotoZones = (count) => {
    console.log('🔧 Generating zones for count:', count);
    const newZones = [];
    const zoneWidth = Math.floor(formData.width * 0.8);
    const zoneHeight = Math.floor((formData.height / count) * 0.7);
    const marginX = Math.floor(formData.width * 0.1);
    const spacing = Math.floor(formData.height / count);
    
    for (let i = 0; i < count; i++) {
      newZones.push({
        index: i,
        x: marginX,
        y: Math.floor(i * spacing + spacing * 0.15),
        width: zoneWidth,
        height: zoneHeight,
        rotation: 0,
        z_index: i,
        border: {
          width: 5,
          color: '#ffffff',
          style: 'solid'
        },
        effects: {
          shadow: true,
          rounded: 10,
          blur: 0,
          opacity: 1
        }
      });
    }
    return newZones;
  };

  // Sync zones when photo_count changes
  useEffect(() => {
    // 🛑 IMPORTANT: In edit mode, if we just loaded the template, DON'T regenerate zones
    // as it would overwrite the custom positions from the database.
    if (isEditMode && !initialLoadDone.current) {
      console.log('⏳ Skipping zone generation on initial edit load');
      return;
    }

    // Only regenerate if count is actually different from current zones length
    if (formData.photo_count > 0 && formData.photo_count !== photoZones.length) {
      console.log('🔄 Regenerating zones for count:', formData.photo_count);
      const zones = generatePhotoZones(formData.photo_count);
      setPhotoZones(zones);
    }
  }, [formData.photo_count]);

  // Load template data in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const response = await adminAPI.getAllTemplates({ id });
      const template = response.data.templates[0];
      
      if (template) {
        // Set initial load to true so useEffect doesn't overwrite zones
        initialLoadDone.current = true;

        setFormData({
          name: template.name,
          description: template.description || '',
          category: template.category,
          layout_type: template.layout_type,
          photo_count: template.photo_count,
          width: template.width,
          height: template.height,
          is_premium: template.is_premium,
          price: template.price || 0,
          background: null,
        });

        if (template.background_url || template.preview_url) {
          setBackgroundPreview(getImageUrl(template.background_url || template.preview_url));
        }

        if (template.photo_zones) {
          try {
            const zones = typeof template.photo_zones === 'string' 
              ? JSON.parse(template.photo_zones) 
              : template.photo_zones;
            setPhotoZones(Array.isArray(zones) ? zones : []);
          } catch (e) {
            console.error('Error parsing photo zones:', e);
          }
        }

        if (template.text_elements) {
          try {
            const texts = typeof template.text_elements === 'string'
              ? JSON.parse(template.text_elements)
              : template.text_elements;
            setTextElements(Array.isArray(texts) ? texts : []);
          } catch (e) {
            console.error('Error parsing text elements:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'error'
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundPreview(event.target.result);
        
        // Auto-detect dimensions
        const img = new Image();
        img.onload = () => {
          setFormData(prev => ({
            ...prev,
            background: file,
            width: img.width,
            height: img.height
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePhotoZone = (index, updatedZone) => {
    const updated = [...photoZones];
    updated[index] = updatedZone;
    setPhotoZones(updated);
  };

  const updatePhotoZoneField = (index, field, value) => {
    const updated = [...photoZones];
    const keys = field.split('.');
    if (keys.length === 1) {
      updated[index][field] = parseFloat(value) || 0;
    } else if (keys.length === 2) {
      updated[index][keys[0]][keys[1]] = keys[1] === 'color' || keys[1] === 'style' ? value : parseFloat(value) || 0;
    }
    setPhotoZones(updated);
  };

  const getContainerWidth = () => previewRef.current?.offsetWidth || 600;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !formData.background) {
      addToast({ title: 'Error', description: 'Please upload a background image', variant: 'error' });
      return;
    }
    if (photoZones.length === 0) {
      addToast({ title: 'Error', description: 'Please add at least one photo placeholder', variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'background') submitData.append(key, formData[key]);
      });
      if (formData.background) submitData.append('background', formData.background);
      submitData.append('photo_zones', JSON.stringify(photoZones));
      submitData.append('text_elements', JSON.stringify(textElements));

      if (isEditMode) {
        await adminAPI.updateTemplate(id, submitData);
        addToast({ title: 'Success', description: 'Template updated successfully!', variant: 'success' });
      } else {
        await adminAPI.createTemplate(submitData);
        addToast({ title: 'Success', description: 'Template created successfully!', variant: 'success' });
      }
      navigate('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      addToast({ title: 'Error', description: error.response?.data?.error || 'Failed to save template', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loadingTemplate ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/templates')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Template' : 'Create Template'}</h1>
              <p className="text-muted-foreground">{isEditMode ? 'Update your photo booth template' : 'Design a new photo booth template'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template Name *</label>
                      <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category *</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {['classic', 'modern', 'vintage', 'fun', 'elegant', 'party'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Photo Count</label>
                        <Input type="number" value={formData.photo_count} onChange={(e) => setFormData({...formData, photo_count: parseInt(e.target.value) || 1})} min="1" max="6" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Width</label>
                        <Input type="number" value={formData.width} onChange={(e) => setFormData({...formData, width: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Height</label>
                        <Input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Background Image</CardTitle></CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" id="background-upload" />
                      <label htmlFor="background-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('background-upload').click()}>Choose File</Button>
                      </label>
                    </div>
                    {backgroundPreview && <img src={backgroundPreview} alt="Preview" className="w-full mt-4 rounded-lg border" />}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save Template'}</Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/templates')}>Cancel</Button>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Preview & Zones</CardTitle></CardHeader>
                  <CardContent>
                    <div 
                      ref={previewRef} 
                      className="relative border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 mx-auto"
                      style={{ 
                        aspectRatio: `${formData.width} / ${formData.height}`,
                        width: '100%',
                        maxWidth: formData.width > formData.height ? '100%' : `${(formData.width / formData.height) * 80}vh`,
                        maxHeight: '80vh'
                      }}
                    >
                      {backgroundPreview ? (
                        <>
                          <img src={backgroundPreview} alt="Background" className="w-full h-full object-contain" />
                          {photoZones.map((zone, index) => (
                            <DraggablePhotoZone key={index} zone={zone} index={index} onUpdate={updatePhotoZone} templateWidth={formData.width} templateHeight={formData.height} containerWidth={getContainerWidth()} />
                          ))}
                        </>
                      ) : <div className="flex items-center justify-center h-full text-gray-400">Upload background to preview</div>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default TemplateCreate;
