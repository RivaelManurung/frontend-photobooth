import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Palette, ImageIcon, Check, Loader2, Cloud } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { photoAPI } from '../../lib/api';
import '../../styles/ResultPage.css';

// ── Constants ──────────────────────────────────────────────────────────────
const PREVIEW_W = 320; // px width of the preview canvas on screen

const PALETTES = [
  { id:'w', label:'White',    bg:'#ffffff', text:'#2d3436' },
  { id:'b', label:'Charcoal', bg:'#2d3436', text:'#ffffff' },
  { id:'p', label:'Pink',     bg:'#ffb3c1', text:'#5c0020' },
  { id:'m', label:'Mint',     bg:'#b2f5ea', text:'#1a4a3a' },
  { id:'s', label:'Sky',      bg:'#bde0fe', text:'#023e8a' },
  { id:'c', label:'Cream',    bg:'#fff3cd', text:'#7d4e00' },
  { id:'l', label:'Lavender', bg:'#e9d8fd', text:'#44337a' },
  { id:'d', label:'Dark',     bg:'#0d0d0d', text:'#39ff14' },
];

const FILTER_MAP = {
  none:  '',
  bw:    'grayscale(100%)',
  sepia: 'sepia(0.85) contrast(1.15)',
  vivid: 'saturate(1.6) contrast(1.1)',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function parseTpl(t) {
  if (!t) return { id:null, name:'Default', bgColor:'#ffffff', textColor:'#2d3436', bgImage:null, width:1200, height:1800, zones:[], texts:[] };
  let zones=[], texts=[];
  try { zones = typeof t.photo_zones==='string' ? JSON.parse(t.photo_zones) : (t.photo_zones||[]); } catch{}
  try { texts = typeof t.text_elements==='string' ? JSON.parse(t.text_elements) : (t.text_elements||[]); } catch{}
  return {
    id: t.id, name: t.name||'Template',
    bgColor:  t.background_color||'#ffffff',
    textColor:t.text_color||'#2d3436',
    bgImage:  t.background_url||t.preview_url||null,
    width:  t.width||1200, height: t.height||1800,
    zones: Array.isArray(zones)?zones:[], texts: Array.isArray(texts)?texts:[],
  };
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => {                   // retry without crossOrigin
      const i2 = new Image();
      i2.onload = () => res(i2);
      i2.onerror = rej;
      i2.src = src + (src.includes('?') ? '&' : '?') + '_nc=' + Date.now();
    };
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const s  = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  ctx.drawImage(img, (img.width-sw)/2, (img.height-sh)/2, sw, sh, x, y, w, h);
}

// ── Core render function — draws everything onto a <canvas> ──────────────
async function renderToCanvas(canvas, tpl, images, bgColor, bgImage, filter, textColor) {
  const { width, height, zones, texts } = tpl;
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  // 1. Solid background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Template background image
  if (bgImage) {
    try {
      const bg = await loadImg(bgImage);
      ctx.drawImage(bg, 0, 0, width, height);
    } catch(e) { console.warn('BG load fail:', e); }
  }

  const f = FILTER_MAP[filter] || '';

  // 3. Photo zones (exact DB coordinates)
  if (zones.length > 0) {
    for (let i = 0; i < zones.length; i++) {
      const z   = zones[i];
      const src = images[i] ?? images[0];
      if (!src) continue;
      let photo; try { photo = await loadImg(src); } catch { continue; }

      ctx.save();

      // Clip
      const r = z.effects?.rounded || 0;
      ctx.beginPath();
      if (r > 0 && ctx.roundRect) ctx.roundRect(z.x, z.y, z.width, z.height, r);
      else                         ctx.rect(z.x, z.y, z.width, z.height);
      ctx.clip();

      // Filter + draw
      if (f) ctx.filter = f;
      if (z.rotation) {
        const cx = z.x + z.width/2, cy = z.y + z.height/2;
        ctx.translate(cx, cy);
        ctx.rotate(z.rotation * Math.PI / 180);
        ctx.translate(-z.width/2, -z.height/2);
        drawCover(ctx, photo, 0, 0, z.width, z.height);
      } else {
        drawCover(ctx, photo, z.x, z.y, z.width, z.height);
      }
      ctx.filter = 'none';

      // Border
      if (z.border?.width > 0) {
        ctx.strokeStyle = z.border.color || '#fff';
        ctx.lineWidth   = z.border.width;
        ctx.beginPath();
        if (r > 0 && ctx.roundRect) ctx.roundRect(z.x, z.y, z.width, z.height, r);
        else ctx.rect(z.x, z.y, z.width, z.height);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else {
    // Fallback: auto-stack
    const px = width*0.08, pw = width*0.84;
    const ph = (height*0.78) / images.length, gap = (height*0.22)/(images.length+1);
    for (let i = 0; i < images.length; i++) {
      let p; try { p = await loadImg(images[i]); } catch { continue; }
      const y = gap*(i+1) + ph*i;
      if (f) ctx.filter = f;
      drawCover(ctx, p, px, y, pw, ph);
      ctx.filter = 'none';
    }
    ctx.fillStyle = textColor;
    ctx.font      = `900 ${Math.round(width*0.055)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('MEMORIA', width/2, height*0.04);
  }

  // 4. Text elements
  for (const t of texts) {
    ctx.save();
    ctx.font      = `${t.font?.weight||'bold'} ${t.font?.size||40}px ${t.font?.family||'Arial'}`;
    ctx.fillStyle = t.font?.color || textColor;
    ctx.textAlign = t.align || 'center';
    const content = t.content==='{{date}}'
      ? new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
      : t.content;
    ctx.fillText(content, t.x, t.y);
    ctx.restore();
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Result() {
  const navigate = useNavigate();
  const { capturedImages, selectedTemplate, resetFlow } = usePhotobooth();

  const [tpl,      setTpl]      = useState(() => parseTpl(selectedTemplate));
  const [override, setOverride] = useState(null);
  const [filter,   setFilter]   = useState('none');
  const [busy,     setBusy]     = useState(false);   // rendering
  const [saved,    setSaved]    = useState(false);
  const [cloud,    setCloud]    = useState(null);
  const [uploading,setUploading]= useState(false);

  const canvasRef  = useRef(null);
  const renderLock = useRef(false);

  const activeBg    = override?.bg   ?? tpl.bgColor;
  const activeText  = override?.text ?? tpl.textColor;
  const activeBgImg = override       ? null : tpl.bgImage;
  const previewH    = Math.round(tpl.height * (PREVIEW_W / tpl.width));

  useEffect(() => {
    if (selectedTemplate) { setTpl(parseTpl(selectedTemplate)); setOverride(null); }
  }, [selectedTemplate]);

  // Re-render canvas whenever anything visual changes
  const doRender = useCallback(async () => {
    if (!canvasRef.current || !capturedImages?.length || renderLock.current) return;
    renderLock.current = true;
    setBusy(true);
    try {
      await renderToCanvas(canvasRef.current, tpl, capturedImages, activeBg, activeBgImg, filter, activeText);
    } finally {
      setBusy(false);
      renderLock.current = false;
    }
  }, [tpl, capturedImages, activeBg, activeBgImg, filter, activeText]);

  useEffect(() => { doRender(); }, [doRender]);

  if (!capturedImages?.length) {
    return (
      <div className="result-empty">
        <p>Tidak ada foto yang diambil.</p>
        <button className="retake-btn" onClick={()=>navigate('/')}>Kembali</button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    // Ensure latest render is complete
    await doRender();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `memoria-${tpl.name.replace(/\s+/g,'-')}-${Date.now()}.png`;
    a.href = dataUrl; a.click();
    setSaved(true);

    setUploading(true);
    photoAPI.uploadPublicStrip({ image_base64: dataUrl, template_id: tpl.id||0, filter })
      .then(r => setCloud(r.data?.url))
      .catch(e => console.warn('upload:', e))
      .finally(() => setUploading(false));
  };

  return (
    <div className="result-wrapper">
      <div className="editor-layout">

        {/* ── Canvas preview ── */}
        <div className="strip-preview-container">
          <div className="strip-viewport" style={{width:PREVIEW_W, height:previewH, position:'relative'}}>
            {busy && (
              <div className="canvas-loading">
                <Loader2 size={24} className="spin" />
              </div>
            )}
            {/* ONE canvas — CSS width scales it for preview, toDataURL gives full res for download */}
            <canvas
              ref={canvasRef}
              style={{ width: PREVIEW_W, height: previewH, display:'block' }}
            />
          </div>
          <div className="template-name-badge">{tpl.name} · {tpl.width}×{tpl.height}</div>
        </div>

        {/* ── Tools ── */}
        <div className="tools-panel">
          <div className="tools-header">
            <h2>Customize Strip</h2>
            <p>Sesuaikan tampilan akhir fotomu</p>
          </div>

          <div className="tool-section">
            <label>🎨 Warna Background</label>
            {override && (
              <button className="restore-btn" onClick={()=>setOverride(null)}>↩ Kembalikan Template</button>
            )}
            <div className="template-picker">
              {PALETTES.map(c => (
                <button key={c.id} className={`template-dot${override?.id===c.id?' active':''}`}
                  style={{background:c.bg}} onClick={()=>setOverride(c)} title={c.label} />
              ))}
            </div>
          </div>

          <div className="tool-section">
            <label>🖼 Efek Filter</label>
            <div className="filter-options">
              {[['none','Normal'],['bw','B&W'],['sepia','Sepia'],['vivid','Vivid']].map(([id,lbl])=>(
                <button key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{lbl}</button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button className="retake-btn" onClick={()=>{resetFlow();navigate('/');}}>
              <RefreshCw size={18}/> Ulangi Foto
            </button>
            <button className={`download-btn${saved?' saved':''}`} onClick={handleDownload} disabled={busy}>
              {busy     ? <><Loader2 size={18} className="spin"/> Rendering...</>
               : saved  ? <><Check size={18}/> Tersimpan!</>
                        : <><Download size={18}/> Download Strip</>}
            </button>
            {saved && (
              <div className="cloud-status">
                <Cloud size={13}/>
                {uploading ? <span>Menyimpan ke cloud...</span>
                 : cloud   ? <span>✅ Tersimpan di Cloud</span>
                           : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
