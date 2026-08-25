const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let stars = [];
let observerLat = 20;
let observerLon = 0;
let constellation = [];

async function loadConstellations() {
    const res = await fetch('data/constellations.json');
    constellation = await res.json();
    renderSky();
}

const timeSlider = document.getElementById('time-slider');
const timeLabel = document.getElementById('time-label');

function getCurrentSkyTime(){
    const now = new Date();
    const minutes = parseInt(timeSlider.value, 10);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
}

function updateTimeLabel(){
    const time = getCurrentSkyTime();
    const h = String(time.getHours()).padStart(2, '0');
    const m = String(time.getMinutes()).padStart(2, '0');
    timeLabel.textContent = `${h}:${m}`;
}

timeSlider.addEventListener('input', () => {
    updateTimeLabel();
    renderSky();
});

function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    renderSky();
}

function renderSky(){
    ctx.fillStyle = '0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const jd = getJulianDate(getCurrentSkyTime());
    const lst = getLST(jd, observerLon);
    console.log('canvas size:', canvas.width, canvas.height, 'devicePixelRatio:', window.devicePixelRatio);
    let visibleCount = 0;

    for (const star of stars){
        const altAz = raDecToAltAz(star.ra, star.dec, lst, observerLat);
        if(altAz.alt < 0) continue;

        const pos = altAzToScreen(altAz.alt, altAz.az, canvas.width, canvas.height);
        if(!pos) continue;

        const radius = Math.max(0.5, (6.5 - star.mag) / 2);
        if(visibleCount < 5) console.log('star:', star.name || star.con, 'radius:', radius, 'pos:', pos);
        visibleCount++;
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    ctx.strokeStyle = '#3a4a63';
    ctx.lineWidth = 1;
    for(const con of constellation){
        for(const line of con.lines){
            ctx.beginPath();
            let started = false;
            for(const[ra, dec] of line){
                const altAz = raDecToAltAz(ra, dec, lst, observerLat);
                if(altAz.alt < 0) {started = false; continue;}
                const pos = altAzToScreen(altAz.alt, altAz.az, canvas.width, canvas.height);
                if(!pos){ started = false; continue; }
                if(!started){
                    ctx.moveTo(pos.x, pos.y);
                    started = true;
                } else {
                    ctx.lineTo(pos.x, pos.y);
                }
            }
            ctx.stroke();
        }
    }
    console.log('total visible stars drawn:', visibleCount);
}

async function loadStars() {
    const res = await fetch('data/stars.json');
    stars = await res.json();
    renderSky();
}

function useLocation(position){
    observerLat = position.coords.latitude;
    observerLon = position.coords.longitude;
    renderSky();
}

function locationFailed(){
    console.warn('location unavailable, using default lat and lon');
}

function updateLocationLabel(){
    document.getElementById('location-label').textContent = `${observerLat.toFixed(2)}, ${observerLat.toFixed(2)}`;
}

document.getElementById('set-location').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('lat-input').value);
    const lon = parseFloat(document.getElementById('lon-input').value);
    if(isNaN(lat) || isNaN(lon)) return;
    observerLat = lat;
    observerLon = lon;
    updateLocationLabel();
    renderSky();
});

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(useLocation, locationFailed);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateTimeLabel();
loadStars();
loadConstellations();