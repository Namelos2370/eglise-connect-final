// backend/setAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// 👇 REMPLACE CECI PAR TON ADRESSE EMAIL EXACTE (Celle que tu utilises pour te connecter)
const EMAIL_A_PASSER_ADMIN = "gabrielfokou26@gmail.com"; 

async function setAdmin() {
  try {
    console.log("Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté !");

    console.log(`Recherche de l'utilisateur : ${EMAIL_A_PASSER_ADMIN}...`);
    const user = await User.findOne({ email: EMAIL_A_PASSER_ADMIN });

    if (!user) {
      console.log("❌ ERREUR : Aucun utilisateur trouvé avec cet email ! Vérifie l'orthographe.");
    } else {
      console.log(`Utilisateur trouvé : ${user.name} (Rôle actuel : ${user.role || 'Aucun'})`);
      
      user.role = "admin"; // On force le rôle
      await user.save();
      
      console.log("🎉 SUCCÈS ! L'utilisateur est maintenant ADMIN.");
    }

  } catch (error) {
    console.error("Erreur :", error);
  } finally {
    mongoose.connection.close();
  }
}

setAdmin();