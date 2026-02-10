// API Base URL (für Deployment anpassen)
const API_BASE = window.location.origin;

// State
let currentPosition = null;
let targetLocation = null;
let watchId = null;
let updateInterval = null;
let deviceHeading = 0; // Gerät-Ausrichtung in Grad
let compassSupported = false;

// DOM Elemente
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const needle = document.getElementById('needle');
const destinationName = document.getElementById('destinationName');
const distanceValue = document.getElementById('distanceValue');
const directionText = document.getElementById('directionText');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');

// Initialisierung
function init() {
    console.log('🧭 Log Pose App gestartet');
    
    // Event Listeners
    retryButton.addEventListener('click', requestLocation);
    
    // Device Orientation für Kompass-Rotation
    if (window.DeviceOrientationEvent) {
        // iOS 13+ braucht Permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Zeige Button für iOS Permission
            showCompassPermission();
        } else {
            // Android oder ältere iOS Versionen
            startCompass();
        }
    } else {
        console.log('⚠️ Device Orientation nicht unterstützt');
    }
    
    // Location anfordern
    requestLocation();
    
    // Ziel-Location regelmäßig aktualisieren (alle 5 Sekunden)
    updateInterval = setInterval(fetchTargetLocation, 5000);
    
    // Initial laden
    fetchTargetLocation();
}

// Kompass Permission für iOS
function showCompassPermission() {
    // Erstelle Button für Permission
    const permBtn = document.createElement('button');
    permBtn.textContent = 'Kompass aktivieren';
    permBtn.className = 'retry-button';
    permBtn.style.position = 'fixed';
    permBtn.style.bottom = '20px';
    permBtn.style.left = '50%';
    permBtn.style.transform = 'translateX(-50%)';
    permBtn.style.zIndex = '1000';
    
    permBtn.addEventListener('click', async () => {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                startCompass();
                permBtn.remove();
            }
        } catch (error) {
            console.error('Kompass Permission Fehler:', error);
        }
    });
    
    document.body.appendChild(permBtn);
}

// Kompass starten
function startCompass() {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    compassSupported = true;
    console.log('✅ Kompass aktiviert');
}

// Device Orientation Handler
function handleOrientation(event) {
    // Alpha = Kompass-Richtung (0-360°)
    // 0° = Norden, 90° = Osten, 180° = Süden, 270° = Westen
    
    if (event.webkitCompassHeading) {
        // iOS
        deviceHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        // Android
        deviceHeading = 360 - event.alpha;
    }
    
    updateCompass();
}

// GPS-Zugriff anfordern
function requestLocation() {
    if (!navigator.geolocation) {
        showError('Dein Browser unterstützt kein GPS.');
        return;
    }
    
    hideError();
    updateStatus('Warte auf GPS...', 'loading');
    
    // GPS-Position kontinuierlich verfolgen
    watchId = navigator.geolocation.watchPosition(
        onPositionSuccess,
        onPositionError,
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );
}

// GPS-Position erfolgreich
function onPositionSuccess(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    
    console.log('📍 Position aktualisiert:', currentPosition);
    updateStatus('GPS aktiv', 'active');
    updateCompass();
}

// GPS-Fehler
function onPositionError(error) {
    console.error('GPS Fehler:', error);
    
    let message = 'Standortzugriff fehlgeschlagen.';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'Du hast den Zugriff auf deinen Standort verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Standort konnte nicht ermittelt werden. Bist du im Freien?';
            break;
        case error.TIMEOUT:
            message = 'GPS-Anfrage hat zu lange gedauert. Versuche es erneut.';
            break;
    }
    
    showError(message);
    updateStatus('GPS Fehler', 'error');
}

// Ziel-Location vom Server holen
async function fetchTargetLocation() {
    try {
        const response = await fetch(`${API_BASE}/api/current`);
        const data = await response.json();
        
        if (data.success && data.location) {
            targetLocation = data.location;
            destinationName.textContent = targetLocation.name;
            console.log('🎯 Ziel aktualisiert:', targetLocation.name);
            updateCompass();
        }
    } catch (error) {
        console.error('Fehler beim Laden des Ziels:', error);
    }
}

// Kompass aktualisieren
function updateCompass() {
    if (!currentPosition || !targetLocation) {
        return;
    }
    
    // Winkel zum Ziel berechnen (Bearing)
    const bearing = calculateBearing(
        currentPosition.lat,
        currentPosition.lng,
        targetLocation.lat,
        targetLocation.lng
    );
    
    // Distanz berechnen
    const distance = calculateDistance(
        currentPosition.lat,
        currentPosition.lng,
        targetLocation.lat,
        targetLocation.lng
    );
    
    // Nadel-Rotation: Bearing minus Device-Ausrichtung
    // Wenn Gerät nach Norden zeigt (0°) und Ziel ist bei 90° (Osten),
    // dann zeigt Nadel 90° nach rechts
    const needleRotation = bearing - deviceHeading;
    
    // Nadel rotieren
    needle.style.transform = `rotate(${needleRotation}deg)`;
    
    // Distanz anzeigen
    if (distance < 1000) {
        distanceValue.textContent = Math.round(distance);
        document.querySelector('.distance-unit').textContent = 'm';
    } else {
        distanceValue.textContent = (distance / 1000).toFixed(1);
        document.querySelector('.distance-unit').textContent = 'km';
    }
    
    // Richtung als Text
    directionText.textContent = getDirectionText(bearing);
}

// Winkel zwischen zwei Koordinaten berechnen (Bearing)
function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalisieren auf 0-360°
    return (bearing + 360) % 360;
}

// Distanz zwischen zwei Koordinaten berechnen (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Erdradius in Metern
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distanz in Metern
}

// Richtung als Text (N, NE, E, SE, S, SW, W, NW)
function getDirectionText(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

// Status aktualisieren
function updateStatus(text, state) {
    statusText.textContent = text;
    statusIndicator.className = 'status-indicator';
    if (state) {
        statusIndicator.classList.add(state);
    }
}

// Fehler anzeigen
function showError(message) {
    errorMessage.textContent = message;
    errorOverlay.classList.add('active');
}

// Fehler verstecken
function hideError() {
    errorOverlay.classList.remove('active');
}

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// App starten
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
