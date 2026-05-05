import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Upload, Eye, Save, Settings2, 
  Maximize, Info, ChevronRight, Layout, Image as ImageIcon, 
  MousePointer2, Layers, Sliders, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { 
  PageHeader, FormField, Textarea, Spinner, Separator,
  Tabs, TabsList, TabsTrigger, TabsContent
} from '../../components/ui/index.jsx';
import { adminAPI, getImageUrl } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DraggablePhotoZone from '../../components/DraggablePhotoZone';

const TemplateCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const generatePhotoZones = useCallback((count) => {
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
        border: { width: 5, color: '#ffffff', style: 'solid' },
        effects: { shadow: true, rounded: 10, blur: 0, opacity: 1 }
      });
    }
    return newZones;
  }, [formData.width, formData.height]);

  useEffect(() => {
    if (isEditMode && !initialLoadDone.current) return;
    if (formData.photo_count > 0 && formData.photo_count !== photoZones.length) {
      setPhotoZones(generatePhotoZones(formData.photo_count));
    }
  }, [formData.photo_count, generatePhotoZones, isEditMode]);

  useEffect(() => {
    if (isEditMode) loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const response = await adminAPI.getAllTemplates({ id });
      const template = response.data.templates[0];
      
      if (template) {
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
          const zones = typeof template.photo_zones === 'string' ? JSON.parse(template.photo_zones) : template.photo_zones;
          setPhotoZones(Array.isArray(zones) ? zones : []);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      addToast({ title: 'Error', description: 'Failed to load template', variant: 'error' });
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
        const img = new Image();
        img.onload = () => {
          const detectedW = img.naturalWidth;
          const detectedH = img.naturalHeight;
          setFormData(prev => ({ ...prev, background: file, width: detectedW, height: detectedH }));
          if (!isEditMode) {
            setPhotoZones(generatePhotoZones(formData.photo_count));
          }
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

  const getContainerWidth = () => previewRef.current?.offsetWidth || 600;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !formData.background) {
      addToast({ title: 'Validation', description: 'Please upload a background image', variant: 'error' });
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
      addToast({ title: 'Error', description: error.response?.data?.error || 'Failed to save template', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Template' : 'Design Studio'}
        description="Craft unique photo booth layouts and experiences"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/templates')}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? 'Update Design' : 'Publish Template'}
            </Button>
          </div>
        }
      />

      {loadingTemplate ? (
        <div className="flex h-96 items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ── Configuration Panel ── */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField label="Template Identity" required>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Wedding Classic Strip"
                  />
                </FormField>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category">
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {['classic', 'modern', 'vintage', 'fun', 'elegant', 'party'].map(c => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Photo Slots">
                    <Input 
                      type="number" 
                      value={formData.photo_count} 
                      onChange={(e) => setFormData({...formData, photo_count: parseInt(e.target.value) || 1})} 
                      min="1" max="6" 
                    />
                  </FormField>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Canvas Resolution</span>
                    <Badge variant="outline" className="text-[10px]">{formData.width} × {formData.height} px</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" value={formData.width} onChange={(e) => setFormData({...formData, width: parseInt(e.target.value)})} className="h-8 text-xs" />
                    <Input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})} className="h-8 text-xs" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Asset Management</label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center group hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="absolute inset-0 opacity-0 cursor-pointer" id="bg-input" />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-xs font-medium text-slate-500">Upload Background Artwork</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG recommended (High Res)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-orange-500" />
                  Layers & Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto divide-y">
                  {photoZones.map((zone, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-medium">Photo Placeholder {idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">{Math.round(zone.width)}x{Math.round(zone.height)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                  {photoZones.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground space-y-2">
                      <Layout className="h-8 w-8 mx-auto opacity-20" />
                      <p className="text-xs italic">No zones active</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Visual Studio Preview ── */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
              <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Workspace Preview</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><MousePointer2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><Maximize className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-center min-h-[600px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                <div 
                  ref={previewRef} 
                  className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-800 ring-1 ring-white/10"
                  style={{ 
                    aspectRatio: `${formData.width} / ${formData.height}`,
                    width: '100%',
                    maxWidth: formData.width > formData.height ? '100%' : `${(formData.width / formData.height) * 80}vh`,
                    maxHeight: '80vh'
                  }}
                >
                  {backgroundPreview ? (
                    <>
                      <img src={backgroundPreview} alt="Background" className="w-full h-full object-contain pointer-events-none" />
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
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                      <ImageIcon className="h-16 w-16 opacity-10" />
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Empty Canvas</p>
                        <p className="text-[10px] opacity-40 mt-1 italic">Upload artwork to begin composing</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center gap-4">
                <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
                  <MousePointer2 className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Editor Active</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase text-white/50 font-bold">X-Axis</span>
                    <span className="text-[10px] font-mono tracking-tighter">0.00</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase text-white/50 font-bold">Y-Axis</span>
                    <span className="text-[10px] font-mono tracking-tighter">0.00</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border bg-blue-50/30 border-blue-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Info className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Auto-Scale Assist</p>
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    Kami mendeteksi resolusi gambar latar Anda secara otomatis untuk memastikan rasio aspek tetap konsisten saat dicetak.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border bg-orange-50/30 border-orange-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Sliders className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-orange-900 uppercase tracking-widest">Interactive Zones</p>
                  <p className="text-[10px] text-orange-700 leading-relaxed">
                    Tarik dan lepaskan zona foto untuk mengatur posisi. Gunakan slider pada layer untuk fine-tuning posisi dan ukuran.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCreate;
