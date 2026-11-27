import { toast } from 'react-toastify';

// Partage natif (téléphone) ou copie du lien (ordinateur)
export async function shareContent({ title, text, path }) {
  const url = `${window.location.origin}${path || ''}`;
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); } catch (e) { /* annulé par l'utilisateur */ }
    return;
  }
  try { await navigator.clipboard.writeText(`${text ? text + ' ' : ''}${url}`); toast.info('Lien copié !'); }
  catch (e) { toast.error('Copie impossible'); }
}

// ---------- Partage d'un média (image / vidéo) avec filigrane « Église Connect » ----------
const BRAND = 'Église Connect';
const SITE = 'eglise-connect.com';

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image(); img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img); img.onerror = reject; img.src = src;
});

// Image : filigrane dessiné sur un canvas (logo + nom, en bas à droite, comme TikTok)
async function watermarkImage(url) {
  const [img, logo] = await Promise.all([loadImage(url), loadImage('/logo192.png').catch(() => null)]);
  const max = 1600; const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
  const u = Math.max(w, h) / 1000;            // unité proportionnelle à la taille de l'image
  const fs = Math.max(16, 34 * u), pad = 16 * u, ls = fs * 1.5;
  g.font = `bold ${fs}px Arial, sans-serif`;
  const tw = Math.max(g.measureText(BRAND).width, 0);
  g.font = `${fs * 0.62}px Arial, sans-serif`;
  const sw = g.measureText(SITE).width;
  const boxW = pad * 3 + (logo ? ls : 0) + Math.max(tw, sw), boxH = ls + pad * 1.4;
  const x = w - boxW - 18 * u, y = h - boxH - 18 * u;
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.beginPath(); g.roundRect ? g.roundRect(x, y, boxW, boxH, boxH / 2) : g.rect(x, y, boxW, boxH); g.fill();
  let tx = x + pad * 1.2;
  if (logo) { g.save(); g.beginPath(); g.arc(tx + ls / 2, y + boxH / 2, ls / 2, 0, Math.PI * 2); g.clip(); g.fillStyle = '#fff'; g.fillRect(tx, y + boxH / 2 - ls / 2, ls, ls); g.drawImage(logo, tx, y + boxH / 2 - ls / 2, ls, ls); g.restore(); tx += ls + pad * 0.8; }
  g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
  g.font = `bold ${fs}px Arial, sans-serif`; g.fillText(BRAND, tx, y + boxH / 2 - fs * 0.05);
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = `${fs * 0.62}px Arial, sans-serif`; g.fillText(SITE, tx, y + boxH / 2 + fs * 0.62);
  return new Promise((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('canvas')), 'image/jpeg', 0.92));
}

// Vidéo : filigrane ajouté par Cloudinary (texte incrusté en bas à droite)
function watermarkedVideoUrl(url) {
  if (!/\/upload\//.test(url) || !/res\.cloudinary\.com/.test(url)) return null;
  const overlay = `l_text:Arial_38_bold:${encodeURIComponent(BRAND)},co_white,o_85,g_south_east,x_30,y_40/l_text:Arial_24:${SITE},co_white,o_75,g_south_east,x_30,y_14`;
  return url.replace('/upload/', `/upload/${overlay}/`);
}

async function fetchBlob(url, retries = 0) {
  for (let i = 0; i <= retries; i++) {
    const r = await fetch(url);
    if (r.ok) return r.blob();
    if (r.status !== 423 || i === retries) throw new Error(`HTTP ${r.status}`);
    await new Promise(res => setTimeout(res, 4000)); // Cloudinary prépare la vidéo
  }
}

// Prépare le fichier à partager. Renvoie { file } ou null (audio/document/échec -> partage du lien).
export async function prepareMediaFile(media) {
  try {
    const safe = String(media.title || 'media').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '_').slice(0, 40);
    if (media.fileType === 'image') {
      const blob = await watermarkImage(media.fileUrl);
      return { file: new File([blob], `${safe}-eglise-connect.jpg`, { type: 'image/jpeg' }) };
    }
    if (media.fileType === 'video') {
      const wm = watermarkedVideoUrl(media.fileUrl);
      if (!wm) return null;
      const blob = await fetchBlob(wm, 8);
      return { file: new File([blob], `${safe}-eglise-connect.mp4`, { type: 'video/mp4' }) };
    }
  } catch (e) { console.error('Préparation du média impossible', e); }
  return null;
}

export function sendPreparedFile({ file, title, text }) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], title, text });
  }
  // Ordinateur : on télécharge le fichier avec filigrane
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  return Promise.resolve('downloaded');
}
