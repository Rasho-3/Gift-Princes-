// ---- SETUP ----
const galaxy = document.getElementById('galaxy');
const heartCanvas = document.getElementById('heartParticles');
const fireCanvas = document.getElementById('fireworks');
const gctx = galaxy.getContext('2d');
const hctx = heartCanvas.getContext('2d');
const fctx = fireCanvas.getContext('2d');

let W, H;

// --- COLOR BASE que usan los botones ---
let colorBase = "#FF2424"; // Rojo por defecto

// --- Funciones conversión hex -> HSL ---
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
  let num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if(max == min){
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s*100, l*100];
}
function baseColorHSL(hex) {
  const rgb = hexToRgb(hex);
  return rgbToHsl(...rgb);
}

// ---- REDIMENSIONA ----
function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  galaxy.width = W; galaxy.height = H;
  heartCanvas.width = W; heartCanvas.height = H;
  fireCanvas.width = W; fireCanvas.height = H;
  drawStars();
  fillHeartParticles();
}
window.addEventListener('resize', resizeCanvas);

// ---- GALAXY BACKGROUND ----
function drawStars() {
  gctx.clearRect(0, 0, W, H);
  for (let i = 0; i < 340; i++) {
    let x = Math.random() * W;
    let y = Math.random() * H;
    let r = Math.random() * 1.4 + 0.4;
    gctx.beginPath();
    gctx.arc(x, y, r, 0, 2 * Math.PI);
    gctx.fillStyle = `rgba(255,255,${220 + Math.floor(Math.random()*35)},${0.66 + Math.random()*0.29})`;
    gctx.shadowColor = '#fff9ee';
    gctx.shadowBlur = Math.random() * 19 + 6;
    gctx.fill();
  }
}

// ---- HEART PARTICLES ----
let heartParticles = [];

function heartFormula(t, scale=1) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
  return [scale*x, -scale*y];
}

class HeartStar {
  constructor(baseX, baseY) {
    this.baseX = baseX;
    this.baseY = baseY;
    this.radius = 1.3 + Math.random()*2.6 + Math.pow(Math.random(),2)*2.8;
    let [h,s,l] = baseColorHSL(colorBase);
    const hue = h + (Math.random()*18 - 9);
    const sat = Math.max(60, Math.min(s + (Math.random()*15-7), 98));
    const lum = Math.max(50, Math.min(l + (Math.random()*16-7), 95));
    this.color = `hsl(${hue}, ${sat}%, ${lum}%)`;
    this.twinkleSeed = Math.random()*10;
    this.twinkleSpeed = 1 + Math.random()*1.84;
    this.amplitude = 3 + Math.random()*20;
    this.angle = Math.random()*2*Math.PI;
    this.speed = 0.012 + Math.random()*0.013;
  }
  update(time) {
    let t = time * 0.001;
    this.displayX = this.baseX + Math.cos(this.angle + t*this.speed) * this.amplitude;
    this.displayY = this.baseY + Math.sin(this.angle + t*this.speed) * this.amplitude;
  }
  draw(ctx, t) {
    let twinkle = 0.7 + 0.7 * Math.sin(t*this.twinkleSpeed + this.twinkleSeed);
    ctx.save();
    ctx.globalAlpha = twinkle * 0.92;
    ctx.beginPath();
    ctx.arc(this.displayX, this.displayY, this.radius * (0.93 + Math.random()*0.15), 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12 + this.radius*7.5*twinkle;
    ctx.fill();
    ctx.restore();
  }
}

// Núcleo galaxia brillante
function drawGalaxyCore(ctx, t) {
  let cx = W/2, cy = H/2;
  let time = t * 0.001;
  for(let i=0; i<17; i++) {
    ctx.save();
    ctx.globalAlpha = 0.062 + 0.09*(1-i/17);
    ctx.beginPath();
    ctx.arc(
      cx + Math.sin(time*1.21+i)*2.8,
      cy + Math.cos(time*1.28-i)*1.2,
      (37-i*1.6 + 9*Math.sin(time*1.1+i)),
      0, 2*Math.PI
    );
    ctx.fillStyle = `hsla(${282+44*Math.sin(time+i/2)},95%,${89-i*2}%, 1)`;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 87-5*i;
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = 0.29 + 0.31*Math.sin(time*1.32);
  ctx.translate(cx,cy);
  ctx.rotate(Math.sin(time*0.8)*0.33);
  let grad = ctx.createRadialGradient(0,0,8, 0,0,54);
  grad.addColorStop(0,"#fffbe0");
  grad.addColorStop(0.3,"#e2cafd");
  grad.addColorStop(0.7,"#9a7ffe99");
  grad.addColorStop(1,"transparent");
  ctx.beginPath();
  ctx.arc(0,0,54,0,2*Math.PI);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function fillHeartParticles() {
  heartParticles = [];
  let cx = W/2;
  let cy = H/2;
  let scale = Math.min(W, H)/27;
  let radialSteps = 36;
  let angleSteps = 120;
  for (let rF=0.90/radialSteps; rF<=1.0; rF+=1/radialSteps) {
    for(let tI=0; tI<angleSteps; tI++) {
      let t = (2 * Math.PI * tI) / angleSteps;
      let [ex, ey] = heartFormula(t, scale);
      let x = cx + ex*rF;
      let y = cy + ey*rF;
      if (Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy)) < (scale*16*0.99)) {
        heartParticles.push(new HeartStar(x, y));
      }
    }
  }
}

// Cambiar color con los botones
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    colorBase = btn.dataset.color;
    fillHeartParticles();
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});
document.querySelectorAll('.color-btn')[0].classList.add('selected');

// ------------------------------------
// Fuegos artificiales normales y especiales
// ------------------------------------
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
    const colors = ["#FF2424","#FFD700","#2277FF","#fff9","#77b2ff","#ff7dff"];
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
  }
  isDead() {return this.state===1 && this.particles.length===0;}
}

// ---- Fireworks especiales para los mensajes especiales ----
const specialMsgLeft = document.querySelector('.special-msg-left');
const specialMsgRight = document.querySelector('.special-msg-right');
let specialFireworks = [];
let specialTimers = {
  left: {shown: false, lastTime: 0, nextTime: 0},
  right: {shown: false, lastTime: 0, nextTime: 0}
};

function getSpecialFireworkPos(side) {
  let x, y;
  if(side === 'left'){
    x = 110;
    y = H - 235;
    if(W < 850) { x = 56; y = H - 225; }
  } else {
    x = W - 110;
    y = H - 235;
    if(W < 850) { x = W - 56; y = H - 225; }
  }
  return {x, y};
}
class SpecialFirework {
  constructor(side) {
    this.side = side;
    let {x, y} = getSpecialFireworkPos(side);
    this.x = x;
    this.y = H + 20;
    this.targetY = y;
    this.vx = 0;
    this.vy = -(6.7 + Math.random()*0.8);
    this.state = 0;
    this.particles = [];
    this.color = (side === 'left') ? "#FF9229" : "#FFD700";
  }
  update() {
    if(this.state === 0){
      this.y += this.vy;
      this.vy += 0.055;
      if( this.y <= this.targetY) this.explode();
    } else {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p=> p.age < p.life);
    }
  }
  draw(ctx) {
    if(this.state === 0){
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6.3, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.restore();
    } else {
      this.particles.forEach(p => p.draw(ctx));
    }
  }
  explode() {
    this.state = 1;
    for(let i=0;i<43+Math.random()*8;i++){
      const angle = (i/60)*2*Math.PI;
      const speed = 3.1 + Math.random()*1.5;
      const vx = Math.cos(angle)*speed*(0.84 + 0.16*Math.random());
      const vy = Math.sin(angle)*speed*(0.92 + 0.1*Math.random());
      this.particles.push(new FireworkParticle(
        this.x, this.y,
        this.color,
        vx, vy
      ));
    }
    showSpecialMsg(this.side);
  }
  isDead(){ return this.state===1 && this.particles.length===0;}
}
function showSpecialMsg(side){
  if(side==='left'){
    specialMsgLeft.style.display='block';
    specialTimers.left.shown = true;
    setTimeout(()=>{specialMsgLeft.style.display='none'; specialTimers.left.shown = false;}, 3000);
    specialTimers.left.lastTime = performance.now();
    specialTimers.left.nextTime = specialTimers.left.lastTime + 4000;
  } else {
    specialMsgRight.style.display='block';
    specialTimers.right.shown = true;
    setTimeout(()=>{specialMsgRight.style.display='none'; specialTimers.right.shown = false;}, 3000);
    specialTimers.right.lastTime = performance.now();
    specialTimers.right.nextTime = specialTimers.right.lastTime + 4000;
  }
}
function processSpecialFireworks(now) {
  for(const side of ['left','right']){
    if(specialFireworks.find(fw=>fw.side===side)) continue;
    if(specialTimers[side].shown) continue;

    let t = performance.now();
    if(!specialTimers[side].lastTime){
      specialTimers[side].lastTime = t-3000;
      specialTimers[side].nextTime = t+700;
    }
    if(t >= specialTimers[side].nextTime){
      specialFireworks.push(new SpecialFirework(side));
    }
  }
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

  specialFireworks.forEach(fw=>fw.update());
  specialFireworks.forEach(fw=>fw.draw(fctx));
  specialFireworks = specialFireworks.filter(fw=>!fw.isDead());
  processSpecialFireworks();
}

// ---- MAIN ANIMATION ----
function animate(time=0){
  hctx.clearRect(0,0,W,H);
  for (let p of heartParticles) {
    p.update(time);
    p.draw(hctx, time*0.01);
  }
  drawGalaxyCore(hctx, time);
  animateFireworks();
  requestAnimationFrame(animate);
}

// --- INICIAR ---
resizeCanvas();
fillHeartParticles();
animate();
