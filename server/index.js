const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Datenstruktur für Locations
let locations = [
  { id: 1, name: "Cappuccino Time", lat: 51.23047926785446, lng: 6.746243947748435 },
  { id: 2, name: "Kneipe 1 - Päffgen Brauhaus", lat: 50.9388, lng: 6.9529 },
  { id: 3, name: "Kneipe 2 - Brauerei zur Malzmühle", lat: 50.9356, lng: 6.9602 },
  { id: 4, name: "Kneipe 3 - Peters Brauhaus", lat: 50.9363, lng: 6.9577 },
  { id: 5, name: "Kneipe 4 - Gilden im Zims", lat: 50.9385, lng: 6.9542 },
  { id: 6, name: "Kneipe 5 - Früh am Dom", lat: 50.9412, lng: 6.9581 },
  { id: 7, name: "Kneipe 6 - Gaffel am Dom", lat: 50.9418, lng: 6.9572 },
  { id: 8, name: "Kneipe 7 - Sion Brauhaus", lat: 50.9402, lng: 6.9538 },
  { id: 9, name: "Endpunkt - Heumarkt", lat: 50.9358, lng: 6.9611 }
];

// Aktuell aktive Location (Index im Array, startet bei 0)
let currentLocationIndex = 0;

// Admin Passwort (ÄNDERN FÜR PRODUKTION!)
const ADMIN_PASSWORD = "junggesellenabschied2025";

// API Routes

// GET aktuelle Location
app.get('/api/current', (req, res) => {
  res.json({
    success: true,
    location: locations[currentLocationIndex],
    index: currentLocationIndex,
    total: locations.length
  });
});

// GET alle Locations
app.get('/api/locations', (req, res) => {
  res.json({
    success: true,
    locations: locations,
    currentIndex: currentLocationIndex
  });
});

// POST neue aktuelle Location (Admin)
app.post('/api/current', (req, res) => {
  const { password, locationIndex } = req.body;

  // Passwort prüfen
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'Falsches Passwort'
    });
  }

  // Index validieren
  if (typeof locationIndex !== 'number' || locationIndex < 0 || locationIndex >= locations.length) {
    return res.status(400).json({
      success: false,
      error: 'Ungültiger Location Index'
    });
  }

  // Location setzen
  currentLocationIndex = locationIndex;
  
  console.log(`[ADMIN] Location geändert zu: ${locations[currentLocationIndex].name}`);

  res.json({
    success: true,
    location: locations[currentLocationIndex],
    index: currentLocationIndex
  });
});

// POST Locations aktualisieren (Admin)
app.post('/api/locations', (req, res) => {
  const { password, locations: newLocations } = req.body;

  // Passwort prüfen
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'Falsches Passwort'
    });
  }

  // Locations validieren
  if (!Array.isArray(newLocations) || newLocations.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Ungültige Locations'
    });
  }

  // Locations aktualisieren
  locations = newLocations.map((loc, index) => ({
    id: index + 1,
    name: loc.name || `Location ${index + 1}`,
    lat: parseFloat(loc.lat),
    lng: parseFloat(loc.lng)
  }));

  // Sicherstellen, dass currentIndex gültig bleibt
  if (currentLocationIndex >= locations.length) {
    currentLocationIndex = 0;
  }

  console.log(`[ADMIN] Locations aktualisiert. Anzahl: ${locations.length}`);

  res.json({
    success: true,
    locations: locations,
    currentIndex: currentLocationIndex
  });
});

// Serve Frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   LOG POSE SERVER GESTARTET                ║
╚════════════════════════════════════════════╝

🧭 Server läuft auf: http://localhost:${PORT}
👥 Nutzer-App:      http://localhost:${PORT}
👨‍💻 Admin-Panel:     http://localhost:${PORT}/admin

📍 Aktuelle Location: ${locations[currentLocationIndex].name}
🔐 Admin-Passwort:    ${ADMIN_PASSWORD}

  `);
});
