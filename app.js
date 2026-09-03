const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let stars = [];
let observerLat = 20;
let observerLon = 0;
let renderedStars = [];
let highlightedStarName = null;
let showGrid = false;
let bortleLevel = 4;
let isPlaying = false;

function animateTimelapse(){
    if(!isPlaying) return;
    let value = parseInt(timeSlider.value, 10);
    value = (value + 1) % 1440;
    timeSlider.value = value;
    updateTimeLabel();
    renderSky();
    requestAnimationFrame(animateTimelapse);
}
document.getElementById('play-timelapse').addEventListener('click', (e) => {
    isPlaying = !isPlaying;
    e.target.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    if(isPlaying)animateTimelapse();
});

const bortleLimits = { 1: 7.6, 2: 7.1, 3: 6.6, 4: 6.3, 5: 5.8, 6: 5.3, 7: 5.0, 8: 4.5, 9: 4.0};

function drawLightPollution(){
    if(bortleLevel <= 1) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerRadius = Math.min(canvas.width, canvas.height) / 2;
    const intensity = (bortleLevel - 1) / 8;
    const gradient = ctx.createRadialGradient(cx, cy, outerRadius * 0.6, cx, cy, outerRadius);
    gradient.addColorStop(0, 'rgba(255, 170, 80, 0)');
    gradient.addColorStop(0, `rgba(255, 170, 80, ${intensity * 0.35})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fill();
}
document.getElementById('bortle-select').addEventListener('change', (e) => {
    bortleLevel = parseInt(e.target.value, 10);
    renderSky();
});

function drawGrid() {
    if (!showGrid) return;
    ctx.strokeStyle = '#2a3548';
    ctx.lineWidth = 0.5;

    for (const altLevel of [0, 30, 60]) {
        ctx.beginPath();
        for (let az = 0; az <= 360; az += 5) {
            const pos = altAzToScreen(altLevel, az, canvas.width, canvas.height);
            if (!pos) continue;
            if (az === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        }
        ctx.stroke();
    }
    for (let az = 0; az < 360; az += 30) {
        ctx.beginPath();
        let started = false;
        for(let alt = 0; alt <= 90; alt += 5){
            const pos = altAzToScreen(alt, az, canvas.width, canvas.height);
            if (!pos) continue;
            if (!started) { ctx.moveTo(pos.x, pos.y); started = true; }
            else ctx.lineTo(pos.x, pos.y);
        }
        ctx.stroke();
    }
}
document.getElementById('toggle-grid').addEventListener('click', (e) => {
    showGrid = !showGrid;
    e.target.classList.toggle('active', showGrid);
    renderSky();
});

let constellation = [];
let zoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

let renderPending = false;

function scheduleRender(){
    if(renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
        renderPending = false;
        renderSky();
    });
}

function screenToLogical(x, y) {
    return {
        x: (x - (canvas.width / 2 + panX)) / zoom + canvas.width / 2,
        y: (y - (canvas.height / 2 + panY)) / zoom + canvas.height / 2
    };
}

async function loadConstellations() {
    const res = await fetch('data/constellations.json');
    constellation = await res.json();
    renderSky();
}

const timeSlider = document.getElementById('time-slider');
const timeLabel = document.getElementById('time-label');

function getCurrentSkyTime() {
    const now = new Date();
    const minutes = parseInt(timeSlider.value, 10);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
}

function updateTimeLabel() {
    const time = getCurrentSkyTime();
    const h = String(time.getHours()).padStart(2, '0');
    const m = String(time.getMinutes()).padStart(2, '0');
    timeLabel.textContent = `${h}:${m}`;
}

timeSlider.addEventListener('input', () => {
    updateTimeLabel();
    renderSky();
});

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    renderSky();
}

function renderSky() {
    ctx.fillStyle = '0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLightPollution();
    ctx.save();
    ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
    drawGrid();
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const jd = getJulianDate(getCurrentSkyTime());
    const lst = getLST(jd, observerLon);

    for (const star of stars) {
        if(star.mag > bortleLimits[bortleLevel]) continue;
        const altAz = raDecToAltAz(star.ra, star.dec, lst, observerLat);
        if (altAz.alt < 0) continue;

        const pos = altAzToScreen(altAz.alt, altAz.az, canvas.width, canvas.height);
        if (!pos) continue;

        const radius = Math.max(0.5, (6.5 - star.mag) / 2);
        renderedStars.push({ x: pos.x, y: pos.y, radius, star });
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    if (highlightedStarName) {
        const found = renderedStars.find(e => e.star.name === highlightedStarName);
        const tooltip = document.getElementById('star-tooltip');
        if (found) {
            ctx.beginPath();
            ctx.arc(found.x, found.y, found.radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffd76b';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            tooltip.textContent = found.star.name;
            tooltip.style.left = found.x + 'px';
            tooltip.style.top = found.y + 'px';
            tooltip.style.display = 'block';
        } else {
            tooltip.textContent = `${highlightedStarName} is below the horizon right now`;
            tooltip.style.left = '50%';
            tooltip.style.top = '40px';
            tooltip.style.display = 'block';
        }
    }

    renderedStars = [];
    ctx.strokeStyle = '#3a4a63';
    ctx.lineWidth = 1;

    const labelPositions = [];

    for (const con of constellation) {
        const visiblePoints = [];

        for (const line of con.lines) {
            ctx.beginPath();
            let started = false;
            for (const [ra, dec] of line) {
                const altAz = raDecToAltAz(ra, dec, lst, observerLat);
                if (altAz.alt < 0) { started = false; continue; }
                const pos = altAzToScreen(altAz.alt, altAz.az, canvas.width, canvas.height);
                if (!pos) { started = false; continue; }
                visiblePoints.push(pos);
                if (!started) {
                    ctx.moveTo(pos.x, pos.y);
                    started = true;
                } else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }
            ctx.stroke();
        }

        if (visiblePoints.length < 2) continue;

        let sumX = 0; sumY = 0;
        for (const p of visiblePoints) { sumX += p.x; sumY += p.y; }
        const labelX = sumX / visiblePoints.length;
        const labelY = sumY / visiblePoints.length;

        let tooClose = false;
        for (const placed of labelPositions) {
            const dx = placed.x - labelX;
            const dy = placed.y - labelY;
            if (Math.sqrt(dx * dx + dy * dy) < 40) { tooClose = true; break; }
        }
        if (tooClose) continue;

        labelPositions.push({ x: labelX, y: labelY });
        ctx.fillStyle = '#7a86a3';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(con.name, labelX, labelY);
    }
    ctx.restore();
}

async function loadStars() {
    const res = await fetch('data/stars.json');
    stars = await res.json();
    renderSky();
}

function useLocation(position) {
    observerLat = position.coords.latitude;
    observerLon = position.coords.longitude;
    renderSky();
}

function locationFailed() {
    console.warn('location unavailable, using default lat and lon');
    document.getElementById('location-label').textContent = 'Location unavialable - using default';
}

function updateLocationLabel() {
    document.getElementById('location-label').textContent = `${observerLat.toFixed(2)}, ${observerLat.toFixed(2)}`;
}

document.getElementById('set-location').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('lat-input').value);
    const lon = parseFloat(document.getElementById('lon-input').value);
    if (isNaN(lat) || isNaN(lon)) return;
    observerLat = lat;
    observerLon = lon;
    updateLocationLabel();
    renderSky();
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(useLocation, locationFailed);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const logical = screenToLogical(e.clientX - rect.left, e.clientY - rect.top);
    const clickX = logical.x;
    const clickY = logical.y;

    let closest = null;
    let closestDist = 15;

    for (const entry of renderedStars) {
        const dx = entry.x - clientX;
        const dy = entry.y - clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
            closestDist = dist;
            closest = entry;
        }
    }
    const tooltip = document.getElementById('star-tooltip');
    if (closest) {
        tooltip.textContent = closest.star.name || closest.star.con || 'Unnamed star';
        tooltip.style.left = closest.x + 'px';
        tooltip.style.top = closest.y + 'px';
        tooltip.style.display = 'block';
    } else {
        tooltip.style.display = 'none';
    }
});

document.getElementById('search').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;

    const match = stars.find(s => s.name && s.name.toLowerCase() === query) || stars.find(s => s.name && s.name.toLowerCase().includes(query));
    const tooltip = document.getElementById('star-tooltip');
    if (match) {
        highlightedStarName = match.name;
        renderSky();
    } else {
        highlightedStarName = null;
        tooltip.textContent = 'No star found';
        tooltip.style.left = '50%';
        tooltip.style.top = '40px';
        tooltip.style.display = 'block';
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom *= e.deltaY < 0 ? 1.1 : 0.9;
    zoom = Math.max(0.5, Math.min(zoom, 5));
    scheduleRender();
});
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
});
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - dragStartX;
    panY = e.clientY - dragStartY;
    scheduleRender();
});
window.addEventListener('mouseup', () => {
    isDragging = false;
})

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateTimeLabel();
loadStars();
loadConstellations();