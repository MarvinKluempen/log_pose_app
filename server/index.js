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
  { id: 1, name: "Loguetown", lat: 52.376127465576744, lng: 4.895042072177835 },
  { id: 2, name: "Whiskey Peak", lat: 52.37428041481016, lng: 4.892295490283367 },
  { id: 3, name: "Skypea", lat: 52.373075205287876, lng: 4.890020977152011 }, 
  { id: 4, name: "Water 7", lat: 52.37366013011269, lng: 4.882364761670184 }, 
  { id: 5, name: "Thriller Bark", lat: 52.37082283464927, lng: 4.889351850110737 },
  { id: 6, name: "Impel Down", lat: 52.36925623098222, lng: 4.8908165425639645 },
  { id: 7, name: "Wano Kuni", lat: 52.36656694252976, lng: 4.891463590761568 },
  { id: 8, name: "Dress Rosa", lat: 52.36568038228147, lng: 4.897443378483437 }, 
  { id: 9, name: "Elbaph", lat: 52.37401946319378, lng: 4.899401712575032 },
  { id: 10, name: "Laughtale", lat: 50.9358, lng: 6.9611 }
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
