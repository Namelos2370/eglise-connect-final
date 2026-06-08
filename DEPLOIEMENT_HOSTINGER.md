# Guide de déploiement — Hostinger (Hébergement partagé)

## Prérequis
- Un compte Hostinger avec hébergement **Premium** ou **Business** (support Node.js)
- Un nom de domaine pointant vers Hostinger
- Une base MongoDB Atlas (MongoDB gratuit sur atlas.mongodb.com)

---

## ÉTAPE 1 — Build du projet

Sur votre machine locale, dans le dossier du projet :

```bash
bash build.sh
```

---

## ÉTAPE 2 — Déployer le Frontend

1. Connectez-vous au **hPanel Hostinger**
2. Allez dans **Gestionnaire de fichiers** > `public_html/`
3. Supprimez les fichiers existants (si présents)
4. Uploadez **tout le contenu** du dossier `frontend/build/` dans `public_html/`
   - Le fichier `index.html` doit être à la racine de `public_html/`
   - Le fichier `.htaccess` sera uploadé automatiquement (routing React)

---

## ÉTAPE 3 — Déployer le Backend

1. Dans le **Gestionnaire de fichiers**, créez un dossier `backend/` (en dehors de `public_html/`)
2. Uploadez tout le contenu du dossier `backend/` dans ce dossier
   - Incluez : `app.js`, `server.js`, `routes/`, `models/`, `middleware/`, `package.json`
   - N'uploadez PAS : `node_modules/`, `.env`

---

## ÉTAPE 4 — Configurer Node.js dans hPanel

1. Dans hPanel, allez dans **Node.js** (section "Avancé")
2. Cliquez sur **Create application**
3. Renseignez :
   - **Node.js version** : `20.x` (recommandé)
   - **Application mode** : `Production`
   - **Application root** : `backend`
   - **Application URL** : `api.eglise-connect.com` (ou un sous-domaine dédié)
   - **Application startup file** : `app.js`
4. Cliquez sur **Create**
5. Cliquez ensuite sur **Run NPM Install** pour installer les dépendances

---

## ÉTAPE 5 — Variables d'environnement

Dans hPanel > Node.js > votre application > **Environment variables**, ajoutez :

| Clé | Valeur |
|-----|--------|
| `MONGO_URI` | Votre URI MongoDB Atlas |
| `JWT_SECRET` | Une chaîne aléatoire longue (ex: 64 caractères) |
| `EMAIL_USER` | Votre adresse Gmail |
| `EMAIL_PASS` | Mot de passe d'application Gmail |
| `CLOUDINARY_CLOUD_NAME` | Depuis votre dashboard Cloudinary |
| `CLOUDINARY_API_KEY` | Depuis votre dashboard Cloudinary |
| `CLOUDINARY_API_SECRET` | Depuis votre dashboard Cloudinary |
| `STRIPE_SECRET_KEY` | Depuis votre dashboard Stripe |
| `CAMPAY_TOKEN` | Depuis votre dashboard Campay |
| `CLIENT_URL` | `https://eglise-connect.com` |
| `PORT` | `3002` |

---

## ÉTAPE 6 — Sous-domaine pour l'API

1. Dans hPanel > **Domaines** > **Sous-domaines**
2. Créez `api.eglise-connect.com` pointant vers le dossier `backend/`
3. Activez le **SSL** gratuit (Let's Encrypt) sur ce sous-domaine

---

## ÉTAPE 7 — Mettre à jour l'URL de l'API dans le frontend

Dans `frontend/src/config.js`, vérifiez que l'URL de production est correcte :

```js
const PROD_API_URL = 'https://api.eglise-connect.com';
```

Si vous avez changé le sous-domaine, modifiez cette ligne, puis relancez `bash build.sh`.

---

## ÉTAPE 8 — Redémarrer et tester

1. Dans hPanel > Node.js > cliquez **Restart**
2. Testez l'API : `https://api.eglise-connect.com/` → doit afficher `API Église Connect V2.1 en ligne`
3. Testez le site : `https://eglise-connect.com`

---

## Dépannage fréquent

| Problème | Solution |
|----------|----------|
| Page blanche sur le site | Vérifier que `.htaccess` est bien dans `public_html/` |
| Erreur 502 sur l'API | Vérifier les logs dans hPanel > Node.js > Logs |
| Erreur MongoDB | Vérifier que l'IP Hostinger est autorisée dans MongoDB Atlas |
| Uploads/images qui ne marchent pas | Vérifier les clés Cloudinary dans les variables d'env |
| Email non reçu | Activer "Accès moins sécurisé" ou créer un mot de passe d'application Gmail |
