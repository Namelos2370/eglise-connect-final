import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© 2025 <strong>Église Connect</strong>. Tous droits réservés.</p>
        <p style={{ fontSize: '0.9em', color: '#888' }}>Fait avec ❤️ pour la gloire de Dieu.</p>
        <div className="footer-links" style={{ display:'flex', justifyContent:'center', gap:'20px', marginTop:'15px', flexWrap:'wrap' }}>
          <Link to="/about" style={{ textDecoration:'none', color:'var(--primary)' }}>À propos</Link>
          <Link to="/privacy" style={{ textDecoration:'none', color:'var(--primary)' }}>Confidentialité</Link>
          <Link to="/contact" style={{ textDecoration:'none', color:'var(--primary)' }}>Contact</Link>
          <Link to="/feedback" style={{ textDecoration:'none', color:'var(--primary)' }}>Donner mon avis</Link> {/* NOUVEAU */}
        </div>
        <p style={{ fontSize:'0.8em', marginTop:'20px', color:'#666' }}>Contact: bureauegliseconnect@gmail.com</p>
      </div>
    </footer>
  );
}