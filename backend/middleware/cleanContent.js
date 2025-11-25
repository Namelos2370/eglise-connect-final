const filter = require('leo-profanity');

// 1. Charger le dictionnaire Français par défaut
filter.loadDictionary('fr');

// 2. Ajouter des mots personnalisés supplémentaires (au cas où)
const customBadWords = [
    "connard", "salope", "pute", "encule", "batard", "putain", 
    "foutre", "chiant", "bite", "couilles", "nique", "fesse", "fesses", 
    "trouduc", "abruti", "debile", "gueule"
];
filter.add(customBadWords);

module.exports = (req, res, next) => {
    try {
        // Nettoyer le contenu principal (Posts, Messages)
        if (req.body.content) {
            req.body.content = filter.clean(req.body.content);
        }
        
        // Nettoyer les commentaires (souvent 'text')
        if (req.body.text) {
            req.body.text = filter.clean(req.body.text);
        }

        // Nettoyer les titres/descriptions (Événements, Médias)
        if (req.body.title) req.body.title = filter.clean(req.body.title);
        if (req.body.description) req.body.description = filter.clean(req.body.description);

        next();
    } catch (error) {
        console.error("Erreur modération:", error);
        // En cas d'erreur, on laisse passer pour ne pas bloquer l'utilisateur
        next(); 
    }
};