const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let stars = [];


function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawStars();
}

function drawStars(){
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars){
        const x = (star.ra / 24) * canvas.width;
        const y = ((90 - star.dec) / 180) * canvas.height;
        const radius = Math.max(0.5, (6.5 - star.mag) / 2);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}

async function loadStars() {
    const res = await fetch('data/stars.json');
    stars = await res.json();
    drawStars();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
loadStars();