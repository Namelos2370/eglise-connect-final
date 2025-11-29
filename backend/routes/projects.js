const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. LISTER LES PROJETS (Public)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name photo');
    res.status(200).json(projects);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. CRÉER UN PROJET (Connecté)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, targetAmount, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const newProject = new Project({
      title, description, category,
      targetAmount: Number(targetAmount),
      image: imageUrl,
      author: req.auth.userId
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 3. SOUTENIR UN PROJET (Simulé pour l'instant, augmente la cagnotte)
router.post('/:id/support', auth, async (req, res) => {
  try {
    const { amount } = req.body; // Montant du don
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    project.currentAmount += Number(amount);
    
    // Ajouter le supporter s'il n'y est pas déjà
    if (!project.supporters.includes(req.auth.userId)) {
        project.supporters.push(req.auth.userId);
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. SUPPRIMER (Auteur ou Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.author.toString() !== req.auth.userId) { 
        // Vérif Admin à ajouter si besoin, pour l'instant auteur seul
        return res.status(403).json({ message: "Non autorisé" });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Projet supprimé" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;