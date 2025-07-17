# Spruch des Tages

Eine einfache Webanwendung, die täglich neue weise Sprüche anzeigt.

## Projektstruktur

```
/
├── index.html          # Hauptseite der Anwendung
├── styles.css          # CSS-Styles für die Anwendung
├── app.js             # Frontend-JavaScript
├── package.json       # Frontend-Dependencies
├── README.md          # Diese Datei
└── backend/
    ├── server.js      # Express-Server
    ├── package.json   # Backend-Dependencies
    ├── middleware/
    │   └── cors.js    # CORS-Middleware
    └── routes/
        └── sprueche.js # API-Routen für Sprüche
```

## Installation und Start

### Backend starten:
```bash
cd backend
npm install
npm run dev
```

### Frontend starten:
```bash
# In einem neuen Terminal
# Einfach die index.html im Browser öffnen
# oder einen lokalen Server starten:
npx serve .
```

## API-Endpunkte

- `GET /api/sprueche` - Alle Sprüche abrufen
- `GET /api/sprueche/:id` - Einzelnen Spruch abrufen
- `GET /api/sprueche/random` - Zufälligen Spruch abrufen

## Verwendung

1. Backend starten (läuft auf Port 3000)
2. Frontend öffnen (index.html)
3. Auf "Neuer Spruch" klicken für einen zufälligen Spruch
