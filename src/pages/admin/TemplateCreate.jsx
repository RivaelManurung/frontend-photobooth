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
    console.log('✅ Generated zones:', newZones.length);
    return newZones;
  };

  // Sync zones when photo_count changes
  useEffect(() => {
    console.log('🔄 Photo count changed:', formData.photo_count, 'current zones:', photoZones.length, 'isEditMode:', isEditMode);
    
    // Always regenerate zones when photo_count changes (both create and edit mode)
    if (formData.photo_count > 0) {
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
          background: null, // Will be set if user uploads new one
        });

        // Set background preview from existing URL
        if (template.background_url || template.preview_url) {
          setBackgroundPreview(getImageUrl(template.background_url || template.preview_url));
        }

        // Parse photo zones
        if (template.photo_zones) {
          try {
            const zones = typeof template.photo_zones === 'string' 
              ? JSON.parse(template.photo_zones) 
              : template.photo_zones;
            setPhotoZones(Array.isArray(zones) ? zones : []);
          } catch (e) {
            console.error('Error parsing photo zones:', e);
            setPhotoZones([]);
          }
        }

        // Parse text elements
        if (template.text_elements) {
          try {
            const texts = typeof template.text_elements === 'string'
              ? JSON.parse(template.text_elements)
              : template.text_elements;
            setTextElements(Array.isArray(texts) ? texts : []);
          } catch (e) {
            console.error('Error parsing text elements:', e);
            setTextElements([]);
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
      setFormData({ ...formData, background: file });
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPhotoZone = () => {
    // Simply increase photo count, useEffect will handle zone generation
    const newPhotoCount = Math.min(6, formData.photo_count + 1);
    setFormData({ ...formData, photo_count: newPhotoCount });
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

  // Get container width for draggable zones
  const getContainerWidth = () => {
    if (previewRef.current) {
      return previewRef.current.offsetWidth;
    }
    return 600; // Default fallback
  };

  const removePhotoZone = (index) => {
    // Simply decrease photo count, useEffect will handle zone regeneration
    const newPhotoCount = Math.max(1, formData.photo_count - 1);
    setFormData({ ...formData, photo_count: newPhotoCount });
  };

  const addTextElement = () => {
    const newText = {
      id: `text-${textElements.length + 1}`,
      content: 'Text',
      x: formData.width / 2,
      y: 50,
      font: {
        family: 'Geist',
        size: 48,
        weight: 'bold',
        color: '#000000',
        style: 'normal'
      },
      align: 'center',
      max_width: formData.width - 100
    };
    
    setTextElements([...textElements, newText]);
  };

  const updateTextElement = (index, field, value) => {
    const updated = [...textElements];
    const keys = field.split('.');
    
    if (keys.length === 1) {
      updated[index][field] = value;
    } else if (keys.length === 2) {
      updated[index][keys[0]][keys[1]] = value;
    }
    
    setTextElements(updated);
  };

  const removeTextElement = (index) => {
    setTextElements(textElements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In edit mode, background is optional (only if user wants to change it)
    if (!isEditMode && !formData.background) {
      addToast({
        title: 'Error',
        description: 'Please upload a background image',
        variant: 'error'
      });
      return;
    }

    if (photoZones.length === 0) {
      addToast({
        title: 'Error',
        description: 'Please add at least one photo placeholder',
        variant: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('layout_type', formData.layout_type);
      submitData.append('photo_count', formData.photo_count);
      submitData.append('width', formData.width);
      submitData.append('height', formData.height);
      submitData.append('is_premium', formData.is_premium);
      submitData.append('price', formData.price);
      
      // Only append background if user uploaded a new one
      if (formData.background) {
        submitData.append('background', formData.background);
      }
      
      submitData.append('photo_zones', JSON.stringify(photoZones));
      submitData.append('text_elements', JSON.stringify(textElements));

      if (isEditMode) {
        await adminAPI.updateTemplate(id, submitData);
        addToast({
          title: 'Success',
          description: 'Template updated successfully!',
          variant: 'success'
        });
      } else {
        await adminAPI.createTemplate(submitData);
        addToast({
          title: 'Success',
          description: 'Template created successfully!',
          variant: 'success'
        });
      }
      
      navigate('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      addToast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} template`,
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loadingTemplate ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading template...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/templates')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEditMode ? 'Edit Template' : 'Create Template'}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode ? 'Update your photo booth template' : 'Design a new photo booth template'}
              </p>
            </div>
          </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Template details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Template Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Classic Photo Strip"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="A classic 4-photo strip template..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="vintage">Vintage</option>
                      <option value="fun">Fun</option>
                      <option value="elegant">Elegant</option>
                      <option value="party">Party</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Layout Type *</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.layout_type}
                      onChange={(e) => setFormData({...formData, layout_type: e.target.value})}
                    >
                      <option value="single">Single Photo</option>
                      <option value="strip">Photo Strip</option>
                      <option value="grid">Grid Layout</option>
                      <option value="collage">Collage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Photo Count</label>
                    <Input
                      type="number"
                      value={formData.photo_count}
                      onChange={(e) => setFormData({...formData, photo_count: parseInt(e.target.value) || 1})}
                      min="1"
                      max="6"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Width (px)</label>
                    <Input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({...formData, width: parseInt(e.target.value)})}
                      min="600"
                      max="3000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Height (px)</label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                      min="600"
                      max="3000"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({...formData, is_premium: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Premium Template</span>
                  </label>

                  {formData.is_premium && (
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                        placeholder="Price (Rp)"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Background Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Background Image</CardTitle>
                <CardDescription>Upload design from Canva (PNG/JPG)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      id="background-upload"
                    />
                    <label htmlFor="background-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('background-upload').click()}>
                        Choose File
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isEditMode 
                          ? 'Upload new image to replace current background'
                          : `Recommended: ${formData.width}x${formData.height}px`
                        }
                      </p>
                    </label>
                  </div>

                  {backgroundPreview && (
                    <div className="relative">
                      <img src={backgroundPreview} alt="Preview" className="w-full rounded-lg border" />
                      <Badge className="absolute top-2 right-2">Preview</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Template' : 'Create Template')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/templates')}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Column - Preview & Zones */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Template Preview</CardTitle>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={previewRef}
                  className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
                >
                  {backgroundPreview ? (
                    <div className="relative">
                      <img src={backgroundPreview} alt="Background" className="w-full" />
                      
                      {/* Render draggable photo zones */}
                      {photoZones.map((zone, index) => (
                        <DraggablePhotoZone
                          key={index}
                          zone={zone}
                          index={index}
                          onUpdate={updatePhotoZone}
                          templateWidth={formData.width}
                          templateHeight={formData.height}
                          containerWidth={getContainerWidth()}
                        />
                      ))}

                      {/* Render text elements */}
                      {textElements.map((text, index) => (
                        <div
                          key={text.id}
                          className="absolute text-blue-600 font-bold"
                          style={{
                            left: `${(text.x / formData.width) * 100}%`,
                            top: `${(text.y / formData.height) * 100}%`,
                            fontSize: `${(text.font.size / formData.height) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          {text.content}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-gray-400">
                      <div className="text-center">
                        <Upload className="h-16 w-16 mx-auto mb-4" />
                        <p>Upload background to see preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photo Zones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Photo Placeholders ({photoZones.length}/{formData.photo_count})</CardTitle>
                    <CardDescription>Drag red boxes in preview to position. Use Photo Count field to add/remove zones.</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={addPhotoZone}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Zone
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {photoZones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No photo zones yet. Click "Add Zone" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {photoZones.map((zone, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Photo {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhotoZone(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">X Position</label>
                            <Input
                              type="number"
                              value={zone.x}
                              onChange={(e) => updatePhotoZoneField(index, 'x', e.target.value)}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Y Position</label>
                            <Input
                              type="number"
                              value={zone.y}
                              onChange={(e) => updatePhotoZoneField(index, 'y', e.target.value)}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Width</label>
                            <Input
                              type="number"
                              value={zone.width}
                              onChange={(e) => updatePhotoZoneField(index, 'width', e.target.value)}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Height</label>
                            <Input
                              type="number"
                              value={zone.height}
                              onChange={(e) => updatePhotoZoneField(index, 'height', e.target.value)}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs">Border Width</label>
                            <Input
                              type="number"
                              value={zone.border.width}
                              onChange={(e) => updatePhotoZoneField(index, 'border.width', e.target.value)}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Border Color</label>
                            <input
                              type="color"
                              value={zone.border.color}
                              onChange={(e) => updatePhotoZoneField(index, 'border.color', e.target.value)}
                              className="h-10 w-full rounded-md border"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Rounded</label>
                            <Input
                              type="number"
                              value={zone.effects.rounded}
                              onChange={(e) => updatePhotoZoneField(index, 'effects.rounded', e.target.value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Text Elements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Text Elements</CardTitle>
                    <CardDescription>Add text, dates, or watermarks</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={addTextElement}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {textElements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No text elements yet. Click "Add Text" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {textElements.map((text, index) => (
                      <div key={text.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={text.content}
                            onChange={(e) => updateTextElement(index, 'content', e.target.value)}
                            placeholder="Text content or {{date}}"
                            size="sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTextElement(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">X Position</label>
                            <Input
                              type="number"
                              value={text.x}
                              onChange={(e) => updateTextElement(index, 'x', parseFloat(e.target.value))}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Y Position</label>
                            <Input
                              type="number"
                              value={text.y}
                              onChange={(e) => updateTextElement(index, 'y', parseFloat(e.target.value))}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Font Size</label>
                            <Input
                              type="number"
                              value={text.font.size}
                              onChange={(e) => updateTextElement(index, 'font.size', parseInt(e.target.value))}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs">Color</label>
                            <input
                              type="color"
                              value={text.font.color}
                              onChange={(e) => updateTextElement(index, 'font.color', e.target.value)}
                              className="h-10 w-full rounded-md border"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
