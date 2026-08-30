/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { createHtmlGameCommand } from "./_htmlGameCommand.js";

export const DINO_HTML = String.raw`<style>
*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box}body{margin:0;background:transparent;font-family:Arial,sans-serif;color:#d5dde1;touch-action:manipulation;cursor:pointer}.wrap{width:100%;max-width:620px;margin:auto;padding:16px}.card{background:rgba(29,40,47,.96);border:1px solid rgba(255,255,255,.13);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)}.head{padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center}.brand{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.42)}.title{font-size:15px;font-weight:bold;color:#fff}.stats{display:flex;gap:16px;text-align:right}.score{font:700 16px monospace;color:#fff;text-shadow:0 0 12px rgba(138,166,180,.75)}.label{font-size:8px;color:rgba(255,255,255,.38);letter-spacing:1px}.main{padding:16px}.board{position:relative;background:rgba(4,9,12,.32);border:1px solid rgba(255,255,255,.09);border-radius:12px;overflow:hidden}.board canvas{display:block;width:100%;height:auto}.overlay{position:absolute;inset:0;background:rgba(10,16,20,.78);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}.hidden{display:none}.gameTitle{font-size:25px;font-weight:bold;letter-spacing:1px}.gameSub{font-size:11px;color:rgba(255,255,255,.5);margin-top:8px}.start{margin-top:16px;padding:11px 22px;border:1px solid rgba(127,163,180,.55);border-radius:9px;background:rgba(82,112,126,.45);color:#fff;font-weight:bold;font-size:11px}.status{text-align:center;font:10px monospace;color:rgba(255,255,255,.42);margin-top:10px}
</style>
<body>
<div class="wrap">
<div class="card">
<div class="head">
<div><div class="brand">N&#205;VEL DINO</div><div class="title">DINO RUNNER</div></div>
<div class="stats"><div><div class="label">PONTOS</div><div class="score" id="score">00000</div></div><div><div class="label">RECORDE</div><div class="score" id="best">00000</div></div></div>
</div>
<div class="main">
<div class="board" id="board">
<canvas id="game" width="560" height="420"></canvas>
<div id="overlay" class="overlay"><div id="gameTitle" class="gameTitle">DINO RUNNER</div><div id="gameSub" class="gameSub">TOQUE PARA PULAR &#8226; DESVIE DOS CACTOS</div><button id="start" class="start">COME&#199;AR</button></div>
</div>
<div id="status" class="status">BEST 00000 &#8226; VELOCIDADE 1.0x</div>
</div>
</div>
</div>
<script>
const c=document.getElementById('game');
const x=c.getContext('2d');
const board=document.getElementById('board');
const scoreEl=document.getElementById('score');
const bestEl=document.getElementById('best');
const statusEl=document.getElementById('status');
const overlay=document.getElementById('overlay');
const gameTitle=document.getElementById('gameTitle');
const gameSub=document.getElementById('gameSub');
const start=document.getElementById('start');

let obstacles=[];
let clouds=[];
let particles=[];
let score=0;
let best=0;
let playing=false;
let last=0;
let speed=4.2;
let spawn=70;
let ground=365;
let dino={x:55,y:329,w:28,h:36,vy:0,onGround:true,step:0};

try{best=parseInt(localStorage.getItem('takeshi_dino_best')||'0',10)||0}catch(e){best=0}

function pad(value){return String(Math.floor(value)).padStart(5,'0')}

function updateUI(){
scoreEl.textContent=pad(score);
bestEl.textContent=pad(best);
statusEl.textContent='BEST '+pad(best)+' • VELOCIDADE '+(speed/4.2).toFixed(1)+'x';
}

function seedClouds(){
clouds=[];
for(let i=0;i<5;i++)clouds.push({x:50+i*125+Math.random()*40,y:34+Math.random()*75,s:1+Math.random()*1.5});
}

function reset(){
obstacles=[];
particles=[];
score=0;
speed=4.2;
spawn=65;
playing=true;
last=0;
dino={x:55,y:329,w:28,h:36,vy:0,onGround:true,step:0};
seedClouds();
overlay.classList.add('hidden');
updateUI();
}

function jump(){
if(!playing){reset();return}
if(dino.onGround){dino.vy=-13;dino.onGround=false;burst(dino.x+12,ground,8)}
}

function burst(px,py,count){
for(let i=0;i<count;i++)particles.push({x:px,y:py,vx:-1-Math.random()*2,vy:-Math.random()*2,life:1,size:1+Math.random()*2});
}

function addObstacle(){
const tall=Math.random()>.52;
obstacles.push({x:580,y:tall?316:331,w:tall?18:15,h:tall?49:34,arms:Math.random()>.5});
}

function hit(a,b){
return a.x+5<b.x+b.w&&a.x+a.w-4>b.x&&a.y+4<b.y+b.h&&a.y+a.h-2>b.y;
}

function gameOver(){
playing=false;
best=Math.max(best,Math.floor(score));
try{localStorage.setItem('takeshi_dino_best',String(best))}catch(e){}
gameTitle.textContent='GAME OVER';
gameSub.textContent='SCORE '+pad(score)+' • TOQUE PARA TENTAR DE NOVO';
start.textContent='JOGAR NOVAMENTE';
overlay.classList.remove('hidden');
updateUI();
}

function update(dt){
speed=Math.min(12,4.2+score/180);
score+=.13*speed*dt;
spawn-=speed*dt;
if(spawn<=0){addObstacle();spawn=215+Math.random()*145-speed*5}

dino.vy+=.78*dt;
dino.y+=dino.vy*dt;
if(dino.y>=ground-dino.h){dino.y=ground-dino.h;dino.vy=0;dino.onGround=true}
dino.step+=speed*.13*dt;

for(let i=obstacles.length-1;i>=0;i--){
obstacles[i].x-=speed*dt;
if(hit(dino,obstacles[i])){gameOver();return}
if(obstacles[i].x+obstacles[i].w<0)obstacles.splice(i,1);
}

for(let i=0;i<clouds.length;i++){
clouds[i].x-=.18*speed*dt;
if(clouds[i].x<-45){clouds[i].x=590;clouds[i].y=30+Math.random()*80}
}

for(let i=particles.length-1;i>=0;i--){
const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.12*dt;p.life-=.04*dt;
if(p.life<=0)particles.splice(i,1);
}
updateUI();
}

function drawCloud(cloud){
x.fillStyle='rgba(151,168,177,.38)';
x.fillRect(cloud.x,cloud.y+6,28*cloud.s,4*cloud.s);
x.beginPath();x.arc(cloud.x+8*cloud.s,cloud.y+6*cloud.s,7*cloud.s,Math.PI,0);x.arc(cloud.x+18*cloud.s,cloud.y+6*cloud.s,9*cloud.s,Math.PI,0);x.fill();
}

function drawDino(){
const px=Math.floor(dino.x),py=Math.floor(dino.y+(dino.onGround&&playing?Math.sin(dino.step)*1.2:0));
x.fillStyle=playing?'#bcc7cc':'#875f61';
x.fillRect(px+3,py+9,16,20);
x.fillRect(px+14,py,16,15);
x.fillRect(px+25,py+10,7,5);
x.fillRect(px,py+15,7,6);
x.fillStyle='#26343a';x.fillRect(px+24,py+4,2,2);
x.fillStyle=playing?'#bcc7cc':'#875f61';
if(!dino.onGround){x.fillRect(px+7,py+27,5,9);x.fillRect(px+16,py+27,5,9)}else if(Math.floor(dino.step)%2){x.fillRect(px+5,py+27,5,9);x.fillRect(px+17,py+27,5,6)}else{x.fillRect(px+8,py+27,5,6);x.fillRect(px+15,py+27,5,9)}
}

function drawCactus(o){
x.fillStyle='#a75c5e';x.fillRect(o.x,o.y,o.w,o.h);x.fillRect(o.x-5,o.y+12,7,6);x.fillRect(o.x-5,o.y+6,4,12);
if(o.arms){x.fillRect(o.x+o.w-2,o.y+21,7,6);x.fillRect(o.x+o.w+2,o.y+13,4,14)}
}

function draw(){
x.clearRect(0,0,560,420);
const bg=x.createLinearGradient(0,0,0,420);bg.addColorStop(0,'#202c32');bg.addColorStop(1,'#152027');x.fillStyle=bg;x.fillRect(0,0,560,420);
clouds.forEach(drawCloud);
x.strokeStyle='rgba(168,184,192,.55)';x.setLineDash([7,6]);x.beginPath();x.moveTo(0,ground+.5);x.lineTo(560,ground+.5);x.stroke();x.setLineDash([]);
x.fillStyle='rgba(113,132,141,.26)';for(let i=0;i<14;i++)x.fillRect(i*43+(score%43),ground+12+(i%3)*4,15,2);
obstacles.forEach(drawCactus);
drawDino();
particles.forEach(function(p){x.globalAlpha=Math.max(0,p.life);x.fillStyle='#9bacb4';x.fillRect(p.x,p.y,p.size,p.size)});x.globalAlpha=1;
}

function loop(t){
if(!last)last=t;
const dt=Math.min((t-last)/16.67,2);
last=t;
if(playing)update(dt);
draw();
requestAnimationFrame(loop);
}

board.addEventListener('pointerdown',function(e){if(e.target===start)return;e.preventDefault();jump()});
start.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();reset()});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}});

seedClouds();
updateUI();
requestAnimationFrame(loop);
</script>
</body>`;

export default createHtmlGameCommand({
  name: "dino",
  commands: ["dino", "dinorunner", "dinossauro"],
  description: "Dino Runner jogável dentro do WhatsApp.",
  usage: `${PREFIX}dino`,
  html: DINO_HTML,
  submessageText: "TAKESHI DINO RUNNER",
  displayName: "Dino Runner",
});
