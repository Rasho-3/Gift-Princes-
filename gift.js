// Setup y dimensiones
const galaxy = document.getElementById('galaxy');
const heartCanvas = document.getElementById('heartParticles');
const fireCanvas = document.getElementById('fireworks');

const gctx = galaxy.getContext('2d');
const hctx = heartCanvas.getContext('2d');
const fctx = fireCanvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

galaxy.width = W; galaxy.height = H;
heartCanvas.width = W; heartCanvas.height = H;
fireCanvas.width = W; fireCanvas.height = H;

let globalRotation = 0;  // rotación total del canvas heartParticles al rededor del centro

// Galaxia fondo
function drawStars() {
  gctx.clearRect(0, 0, W, H);
  for (let i = 0; i < 320; i++) {
    let x = Math.random() * W;
    let y = Math.random() * H;
    let r = Math.random() * 1.2 + 0.2;
    gctx.beginPath();
    gctx.arc(x, y, r, 0, 2 * Math.PI);
    gctx.fillStyle = `rgba(255,255,${200 + Math.floor(Math.random()*55)},${0.8 + Math.random()*0.2})`;
    gctx.shadowColor = '#ffe';
    gctx.shadowBlur = Math.random() * 6 + 2;
    gctx.fill();
  }
}
drawStars();

window.addEventListener('resize', () => {
  W = window.innerWidth; H = window.innerHeight;
  galaxy.width = W; galaxy.height = H;
  heartCanvas.width = W; heartCanvas.height = H;
  fireCanvas.width = W; fireCanvas.height = H;
  drawStars();
  fillHeartPoints();
});

// Corazón con puntos
let particleColor = "#FF2424";
let heartPoints = [];
let pulseTime = 0;

function heartFormula(t, scale=1) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
  return [scale*x, -scale*y];
}

function fillHeartPoints() {
  heartPoints = [];
  let cx = W/2, cy = H/2 + 30;
  let scale = 12;
  let radialSteps = 60, angleSteps = 80;
  for (let rF=1/radialSteps; rF<=1; rF+=1/radialSteps) {
    for(let tI=0; tI<angleSteps; tI++) {
      let t = (2 * Math.PI * tI) / angleSteps;
      let [ex, ey] = heartFormula(t, scale);
      let x = cx + ex*rF;
      let y = cy + ey*rF;
      heartPoints.push({
        baseX:x,
        baseY:y,
        r:1 + Math.random()*2.2,
        alpha: 0.7 + Math.random()*0.3,
        twinkleSeed: Math.random()*Math.PI*2
      });
    }
  }
}
fillHeartPoints();

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    particleColor = btn.dataset.color;
    fillHeartPoints();
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});
document.querySelectorAll('.color-btn')[0].classList.add('selected');

// Fuegos artificiales
class FireworkParticle {
  constructor(x, y, color, vx, vy) {
    this.x=x; this.y=y; this.color=color;
    this.vx = vx; this.vy = vy;
    this.life = 68 + Math.random() * 28;
    this.age = 0;
    this.size = 2 + Math.random()*2;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.021;
    this.vx *= 0.99; this.vy *= 0.99;
    this.age++;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 1 - this.age / this.life;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 17;
    ctx.fill();
    ctx.restore();
  }
}

class Firework {
  constructor() {
    const pad = 70;
    this.x = pad + Math.random()*(W - pad*2);
    this.y = H + 10;
    this.targetY = Math.random() * H * 0.4 + H * 0.15;
    const colors = ["#FF2424","#FFD700","#34FA6F","#fff9","#77b2ff","#ff7dff"];
    this.color = colors[Math.floor(Math.random()*colors.length)];
    this.vx = (Math.random()-0.5)*1.8;
    this.vy = -(6 + Math.random()*2);
    this.state=0;
    this.particles = [];
  }
  update() {
    if(this.state === 0){
      this.x += this.vx; this.y += this.vy;
      this.vy += 0.06;
      if(this.vy > -0.2 || this.y <= this.targetY) this.explode();
    } else {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p=> p.age < p.life);
    }
  }
  draw(ctx) {
    if(this.state === 0){
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x,this.y,4.3,0,2*Math.PI);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 13;
      ctx.fill();
      ctx.restore();
    } else {
      this.particles.forEach(p => p.draw(ctx));
    }
  }
  explode() {
    this.state =1;
    for(let i=0;i<60+Math.random()*25;i++){
      const angle = (i/70)*2*Math.PI;
      const speed = 2.8 + Math.random()*1.8;
      const vx = Math.cos(angle)*speed*(0.8 + 0.45*Math.random());
      const vy = Math.sin(angle)*speed*(0.7 + 0.53*Math.random());
      this.particles.push(new FireworkParticle(this.x,this.y,this.color,vx,vy));
    }
    onFireworkExplode();
  }
  isDead() {return this.state===1 && this.particles.length===0;}
}

let fireworks = [];
function animateFireworks() {
  fctx.globalCompositeOperation = 'destination-out';
  fctx.fillStyle = 'rgba(14,7,28,0.33)';
  fctx.fillRect(0,0,W,H);
  fctx.globalCompositeOperation = 'lighter';

  if(Math.random()<0.07 && fireworks.length < 12){
    fireworks.push(new Firework());
  }
  fireworks.forEach(f => f.update());
  fireworks.forEach(f => f.draw(fctx));
  fireworks = fireworks.filter(f => !f.isDead());
}

// Texto Mi Princesa
const princessTitle = document.getElementById('princess-title');
let titleCanShow = true;
function onFireworkExplode(){
  if(!titleCanShow) return;
  titleCanShow = false;
  princessTitle.style.display = 'block';
  setTimeout(() => {
    princessTitle.style.display = 'none';
    setTimeout(() => {
      titleCanShow = true;
    }, 5000);
  }, 1800);
}

// Animación principal con rotación de pantalla para corazón y conejos
function animate(time=0){
  hctx.clearRect(0,0,W,H);

  hctx.save();
  hctx.translate(W/2, H/2);
  hctx.rotate(globalRotation);
  hctx.translate(-W/2, -H/2);

  pulseTime += 0.034;

  for(let p of heartPoints){
    const twinkle = 0.85 + 0.35 * Math.sin(pulseTime*2 + p.twinkleSeed);
    hctx.save();
    hctx.globalAlpha = p.alpha * twinkle;
    hctx.beginPath();
    hctx.arc(p.baseX, p.baseY, p.r*(0.95 + 0.25 * twinkle), 0, 2*Math.PI);
    hctx.fillStyle = particleColor;
    hctx.shadowColor = particleColor;
    hctx.shadowBlur = 15 + 6 * twinkle;
    hctx.fill();
    hctx.restore();
  }

  hctx.restore();

  globalRotation += 0.0007;

  animateFireworks();

  requestAnimationFrame(animate);
}
animate();
