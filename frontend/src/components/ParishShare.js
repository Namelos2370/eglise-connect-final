import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { FaQrcode, FaLink, FaShareAlt, FaDownload } from 'react-icons/fa';

const SITE = 'https://eglise-connect.com';

// Lien d'invitation + QR code d'une paroisse (partage, affichage à la paroisse)
export default function ParishShare({ parish }) {
  const link = `${SITE}/paroisses/${parish.slug}?rejoindre=1`;
  const [qr, setQr] = useState('');

  useEffect(() => {
    QRCode.toDataURL(link, { width: 600, margin: 2, color: { dark: '#2b2b2b', light: '#ffffff' } }).then(setQr).catch(() => {});
  }, [link]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast.success('Lien copié !'); }
    catch (e) { window.prompt('Copiez ce lien :', link); }
  };
  const share = async () => {
    const data = { title: parish.name, text: `Rejoignez ${parish.name} sur Église Connect`, url: link };
    if (navigator.share) { try { await navigator.share(data); } catch (e) {} } else copy();
  };

  // Affiche prête à imprimer : nom + QR + consigne
  const downloadPoster = async () => {
    const W = 1000, H = 1400;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#DFA92E'; g.fillRect(0, 0, W, 40); g.fillRect(0, H - 40, W, 40);
    g.textAlign = 'center'; g.fillStyle = '#2b2b2b';
    g.font = 'bold 64px Arial'; g.fillText('Rejoignez notre paroisse', W / 2, 190);
    g.font = 'bold 54px Arial'; g.fillStyle = '#946B00';
    const words = parish.name.split(' '); let line = '', y = 290;
    words.forEach(w => { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > W - 160) { g.fillText(line, W / 2, y); line = w; y += 66; } else line = t; });
    g.fillText(line, W / 2, y);
    const img = new Image();
    img.onload = () => {
      g.drawImage(img, 150, y + 50, 700, 700);
      g.fillStyle = '#2b2b2b'; g.font = 'bold 48px Arial'; g.fillText('Scannez avec votre téléphone', W / 2, y + 840);
      g.font = '38px Arial'; g.fillStyle = '#555'; g.fillText('Prières · Événements · Annonces', W / 2, y + 905);
      g.font = 'bold 40px Arial'; g.fillStyle = '#946B00'; g.fillText('eglise-connect.com', W / 2, H - 90);
      const a = document.createElement('a'); a.download = `affiche-${parish.slug}.png`; a.href = c.toDataURL('image/png'); a.click();
    };
    img.src = qr;
  };

  return (
    <div className="card" style={{ padding: 20, marginTop: 20, textAlign: 'center' }}>
      <h3 style={{ marginTop: 0 }}><FaQrcode style={{ color: 'var(--primary)' }} /> Inviter à rejoindre la paroisse</h3>
      {qr && <img src={qr} alt={`QR code pour rejoindre ${parish.name}`} width="220" height="220" />}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', wordBreak: 'break-all' }}>{link}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={copy}><FaLink /> Copier le lien</button>
        <button onClick={share}><FaShareAlt /> Partager</button>
        <button className="btn-outline" onClick={downloadPoster} disabled={!qr}><FaDownload /> Affiche à imprimer</button>
      </div>
    </div>
  );
}
