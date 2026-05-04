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
    // data: URLs must NOT have crossOrigin set — it breaks loading in canvas
    const isData = src.startsWith('data:');
    if (!isData) img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => {
      if (isData) { rej(new Error('data URL load failed')); return; }
      // Retry external URL without crossOrigin (will taint canvas but still shows)
      const i2 = new Image();
      i2.onload = () => res(i2);
      i2.onerror = rej;
      i2.src = src;
    };
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const s  = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  const sx = (img.width  - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// ── Core render function ─────────────────────────────────────────────────
// Returns {width, height} of the actual canvas rendered
async function renderToCanvas(canvas, tpl, images, bgColor, bgImage, filter, textColor) {
  const { width: tplW, height: tplH, zones, texts } = tpl;
  const ctx = canvas.getContext('2d');
  const f   = FILTER_MAP[filter] || '';

  // Step 1: Load background image and get its NATURAL dimensions
  let bgEl   = null;
  let canvasW = tplW;
  let canvasH = tplH;

  if (bgImage) {
    try {
      bgEl    = await loadImg(bgImage);
      // Use the actual image size — NOT the stored template size
      canvasW = bgEl.naturalWidth  || bgEl.width  || tplW;
      canvasH = bgEl.naturalHeight || bgEl.height || tplH;
      console.log(`🖼 BG image natural size: ${canvasW}×${canvasH} (template stored: ${tplW}×${tplH})`);
    } catch(e) {
      console.warn('BG image load failed:', e);
    }
  }

  // Scale factors: convert zone coords from template space → image space
  const scaleX = canvasW / tplW;
  const scaleY = canvasH / tplH;

  // Setup canvas at natural image size
  canvas.width  = canvasW;
  canvas.height = canvasH;
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Fill background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw background image at 1:1 (no distortion)
  if (bgEl) {
    ctx.drawImage(bgEl, 0, 0, canvasW, canvasH);
  }

  // Draw photo zones (coordinates scaled from template space to image space)
  if (zones.length > 0) {
    for (let i = 0; i < zones.length; i++) {
      const z   = zones[i];
      const src = images[i] ?? images[0];
      if (!src) continue;

      let photo;
      try { photo = await loadImg(src); }
      catch(e) { console.error(`Zone ${i} load failed:`, e); continue; }

      // Scale zone rect to image space
      const zx = z.x     * scaleX;
      const zy = z.y     * scaleY;
      const zw = z.width * scaleX;
      const zh = z.height* scaleY;
      const r  = (z.effects?.rounded || 0) * Math.min(scaleX, scaleY);

      ctx.save();

      // Clip to zone
      ctx.beginPath();
      if (r > 0 && ctx.roundRect) ctx.roundRect(zx, zy, zw, zh, r);
      else ctx.rect(zx, zy, zw, zh);
      ctx.clip();

      if (f) ctx.filter = f;

      if (z.rotation) {
        const cx = zx + zw/2, cy = zy + zh/2;
        ctx.translate(cx, cy);
        ctx.rotate(z.rotation * Math.PI / 180);
        ctx.translate(-zw/2, -zh/2);
        drawCover(ctx, photo, 0, 0, zw, zh);
      } else {
        drawCover(ctx, photo, zx, zy, zw, zh);
      }
      ctx.filter = 'none';

      // Border
      if (z.border?.width > 0) {
        ctx.strokeStyle = z.border.color || '#fff';
        ctx.lineWidth   = (z.border.width) * Math.min(scaleX, scaleY);
        ctx.beginPath();
        if (r > 0 && ctx.roundRect) ctx.roundRect(zx, zy, zw, zh, r);
        else ctx.rect(zx, zy, zw, zh);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else {
    // Fallback: auto-stack
    const px = canvasW*0.08, pw = canvasW*0.84;
    const ph = (canvasH*0.78)/images.length, gap = (canvasH*0.22)/(images.length+1);
    for (let i = 0; i < images.length; i++) {
      let p; try { p = await loadImg(images[i]); } catch { continue; }
      if (f) ctx.filter = f;
      drawCover(ctx, p, px, gap*(i+1)+ph*i, pw, ph);
      ctx.filter = 'none';
    }
    ctx.fillStyle = textColor;
    ctx.font = `900 ${Math.round(canvasW*0.055)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('MEMORIA', canvasW/2, canvasH*0.04);
  }

  // Text elements (scaled to image space)
  for (const t of texts) {
    ctx.save();
    ctx.font      = `${t.font?.weight||'bold'} ${(t.font?.size||40)*Math.min(scaleX,scaleY)}px ${t.font?.family||'Arial'}`;
    ctx.fillStyle = t.font?.color || textColor;
    ctx.textAlign = t.align || 'center';
    const content = t.content==='{{date}}'
      ? new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
      : t.content;
    ctx.fillText(content, t.x * scaleX, t.y * scaleY);
    ctx.restore();
  }

  // Return actual rendered dimensions
  return { width: canvasW, height: canvasH };
}


// ── Component ──────────────────────────────────────────────────────────────
export default function Result() {
  const navigate = useNavigate();
  const { capturedImages, selectedTemplate, resetFlow } = usePhotobooth();

  const [tpl,        setTpl]        = useState(() => parseTpl(selectedTemplate));
  const [override,   setOverride]   = useState(null);
  const [filter,     setFilter]     = useState('none');
  const [busy,       setBusy]       = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [cloud,      setCloud]      = useState(null);
  const [uploading,  setUploading]  = useState(false);
  // Actual rendered dimensions (from bg image natural size)
  const [rendered,   setRendered]   = useState({ w: tpl.width, h: tpl.height });

  const canvasRef  = useRef(null);
  const renderLock = useRef(false);

  const activeBg    = override?.bg   ?? tpl.bgColor;
  const activeText  = override?.text ?? tpl.textColor;
  const activeBgImg = override       ? null : tpl.bgImage;
  // Use rendered dimensions for preview aspect ratio
  const previewH    = Math.round(rendered.h * (PREVIEW_W / rendered.w));

  useEffect(() => {
    if (selectedTemplate) { setTpl(parseTpl(selectedTemplate)); setOverride(null); }
  }, [selectedTemplate]);

  // Re-render canvas whenever anything visual changes
  const doRender = useCallback(async () => {
    if (!canvasRef.current || !capturedImages?.length || renderLock.current) return;
    renderLock.current = true;
    setBusy(true);
    try {
      const dims = await renderToCanvas(canvasRef.current, tpl, capturedImages, activeBg, activeBgImg, filter, activeText);
      if (dims) setRendered({ w: dims.width, h: dims.height });
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
