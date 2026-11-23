import React from 'react';
import Seo from '../components/Seo';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background:'white', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
      <Seo title="Politique de confidentialité" description="Comment Église Connect collecte, utilise et protège vos données personnelles, et comment exercer vos droits." path="/privacy" />
      <h1 style={{ color: 'var(--secondary)', borderBottom:'3px solid var(--primary)', paddingBottom:'10px' }}>Politique de Confidentialité</h1>
      
      <p><strong>Dernière mise à jour :</strong> 23 novembre 2026</p>

      <h3>1. Introduction</h3>
      <p>Bienvenue sur <strong>Église Connect</strong>. La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique vise à vous informer en toute transparence sur les données que nous collectons et l'usage que nous en faisons.</p>

      <h3>2. Données collectées</h3>
      <p>Dans le cadre de l'utilisation de notre application, nous pouvons collecter les informations suivantes :</p>
      <ul>
        <li><strong>Identité :</strong> Nom, Prénom, Photo de profil.</li>
        <li><strong>Contact :</strong> Adresse email, Numéro de téléphone, Ville.</li>
        <li><strong>Contenu :</strong> Vos publications, commentaires, messages et requêtes de prière.</li>
      </ul>

      <h3>3. Utilisation des données</h3>
      <p>Vos données sont utilisées uniquement pour :</p>
      <ul>
        <li>Permettre votre authentification et la gestion de votre profil.</li>
        <li>Faciliter les interactions communautaires (Chat, Commentaires).</li>
        <li>Gérer les événements et les participations.</li>
        <li>Assurer la sécurité de la plateforme.</li>
      </ul>
      <p><strong>Nous ne revendons jamais vos données à des tiers.</strong></p>

      <h3>4. Hébergement, cookies et mesure d'audience</h3>
      <p>Les données sont hébergées sur un serveur sécurisé (communications chiffrées en HTTPS) ; les images sont stockées chez Cloudinary. Nous utilisons le stockage local de votre navigateur pour maintenir votre connexion (nécessaire au service). Avec votre accord uniquement, nous activons une mesure d'audience anonyme (Vercel Analytics, sans cookie publicitaire ni profilage). Vous pouvez refuser ou changer d'avis en effaçant les données du site dans votre navigateur.</p>

      <h3>5. Durée de conservation</h3>
      <p>Vos données sont conservées tant que votre compte est actif, puis supprimées sur demande.</p>

      <h3>6. Vos droits</h3>
      <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de modification et de suppression de vos données. Vous pouvez exercer ce droit directement depuis votre page "Profil" ou en nous contactant.</p>

      <h3>7. Contact</h3>
      <p>Pour toute question relative à cette politique, vous pouvez nous contacter à l'adresse suivante :</p>
      <p style={{ background:'#f9f9f9', padding:'15px', borderLeft:'4px solid var(--primary)', fontWeight:'bold' }}>
        📧 bureauegliseconnect@gmail.com
      </p>
    </div>
  );
}