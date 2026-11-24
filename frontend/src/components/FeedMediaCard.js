import { Link } from 'react-router-dom';
import { FaPlayCircle } from 'react-icons/fa';

// Carte « Média » affichée dans le fil (vidéo, audio, image)
export default function FeedMediaCard({ media }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '15px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={media.author?.photo || '/avatar.svg'} alt="Photo de l'auteur" width="45" height="45" style={{ borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <strong>{media.author?.name}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(media.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
        </div>
        <span style={{ background: '#fff8e1', color: '#7A5800', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 'bold' }}><FaPlayCircle /> {media.category || 'Média'}</span>
      </div>
      {media.fileType === 'video' && <video src={media.fileUrl} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 480, background: '#000' }} />}
      {media.fileType === 'audio' && <div style={{ padding: '0 20px 10px' }}><audio src={media.fileUrl} controls preload="metadata" style={{ width: '100%' }} /></div>}
      {media.fileType === 'image' && <img src={media.fileUrl} alt={media.title} style={{ width: '100%' }} />}
      <div style={{ padding: '15px 20px' }}>
        <h3 style={{ margin: '0 0 5px' }}>{media.title}</h3>
        {media.description && <p style={{ margin: 0, color: '#444', whiteSpace: 'pre-wrap' }}>{media.description}</p>}
        <Link to="/sermons" style={{ display: 'inline-block', marginTop: 10, color: 'var(--primary)', fontWeight: 'bold' }}>Voir tous les médias →</Link>
      </div>
    </div>
  );
}
