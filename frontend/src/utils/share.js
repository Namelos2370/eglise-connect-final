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
