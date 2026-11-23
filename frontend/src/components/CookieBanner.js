import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

const KEY = 'ec_cookie_consent';
const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };

// Bandeau de consentement. La mesure d'audience (Vercel Analytics, sans cookie)
// ne se charge que si le visiteur accepte.
export default function CookieBanner() {
  const [choice, setChoice] = useState(read());
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} setChoice(v); };

  return (
    <>
      {choice === 'accepted' && <Analytics />}
      {!choice && (
        <div role="dialog" aria-label="Consentement aux cookies" className="cookie-banner">
          <p>
            Nous utilisons un stockage local pour votre connexion et, si vous l'acceptez, une mesure d'audience anonyme pour améliorer le site.{' '}
            <Link to="/privacy">En savoir plus</Link>
          </p>
          <div className="cookie-actions">
            <button type="button" className="cookie-refuse" onClick={() => save('refused')}>Refuser</button>
            <button type="button" onClick={() => save('accepted')}>Accepter</button>
          </div>
        </div>
      )}
    </>
  );
}
