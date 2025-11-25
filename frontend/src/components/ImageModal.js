import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function ImageModal({ src, onClose }) {
  if (!src) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><FaTimes /></button>
      <img src={src} alt="Zoom" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}