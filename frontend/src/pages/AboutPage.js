import React from 'react';
import { FaChurch, FaHeart, FaGlobe } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ textAlign:'center', marginBottom:'40px' }}>
        <h1 style={{ fontSize:'2.5rem', color:'var(--primary)', marginBottom:'10px' }}>Notre Vision</h1>
        <p style={{ fontSize:'1.2rem', color:'#666' }}>Connecter les âmes, renforcer la foi, bâtir l'avenir.</p>
      </div>

      <div className="card" style={{ padding:'40px', lineHeight:'1.8', fontSize:'1.05rem' }}>
        <p>
          <strong>Église Connect</strong> est née d'un constat simple : dans un monde de plus en plus numérique, la communauté chrétienne a besoin d'outils modernes pour maintenir le lien fraternel au-delà des murs de l'église.
        </p>
        <p>
          Notre mission n'est pas de remplacer la rencontre physique, mais de l'enrichir. Que ce soit pour partager une requête de prière urgente, organiser une répétition de chorale, ou simplement prendre des nouvelles d'un frère éloigné, Église Connect est le pont qui nous unit.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginTop:'40px' }}>
        <div className="card" style={{ textAlign:'center', padding:'30px' }}>
            <FaChurch style={{ fontSize:'2.5rem', color:'var(--primary)', marginBottom:'15px' }} />
            <h3 style={{ margin:0 }}>Communion</h3>
            <p style={{ fontSize:'0.9em', color:'#666' }}>Un corps uni et solidaire.</p>
        </div>
        <div className="card" style={{ textAlign:'center', padding:'30px' }}>
            <FaHeart style={{ fontSize:'2.5rem', color:'var(--primary)', marginBottom:'15px' }} />
            <h3 style={{ margin:0 }}>Partage</h3>
            <p style={{ fontSize:'0.9em', color:'#666' }}>Porter les fardeaux les uns des autres.</p>
        </div>
        <div className="card" style={{ textAlign:'center', padding:'30px' }}>
            <FaGlobe style={{ fontSize:'2.5rem', color:'var(--primary)', marginBottom:'15px' }} />
            <h3 style={{ margin:0 }}>Impact</h3>
            <p style={{ fontSize:'0.9em', color:'#666' }}>Rayonner dans le monde entier.</p>
        </div>
      </div>
    </div>
  );
}