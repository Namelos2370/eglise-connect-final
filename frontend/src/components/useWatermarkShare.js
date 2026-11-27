import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaShareAlt } from 'react-icons/fa';
import { prepareMediaFile, sendPreparedFile } from '../utils/share';

// Partage d'une publication : si elle a une image, on envoie l'image avec le filigrane Église Connect ;
// sinon (ou si la préparation échoue) on partage le texte/lien via `fallback`.
export default function useWatermarkShare() {
  const [ready, setReady] = useState(null);
  const [busy, setBusy] = useState(false);

  const share = async ({ imageUrl, title, text, fallback }) => {
    if (!imageUrl) return fallback();
    if (busy) return;
    setBusy(true);
    const tid = toast.loading('Préparation de l’image…');
    const prep = await prepareMediaFile({ fileType: 'image', fileUrl: imageUrl, title });
    toast.dismiss(tid); setBusy(false);
    if (!prep) return fallback();
    const payload = { file: prep.file, title, text: `${text} · eglise-connect.com` };
    try { const r = await sendPreparedFile(payload); if (r === 'downloaded') toast.success('Image téléchargée avec le filigrane'); }
    catch (e) { if (!e || e.name !== 'AbortError') setReady(payload); }
  };

  const sheet = ready ? (
    <div onClick={() => setReady(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 4000, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', padding: 22, textAlign: 'center' }}>
        <strong>Prêt à partager ✅</strong>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Votre image porte le filigrane Église Connect.</p>
        <button style={{ width: '100%' }} onClick={() => { const r = ready; setReady(null); sendPreparedFile(r).catch(() => {}); }}><FaShareAlt /> Envoyer</button>
      </div>
    </div>
  ) : null;

  return { share, sheet };
}
