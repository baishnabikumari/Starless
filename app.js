const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let stars = [];
let observerLat = 20;
let observerLon = 0;

function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    renderSky();
}

function renderSky(){
    ctx.fillStyle = '0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const jd = getJulianDate(new Date());
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

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(useLocation, locationFailed);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
loadStars();