import { useRef } from 'react';

// Anti-spam léger : champ piège (honeypot) invisible + délai minimal avant envoi.
export const HONEYPOT_STYLE = { position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0, overflow: 'hidden' };

export function useAntiSpam() {
  const startedAt = useRef(Date.now());
  const trap = useRef(null);
  // true => on bloque l'envoi (robot probable)
  const looksLikeBot = () => (trap.current && trap.current.value) || Date.now() - startedAt.current < 2500;
  const Honeypot = () => (
    <div style={HONEYPOT_STYLE} aria-hidden="true">
      <label>Ne pas remplir<input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
  return { looksLikeBot, Honeypot };
}
