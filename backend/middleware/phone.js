// Normalise un numéro de téléphone en format international (+237...).
// Un numéro à 9 chiffres commençant par 6 ou 2 est considéré comme camerounais.
const PLACEHOLDER_DOMAIN = '@phone.eglise-connect.local';

function normalizePhone(raw) {
  if (!raw) return null;
  let s = String(raw).trim().replace(/[\s().-]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  if (hasPlus) return '+' + digits;
  if (digits.length === 9 && /^[62]/.test(digits)) return '+237' + digits;
  if (digits.startsWith('237') && digits.length === 12) return '+' + digits;
  return '+' + digits;
}

const phoneEmail = (key) => key.replace('+', '') + PLACEHOLDER_DOMAIN;
const isPlaceholderEmail = (e) => typeof e === 'string' && e.endsWith(PLACEHOLDER_DOMAIN);

module.exports = { normalizePhone, phoneEmail, isPlaceholderEmail, PLACEHOLDER_DOMAIN };
