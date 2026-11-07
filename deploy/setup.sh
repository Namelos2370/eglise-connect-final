#!/bin/bash
# Installation d'Église Connect (API) sur un VPS Ubuntu vierge.
# Usage : curl -fsSL https://raw.githubusercontent.com/Namelos2370/eglise-connect-final/fix/audit/deploy/setup.sh | bash
set -e
[ "$(id -u)" -eq 0 ] || { echo "Lance ce script en root."; exit 1; }

ask() { # ask "Question" VARIABLE [défaut]
  local v; read -r -p "$1${3:+ [$3]} : " v < /dev/tty
  printf -v "$2" '%s' "${v:-$3}"
}

echo "=== Configuration (Entrée = valeur par défaut / ignorer) ==="
ask "Domaine principal" DOMAINE eglise-connect.com
ask "MONGO_URI (lien MongoDB Atlas)" MONGO_URI
ask "JWT_SECRET (Entrée = en générer un nouveau)" JWT_SECRET
ask "EMAIL_USER (Gmail d'envoi)" EMAIL_USER
ask "EMAIL_PASS (mot de passe d'application Gmail)" EMAIL_PASS
ask "CLOUDINARY_CLOUD_NAME" CLD_NAME
ask "CLOUDINARY_API_KEY" CLD_KEY
ask "CLOUDINARY_API_SECRET" CLD_SECRET
ask "STRIPE_SECRET_KEY" STRIPE_KEY sk_test_placeholder
ask "CAMPAY_TOKEN" CAMPAY_TOKEN
[ -n "$JWT_SECRET" ] || JWT_SECRET=$(openssl rand -hex 32)
[ -n "$MONGO_URI" ] || { echo "MONGO_URI est obligatoire."; exit 1; }

echo "=== Installation des paquets ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx git curl ufw dnsutils
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm i -g pm2
# Pare-feu : on n'active rien ; on ajoute seulement les règles si ufw est déjà actif (VPS partagé avec d'autres sites)
if ufw status | grep -q 'Status: active'; then ufw allow OpenSSH >/dev/null; ufw allow 'Nginx Full' >/dev/null; fi

# Port libre pour l'API (ne touche pas aux ports déjà utilisés par un autre site)
PORT_API=3002
if pm2 describe eglise-api >/dev/null 2>&1; then
  PORT_API=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;print(next((p['pm2_env'].get('PORT') for p in json.load(sys.stdin) if p['name']=='eglise-api' and p['pm2_env'].get('PORT')),3002))" 2>/dev/null || echo 3002)
else
  while ss -ltn | awk '{print $4}' | grep -q ":$PORT_API$"; do PORT_API=$((PORT_API+1)); done
fi
echo "Port utilisé par l'API : $PORT_API"

echo "=== Code ==="
APP=/var/www/eglise-connect
if [ -d "$APP/.git" ]; then
  git -C "$APP" fetch origin fix/audit && git -C "$APP" checkout fix/audit && git -C "$APP" reset --hard origin/fix/audit
else
  git clone --branch fix/audit https://github.com/Namelos2370/eglise-connect-final "$APP"
fi
cd "$APP/backend" && npm ci --omit=dev

cat > .env <<ENV
PORT=$PORT_API
MONGO_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
CLIENT_URL=https://$DOMAINE
CORS_ORIGINS=https://$DOMAINE,https://www.$DOMAINE,https://eglise-connect-final.vercel.app
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
CLOUDINARY_CLOUD_NAME=$CLD_NAME
CLOUDINARY_API_KEY=$CLD_KEY
CLOUDINARY_API_SECRET=$CLD_SECRET
STRIPE_SECRET_KEY=$STRIPE_KEY
CAMPAY_TOKEN=$CAMPAY_TOKEN
ENV
chmod 600 .env

echo "=== Démarrage de l'API ==="
pm2 delete eglise-api >/dev/null 2>&1 || true
PORT=$PORT_API pm2 start server.js --name eglise-api --update-env
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

cat > /etc/nginx/sites-available/eglise-api <<NGINX
server {
  server_name api.$DOMAINE;
  client_max_body_size 100M;
  location / {
    proxy_pass http://127.0.0.1:$PORT_API;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
ln -sf /etc/nginx/sites-available/eglise-api /etc/nginx/sites-enabled/eglise-api
nginx -t && systemctl reload nginx

echo "=== HTTPS ==="
MYIP=$(curl -4 -s https://api.ipify.org)
DNSIP=$(dig +short "api.$DOMAINE" | tail -1)
if [ "$MYIP" = "$DNSIP" ]; then
  certbot --nginx -d "api.$DOMAINE" --non-interactive --agree-tos -m gabrielfokou26@gmail.com --redirect
  echo; curl -s "https://api.$DOMAINE"; echo
  echo "Terminé : https://api.$DOMAINE est en ligne."
else
  echo "ATTENTION : api.$DOMAINE pointe vers '${DNSIP:-rien}' au lieu de $MYIP."
  echo "Crée l'enregistrement DNS A  api -> $MYIP, attends quelques minutes, puis relance la même commande."
  echo "L'API tourne déjà en HTTP : curl http://127.0.0.1:$PORT_API"
fi
