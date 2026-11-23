import Seo from '../components/Seo';

const box = { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', lineHeight: 1.6 };

export default function TermsPage() {
  return (
    <div style={box}>
      <Seo title="Conditions générales d'utilisation" description="Conditions générales d'utilisation d'Église Connect : règles de la communauté, compte, contenus et responsabilités." path="/terms" />
      <h1 style={{ color: 'var(--secondary)', borderBottom: '3px solid var(--primary)', paddingBottom: 10 }}>Conditions Générales d'Utilisation</h1>
      <p><strong>Dernière mise à jour :</strong> 23 novembre 2026</p>

      <h3>1. Objet</h3>
      <p>Les présentes conditions encadrent l'utilisation du site et de l'application <strong>Église Connect</strong> (eglise-connect.com), un réseau communautaire chrétien : fil d'actualité, événements, prières, groupes, messagerie, médias et marché de services. En créant un compte ou en utilisant le site, vous acceptez ces conditions.</p>

      <h3>2. Compte</h3>
      <ul>
        <li>Vous devez fournir des informations exactes et une adresse email valide.</li>
        <li>Vous êtes responsable de la confidentialité de votre mot de passe et de l'activité de votre compte.</li>
        <li>Un compte est personnel : un seul compte par personne.</li>
      </ul>

      <h3>3. Règles de la communauté</h3>
      <p>Église Connect est un espace de bienveillance. Il est interdit de publier :</p>
      <ul>
        <li>des propos haineux, injurieux, diffamatoires, discriminatoires ou menaçants ;</li>
        <li>des contenus violents, sexuellement explicites ou illégaux ;</li>
        <li>du spam, de la publicité non autorisée ou des tentatives d'escroquerie ;</li>
        <li>des contenus portant atteinte aux droits d'autrui (droit d'auteur, vie privée, image).</li>
      </ul>

      <h3>4. Vos contenus</h3>
      <p>Vous restez propriétaire de ce que vous publiez. Vous nous accordez une licence limitée, non exclusive, pour l'afficher dans le cadre du service. Vous garantissez avoir le droit de publier ces contenus.</p>

      <h3>5. Modération</h3>
      <p>L'équipe peut retirer tout contenu contraire aux présentes règles, suspendre ou supprimer un compte, avec ou sans préavis en cas de manquement grave.</p>

      <h3>6. Dons et services</h3>
      <p>Les fonctionnalités de dons sont en cours de mise en place. Les échanges de services entre membres (marché) se font sous la seule responsabilité des membres concernés ; Église Connect n'est pas partie à ces accords.</p>

      <h3>7. Disponibilité et responsabilité</h3>
      <p>Nous faisons au mieux pour assurer un service continu, sans garantie d'absence d'interruption ou d'erreur. Église Connect ne peut être tenue responsable des contenus publiés par les utilisateurs ni des dommages indirects liés à l'usage du service.</p>

      <h3>8. Données personnelles</h3>
      <p>Le traitement de vos données est décrit dans notre <a href="/privacy">politique de confidentialité</a>.</p>

      <h3>9. Modification des conditions</h3>
      <p>Ces conditions peuvent évoluer. La date de mise à jour figure en haut de cette page ; l'utilisation continue du site vaut acceptation.</p>

      <h3>10. Contact</h3>
      <p style={{ background: '#f9f9f9', padding: 15, borderLeft: '4px solid var(--primary)', fontWeight: 'bold' }}>
        <a href="mailto:bureauegliseconnect@gmail.com">bureauegliseconnect@gmail.com</a>
      </p>
    </div>
  );
}
