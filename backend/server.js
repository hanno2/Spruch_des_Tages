const express = require('express');
const cors = require('./middleware/cors');
const spruecheRoutes = require('./routes/sprueche');

const app = express();
const port = 3000;

// Middleware
app.use(cors);
app.use(express.json());

// Routes
app.use('/api/sprueche', spruecheRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Spruch des Tages API läuft!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Etwas ist schief gelaufen!' });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
