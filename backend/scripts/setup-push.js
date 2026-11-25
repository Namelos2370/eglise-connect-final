// Génère les clés VAPID (une seule fois) et les ajoute au fichier .env
// Usage : cd backend && node scripts/setup-push.js
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const envPath = path.join(__dirname, '..', '.env');
const current = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
if (/^VAPID_PUBLIC_KEY=/m.test(current)) {
  console.log('✅ Les clés VAPID existent déjà dans .env — rien à faire.');
  process.exit(0);
}
const keys = webpush.generateVAPIDKeys();
const block = `\n# Notifications push\nVAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\nVAPID_SUBJECT=mailto:contact@eglise-connect.com\n`;
fs.appendFileSync(envPath, block);
console.log('✅ Clés VAPID ajoutées à .env. Redémarrez : pm2 restart eglise-api --update-env');
