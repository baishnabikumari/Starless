const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

ctx.fillStyle = '#0a0e17';
ctx.fillRect(0, 0, canvas.width, canvas.height);