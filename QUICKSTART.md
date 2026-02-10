# 🚀 QUICK START GUIDE

## In 3 Schritten zur laufenden App

### 1️⃣ Terminal öffnen und ins Projekt-Verzeichnis wechseln

```bash
cd log-pose-app
```

### 2️⃣ Dependencies installieren

```bash
npm install
```

Das dauert ca. 10-30 Sekunden.

### 3️⃣ Server starten

```bash
npm start
```

Du siehst dann:

```
╔════════════════════════════════════════════╗
║   LOG POSE SERVER GESTARTET                ║
╚════════════════════════════════════════════╝

🧭 Server läuft auf: http://localhost:3000
👥 Nutzer-App:      http://localhost:3000
👨‍💻 Admin-Panel:     http://localhost:3000/admin

📍 Aktuelle Location: Startpunkt - Hauptbahnhof
🔐 Admin-Passwort:    junggesellenabschied2025
```

---

## 📱 App verwenden

### Für Teilnehmer:
Öffne auf dem Smartphone: **http://localhost:3000**
- Erlaube GPS-Zugriff
- Fertig! 🎉

### Für Admin:
Öffne im Browser: **http://localhost:3000/admin**
- Passwort: `junggesellenabschied2025`
- Klicke auf "Aktivieren" bei der gewünschten Location

---

## 🔧 Erste Anpassungen

### Passwort ändern

Öffne `server/index.js`, Zeile 31:

```javascript
const ADMIN_PASSWORD = "dein-neues-passwort";
```

### Locations für deinen Ort eintragen

Öffne `server/index.js`, Zeilen 14-24:

1. Gehe zu Google Maps
2. Rechtsklick auf den Ort
3. Klicke auf die Koordinaten (werden kopiert)
4. Trage ein:

```javascript
let locations = [
  { id: 1, name: "Startpunkt", lat: 50.1234, lng: 8.5678 },
  { id: 2, name: "Erste Kneipe", lat: 50.1235, lng: 8.5679 },
  // ... bis zu 9 Locations
];
```

---

## 🌐 Online stellen (optional)

### Mit ngrok (schnell & einfach):

```bash
# In neuem Terminal
npx ngrok http 3000
```

Du bekommst eine URL wie: `https://abc123.ngrok.io`

Diese URL können alle Teilnehmer öffnen!

**Wichtig:** Die URL funktioniert nur, solange dein Rechner läuft.

---

## ❓ Hilfe bei Problemen

### Server startet nicht?
```bash
# Prüfe ob Port 3000 schon belegt ist
lsof -i :3000

# Starte mit anderem Port
PORT=8080 npm start
```

### GPS funktioniert nicht?
- Nutze HTTPS (mit ngrok automatisch)
- Erlaube Standortzugriff im Browser
- Teste draußen (besserer GPS-Empfang)

### Locations werden nicht aktualisiert?
- Prüfe ob Server läuft
- Öffne Browser-Konsole (F12)
- Checke Netzwerk-Tab für API-Fehler

---

## 📖 Mehr Infos?

Schau in die **README.md** für:
- Detaillierte Dokumentation
- Deployment-Optionen
- API-Referenz
- Troubleshooting

Oder in die **ARCHITECTURE.md** für:
- Technische Details
- Architektur-Übersicht
- Erweiterungs-Ideen

---

## ✅ Checkliste für den Event

- [ ] Locations mit echten Koordinaten eingetragen
- [ ] Admin-Passwort geändert
- [ ] App lokal getestet
- [ ] An allen Locations getestet (GPS-Empfang)
- [ ] Backup-Plan (Location-Liste offline)
- [ ] Smartphones aufgeladen
- [ ] Powerbanks eingepackt
- [ ] WhatsApp-Gruppe erstellt
- [ ] Alle haben die URL
- [ ] Admin-Zugang sicher aufbewahrt

---

## 🍺 Viel Spaß!

Bei Fragen oder Problemen:
1. Check Browser-Konsole (F12)
2. Check Server-Logs im Terminal
3. Check README.md

**Prost!** 🎉
