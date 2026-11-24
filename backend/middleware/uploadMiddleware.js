const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eglise-connect-media',
    // IMPORTANT : 'auto' permet à Cloudinary de détecter si c'est une image, une vidéo ou un son
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'heic', 'heif', 'mp4', 'mov', 'm4v', 'webm', '3gp', 'mp3', 'm4a', 'aac', 'wav', 'ogg', 'pdf'],
  }
});

// Limite à 100 Mo par fichier
const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary non configuré (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET manquants) : les envois de photos/vidéos échoueront.');
}

module.exports = upload;