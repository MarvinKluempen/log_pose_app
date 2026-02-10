// API Base URL
const API_BASE = window.location.origin;

// State
let password = '';
let locations = [];
let currentIndex = 0;
let updateInterval = null;

// DOM Elemente
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const currentLocationName = document.getElementById('currentLocationName');
const currentLocationCoords = document.getElementById('currentLocationCoords');
const locationsList = document.getElementById('locationsList');
const nextLocationBtn = document.getElementById('nextLocationBtn');
const prevLocationBtn = document.getElementById('prevLocationBtn');
const resetBtn = document.getElementById('resetBtn');
const logoutBtn = document.getElementById('logoutBtn');
const totalLocations = document.getElementById('totalLocations');
const currentIndexEl = document.getElementById('currentIndex');
const remainingLocations = document.getElementById('remainingLocations');
const toast = document.getElementById('toast');

// Initialisierung
function init() {
    console.log('👨‍💻 Admin Panel gestartet');
    
    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    nextLocationBtn.addEventListener('click', nextLocation);
    prevLocationBtn.addEventListener('click', prevLocation);
    resetBtn.addEventListener('click', resetToStart);
    logoutBtn.addEventListener('click', logout);
    
    // Prüfen ob bereits eingeloggt (Session Storage)
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
        password = savedPassword;
        showAdminPanel();
    }
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const inputPassword = passwordInput.value;
    
    // Passwort testen durch API-Aufruf
    try {
        const response = await fetch(`${API_BASE}/api/current`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: inputPassword,
                locationIndex: 0
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            password = inputPassword;
            sessionStorage.setItem('adminPassword', password);
            showAdminPanel();
        } else {
            showLoginError('Falsches Passwort');
        }
    } catch (error) {
        showLoginError('Verbindungsfehler');
    }
}

// Admin Panel anzeigen
function showAdminPanel() {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
    
    // Daten laden
    fetchData();
    
    // Auto-Update alle 5 Sekunden
    updateInterval = setInterval(fetchData, 5000);
}

// Login-Fehler anzeigen
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 3000);
}

// Daten vom Server laden
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE}/api/locations`);
        const data = await response.json();
        
        if (data.success) {
            locations = data.locations;
            currentIndex = data.currentIndex;
            
            updateUI();
        }
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        showToast('Fehler beim Laden der Daten');
    }
}

// UI aktualisieren
function updateUI() {
    if (locations.length === 0) return;
    
    const current = locations[currentIndex];
    
    // Aktuelle Location
    currentLocationName.textContent = current.name;
    currentLocationCoords.textContent = `${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`;
    
    // Stats
    totalLocations.textContent = locations.length;
    currentIndexEl.textContent = currentIndex + 1;
    remainingLocations.textContent = locations.length - currentIndex - 1;
    
    // Locations Liste
    renderLocationsList();
}

// Locations Liste rendern
function renderLocationsList() {
    locationsList.innerHTML = '';
    
    locations.forEach((location, index) => {
        const item = document.createElement('div');
        item.className = 'location-item';
        
        if (index === currentIndex) {
            item.classList.add('active');
        }
        
        if (index < currentIndex) {
            item.classList.add('completed');
        }
        
        item.innerHTML = `
            <div class="location-icon">${getLocationIcon(index)}</div>
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
            </div>
            <div class="location-status">
                <div class="location-number">#${index + 1}</div>
            </div>
            <button 
                class="activate-btn" 
                onclick="setLocation(${index})"
                ${index === currentIndex ? 'disabled' : ''}
            >
                ${index === currentIndex ? 'Aktiv' : 'Aktivieren'}
            </button>
        `;
        
        locationsList.appendChild(item);
    });
}

// Location Icon basierend auf Index
function getLocationIcon(index) {
    if (index === 0) return '🏁';
    if (index === locations.length - 1) return '🎯';
    if (index < currentIndex) return '✅';
    if (index === currentIndex) return '📍';
    return '⭕';
}

// Location setzen
async function setLocation(index) {
    try {
        const response = await fetch(`${API_BASE}/api/current`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                locationIndex: index
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentIndex = index;
            updateUI();
            showToast(`✅ Location geändert: ${locations[index].name}`);
        } else {
            showToast('❌ Fehler beim Ändern der Location');
        }
    } catch (error) {
        console.error('Fehler:', error);
        showToast('❌ Verbindungsfehler');
    }
}

// Nächste Location
function nextLocation() {
    if (currentIndex < locations.length - 1) {
        setLocation(currentIndex + 1);
    } else {
        showToast('ℹ️ Bereits bei der letzten Location');
    }
}

// Vorherige Location
function prevLocation() {
    if (currentIndex > 0) {
        setLocation(currentIndex - 1);
    } else {
        showToast('ℹ️ Bereits bei der ersten Location');
    }
}

// Zurück zum Start
function resetToStart() {
    if (confirm('Wirklich zurück zum Start setzen?')) {
        setLocation(0);
    }
}

// Ausloggen
function logout() {
    sessionStorage.removeItem('adminPassword');
    password = '';
    
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    adminPanel.style.display = 'none';
    loginSection.style.display = 'flex';
    passwordInput.value = '';
}

// Toast Notification anzeigen
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Globale Funktion für Location-Buttons
window.setLocation = setLocation;

// Cleanup
window.addEventListener('beforeunload', () => {
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
