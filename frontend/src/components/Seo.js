import { useEffect } from 'react';

const SITE = 'https://eglise-connect.com';
const DEFAULT_DESC = "Église Connect : le réseau chrétien pour prier ensemble, partager des événements, suivre les prédications et rester connecté à votre communauté.";

function setMeta(selector, attr, key, value) {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement(attr === 'link' ? 'link' : 'meta'); el.setAttribute(attr === 'link' ? 'rel' : (key), attr === 'link' ? 'canonical' : selector.match(/"(.+?)"/)[1]); document.head.appendChild(el); }
  el.setAttribute(attr === 'link' ? 'href' : 'content', value);
}

// Met à jour titre, description, canonical et aperçus sociaux pour chaque page.
export default function Seo({ title, description = DEFAULT_DESC, path = '', noindex = false }) {
  useEffect(() => {
    const full = title ? `${title} | Église Connect` : 'Église Connect – La communauté chrétienne en ligne';
    const url = `${SITE}${path}`;
    document.title = full;
    setMeta('meta[name="description"]', 'meta', 'name', description);
    setMeta('meta[property="og:title"]', 'meta', 'property', full);
    setMeta('meta[property="og:description"]', 'meta', 'property', description);
    setMeta('meta[property="og:url"]', 'meta', 'property', url);
    setMeta('meta[name="twitter:title"]', 'meta', 'name', full);
    setMeta('meta[name="twitter:description"]', 'meta', 'name', description);
    setMeta('link[rel="canonical"]', 'link', 'rel', url);
    setMeta('meta[name="robots"]', 'meta', 'name', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noindex]);
  return null;
}
