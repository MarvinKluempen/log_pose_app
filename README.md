# 🧭 Log Pose App - One Piece Kompass für Kneipentour

Eine Web-App im Stil des Log Pose aus One Piece für Junggesellenabschiede und Kneipentouren. Nutzer sehen einen animierten Kompass, der in Echtzeit zur aktiven Location zeigt.

## 📋 Features

### Frontend (Nutzer)
- ✅ Mobile-first Design
- ✅ GPS-basierte Navigation
- ✅ Animierter Kompass im One Piece Stil
- ✅ Echtzeit-Aktualisierung der Ziel-Location
- ✅ Distanzanzeige in Metern/Kilometern
- ✅ Richtungsanzeige (N, NE, E, SE, S, SW, W, NW)
- ✅ Sanfte, flüssige Animationen
- ✅ Fehlerbehandlung bei GPS-Problemen

### Backend
- ✅ Node.js + Express Server
- ✅ RESTful API
- ✅ In-Memory Datenspeicherung
- ✅ CORS-Support
- ✅ Passwortgeschütztes Admin-Interface

### Admin-Panel
- ✅ Separate Admin-Seite
- ✅ Passwortschutz
- ✅ Alle Locations verwalten
- ✅ Aktive Location ändern
- ✅ Quick Actions (Nächste/Vorherige/Reset)
- ✅ Live-Statistiken
- ✅ Responsive Design

## 🚀 Installation

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm oder yarn

### Schritt 1: Projekt einrichten

```bash
# In den Projektordner wechseln
cd log-pose-app

# Dependencies installieren
npm install
```

### Schritt 2: Server starten

```bash
# Server starten
npm start
```

Der Server läuft nun auf `http://localhost:3000`

## 📱 Verwendung

### Für Teilnehmer
1. Öffne `http://localhost:3000` auf dem Smartphone
2. Erlaube GPS-Zugriff wenn gefragt
3. Der Kompass zeigt automatisch zur aktuellen Ziel-Location

### Für Veranstalter (Admin)
1. Öffne `http://localhost:3000/admin`
2. Logge dich mit dem Passwort ein (Standard: `junggesellenabschied2025`)
3. Klicke auf "Aktivieren" bei der gewünschten Location
4. Alle Nutzer sehen sofort die neue Location

## ⚙️ Konfiguration

### Admin-Passwort ändern

Bearbeite `server/index.js` Zeile 31:

```javascript
const ADMIN_PASSWORD = "dein-neues-passwort";
```

### Locations anpassen

Bearbeite `server/index.js` Zeilen 14-24:

```javascript
let locations = [
  { id: 1, name: "Startpunkt", lat: 50.9413, lng: 6.9583 },
  { id: 2, name: "Kneipe 1", lat: 50.9388, lng: 6.9529 },
  // ... weitere Locations
];
```

**Koordinaten finden:**
1. Gehe zu [Google Maps](https://maps.google.com)
2. Rechtsklick auf den gewünschten Ort
3. Klicke auf die Koordinaten (werden in Zwischenablage kopiert)
4. Format: `lat, lng` (z.B. `50.9413, 6.9583`)

### Port ändern

Setze die Umgebungsvariable `PORT`:

```bash
PORT=8080 npm start
```

Oder bearbeite `server/index.js` Zeile 7:

```javascript
const PORT = process.env.PORT || 8080;
```

## 🌐 Deployment

### Vercel

1. Installiere Vercel CLI:
```bash
npm install -g vercel
```

2. Deploye das Projekt:
```bash
vercel
```

3. Folge den Anweisungen im Terminal

### Netlify

1. Erstelle `netlify.toml`:
```toml
[build]
  command = "npm install"
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. Deploye via Netlify CLI oder Netlify Dashboard

### Heroku

1. Erstelle `Procfile`:
```
web: node server/index.js
```

2. Deploye:
```bash
heroku create
git push heroku main
```

### Eigener Server

```bash
# Dependencies installieren
npm install

# Mit PM2 starten (empfohlen)
npm install -g pm2
pm2 start server/index.js --name log-pose
pm2 save
pm2 startup
```

## 🔧 API Dokumentation

### GET `/api/current`
Gibt die aktuell aktive Location zurück.

**Response:**
```json
{
  "success": true,
  "location": {
    "id": 1,
    "name": "Startpunkt",
    "lat": 50.9413,
    "lng": 6.9583
  },
  "index": 0,
  "total": 9
}
```

### GET `/api/locations`
Gibt alle Locations zurück.

**Response:**
```json
{
  "success": true,
  "locations": [...],
  "currentIndex": 0
}
```

### POST `/api/current`
Setzt eine neue aktive Location (Admin).

**Request:**
```json
{
  "password": "junggesellenabschied2025",
  "locationIndex": 2
}
```

**Response:**
```json
{
  "success": true,
  "location": {...},
  "index": 2
}
```

## 📁 Projektstruktur

```
log-pose-app/
├── public/                 # Frontend Dateien
│   ├── index.html         # Nutzer-App
│   ├── admin.html         # Admin-Panel
│   ├── styles.css         # Nutzer-Styles
│   ├── admin-styles.css   # Admin-Styles
│   ├── app.js            # Nutzer-Logic
│   └── admin.js          # Admin-Logic
├── server/
│   └── index.js          # Backend Server
├── package.json          # Dependencies
└── README.md            # Diese Datei
```

## 🐛 Troubleshooting

### GPS funktioniert nicht
- **Problem:** Browser fordert keinen GPS-Zugriff an
- **Lösung:** HTTPS ist erforderlich (außer bei localhost). Nutze ngrok oder einen HTTPS-Server.

```bash
# Temporär mit ngrok
npx ngrok http 3000
```

### Locations werden nicht aktualisiert
- **Problem:** Nutzer sehen alte Location
- **Lösung:** 
  1. Prüfe ob Server läuft
  2. Prüfe Netzwerkverbindung
  3. Öffne Browser-Konsole für Fehlermeldungen

### Admin-Panel nicht erreichbar
- **Problem:** 404 Error bei `/admin`
- **Lösung:** Stelle sicher, dass `admin.html` in `public/` existiert

### Passwort funktioniert nicht
- **Problem:** Login schlägt fehl
- **Lösung:** Prüfe `server/index.js` Zeile 31 für korrektes Passwort

## 💡 Tipps für den Junggesellenabschied

1. **Teste vorher:** Teste die App an den tatsächlichen Locations
2. **WLAN nutzen:** Erstelle einen mobilen Hotspot falls nötig
3. **Backup-Plan:** Notiere die Locations auch offline
4. **Akku sparen:** Reduziere Bildschirmhelligkeit
5. **Gruppenchat:** Kombiniere mit WhatsApp-Gruppe für Updates

## 🔐 Sicherheit

**WICHTIG für Produktionsumgebung:**

1. Ändere das Admin-Passwort
2. Nutze HTTPS
3. Implementiere Rate Limiting
4. Setze sichere CORS-Regeln
5. Nutze Umgebungsvariablen für Secrets

## 📝 Lizenz

MIT License - Frei nutzbar für private und kommerzielle Zwecke.

## 🤝 Support

Bei Problemen:
1. Prüfe die Browser-Konsole (F12)
2. Prüfe die Server-Logs
3. Stelle sicher, dass alle Dependencies installiert sind

## 🎉 Viel Erfolg!

Viel Spaß bei eurem Junggesellenabschied! 🍺🎊

---

**Erstellt mit ❤️ für unvergessliche Kneipentouren**
