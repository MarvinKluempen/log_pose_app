# 🏗️ Architektur-Dokumentation

## Systemübersicht

Die Log Pose App besteht aus drei Hauptkomponenten:

```
┌─────────────────┐
│  Nutzer-App     │  (Frontend)
│  (index.html)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express Server │  (Backend)
│  (index.js)     │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Admin-Panel    │  (Frontend)
│  (admin.html)   │
└─────────────────┘
```

## Frontend-Architektur

### Nutzer-App (`index.html`, `app.js`, `styles.css`)

**Hauptfunktionen:**
1. GPS-Tracking via Geolocation API
2. Kompass-Berechnung (Bearing & Distance)
3. UI-Updates in Echtzeit
4. Polling für Location-Updates (alle 5 Sekunden)

**Datenfluss:**
```
GPS Position → Bearing/Distance Berechnung → Nadel-Rotation → UI Update
                                            ↓
                                    API: GET /api/current (alle 5s)
```

**Wichtige Algorithmen:**

1. **Bearing Berechnung** (Richtung zwischen zwei Punkten):
```javascript
// Haversine-basierte Bearing-Formel
bearing = atan2(
  sin(lng2 - lng1) * cos(lat2),
  cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lng2 - lng1)
)
```

2. **Distanz Berechnung** (Haversine):
```javascript
// Große-Kreis-Distanz auf Kugeloberfläche
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
c = 2 * atan2(√a, √(1-a))
distance = R * c  // R = Erdradius (6371 km)
```

### Admin-Panel (`admin.html`, `admin.js`, `admin-styles.css`)

**Hauptfunktionen:**
1. Authentifizierung (Session Storage)
2. Location-Verwaltung
3. Echtzeit-Updates (Polling alle 5 Sekunden)
4. Quick Actions (Next/Prev/Reset)

**State Management:**
```javascript
// Lokaler State
{
  password: string,
  locations: Location[],
  currentIndex: number
}

// Gespeichert in sessionStorage
sessionStorage.setItem('adminPassword', password)
```

## Backend-Architektur

### Express Server (`server/index.js`)

**Middleware-Stack:**
```
Request
  │
  ├─► CORS Middleware
  │
  ├─► JSON Body Parser
  │
  ├─► Static File Server (public/)
  │
  └─► API Routes
```

**Datenhaltung:**

In-Memory Storage (einfach, schnell, ausreichend für Use Case):
```javascript
// Globale Variablen
let locations = [...];        // Array von Locations
let currentLocationIndex = 0; // Index der aktiven Location
```

**Vorteile:**
- Keine Datenbank nötig
- Sehr schnell
- Einfach zu deployen

**Nachteile:**
- State geht bei Neustart verloren
- Nicht skalierbar auf mehrere Server-Instanzen

**Für Produktion empfohlen:**
- Redis für State
- PostgreSQL/MongoDB für Locations
- WebSockets statt Polling

## API-Design

### RESTful Endpoints

**GET `/api/current`**
- Zweck: Aktuelle Location abrufen
- Auth: Keine
- Response: Location + Metadaten

**GET `/api/locations`**
- Zweck: Alle Locations abrufen
- Auth: Keine
- Response: Array + currentIndex

**POST `/api/current`**
- Zweck: Aktive Location ändern
- Auth: Passwort in Body
- Request: `{ password, locationIndex }`
- Response: Neue Location oder Error

**POST `/api/locations`**
- Zweck: Locations aktualisieren
- Auth: Passwort in Body
- Request: `{ password, locations[] }`
- Response: Aktualisierte Locations

### Fehlerbehandlung

```javascript
// Standard Error Response
{
  success: false,
  error: "Fehlermeldung"
}

// HTTP Status Codes
200 - OK
400 - Bad Request (ungültige Daten)
401 - Unauthorized (falsches Passwort)
500 - Server Error
```

## Sicherheitskonzept

### Aktuelle Implementierung (Development)

1. **Passwort:** Plain-Text in Code
2. **Auth:** Einfacher String-Vergleich
3. **CORS:** Offen für alle Origins
4. **HTTPS:** Nicht erzwungen

### Produktions-Empfehlungen

```javascript
// 1. Umgebungsvariablen
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fallback';

// 2. Passwort-Hashing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// 3. JWT-Tokens
const jwt = require('jsonwebtoken');
const token = jwt.sign({ admin: true }, SECRET, { expiresIn: '1h' });

// 4. Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// 5. CORS Whitelist
app.use(cors({
  origin: ['https://yourdomain.com']
}));
```

## Performance-Optimierungen

### Frontend

1. **Debouncing:** GPS-Updates throttlen
```javascript
let lastUpdate = 0;
const UPDATE_INTERVAL = 1000; // 1 Sekunde

if (Date.now() - lastUpdate > UPDATE_INTERVAL) {
  updateCompass();
  lastUpdate = Date.now();
}
```

2. **CSS Animations:** GPU-beschleunigt
```css
.needle {
  transform: rotate(45deg);
  will-change: transform; /* GPU-Layer */
}
```

3. **Asset Optimization:**
- Keine externen Libraries (außer Backend-Dependencies)
- Inline CSS/JS für schnelles Laden
- Minification für Produktion

### Backend

1. **Caching Headers:**
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

2. **Kompression:**
```javascript
const compression = require('compression');
app.use(compression());
```

## Skalierbarkeit

### Aktuelle Limits

- **Nutzer:** ~100 gleichzeitig (Polling-Last)
- **Locations:** Unbegrenzt (Array-basiert)
- **Requests:** ~10/Sekunde pro Nutzer (5s Polling)

### Skalierungs-Optionen

1. **WebSockets statt Polling:**
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.emit('locationUpdate', currentLocation);
});

// Bei Location-Änderung
io.emit('locationUpdate', newLocation);
```

2. **Redis für Multi-Server:**
```javascript
const redis = require('redis');
const client = redis.createClient();

await client.set('currentIndex', index);
await client.set('locations', JSON.stringify(locations));
```

3. **Load Balancer:**
```
User → Nginx → [Server 1, Server 2, Server 3] → Redis
```

## Deployment-Strategien

### Option 1: Single Server (Klein, einfach)
```
Heroku/Railway → Express App → In-Memory
```

### Option 2: Serverless (Skalierbar, günstig)
```
Vercel/Netlify → Serverless Functions → Redis
```

### Option 3: Container (Flexibel, professionell)
```
Docker → Kubernetes → Multiple Instances → PostgreSQL
```

## Monitoring & Logging

### Empfohlene Tools

1. **Logging:**
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Error Tracking:**
- Sentry für Frontend & Backend
- LogRocket für Session Replay

3. **Analytics:**
- Google Analytics für Nutzer-Tracking
- Custom Events für Location-Wechsel

## Testing-Strategie

### Unit Tests (empfohlen)

```javascript
// app.test.js
describe('Bearing Calculation', () => {
  it('should calculate correct bearing', () => {
    const bearing = calculateBearing(50.0, 8.0, 51.0, 9.0);
    expect(bearing).toBeCloseTo(45, 1);
  });
});
```

### Integration Tests

```javascript
// server.test.js
describe('API Endpoints', () => {
  it('GET /api/current should return location', async () => {
    const res = await request(app).get('/api/current');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

### E2E Tests

```javascript
// Cypress
describe('User Flow', () => {
  it('should show compass after GPS permission', () => {
    cy.visit('/');
    cy.get('.compass').should('be.visible');
  });
});
```

## Erweiterungsmöglichkeiten

### 1. Offline-Modus (PWA)
```javascript
// service-worker.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 2. Push Notifications
```javascript
// Location-Änderung per Push
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Neue Location!', {
        body: 'Das nächste Ziel wurde aktiviert.'
      });
    }
  });
}
```

### 3. Augmented Reality (AR)
```javascript
// AR.js Integration
<a-scene embedded arjs>
  <a-marker preset="hiro">
    <a-box position="0 0.5 0" material="color: blue;"></a-box>
  </a-marker>
</a-scene>
```

### 4. Multi-Gruppen Support
```javascript
// Gruppen-basierte Locations
let groups = {
  'gruppe-a': { locations: [...], currentIndex: 0 },
  'gruppe-b': { locations: [...], currentIndex: 2 }
};

app.get('/api/current/:groupId', (req, res) => {
  const group = groups[req.params.groupId];
  res.json({ location: group.locations[group.currentIndex] });
});
```

## Technologie-Entscheidungen

### Warum Vanilla JS?
- ✅ Keine Build-Tools nötig
- ✅ Schnelleres Laden
- ✅ Einfacher zu verstehen
- ✅ Weniger Dependencies

### Warum Express?
- ✅ Minimalistisch
- ✅ Große Community
- ✅ Flexible Middleware
- ✅ Gut dokumentiert

### Warum In-Memory Storage?
- ✅ Einfachste Lösung
- ✅ Keine Datenbank nötig
- ✅ Perfekt für Use Case
- ✅ Sehr schnell

---

**Stand:** 2025
**Version:** 1.0.0
