#!/bin/bash
# ============================================================
# Script de build — Église Connect
# Usage : bash build.sh
# ============================================================

set -e

echo ""
echo "====================================="
echo "  ÉGLISE CONNECT — BUILD PRODUCTION"
echo "====================================="
echo ""

# 1. Build du Frontend React
echo "[1/3] Installation des dépendances frontend..."
cd frontend
npm install --silent

echo "[2/3] Build du frontend React..."
npm run build
echo "      ✓ Build créé dans frontend/build/"

# 2. Dépendances Backend
echo "[3/3] Installation des dépendances backend..."
cd ../backend
npm install --omit=dev --silent
echo "      ✓ Dépendances backend installées"

cd ..

echo ""
echo "====================================="
echo "  BUILD TERMINÉ AVEC SUCCÈS"
echo "====================================="
echo ""
echo "Prochaines étapes pour Hostinger :"
echo ""
echo "  FRONTEND :"
echo "  → Uploader le contenu de frontend/build/ dans public_html/"
echo ""
echo "  BACKEND :"
echo "  → Uploader le dossier backend/ sur le serveur"
echo "  → Dans hPanel > Node.js :"
echo "      • Node.js version : 18.x ou 20.x"
echo "      • Application root : backend"
echo "      • Application startup file : app.js"
echo "  → Créer le fichier .env à partir de backend/.env.example"
echo "  → Cliquer sur 'Restart' dans hPanel > Node.js"
echo ""
