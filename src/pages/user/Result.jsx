import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Check, Loader2, Cloud, Sliders, Sparkles, Palette } from 'lucide-react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { photoAPI } from '../../lib/api';
import '../../styles/ResultPage.css';

const PREVIEW_W = 300;

const PALETTES = [
  { id:'w',  label:'White',     bg:'#ffffff', text:'#2d3436' },
  { id:'b',  label:'Charcoal',  bg:'#2d3436', text:'#ffffff' },
  { id:'p',  label:'Pink',      bg:'#ffb3c1', text:'#5c0020' },
  { id:'m',  label:'Mint',      bg:'#b2f5ea', text:'#1a4a3a' },
  { id:'s',  label:'Sky',       bg:'#bde0fe', text:'#023e8a' },
  { id:'c',  label:'Cream',     bg:'#fff3cd', text:'#7d4e00' },
  { id:'l',  label:'Lavender',  bg:'#e9d8fd', text:'#44337a' },
  { id:'d',  label:'Dark',      bg:'#0d0d0d', text:'#39ff14' },
  { id:'r',  label:'Rose',      bg:'#ffe4e6', text:'#881337' },
  { id:'g',  label:'Gold',      bg:'#fef3c7', text:'#92400e' },
  { id:'n',  label:'Navy',      bg:'#1e3a5f', text:'#93c5fd' },
  { id:'co', label:'Coral',     bg:'#ffd6c0', text:'#7c2d12' },
];

const FILTERS = [
  { id:'none',      label:'Normal',    emoji:'🌟', css:'' },
  { id:'bw',        label:'B&W',       emoji:'⬛', css:'grayscale(100%)' },
  { id:'sepia',     label:'Sepia',     emoji:'🟤', css:'sepia(0.9) contrast(1.1)' },
  { id:'vivid',     label:'Vivid',     emoji:'🌈', css:'saturate(1.8) contrast(1.15)' },
  { id:'cool',      label:'Cool',      emoji:'🧊', css:'hue-rotate(180deg) saturate(1.2) brightness(1.05)' },
  { id:'warm',      label:'Warm',      emoji:'🔥', css:'sepia(0.3) saturate(1.4) hue-rotate(-10deg)' },
  { id:'fade',      label:'Fade',      emoji:'🌫️', css:'opacity(0.85) brightness(1.15) contrast(0.85) saturate(0.7)' },
  { id:'dramatic',  label:'Dramatic',  emoji:'🎭', css:'contrast(1.5) saturate(0.6) brightness(0.85)' },
  { id:'vintage',   label:'Vintage',   emoji:'📷', css:'sepia(0.6) contrast(0.9) brightness(0.9) saturate(0.8) hue-rotate(-10deg)' },
  { id:'lomo',      label:'Lomo',      emoji:'🔴', css:'saturate(1.8) contrast(1.4) brightness(0.9)' },
  { id:'matte',     label:'Matte',     emoji:'🟦', css:'contrast(0.85) brightness(1.1) saturate(0.9)' },
  { id:'cinema',    label:'Cinema',    emoji:'🎬', css:'contrast(1.2) saturate(0.7) hue-rotate(5deg) brightness(0.9)' },
  { id:'rose',      label:'Rose',      emoji:'🌹', css:'sepia(0.4) hue-rotate(310deg) saturate(1.5) brightness(1.05)' },
  { id:'aqua',      label:'Aqua',      emoji:'🌊', css:'hue-rotate(140deg) saturate(1.3) brightness(1.05)' },
  { id:'purple',    label:'Purple',    emoji:'💜', css:'hue-rotate(270deg) saturate(1.4) brightness(0.95)' },
  { id:'golden',    label:'Golden',    emoji:'✨', css:'sepia(0.7) saturate(1.6) brightness(1.1) hue-rotate(-15deg)' },
  { id:'neon',      label:'Neon',      emoji:'💡', css:'brightness(0.8) contrast(1.6) saturate(2) hue-rotate(30deg)' },
  { id:'noir',      label:'Noir',      emoji:'🌙', css:'grayscale(100%) contrast(1.4) brightness(0.8)' },
  { id:'pastel',    label:'Pastel',    emoji:'🎀', css:'brightness(1.15) saturate(0.6) contrast(0.9)' },
  { id:'pop',       label:'Pop Art',   emoji:'🎨', css:'saturate(2.5) contrast(1.3) brightness(1.05)' },
];

const STICKERS = [
  { id:'none',   label:'None',      emoji:'' },
  { id:'hearts', label:'Hearts',    emoji:'❤️💕❤️' },
  { id:'stars',  label:'Stars',     emoji:'⭐✨⭐' },
  { id:'flower', label:'Flowers',   emoji:'🌸🌺🌸' },
  { id:'fire',   label:'Fire',      emoji:'🔥💥🔥' },
  { id:'rain',   label:'Rainbow',   emoji:'🌈☁️🌈' },
  { id:'cool2',  label:'Cool',      emoji:'😎🕶️😎' },
  { id:'love',   label:'Love',      emoji:'💖💗💖' },
];

const FRAMES = [
  { id:'none',     label:'No Frame'  },
  { id:'white',    label:'White Border' },
  { id:'black',    label:'Black Border' },
  { id:'gold',     label:'Gold Border' },
  { id:'polaroid', label:'Polaroid' },
  { id:'dashed',   label:'Dashed' },
  { id:'double',   label:'Double' },
  { id:'glow',     label:'Glow' },
];

function parseTpl(t) {
  if (!t) return { id:null, name:'Default', bgColor:'#ffffff', textColor:'#2d3436', bgImage:null, width:1200, height:1800, zones:[], texts:[] };
  let zones=[], texts=[];
  try { zones = typeof t.photo_zones==='string' ? JSON.parse(t.photo_zones) : (t.photo_zones||[]); } catch{}
  try { texts = typeof t.text_elements==='string' ? JSON.parse(t.text_elements) : (t.text_elements||[]); } catch{}
  return {
    id:t.id, name:t.name||'Template',
    bgColor:t.background_color||'#ffffff',
    textColor:t.text_color||'#2d3436',
    bgImage:t.background_url||t.preview_url||null,
    width:t.width||1200, height:t.height||1800,
    zones:Array.isArray(zones)?zones:[], texts:Array.isArray(texts)?texts:[],
  };
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    const isData = src.startsWith('data:');
    if (!isData) img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => {
      if (isData) { rej(new Error('data URL load failed')); return; }
      const i2 = new Image();
      i2.onload = () => res(i2);
      i2.onerror = rej;
      i2.src = src;
    };
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const s  = Math.max(w/img.width, h/img.height);
  const sw = w/s, sh = h/s;
  const sx = (img.width-sw)/2, sy = (img.height-sh)/2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function buildFilter(filterId, adj) {
  const base = FILTERS.find(f => f.id === filterId)?.css || '';
  const adjStr = [
    adj.brightness !== 100 ? `brightness(${adj.brightness/100})` : '',
    adj.contrast   !== 100 ? `contrast(${adj.contrast/100})`     : '',
    adj.saturation !== 100 ? `saturate(${adj.saturation/100})`   : '',
    adj.blur       > 0     ? `blur(${adj.blur}px)`               : '',
    adj.sharpen    > 0     ? `contrast(${1 + adj.sharpen*0.02}) brightness(${1 - adj.sharpen*0.005})` : '',
  ].filter(Boolean).join(' ');
  return [base, adjStr].filter(Boolean).join(' ');
}

async function renderToCanvas(canvas, tpl, images, bgColor, bgImage, filterCss, textColor, adj, vignette, frame) {
  const { width:tplW, height:tplH, zones, texts } = tpl;
  const ctx = canvas.getContext('2d');

  let bgEl=null, canvasW=tplW, canvasH=tplH;
  if (bgImage) {
    try {
      bgEl    = await loadImg(bgImage);
      canvasW = bgEl.naturalWidth  || bgEl.width  || tplW;
      canvasH = bgEl.naturalHeight || bgEl.height || tplH;
    } catch(e) { console.warn('BG load failed:', e); }
  }

  const scaleX = canvasW/tplW, scaleY = canvasH/tplH;
  canvas.width=canvasW; canvas.height=canvasH;
  ctx.clearRect(0,0,canvasW,canvasH);
  ctx.fillStyle=bgColor;
  ctx.fillRect(0,0,canvasW,canvasH);
  if (bgEl) ctx.drawImage(bgEl,0,0,canvasW,canvasH);

  const f = filterCss;

  if (zones.length > 0) {
    for (let i=0; i<zones.length; i++) {
      const z=zones[i], src=images[i]??images[0];
      if (!src) continue;
      let photo; try { photo=await loadImg(src); } catch{ continue; }
      const zx=z.x*scaleX, zy=z.y*scaleY, zw=z.width*scaleX, zh=z.height*scaleY;
      const r=(z.effects?.rounded||0)*Math.min(scaleX,scaleY);
      ctx.save();
      ctx.beginPath();
      if (r>0 && ctx.roundRect) ctx.roundRect(zx,zy,zw,zh,r);
      else ctx.rect(zx,zy,zw,zh);
      ctx.clip();
      if (f) ctx.filter=f;
      if (z.rotation) {
        const cx=zx+zw/2, cy=zy+zh/2;
        ctx.translate(cx,cy); ctx.rotate(z.rotation*Math.PI/180); ctx.translate(-zw/2,-zh/2);
        drawCover(ctx,photo,0,0,zw,zh);
      } else { drawCover(ctx,photo,zx,zy,zw,zh); }
      ctx.filter='none';
      if (z.border?.width>0) {
        ctx.strokeStyle=z.border.color||'#fff';
        ctx.lineWidth=(z.border.width)*Math.min(scaleX,scaleY);
        ctx.beginPath();
        if (r>0 && ctx.roundRect) ctx.roundRect(zx,zy,zw,zh,r);
        else ctx.rect(zx,zy,zw,zh);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else {
    const px=canvasW*0.08, pw=canvasW*0.84;
    const ph=(canvasH*0.78)/images.length, gap=(canvasH*0.22)/(images.length+1);
    for (let i=0;i<images.length;i++) {
      let p; try{p=await loadImg(images[i]);}catch{continue;}
      if(f) ctx.filter=f;
      drawCover(ctx,p,px,gap*(i+1)+ph*i,pw,ph);
      ctx.filter='none';
    }
    ctx.fillStyle=textColor;
    ctx.font=`900 ${Math.round(canvasW*0.055)}px Arial`;
    ctx.textAlign='center';
    ctx.fillText('MEMORIA',canvasW/2,canvasH*0.04);
  }

  for (const t of texts) {
    ctx.save();
    ctx.font=`${t.font?.weight||'bold'} ${(t.font?.size||40)*Math.min(scaleX,scaleY)}px ${t.font?.family||'Arial'}`;
    ctx.fillStyle=t.font?.color||textColor;
    ctx.textAlign=t.align||'center';
    const content=t.content==='{{date}}'
      ? new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
      : t.content;
    ctx.fillText(content,t.x*scaleX,t.y*scaleY);
    ctx.restore();
  }

  // Vignette overlay
  if (vignette > 0) {
    const grad = ctx.createRadialGradient(canvasW/2,canvasH/2,canvasH*0.3,canvasW/2,canvasH/2,canvasH*0.85);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${vignette/100})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvasW,canvasH);
  }

  // Frame overlay
  if (frame !== 'none') {
    const fw = Math.round(canvasW * 0.025);
    if (frame === 'white')    { ctx.strokeStyle='#ffffff'; ctx.lineWidth=fw*2; ctx.strokeRect(0,0,canvasW,canvasH); }
    if (frame === 'black')    { ctx.strokeStyle='#000000'; ctx.lineWidth=fw*2; ctx.strokeRect(0,0,canvasW,canvasH); }
    if (frame === 'gold')     { ctx.strokeStyle='#f59e0b'; ctx.lineWidth=fw*2; ctx.strokeRect(0,0,canvasW,canvasH); }
    if (frame === 'polaroid') { ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvasW,fw*4); ctx.fillRect(0,canvasH-fw*10,canvasW,fw*10); ctx.fillRect(0,0,fw*4,canvasH); ctx.fillRect(canvasW-fw*4,0,fw*4,canvasH); }
    if (frame === 'dashed')   { ctx.strokeStyle='#fff'; ctx.lineWidth=fw; ctx.setLineDash([fw*3,fw*2]); ctx.strokeRect(fw*2,fw*2,canvasW-fw*4,canvasH-fw*4); ctx.setLineDash([]); }
    if (frame === 'double')   { ctx.strokeStyle='#fff'; ctx.lineWidth=fw; ctx.strokeRect(fw,fw,canvasW-fw*2,canvasH-fw*2); ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=fw/2; ctx.strokeRect(fw*3,fw*3,canvasW-fw*6,canvasH-fw*6); }
    if (frame === 'glow')     { ctx.shadowColor='rgba(255,255,255,0.9)'; ctx.shadowBlur=fw*3; ctx.strokeStyle='#fff'; ctx.lineWidth=fw; ctx.strokeRect(fw,fw,canvasW-fw*2,canvasH-fw*2); ctx.shadowBlur=0; }
  }

  return { width:canvasW, height:canvasH };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Result() {
  const navigate  = useNavigate();
  const { capturedImages, selectedTemplate, resetFlow } = usePhotobooth();

  const [tpl,       setTpl]       = useState(() => parseTpl(selectedTemplate));
  const [override,  setOverride]  = useState(null);
  const [filterId,  setFilterId]  = useState('none');
  const [sticker,   setSticker]   = useState('none');
  const [frame,     setFrame]     = useState('none');
  const [vignette,  setVignette]  = useState(0);
  const [adj, setAdj] = useState({ brightness:100, contrast:100, saturation:100, blur:0, sharpen:0 });
  const [busy,      setBusy]      = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [cloud,     setCloud]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');
  const [rendered,  setRendered]  = useState({ w:tpl.width, h:tpl.height });

  const canvasRef  = useRef(null);
  const renderLock = useRef(false);

  const activeBg    = override?.bg   ?? tpl.bgColor;
  const activeText  = override?.text ?? tpl.textColor;
  const activeBgImg = override       ? null : tpl.bgImage;
  const filterCss   = buildFilter(filterId, adj);
  const previewH    = Math.round(rendered.h * (PREVIEW_W/rendered.w));

  useEffect(() => {
    if (selectedTemplate) { setTpl(parseTpl(selectedTemplate)); setOverride(null); }
  }, [selectedTemplate]);

  const doRender = useCallback(async () => {
    if (!canvasRef.current || !capturedImages?.length || renderLock.current) return;
    renderLock.current = true;
    setBusy(true);
    try {
      const dims = await renderToCanvas(canvasRef.current, tpl, capturedImages, activeBg, activeBgImg, filterCss, activeText, adj, vignette, frame);
      if (dims) setRendered({ w:dims.width, h:dims.height });
    } finally { setBusy(false); renderLock.current = false; }
  }, [tpl, capturedImages, activeBg, activeBgImg, filterCss, activeText, adj, vignette, frame]);

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
    await doRender();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `memoria-${tpl.name.replace(/\s+/g,'-')}-${Date.now()}.png`;
    a.href = dataUrl; a.click();
    setSaved(true);
    setUploading(true);
    photoAPI.uploadPublicStrip({ image_base64:dataUrl, template_id:tpl.id||0, filter:filterId })
      .then(r => setCloud(r.data?.url))
      .catch(e => console.warn('upload:', e))
      .finally(() => setUploading(false));
  };

  const resetAdj = () => setAdj({ brightness:100, contrast:100, saturation:100, blur:0, sharpen:0 });

  const tabs = [
    { id:'filters',  label:'Filters',  icon:<Sparkles size={15}/> },
    { id:'adjust',   label:'Adjust',   icon:<Sliders size={15}/> },
    { id:'palette',  label:'Palette',  icon:<Palette size={15}/> },
    { id:'stickers', label:'Stickers', icon:'🎀' },
    { id:'frame',    label:'Frame',    icon:'🖼' },
  ];

  return (
    <div className="result-wrapper">
      <div className="editor-layout">

        {/* ── Canvas preview ── */}
        <div className="strip-preview-container">
          <div className="strip-viewport" style={{width:PREVIEW_W, height:previewH, position:'relative'}}>
            {busy && (
              <div className="canvas-loading">
                <Loader2 size={24} className="spin"/>
              </div>
            )}
            <canvas ref={canvasRef} style={{width:PREVIEW_W, height:previewH, display:'block'}}/>
            {/* Sticker overlay (decorative only, not on canvas) */}
            {sticker !== 'none' && (
              <div className="sticker-overlay">
                <span>{STICKERS.find(s=>s.id===sticker)?.emoji}</span>
              </div>
            )}
          </div>
          <div className="template-name-badge">{tpl.name} · {rendered.w}×{rendered.h}</div>
          {/* Filter name pill */}
          <div className="active-filter-pill">
            {FILTERS.find(f=>f.id===filterId)?.emoji} {FILTERS.find(f=>f.id===filterId)?.label}
            {vignette > 0 && <span className="pill-extra">· Vignette</span>}
            {frame !== 'none' && <span className="pill-extra">· {FRAMES.find(f=>f.id===frame)?.label}</span>}
          </div>
        </div>

        {/* ── Tools ── */}
        <div className="tools-panel">
          <div className="tools-header">
            <h2>✨ Customize Strip</h2>
            <p>Sesuaikan tampilan akhir fotomu</p>
          </div>

          {/* Tabs */}
          <div className="tool-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`tool-tab${activeTab===t.id?' active':''}`} onClick={()=>setActiveTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── FILTERS TAB ── */}
          {activeTab === 'filters' && (
            <div className="tab-content">
              <div className="filter-grid">
                {FILTERS.map(f => (
                  <button key={f.id} className={`filter-chip${filterId===f.id?' active':''}`} onClick={()=>setFilterId(f.id)}>
                    <span className="filter-emoji">{f.emoji}</span>
                    <span className="filter-label">{f.label}</span>
                    {filterId===f.id && <span className="filter-check">✓</span>}
                  </button>
                ))}
              </div>

              <div className="tool-section" style={{marginTop:'1.25rem'}}>
                <label className="section-label">
                  <span>🌑 Vignette</span>
                  <span className="adj-val">{vignette}%</span>
                </label>
                <input type="range" min="0" max="90" value={vignette}
                  onChange={e=>setVignette(Number(e.target.value))} className="adj-slider"/>
                <div className="slider-hints"><span>None</span><span>Strong</span></div>
              </div>
            </div>
          )}

          {/* ── ADJUST TAB ── */}
          {activeTab === 'adjust' && (
            <div className="tab-content">
              {[
                { key:'brightness', label:'☀️ Brightness', min:30, max:200, unit:'%' },
                { key:'contrast',   label:'🔆 Contrast',   min:30, max:250, unit:'%' },
                { key:'saturation', label:'🎨 Saturation',  min:0,  max:300, unit:'%' },
                { key:'blur',       label:'💧 Blur',        min:0,  max:10,  unit:'px' },
                { key:'sharpen',    label:'🔪 Sharpen',     min:0,  max:10,  unit:'' },
              ].map(sl => (
                <div className="tool-section" key={sl.key}>
                  <label className="section-label">
                    <span>{sl.label}</span>
                    <span className="adj-val">{adj[sl.key]}{sl.unit}</span>
                  </label>
                  <input type="range" min={sl.min} max={sl.max} value={adj[sl.key]}
                    onChange={e=>setAdj(a=>({...a,[sl.key]:Number(e.target.value)}))}
                    className="adj-slider"/>
                </div>
              ))}
              <button className="reset-adj-btn" onClick={resetAdj}>↩ Reset Semua Adjustment</button>
            </div>
          )}

          {/* ── PALETTE TAB ── */}
          {activeTab === 'palette' && (
            <div className="tab-content">
              {override && (
                <button className="restore-btn" onClick={()=>setOverride(null)}>↩ Kembalikan Template</button>
              )}
              <div className="palette-grid">
                {PALETTES.map(c => (
                  <button key={c.id}
                    className={`palette-swatch${override?.id===c.id?' active':''}`}
                    style={{background:c.bg, color:c.text}}
                    onClick={()=>setOverride(c)}
                    title={c.label}>
                    <span className="swatch-label">{c.label}</span>
                    {override?.id===c.id && <span className="swatch-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STICKERS TAB ── */}
          {activeTab === 'stickers' && (
            <div className="tab-content">
              <p className="tab-desc">Tambahkan stiker dekoratif di atas foto strip kamu!</p>
              <div className="sticker-grid">
                {STICKERS.map(s => (
                  <button key={s.id}
                    className={`sticker-btn${sticker===s.id?' active':''}`}
                    onClick={()=>setSticker(s.id)}>
                    <span className="sticker-emoji">{s.emoji || '🚫'}</span>
                    <span className="sticker-name">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── FRAME TAB ── */}
          {activeTab === 'frame' && (
            <div className="tab-content">
              <p className="tab-desc">Pilih border / bingkai untuk foto strip kamu!</p>
              <div className="frame-grid">
                {FRAMES.map(fr => (
                  <button key={fr.id}
                    className={`frame-btn${frame===fr.id?' active':''}`}
                    onClick={()=>setFrame(fr.id)}>
                    {fr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="action-buttons">
            <button className="retake-btn" onClick={()=>{resetFlow();navigate('/');}}>
              <RefreshCw size={18}/> Ulangi Foto
            </button>
            <button className={`download-btn${saved?' saved':''}`} onClick={handleDownload} disabled={busy}>
              {busy    ? <><Loader2 size={18} className="spin"/> Rendering...</>
               : saved ? <><Check size={18}/> Tersimpan!</>
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
