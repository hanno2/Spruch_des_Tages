const express = require('express');
const router = express.Router();

// Beispiel-Sprüche
const sprueche = [
  {
    id: 1,
    text: "Das Leben ist wie eine Schachtel Pralinen – man weiß nie, was man bekommt.",
    autor: "Forrest Gump"
  },
  {
    id: 2,
    text: "Der frühe Vogel fängt den Wurm.",
    autor: "Sprichwort"
  },
  {
    id: 3,
    text: "Glück ist das einzige, was sich verdoppelt, wenn man es teilt.",
    autor: "Albert Schweitzer"
  }
];

// GET /api/sprueche - Alle Sprüche abrufen
router.get('/', (req, res) => {
  res.json(sprueche);
});

// GET /api/sprueche/:id - Einzelnen Spruch abrufen
router.get('/:id', (req, res) => {
  const spruch = sprueche.find(s => s.id === parseInt(req.params.id));
  if (!spruch) {
    return res.status(404).json({ message: 'Spruch nicht gefunden' });
  }
  res.json(spruch);
});

// GET /api/sprueche/random - Zufälligen Spruch abrufen
router.get('/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * sprueche.length);
  res.json(sprueche[randomIndex]);
});

module.exports = router;
