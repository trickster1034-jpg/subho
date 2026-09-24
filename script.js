const canvas = document.getElementById('multiverse-canvas');
const ctx = canvas.getContext('2d');
let width, height, time = 0, currentDimension = 0;

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function drawWormhole() {
    ctx.fillStyle = 'rgba(0, 0, 5, 0.3)'; ctx.fillRect(0,0,width,height);
    ctx.save(); ctx.translate(width/2, height/2);
    for(let i=0; i<100; i++) {
        let angle = (i * 0.1) + (time * 0.01);
        let radius = (i * 5) + Math.sin(time*0.05 + i)*50;
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        ctx.beginPath(); ctx.arc(x, y, i*0.05, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${200 + i + time}, 100%, 70%)`;
        ctx.fill();
    }
    ctx.restore();
}

function drawTear() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.4)'; ctx.fillRect(0,0,width,height);
    ctx.save(); ctx.translate(width/2, height/2);
    for(let j=0; j<6; j++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(time*0.02)*300, Math.cos(time*0.03)*300);
        ctx.lineTo(Math.cos(time*0.01)*400, Math.sin(time*0.04)*400);
        ctx.strokeStyle = `hsl(${time % 360}, 100%, 50%)`; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
}

function drawDark() {
    ctx.fillStyle = 'rgba(15, 0, 20, 0.2)'; ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    for(let i=0; i<10; i++) {
        let x1 = width/2 + Math.sin(time*0.02 + i)*300; let y1 = height/2 + Math.cos(time*0.03 + i)*300;
        let cp1x = width/2 + Math.cos(time*0.04 - i)*500; let cp1y = height/2 + Math.sin(time*0.02 + i)*500;
        let x2 = width/2 + Math.sin(time*0.01 + i*2)*400; let y2 = height/2 + Math.cos(time*0.05 + i*2)*400;
        ctx.moveTo(width/2, height/2); ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
    }
    ctx.strokeStyle = '#9d00ff'; ctx.lineWidth = 2; ctx.stroke();
}

function drawDimension() {
    if(currentDimension===0) drawWormhole();
    else if(currentDimension===1) drawTear();
    else drawDark();
    time++; requestAnimationFrame(drawDimension);
}
drawDimension();

window.addEventListener('click', (e) => {
    if (document.getElementById('scene-2').classList.contains('active-scene') && e.target.tagName !== 'BUTTON') {
        currentDimension = (currentDimension + 1) % 3; time = 0;
    }
});

let micActive = false;
navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser = audioContext.createAnalyser();
    let microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser); analyser.fftSize = 256;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
    function detectBlow() {
        analyser.getByteFrequencyData(dataArray);
        let average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (average > 25) extinguishCandles(); 
        else requestAnimationFrame(detectBlow);
    }
    detectBlow();
}).catch(() => {
    document.getElementById('mic-instruction').innerText = "Mic blocked! Tap cake to blow.";
    document.querySelector('.cake-container').addEventListener('click', extinguishCandles);
});

function extinguishCandles() {
    if(micActive) return; micActive = true;
    document.querySelectorAll('.flame').forEach(f => f.classList.add('extinguished'));
    document.getElementById('mic-instruction').innerText = "Reality Warping... 🌌";
    
    // Start the looping sound continuously
    const sound = document.getElementById('bg-sound');
    sound.play().catch(e => console.log("Audio blocked by browser:", e));

    setTimeout(() => {
        document.getElementById('scene-1').classList.remove('active-scene');
        document.getElementById('scene-2').classList.add('active-scene');
    }, 2000);
}

function goToScene3() {
    // Just change the scene, audio continues looping naturally
    document.getElementById('scene-2').classList.remove('active-scene');
    document.getElementById('scene-3').classList.add('active-scene');
    setTimeout(() => { document.getElementById('curtain-container').classList.add('open'); }, 500);
}

function goToScene4() {
    document.getElementById('scene-3').classList.remove('active-scene');
    document.getElementById('scene-4').classList.add('active-scene');
    initAmongUsGame();
}

const carousel = document.getElementById('carousel');
let isDragging = false, startX, currentRotate = 0;

function handleDragStart(clientX) { isDragging = true; startX = clientX; carousel.style.transition = 'none'; }
function handleDragMove(clientX) {
    if(!isDragging) return;
    let delta = (clientX - startX) * 0.5; 
    carousel.style.transform = `rotateX(0deg) rotateY(${currentRotate + delta}deg) rotateZ(0deg)`;
}
function handleDragEnd(clientX) {
    if(!isDragging) return; isDragging = false;
    currentRotate += (clientX - startX) * 0.5;
    carousel.style.transition = 'transform 0.3s ease-out';
}

const dragArea = document.getElementById('drag-area');
dragArea.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientX));
dragArea.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX));
dragArea.addEventListener('touchend', (e) => handleDragEnd(e.changedTouches[0].clientX));
dragArea.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
window.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
window.addEventListener('mouseup', (e) => handleDragEnd(e.clientX));

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
const targetSquare = document.getElementById('target-square');
const l_tl = document.getElementById('line-tl'), l_tr = document.getElementById('line-tr');
const l_bl = document.getElementById('line-bl'), l_br = document.getElementById('line-br');
const sqSize = 125; 

function updateLines() {
    let w = window.innerWidth, h = window.innerHeight;
    targetSquare.style.left = targetX + 'px';
    targetSquare.style.top = targetY + 'px';
    
    l_tl.setAttribute('x1', 0); l_tl.setAttribute('y1', 0);
    l_tl.setAttribute('x2', targetX - sqSize); l_tl.setAttribute('y2', targetY - sqSize);
    
    l_tr.setAttribute('x1', w); l_tr.setAttribute('y1', 0);
    l_tr.setAttribute('x2', targetX + sqSize); l_tr.setAttribute('y2', targetY - sqSize);
    
    l_bl.setAttribute('x1', 0); l_bl.setAttribute('y1', h);
    l_bl.setAttribute('x2', targetX - sqSize); l_bl.setAttribute('y2', targetY + sqSize);
    
    l_br.setAttribute('x1', w); l_br.setAttribute('y1', h);
    l_br.setAttribute('x2', targetX + sqSize); l_br.setAttribute('y2', targetY + sqSize);
}

const interactionLayer = document.getElementById('interactive-layer');
interactionLayer.addEventListener('pointermove', (e) => {
    targetX = e.clientX; targetY = e.clientY; updateLines();
});
interactionLayer.addEventListener('pointerdown', (e) => {
    targetX = e.clientX; targetY = e.clientY; updateLines();
});

let gameScore = 0; let gameActive = false;
function initAmongUsGame() {
    gameActive = true; updateLines(); spawnEntity();
}

function spawnEntity() {
    if(!gameActive) return;
    const isBomb = Math.random() < 0.2; 
    const el = document.createElement('div');
    el.className = isBomb ? 'bomb' : 'asteroid';
    
    let startXPos = Math.random() * (window.innerWidth - 60);
    el.style.left = startXPos + 'px';
    el.style.top = '-60px';
    document.getElementById('scene-4').appendChild(el);

    let posY = -60, posX = startXPos, rotation = 0;
    let speedY = Math.random() * 3 + 2, speedX = (Math.random() - 0.5) * 4;

    let interval = setInterval(() => {
        posY += speedY; posX += speedX; rotation += 2;
        el.style.top = posY + 'px'; el.style.left = posX + 'px'; el.style.transform = `rotate(${rotation}deg)`;
        if(posY > window.innerHeight + 100) { clearInterval(interval); el.remove(); }
    }, 20);

    el.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); clearInterval(interval);
        
        if (isBomb) {
            document.getElementById('jumpscare').style.display = 'block';
            setTimeout(() => { document.getElementById('jumpscare').style.display = 'none'; }, 2000);
            el.remove();
        } else {
            el.style.background = '#0f0';
            setTimeout(() => el.remove(), 50);
            gameScore++;
            document.getElementById('score').innerText = gameScore;
            if(gameScore >= 10) {
                gameActive = false;
                document.querySelector('.chat-text').innerText = "TASK COMPLETED! SUS ඞ";
                document.querySelector('.chat-text').style.color = "#0f0";
            }
        }
    });

    if(gameScore < 10) setTimeout(spawnEntity, Math.random() * 800 + 400);
}
