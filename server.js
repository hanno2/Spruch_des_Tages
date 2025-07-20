// Express Server mit MySQL2 für Spruch des Tages
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL2 Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sprueche_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
});

// Datenbank initialisieren
async function initDatabase() {
    try {
        // Datenbank erstellen falls nicht vorhanden
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        await connection.execute(CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'sprueche_db'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);
        await connection.end();
        
        // Tabelle erstellen
        await pool.execute(
            CREATE TABLE IF NOT EXISTS sprueche (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text TEXT NOT NULL,
                autor VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_autor (autor),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        );
        
        // Standard-Sprüche einfügen falls Tabelle leer
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM sprueche');
        if (rows[0].count === 0) {
            const defaultSprueche = [
                { text: "Der Weg ist das Ziel.", autor: "Konfuzius" },
                { text: "Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.", autor: "Albert Einstein" },
                { text: "Das Leben ist, was passiert, während du eifrig dabei bist, andere Pläne zu machen.", autor: "John Lennon" },
                { text: "Sei du selbst; alle anderen sind bereits vergeben.", autor: "Oscar Wilde" },
                { text: "Der größte Ruhm im Leben liegt nicht darin, nie zu fallen, sondern jedes Mal wieder aufzustehen.", autor: "Nelson Mandela" }
            ];
            
            for (const spruch of defaultSprueche) {
                await pool.execute(
                    'INSERT INTO sprueche (text, autor) VALUES (?, ?)',
                    [spruch.text, spruch.autor]
                );
            }
        }
        
        console.log('✅ Datenbank initialisiert');
    } catch (error) {
        console.error('❌ DB Fehler:', error);
        throw error;
    }
}

// API ROUTES
app.get('/api/sprueche', async (req, res) => {
    try {
        const [sprueche] = await pool.execute('SELECT * FROM sprueche ORDER BY created_at DESC');
        res.json({ success: true, data: sprueche });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/sprueche/random', async (req, res) => {
    try {
        const [sprueche] = await pool.execute('SELECT * FROM sprueche ORDER BY RAND() LIMIT 1');
        res.json({ success: true, data: sprueche[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sprueche', async (req, res) => {
    try {
        const { text, autor } = req.body;
        if (!text || !autor) {
            return res.status(400).json({ success: false, message: 'Text und Autor erforderlich' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO sprueche (text, autor) VALUES (?, ?)',
            [text.trim(), autor.trim()]
        );
        
        const [newSpruch] = await pool.execute('SELECT * FROM sprueche WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newSpruch[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/sprueche/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await pool.execute('SELECT * FROM sprueche WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Spruch nicht gefunden' });
        }
        
        await pool.execute('DELETE FROM sprueche WHERE id = ?', [id]);
        res.json({ success: true, message: 'Spruch gelöscht' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-new.html'));
});

app.get('/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ success: true, message: 'Server OK' });
    } catch (error) {
        res.status(503).json({ success: false, error: error.message });
    }
});

async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log('🚀 Server läuft auf Port', PORT);
            console.log('📊 API Endpoints:');
            console.log('  GET /api/sprueche - Alle Sprüche');
            console.log('  GET /api/sprueche/random - Zufälliger Spruch'); 
            console.log('  POST /api/sprueche - Neuen Spruch erstellen');
            console.log('  DELETE /api/sprueche/:id - Spruch löschen');
            console.log('  GET /health - Health Check');
            console.log('💡 Frontend: http://localhost:' + PORT);
        });
    } catch (error) {
        console.error('❌ Server-Fehler:', error);
        process.exit(1);
    }
}

startServer();
