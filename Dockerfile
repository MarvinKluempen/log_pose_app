# Multi-stage build für optimale Image-Größe
FROM node:18-alpine AS base

# Arbeitsverzeichnis
WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm ci --only=production

# App-Code kopieren
COPY . .

# Port exponieren
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/current', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# User für Sicherheit
USER node

# Server starten
CMD ["node", "server/index.js"]
