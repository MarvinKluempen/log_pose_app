# 🚀 DEPLOYMENT GUIDE

Dieser Guide zeigt verschiedene Möglichkeiten, die Log Pose App online zu stellen.

---

## 🎯 Option 1: Vercel (Empfohlen für Anfänger)

**Vorteile:**
- ✅ Kostenlos
- ✅ HTTPS automatisch
- ✅ Sehr schnell
- ✅ Einfaches Setup

**Schritte:**

1. **Vercel CLI installieren:**
```bash
npm install -g vercel
```

2. **Einloggen:**
```bash
vercel login
```

3. **Deployen:**
```bash
cd log-pose-app
vercel
```

4. **Umgebungsvariablen setzen:**
```bash
vercel env add ADMIN_PASSWORD
# Eingeben: dein-passwort

vercel --prod
```

5. **Fertig!** Du bekommst eine URL wie: `https://log-pose-app.vercel.app`

**Passwort ändern:**
```bash
vercel env rm ADMIN_PASSWORD production
vercel env add ADMIN_PASSWORD production
vercel --prod
```

---

## 🐳 Option 2: Docker (Empfohlen für Server)

**Vorteile:**
- ✅ Läuft überall
- ✅ Einfach zu verwalten
- ✅ Isoliert
- ✅ Skalierbar

**Schritte:**

1. **Docker installieren:**
   - https://docs.docker.com/get-docker/

2. **Image bauen:**
```bash
cd log-pose-app
docker build -t log-pose-app .
```

3. **Container starten:**
```bash
docker run -d \
  -p 3000:3000 \
  -e ADMIN_PASSWORD="dein-passwort" \
  --name log-pose \
  log-pose-app
```

4. **Mit Docker Compose (einfacher):**
```bash
# .env Datei erstellen
echo "ADMIN_PASSWORD=dein-passwort" > .env

# Starten
docker-compose up -d

# Logs ansehen
docker-compose logs -f

# Stoppen
docker-compose down
```

5. **App läuft auf:** `http://localhost:3000`

---

## ☁️ Option 3: Railway (Empfohlen für Hobby-Projekte)

**Vorteile:**
- ✅ $5 gratis pro Monat
- ✅ Sehr einfach
- ✅ GitHub Integration
- ✅ Auto-Deploy

**Schritte:**

1. **Auf Railway anmelden:**
   - https://railway.app

2. **Neues Projekt:**
   - "New Project" → "Deploy from GitHub"
   - Repository auswählen

3. **Environment Variables setzen:**
   - In Settings → Variables
   - `ADMIN_PASSWORD` = dein-passwort

4. **Deploy!**
   - Railway deployed automatisch
   - Du bekommst eine URL

---

## 🔥 Option 4: Heroku

**Vorteile:**
- ✅ Bekannte Plattform
- ✅ Einfach
- ✅ Viele Add-ons

**Schritte:**

1. **Heroku CLI installieren:**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download von heroku.com
```

2. **Login:**
```bash
heroku login
```

3. **App erstellen:**
```bash
cd log-pose-app
heroku create dein-app-name
```

4. **Environment Variables:**
```bash
heroku config:set ADMIN_PASSWORD="dein-passwort"
```

5. **Deployen:**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Öffnen:**
```bash
heroku open
```

---

## 🏠 Option 5: Eigener Server (VPS)

**Vorteile:**
- ✅ Volle Kontrolle
- ✅ Günstig (ab ~5€/Monat)
- ✅ Unbegrenzte Nutzer

**Anbieter:**
- DigitalOcean
- Hetzner
- Linode
- AWS Lightsail

**Setup (Ubuntu Server):**

1. **Server einrichten:**
```bash
# SSH verbinden
ssh root@deine-server-ip

# Updates
apt update && apt upgrade -y

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PM2 (Process Manager)
npm install -g pm2
```

2. **Code hochladen:**
```bash
# Auf lokalem Rechner
scp -r log-pose-app root@deine-server-ip:/var/www/

# Auf Server
cd /var/www/log-pose-app
npm install
```

3. **Umgebungsvariablen:**
```bash
echo "ADMIN_PASSWORD=dein-passwort" > .env
```

4. **App starten mit PM2:**
```bash
pm2 start server/index.js --name log-pose
pm2 save
pm2 startup
```

5. **Nginx als Reverse Proxy (optional):**
```bash
apt install -y nginx

# Nginx Config
nano /etc/nginx/sites-available/log-pose
```

```nginx
server {
    listen 80;
    server_name deine-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktivieren
ln -s /etc/nginx/sites-available/log-pose /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d deine-domain.com
```

6. **Firewall:**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 📱 Option 6: ngrok (Temporär, für Tests)

**Vorteile:**
- ✅ Sofort einsatzbereit
- ✅ Kein Server nötig
- ✅ HTTPS automatisch

**Schritte:**

1. **ngrok installieren:**
   - https://ngrok.com/download

2. **Account erstellen und Token holen:**
   - https://dashboard.ngrok.com/get-started/your-authtoken

3. **Token setzen:**
```bash
ngrok authtoken DEIN_TOKEN
```

4. **App lokal starten:**
```bash
cd log-pose-app
npm start
```

5. **ngrok starten (in neuem Terminal):**
```bash
ngrok http 3000
```

6. **URL teilen:**
   - Du bekommst eine URL wie: `https://abc123.ngrok.io`
   - Diese URL teilst du mit allen Teilnehmern

**Wichtig:** 
- URL funktioniert nur solange dein Rechner läuft
- Gratis-Version: URL ändert sich bei jedem Neustart
- Bezahlversion: Feste Subdomain möglich

---

## 🔒 Sicherheit Checklist

Bevor du online gehst:

- [ ] Admin-Passwort geändert
- [ ] HTTPS aktiviert (bei allen Optionen außer ngrok automatisch)
- [ ] `.env` Datei NICHT in Git committen
- [ ] Rate Limiting aktivieren (für Produktion)
- [ ] CORS auf deine Domain beschränken (für Produktion)

**Rate Limiting hinzufügen:**
```bash
npm install express-rate-limit
```

In `server/index.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Max 100 Requests pro IP
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring (Optional)

### Logs ansehen:

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker logs -f log-pose
```

**PM2:**
```bash
pm2 logs log-pose
```

**Heroku:**
```bash
heroku logs --tail
```

### Uptime Monitoring:

Kostenlose Tools:
- UptimeRobot: https://uptimerobot.com
- Better Uptime: https://betteruptime.com
- Pingdom: https://www.pingdom.com

---

## 💡 Performance Tipps

1. **Kompression aktivieren:**
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

2. **Caching Headers:**
Bereits in `server/index.js` implementiert!

3. **CDN (für statische Files):**
   - Cloudflare (kostenlos)
   - Vercel Edge Network (automatisch)

---

## 🆘 Troubleshooting

### Deployment schlägt fehl?
- Check Node.js Version (mind. 14)
- Check package.json Syntax
- Logs ansehen

### App startet nicht?
```bash
# Environment Variables prüfen
printenv | grep ADMIN_PASSWORD

# Port schon belegt?
lsof -i :3000

# Dependencies installiert?
npm install
```

### 502 Bad Gateway?
- Check ob Server läuft
- Check Firewall
- Check Nginx Config
- Check App Logs

---

## 🎉 Erfolgreich deployed?

Teste die App:

1. **Frontend:** https://deine-url.com
   - GPS erlauben
   - Kompass sollte sich drehen

2. **Admin:** https://deine-url.com/admin
   - Mit Passwort einloggen
   - Location ändern

3. **API:** https://deine-url.com/api/current
   - Sollte JSON zurückgeben

---

**Glückwunsch! Deine App ist live! 🎊**
