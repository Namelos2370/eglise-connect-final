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
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mp3', 'wav', 'pdf'],
  }
});

const upload = multer({ storage: storage });

module.exports = upload;