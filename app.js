// Internationalisation
const translations = {
    en: {
        'app.title': 'Line of Sight',
        'app.subtitle': 'Radio Operator Tool',
        'point.a': 'Point A (Start)',
        'point.b': 'Point B (End)',
        'height.label': 'Antenna Height (m)',
        'no.point': 'No point selected',
        'freq.label': 'Frequency (MHz)',
        'tooltip.freq': 'Used to calculate 60% Fresnel zone clearance. Set to 0 to disable.',
        'kfactor.label': 'Radio Propagation (k=4/3)',
        'tooltip.kfactor': 'Accounts for atmospheric refraction in VHF/UHF bands.',
        'tooltip.kfactor.mobile': 'Accounts for atmospheric refraction in VHF/UHF bands.',
        'calculate.btn': 'Calculate LOS',
        'distance.label': 'Distance',
        'locator.a': 'A Locator',
        'locator.b': 'B Locator',
        'bearing.ab': 'Bearing A\u2192B',
        'bearing.ba': 'Bearing B\u2192A',
        'clear.btn': 'Clear All',
        'results.title': 'Elevation Profile',
        'status.no-data': 'No Data',
        'status.clear': 'Clear LOS',
        'status.obstructed': 'Obstructed',
        'status.fresnel-risk': 'Fresnel Risk',
        'mobile.point-a': 'Point A',
        'mobile.point-b': 'Point B',
        'mobile.antenna-a': 'ANTENNA A (m)',
        'mobile.antenna-b': 'ANTENNA B (m)',
        'mobile.freq': 'FREQUENCY (MHz)',
        'mobile.calculate': 'CALCULATE',
        'mobile.dist': 'Dist',
        'mobile.loc-a': 'A Loc',
        'mobile.loc-b': 'B Loc',
        'settings.advanced': 'Advanced Settings',
        'settings.kfactor': 'Radio (k=4/3)',
        'settings.theme': 'Theme Mode',
        'settings.language': 'Language',
        'loader.text': 'Computing LOS...',
        'chart.km': 'km',
        'chart.m': 'm',
        'error.rate-limit': 'Too many requests. Please wait a minute.',
        'error.bad-request': 'Bad request. Path might be invalid.',
        'error.elevation-api': 'Unexpected elevation data from API.',
        'error.elevation-fail': 'Elevation fetch failed',
    },
    pl: {
        'app.title': 'Line of Sight',
        'app.subtitle': '',
        'point.a': 'Punkt A (Start)',
        'point.b': 'Punkt B (Koniec)',
        'height.label': 'Wysoko\u015b\u0107 Anteny (m)',
        'no.point': 'Nie wybrano punktu',
        'freq.label': 'Cz\u0119stotliwo\u015b\u0107 (MHz)',
        'tooltip.freq': 'S\u0142u\u017cy do obliczenia 60% strefy Fresnela. Wpisz 0, aby wy\u0142\u0105czy\u0107.',
        'kfactor.label': 'Propagacja Radiowa (k=4/3)',
        'tooltip.kfactor': 'Uwzgl\u0119dnia refrakcj\u0119 atmosferyczn\u0105 w pasmach VHF/UHF.',
        'tooltip.kfactor.mobile': 'Uwzgl\u0119dnia refrakcj\u0119 atmosferyczn\u0105 w pasmach VHF/UHF.',
        'calculate.btn': 'Oblicz Zasi\u0119g',
        'distance.label': 'Odleg\u0142o\u015b\u0107',
        'locator.a': 'Lokator A',
        'locator.b': 'Lokator B',
        'bearing.ab': 'Azymut A\u2192B',
        'bearing.ba': 'Azymut B\u2192A',
        'clear.btn': 'Wyczy\u015b\u0107',
        'results.title': 'Profil Terenu',
        'status.no-data': 'Brak Danych',
        'status.clear': 'Wolna LOS',
        'status.obstructed': 'Zas\u0142oni\u0119ty',
        'status.fresnel-risk': 'Ryzyko Fresnela',
        'mobile.point-a': 'Punkt A',
        'mobile.point-b': 'Punkt B',
        'mobile.antenna-a': 'ANTENA A (m)',
        'mobile.antenna-b': 'ANTENA B (m)',
        'mobile.freq': 'CZ\u0118STOTLIWO\u015a\u0106 (MHz)',
        'mobile.calculate': 'OBLICZ',
        'mobile.dist': 'Odl.',
        'mobile.loc-a': 'Lok. A',
        'mobile.loc-b': 'Lok. B',
        'settings.advanced': 'Ustawienia',
        'settings.kfactor': 'Radio (k=4/3)',
        'settings.theme': 'Motyw',
        'settings.language': 'J\u0119zyk',
        'loader.text': 'Obliczanie zasi\u0119gu\u2026',
        'chart.km': 'km',
        'chart.m': 'm',
        'error.rate-limit': 'Zbyt wiele zapyta\u0144. Poczekaj chwil\u0119.',
        'error.bad-request': 'B\u0142\u0119dne zapytanie. \u015acie\u017cka mo\u017ce by\u0107 nieprawid\u0142owa.',
        'error.elevation-api': 'Nieoczekiwane dane wysoko\u015bci z API.',
        'error.elevation-fail': 'Pobieranie danych terenu nieudane',
    }
};

const browserLang = navigator.language?.startsWith('pl') ? 'pl' : 'en';
let currentLang = localStorage.getItem('lang') || browserLang;
const t = (key) => translations[currentLang][key] ?? translations.en[key];

const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-tip]').forEach(el => {
        el.setAttribute('data-tip', t(el.dataset.i18nTip));
    });
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.textContent = lang.toUpperCase();
    });

    if (!state.pointA) updateUISync('coords-a-display', t('no.point'));
    if (!state.pointB) updateUISync('coords-b-display', t('no.point'));

    if (!state.elevationData.length) {
        document.querySelectorAll('[id^="status-badge"]').forEach(el => {
            el.innerText = t('status.no-data');
        });
    } else {
        processLOS();
    }
};

// State Management
let isCalculating = false;
let state = {
    pointA: null,
    pointB: null,
    distance: 0,
    bearingAB: 0,
    bearingBA: 0,
    elevationData: [],
    chart: null,
    activePoint: 'A'
};

// Configuration
const CONFIG = {
    EARTH_RADIUS: 6371000,
    K_FACTOR: 4/3,
    TOPO_TILES: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    DARK_TILES: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    ATTRIBUTION: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    DARK_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};

// Initialize Theme
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

// Initialize Map
const map = L.map('map', { zoomControl: false, tap: true }).setView([52.2297, 21.0122], 6);
let currentTileLayer = L.tileLayer(prefersDark ? CONFIG.DARK_TILES : CONFIG.TOPO_TILES, {
    attribution: prefersDark ? CONFIG.DARK_ATTRIBUTION : CONFIG.ATTRIBUTION,
    maxZoom: prefersDark ? 20 : 17,
    subdomains: prefersDark ? 'abcd' : 'abc'
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

// Search
const geocoder = L.Control.geocoder({ defaultMarkGeocode: false, position: 'topright', placeholder: 'Search...' })
    .on('markgeocode', e => {
        map.fitBounds(e.geocode.bbox);
        const center = e.geocode.center;
        if (!state.pointA) setPoint('A', center);
        else if (!state.pointB) setPoint('B', center);
        else setPoint(state.activePoint, center);
    })
    .addTo(map);

// Locate
const LocateControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'bg-base-100 flex items-center justify-center cursor-pointer', container);
        button.innerHTML = '<i data-lucide="locate-fixed" class="w-4 h-4"></i>';
        button.onclick = () => map.locate({ setView: true, maxZoom: 14 });
        return container;
    }
});
map.addControl(new LocateControl());
map.on('locationfound', e => { if (!state.pointA) setPoint('A', e.latlng); lucide.createIcons(); });

// Icons
const iconA = L.divIcon({ className: 'custom-div-icon', html: `<div class="w-8 h-8 bg-primary rounded-full border-4 border-base-100 shadow-lg flex items-center justify-center text-primary-content font-bold">A</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
const iconB = L.divIcon({ className: 'custom-div-icon', html: `<div class="w-8 h-8 bg-secondary rounded-full border-4 border-base-100 shadow-lg flex items-center justify-center text-secondary-content font-bold">B</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });

// UI Sync Helpers
const getAntennaHeight = (point) => {
    const selector = point === 'A' ? '.h-a-input' : '.h-b-input';
    const inputs = document.querySelectorAll(selector);
    return Math.max(0, parseFloat(inputs[0].value) || 0);
};

// Adaptive sample count: ~2 per km, min 100, max 500
const getSampleCount = (distKm) => Math.min(500, Math.max(100, Math.ceil(distKm * 2)));

const getFrequency = () => {
    const inputs = document.querySelectorAll('.freq-input');
    return Math.max(0, parseFloat(inputs[0].value) || 0);
};

const updateUISync = (key, value) => {
    document.querySelectorAll(`.${key}`).forEach(el => {
        if (el.tagName === 'INPUT') el.value = value;
        else el.innerHTML = value;
    });
};

const setActivePoint = (point) => {
    state.activePoint = point;
    
    // Sync Desktop Accordion
    document.getElementById(`accordion-${point.toLowerCase()}`).checked = true;
    
    // Sync Mobile Selector Buttons
    const btnA = document.getElementById('mobile-select-a');
    const btnB = document.getElementById('mobile-select-b');
    if (point === 'A') {
        btnA.className = 'btn btn-sm btn-primary no-animation rounded-lg';
        btnB.className = 'btn btn-sm btn-ghost no-animation rounded-lg';
    } else {
        btnA.className = 'btn btn-sm btn-ghost no-animation rounded-lg';
        btnB.className = 'btn btn-sm btn-secondary no-animation rounded-lg';
    }
};

// Map Events
map.on('click', e => {
    // Reset stale elevation data when moving points
    state.elevationData = [];
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
    // Hide results panels as they are now stale
    document.getElementById('results-panel-desktop').classList.add('translate-y-[120%]');
    document.getElementById('bottom-sheet').classList.remove('expanded');

    if (state.activePoint === 'A') {
        setPoint('A', e.latlng);
        // Automatically switch to B if this was the first placement of A
        if (!state.pointB) setActivePoint('B');
    } else {
        setPoint('B', e.latlng);
    }
});

// Selector Button Events
document.getElementById('mobile-select-a').onclick = () => setActivePoint('A');
document.getElementById('mobile-select-b').onclick = () => setActivePoint('B');
document.getElementById('accordion-a').onchange = () => state.activePoint = 'A';
document.getElementById('accordion-b').onchange = () => state.activePoint = 'B';

// Maidenhead Locator Conversion
function getMaidenhead(lat, lon) {
    lon += 180;
    lat += 90;

    const fieldLon = String.fromCharCode(65 + Math.floor(lon / 20));
    const fieldLat = String.fromCharCode(65 + Math.floor(lat / 10));

    const squareLon = Math.floor((lon % 20) / 2).toString();
    const squareLat = Math.floor(lat % 10).toString();

    const subsquareLon = String.fromCharCode(97 + Math.floor(((lon % 2) * 12)));
    const subsquareLat = String.fromCharCode(97 + Math.floor(((lat % 1) * 24)));

    return fieldLon + fieldLat + squareLon + squareLat + subsquareLon + subsquareLat;
}

function setPoint(label, latlng) {
    const isA = label === 'A';
    const markerKey = isA ? 'pointA' : 'pointB';
    const icon = isA ? iconA : iconB;

    if (state[markerKey]?.marker) {
        state[markerKey].marker.setLatLng(latlng);
    } else {
        const marker = L.marker(latlng, { icon, draggable: true }).addTo(map);
        marker.on('drag', () => updatePath());
        marker.on('dragend', () => updatePath());
        state[markerKey] = { marker };
    }
    state[markerKey].lat = latlng.lat;
    state[markerKey].lng = latlng.lng;
    
    const locator = getMaidenhead(latlng.lat, latlng.lng);
    updateUISync(isA ? 'coords-a-display' : 'coords-b-display', `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    updateUISync(isA ? 'locator-a-display' : 'locator-b-display', locator);
    
    updatePath();
}

let pathLine = null;
function updatePath() {
    if (!state.pointA || !state.pointB) return;

    // Sync state with current marker positions (crucial for drag)
    const latlngA = state.pointA.marker.getLatLng();
    const latlngB = state.pointB.marker.getLatLng();
    
    state.pointA.lat = latlngA.lat;
    state.pointA.lng = latlngA.lng;
    state.pointB.lat = latlngB.lat;
    state.pointB.lng = latlngB.lng;

    // Update coordinate/locator displays in real-time during drag
    updateUISync('coords-a-display', `${state.pointA.lat.toFixed(4)}, ${state.pointA.lng.toFixed(4)}`);
    updateUISync('coords-b-display', `${state.pointB.lat.toFixed(4)}, ${state.pointB.lng.toFixed(4)}`);
    updateUISync('locator-a-display', getMaidenhead(state.pointA.lat, state.pointA.lng));
    updateUISync('locator-b-display', getMaidenhead(state.pointB.lat, state.pointB.lng));

    const latlngs = [latlngA, latlngB];
    if (pathLine) pathLine.setLatLngs(latlngs);
    else pathLine = L.polyline(latlngs, { color: '#10b981', weight: 3, dashArray: '10, 10' }).addTo(map);

    const from = turf.point([state.pointA.lng, state.pointA.lat]);
    const to = turf.point([state.pointB.lng, state.pointB.lat]);
    state.distance = turf.distance(from, to);
    state.bearingAB = (turf.bearing(from, to) + 360) % 360;
    state.bearingBA = (turf.bearing(to, from) + 360) % 360;

    updateUISync('dist-display', `${state.distance.toFixed(2)} km`);
    updateUISync('bearing-ab-display', `${Math.round(state.bearingAB)}°`);
    updateUISync('bearing-ba-display', `${Math.round(state.bearingBA)}°`);

    // Reset stale results if we are dragging
    state.elevationData = [];
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
    document.querySelectorAll('[id^="status-badge"]').forEach(el => {
        el.innerText = t('status.no-data');
        el.className = 'badge badge-lg gap-2 font-bold py-4 badge-ghost opacity-30 uppercase tracking-widest text-[10px]';
    });
}

function showError(msg) {
    const toast = document.getElementById('error-toast');
    const message = document.getElementById('error-message');
    message.innerText = msg;
    toast.classList.remove('hidden');
    lucide.createIcons(); // To render alert-circle icon
    setTimeout(() => toast.classList.add('hidden'), 5000);
}

async function calculateLOS() {
    if (!state.pointA || !state.pointB) return;
    if (isCalculating) return;
    isCalculating = true;
    document.getElementById('loader').classList.remove('hidden');
    
    const from = [state.pointA.lng, state.pointA.lat];
    const to = [state.pointB.lng, state.pointB.lat];
    const line = turf.lineString([from, to]);
    const length = turf.length(line);
    const sampleCount = getSampleCount(length);
    const points = [];

    for (let i = 0; i <= sampleCount; i++) {
        const p = turf.along(line, (length / sampleCount) * i);
        points.push({ lat: p.geometry.coordinates[1], lng: p.geometry.coordinates[0], dist: (length / sampleCount) * i * 1000 });
    }

    try {
        let allElevations = [];
        for (let i = 0; i < points.length; i += 50) {
            const batch = points.slice(i, i + 50);
            const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${batch.map(p=>p.lat).join(',')}&longitude=${batch.map(p=>p.lng).join(',')}`);
            
            if (!res.ok) {
                if (res.status === 429) throw new Error(t('error.rate-limit'));
                if (res.status === 400) throw new Error(t('error.bad-request'));
                throw new Error(`API Error: ${res.status}`);
            }
            
            const data = await res.json();
            if (!Array.isArray(data.elevation) || data.elevation.length !== batch.length) {
                throw new Error(t('error.elevation-api'));
            }
            allElevations = allElevations.concat(data.elevation);
        }
        state.elevationData = points.map((p, i) => ({ ...p, elevation: allElevations[i] }));
        processLOS();
        
        // Show results
        if (window.innerWidth < 1024) {
            document.getElementById('bottom-sheet').classList.add('expanded');
        } else {
            document.getElementById('results-panel-desktop').classList.remove('translate-y-[120%]');
        }
    } catch (e) {
        showError(e.message || t('error.elevation-fail'));
    } finally {
        isCalculating = false;
        document.getElementById('loader').classList.add('hidden');
    }
}

function processLOS() {
    if (!state.elevationData.length) return;
    const hA = getAntennaHeight('A');
    const hB = getAntennaHeight('B');
    const isRadio = document.querySelector('.k-factor-toggle').checked;
    const Re = CONFIG.EARTH_RADIUS * (isRadio ? CONFIG.K_FACTOR : 1);

    const freqMHz = getFrequency();
    const lambda = freqMHz > 0 ? (3e8 / (freqMHz * 1e6)) : 0;

    const totalDist = state.elevationData[state.elevationData.length - 1].dist;
    const startH = state.elevationData[0].elevation + hA;
    const endH = state.elevationData[state.elevationData.length - 1].elevation + hB;

    let obstructed = false;
    let fresnelObstructed = false;
    const profile = state.elevationData.map(p => {
        const bulge = (p.dist * (totalDist - p.dist)) / (2 * Re);
        const effH = p.elevation + bulge;
        const losH = startH + (endH - startH) * (p.dist / totalDist);
        if (effH > losH) obstructed = true;

        let fresnelR = 0;
        if (lambda > 0 && p.dist > 0 && p.dist < totalDist) {
            fresnelR = Math.sqrt(lambda * p.dist * (totalDist - p.dist) / totalDist);
            if (effH <= losH && (losH - effH) < 0.6 * fresnelR) fresnelObstructed = true;
        }

        return { x: p.dist / 1000, y: p.elevation, effY: effH, losY: losH, fresnelR };
    });

    renderChart(profile, obstructed, fresnelObstructed);

    const badgeText = obstructed ? t('status.obstructed') : (fresnelObstructed ? t('status.fresnel-risk') : t('status.clear'));
    const badgeClass = obstructed ? 'badge-error' : (fresnelObstructed ? 'badge-warning' : 'badge-success');
    
    // Update all status badges (Desktop and Mobile)
    document.querySelectorAll('[id^="status-badge"]').forEach(el => {
        el.innerText = badgeText;
        el.className = `badge badge-lg gap-2 font-bold py-4 ${badgeClass}`;
    });
    
    if (pathLine) pathLine.setStyle({ color: obstructed ? '#f97316' : '#10b981' });
}

function renderChart(profile, obstructed, fresnelObstructed) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const textColor = isLight ? '#374151' : '#9ca3af';

    // Identify active chart canvas based on viewport
    const chartId = window.innerWidth < 1024 ? 'elevationChartMobile' : 'elevationChartDesktop';
    const ctx = document.getElementById(chartId).getContext('2d');

    if (state.chart) state.chart.destroy();

    const hasFresnel = profile.some(p => p.fresnelR > 0);
    const fresnelColor = fresnelObstructed ? 'rgba(234, 179, 8, 0.5)' : 'rgba(234, 179, 8, 0.3)';
    // Use orange (#f97316) for obstructed — distinguishable from green even with red-green color blindness
    const losColor = obstructed ? '#f97316' : '#10b981';
    const datasets = [
        { label: 'Terrain', data: profile.map(p => p.y), borderColor: '#6b7280', fill: true, pointRadius: 0, borderWidth: 1 },
        // Dashed line for Effective Earth — differentiates by pattern, not color alone
        { label: 'Effective Earth', data: profile.map(p => p.effY), borderColor: '#3b82f6', borderDash: [6, 3], fill: true, pointRadius: 0, borderWidth: 2 },
        { label: 'LOS Ray', data: profile.map(p => p.losY), borderColor: losColor, borderWidth: 3, pointRadius: 0 }
    ];

    if (hasFresnel) {
        datasets.push(
            { label: 'Fresnel Zone (60%)', data: profile.map(p => p.fresnelR > 0 ? p.losY + 0.6 * p.fresnelR : null), borderColor: fresnelColor, borderDash: [4, 4], fill: false, pointRadius: 0, borderWidth: 1 },
            { label: '_fresnel_lower', data: profile.map(p => p.fresnelR > 0 ? p.losY - 0.6 * p.fresnelR : null), borderColor: fresnelColor, borderDash: [4, 4], fill: '-1', backgroundColor: 'rgba(234, 179, 8, 0.05)', pointRadius: 0, borderWidth: 1 }
        );
    }

    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: profile.map(p => p.x.toFixed(1)),
            datasets
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: t('chart.km'), color: textColor }, ticks: { color: textColor, maxRotation: 0 }, grid: { display: false } },
                y: { title: { display: true, text: t('chart.m'), color: textColor }, ticks: { color: textColor } }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        boxWidth: 16,
                        boxHeight: 3,
                        padding: 12,
                        font: { size: 10 },
                        filter: item => !item.text.startsWith('_')
                    }
                }
            }
        }
    });
}

// Global Event Listeners
document.querySelectorAll('.calculate-trigger').forEach(btn => btn.onclick = calculateLOS);
document.querySelectorAll('.clear-trigger').forEach(btn => btn.onclick = () => {
    if (state.pointA?.marker) map.removeLayer(state.pointA.marker);
    if (state.pointB?.marker) map.removeLayer(state.pointB.marker);
    if (pathLine) map.removeLayer(pathLine);
    state.pointA = state.pointB = pathLine = null;
    state.elevationData = [];
    state.distance = 0;
    state.bearingAB = 0;
    state.bearingBA = 0;
    updateUISync('coords-a-display', t('no.point'));
    updateUISync('coords-b-display', t('no.point'));
    updateUISync('locator-a-display', '');
    updateUISync('locator-b-display', '');
    updateUISync('dist-display', '0.00 km');
    updateUISync('bearing-ab-display', '0°');
    updateUISync('bearing-ba-display', '0°');

    document.querySelectorAll('[id^="status-badge"]').forEach(el => {
        el.innerText = t('status.no-data');
        el.className = 'badge badge-lg gap-2 font-bold py-4 badge-ghost opacity-30 uppercase tracking-widest text-[10px]';
    });

    if (state.chart) { state.chart.destroy(); state.chart = null; }
    document.getElementById('bottom-sheet').classList.remove('expanded');
    document.getElementById('results-panel-desktop').classList.add('translate-y-[120%]');
    setActivePoint('A');
});

// Theme Logic
const handleTheme = (isLight) => {
    document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
    
    // Sync both toggles
    document.getElementById('theme-toggle').checked = isLight;
    document.getElementById('theme-toggle-mobile').checked = isLight;

    map.removeLayer(currentTileLayer);
    currentTileLayer = L.tileLayer(isLight ? CONFIG.TOPO_TILES : CONFIG.DARK_TILES, {
        attribution: isLight ? CONFIG.ATTRIBUTION : CONFIG.DARK_ATTRIBUTION,
        maxZoom: isLight ? 17 : 20,
        subdomains: isLight ? 'abc' : 'abcd'
    }).addTo(map);
    if (state.elevationData.length) processLOS();
};

document.getElementById('theme-toggle').onchange = e => handleTheme(e.target.checked);
document.getElementById('theme-toggle-mobile').onchange = e => handleTheme(e.target.checked);

// Inputs sync
document.querySelectorAll('.h-a-input, .h-b-input, .k-factor-toggle, .freq-input').forEach(input => {
    input.oninput = () => {
        if (input.type === 'number' && input.min !== '' && parseFloat(input.value) < parseFloat(input.min)) {
            input.value = input.min;
        }
        const val = input.type === 'checkbox' ? input.checked : input.value;
        let selector = '';
        if (input.classList.contains('h-a-input')) selector = '.h-a-input';
        else if (input.classList.contains('h-b-input')) selector = '.h-b-input';
        else if (input.classList.contains('k-factor-toggle')) selector = '.k-factor-toggle';
        else if (input.classList.contains('freq-input')) selector = '.freq-input';
        
        if (selector) {
            document.querySelectorAll(selector).forEach(other => {
                if (other !== input) {
                    if (other.type === 'checkbox') other.checked = val;
                    else other.value = val;
                }
            });
        }
        if (state.elevationData.length) processLOS();
    };
});

// Sidebar Toggle
const sidebar = document.getElementById('desktop-sidebar');
const sToggle = document.getElementById('sidebar-toggle');
sToggle.onclick = () => {
    const isHidden = sidebar.style.transform === 'translateX(-100%)';
    sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
    sToggle.style.left = isHidden ? '20rem' : '1rem';
    sToggle.innerHTML = isHidden ? '<i data-lucide="chevron-left"></i>' : '<i data-lucide="chevron-right"></i>';
    lucide.createIcons();
    setTimeout(() => map.invalidateSize(), 300);
};

// Mobile Sheet Handle & Gestures
const sheet = document.getElementById('bottom-sheet');
const handle = document.getElementById('sheet-handle');
let startY, currentY;

handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    sheet.style.transition = 'none'; // Disable transition during drag
});

handle.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY < 0 && !sheet.classList.contains('expanded')) {
        // Sliding up to expand
        sheet.style.transform = `translateY(calc(100% - 3rem + ${deltaY}px))`;
    } else if (deltaY > 0 && sheet.classList.contains('expanded')) {
        // Sliding down to collapse
        sheet.style.transform = `translateY(${deltaY}px)`;
    }
});

handle.addEventListener('touchend', (e) => {
    sheet.style.transition = ''; // Re-enable transition
    const deltaY = (currentY ?? startY) - startY;
    
    if (Math.abs(deltaY) > 50) {
        if (deltaY < 0) sheet.classList.add('expanded');
        else sheet.classList.remove('expanded');
    }
    
    sheet.style.transform = ''; // Clear inline style to let CSS take over
    startY = currentY = null;
});

handle.onclick = () => sheet.classList.toggle('expanded');

// Language Toggle
document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.onclick = () => setLanguage(currentLang === 'en' ? 'pl' : 'en');
});

// Apply saved language on load
setLanguage(currentLang);

// Auto-init
lucide.createIcons();
let resizeTimer;
window.onresize = () => {
    map.invalidateSize();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (state.elevationData.length) processLOS();
    }, 300);
};
