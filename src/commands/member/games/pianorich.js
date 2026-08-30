/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { createHtmlGameCommand } from "./_htmlGameCommand.js";

export const PIANO_HTML = String.raw`<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}body{margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer}.wrap{width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box}.card{background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)}.head{padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center}.brand{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.45)}.title{font-size:15px;font-weight:bold;color:#fff}.stats{text-align:right}.score{font-size:20px;font-weight:bold;color:#fff;text-shadow:0 0 12px rgba(108,92,231,.9)}.combo{font-size:10px;color:rgba(255,255,255,.45);margin-top:3px}.main{padding:16px}.board{position:relative;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden}.board canvas{display:block;width:100%;height:auto}.keys{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:10px}.key{height:62px;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(255,255,255,.07);color:#fff;font-weight:bold;font-size:13px}.key small{display:block;font-size:8px;color:rgba(255,255,255,.35);margin-top:4px}.key.active{background:rgba(108,92,231,.65);box-shadow:0 0 22px rgba(108,92,231,.7);transform:scale(.96)}.status{text-align:center;font-size:10px;color:rgba(255,255,255,.4);margin-top:10px}.overlay{position:absolute;inset:0;background:rgba(5,5,12,.78);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}.hidden{display:none}.gameTitle{font-size:25px;font-weight:bold;letter-spacing:1px}.gameSub{font-size:11px;color:rgba(255,255,255,.5);margin-top:8px}.start{margin-top:16px;padding:11px 22px;border:1px solid rgba(108,92,231,.6);border-radius:9px;background:rgba(108,92,231,.3);color:#fff;font-weight:bold;font-size:11px}.judge{position:absolute;left:0;right:0;top:42%;text-align:center;font-size:20px;font-weight:bold;opacity:0;pointer-events:none;text-shadow:0 0 18px currentColor}.judge.show{animation:pop .45s ease-out}@keyframes pop{0%{opacity:1;transform:scale(.7)}100%{opacity:0;transform:scale(1.3) translateY(-20px)}}</style>
<body>
<div class="wrap">
<div class="card">
<div class="head">
<div>
<div class="brand">TAKESHI ARCADE</div>
<div class="title">NEON PIANO</div>
</div>
<div class="stats">
<div class="score" id="score">00000</div>
<div class="combo" id="combo">COMBO 0</div>
</div>
</div>
<div class="main">
<div class="board">
<canvas id="game" width="560" height="420"></canvas>
<div id="overlay" class="overlay">
<div id="gameTitle" class="gameTitle">NEON PIANO</div>
<div id="gameSub" class="gameSub">7 NOTES • 3 MISSES = GAME OVER</div>
<button id="start" class="start">START</button>
</div>
<div id="judge" class="judge"></div>
</div>
<div class="keys">
<button class="key" data-key="0">C<small>A</small></button>
<button class="key" data-key="1">D<small>S</small></button>
<button class="key" data-key="2">E<small>D</small></button>
<button class="key" data-key="3">F<small>F</small></button>
<button class="key" data-key="4">G<small>G</small></button>
<button class="key" data-key="5">A<small>H</small></button>
<button class="key" data-key="6">B<small>J</small></button>
</div>
<div id="status" class="status">BEST 00000 • LEVEL 1</div>
</div>
</div>
</div>
</div>
<script>
const c=document.getElementById('game');
const x=c.getContext('2d');
const scoreEl=document.getElementById('score');
const comboEl=document.getElementById('combo');
const statusEl=document.getElementById('status');
const overlay=document.getElementById('overlay');
const gameTitle=document.getElementById('gameTitle');
const gameSub=document.getElementById('gameSub');
const start=document.getElementById('start');
const judge=document.getElementById('judge');
const keyEls=document.querySelectorAll('.key');

let notes=[];
let particles=[];
let stars=[];
let score=0;
let best=0;
let combo=0;
let misses=0;
let level=1;
let speed=2.2;
let spawn=30;
let playing=false;
let last=0;
let audio=null;

try{
best=parseInt(localStorage.getItem('takeshi_piano_best')||'0',10)||0;
}catch(e){best=0}

function audioStart(){
if(audio)return;
try{
audio=new(window.AudioContext||window.webkitAudioContext)();
}catch(e){}
}

function playNote(n){
audioStart();
if(!audio)return;

try{
if(audio.state==='suspended')audio.resume();

const freq=[261.63,293.66,329.63,349.23,392,440,493.88];
const osc=audio.createOscillator();
const gain=audio.createGain();

osc.type='sine';
osc.frequency.value=freq[n];

gain.gain.setValueAtTime(.0001,audio.currentTime);
gain.gain.exponentialRampToValueAtTime(.12,audio.currentTime+.01);
gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.35);

osc.connect(gain);
gain.connect(audio.destination);

osc.start();
osc.stop(audio.currentTime+.36);
}catch(e){}
}

function reset(){
notes=[];
particles=[];
score=0;
combo=0;
misses=0;
level=1;
speed=2.2;
spawn=30;
playing=true;
last=0;

overlay.classList.add('hidden');

stars=[];

for(let i=0;i<60;i++){
stars.push({
x:Math.random()*560,
y:Math.random()*420,
s:.5+Math.random()*1.5
});
}

updateUI();
}

function updateUI(){
scoreEl.textContent=String(Math.floor(score)).padStart(5,'0');
comboEl.textContent='COMBO '+combo;
statusEl.textContent='BEST '+String(Math.floor(best)).padStart(5,'0')+' • LEVEL '+level;
}

function createNote(){
notes.push({
lane:Math.floor(Math.random()*7),
y:-25,
hit:false
});
}

function burst(px,py,n){
for(let i=0;i<n;i++){
let a=Math.random()*Math.PI*2;
let s=1+Math.random()*3;

particles.push({
x:px,
y:py,
vx:Math.cos(a)*s,
vy:Math.sin(a)*s,
life:1,
size:1+Math.random()*3
});
}
}

function result(text){
judge.textContent=text;
judge.className='judge show';

setTimeout(function(){
judge.className='judge';
},400);
}

function press(n){
if(!playing)return;

playNote(n);

keyEls[n].classList.add('active');

setTimeout(function(){
keyEls[n].classList.remove('active');
},90);

let target=null;
let distance=999;

for(let i=0;i<notes.length;i++){
let q=notes[i];

if(!q.hit&&q.lane===n){
let d=Math.abs(q.y-365);

if(d<distance){
distance=d;
target=q;
}
}
}

if(target&&distance<48){
target.hit=true;

if(distance<14){
score+=100+combo*5;
combo++;
result('PERFECT');
burst(n*80+40,365,18);
}else if(distance<29){
score+=60+combo*3;
combo++;
result('GOOD');
burst(n*80+40,365,10);
}else{
score+=25;
combo++;
result('OK');
}

if(combo>0&&combo%10===0){
level++;
speed=Math.min(6,speed+.3);
}

if(score>best){
best=Math.floor(score);
try{
localStorage.setItem('takeshi_piano_best',String(best));
}catch(e){}
}

updateUI();
}else{
combo=0;
misses++;

result('MISS');

if(misses>=3){
gameOver();
}

updateUI();
}
}

function gameOver(){
playing=false;

gameTitle.textContent='GAME OVER';
gameSub.textContent='SCORE '+String(Math.floor(score)).padStart(5,'0')+' • MISSES '+misses;
start.textContent='PLAY AGAIN';

overlay.classList.remove('hidden');
}

for(let i=0;i<keyEls.length;i++){
keyEls[i].addEventListener('pointerdown',function(e){
e.preventDefault();
press(parseInt(this.dataset.key,10));
});
}

document.addEventListener('keydown',function(e){
const map={
a:0,
s:1,
d:2,
f:3,
g:4,
h:5,
j:6
};

const k=e.key.toLowerCase();

if(map[k]!==undefined){
e.preventDefault();
press(map[k]);
}
});

start.addEventListener('pointerdown',function(e){
e.preventDefault();
audioStart();
reset();
});

function update(dt){
spawn-=dt;

if(spawn<=0){
createNote();
spawn=Math.max(16,36-level*2)+Math.random()*12;
}

for(let i=0;i<notes.length;i++){
notes[i].y+=speed*dt;
}

for(let i=notes.length-1;i>=0;i--){
if(notes[i].hit){
notes.splice(i,1);
continue;
}

if(notes[i].y>440){
notes.splice(i,1);
combo=0;
misses++;
result('MISS');

if(misses>=3){
gameOver();
return;
}
}
}

for(let i=0;i<stars.length;i++){
stars[i].y+=stars[i].s*dt;

if(stars[i].y>420){
stars[i].y=-3;
stars[i].x=Math.random()*560;
}
}

for(let i=0;i<particles.length;i++){
let p=particles[i];

p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.vx*=.97;
p.vy*=.97;
p.life-=.035*dt;
}

particles=particles.filter(function(p){
return p.life>0;
});

updateUI();
}

function draw(){
x.clearRect(0,0,560,420);

let bg=x.createLinearGradient(0,0,0,420);
bg.addColorStop(0,'#05050d');
bg.addColorStop(1,'#12081c');

x.fillStyle=bg;
x.fillRect(0,0,560,420);

stars.forEach(function(s){
x.fillStyle='rgba(150,130,255,'+(s.s*.25)+')';
x.fillRect(s.x,s.y,s.s,s.s);
});

for(let i=0;i<7;i++){
x.fillStyle='rgba(255,255,255,.025)';
x.fillRect(i*80,0,79,420);

x.strokeStyle='rgba(130,110,255,.08)';
x.beginPath();
x.moveTo(i*80,0);
x.lineTo(i*80,420);
x.stroke();
}

x.fillStyle='rgba(108,92,231,.09)';
x.fillRect(0,350,560,35);

x.strokeStyle='rgba(140,120,255,.75)';
x.lineWidth=2;
x.shadowColor='rgba(120,100,255,.8)';
x.shadowBlur=12;

x.beginPath();
x.moveTo(0,365);
x.lineTo(560,365);
x.stroke();

x.shadowBlur=0;

notes.forEach(function(n){
if(n.hit)return;

let xx=n.lane*80+40;

x.save();
x.translate(xx,n.y);

x.shadowColor='rgba(110,90,255,.9)';
x.shadowBlur=18;

let gr=x.createLinearGradient(0,-15,0,15);
gr.addColorStop(0,'#e8e4ff');
gr.addColorStop(.25,'#9385ff');
gr.addColorStop(1,'#5545bf');

x.fillStyle=gr;

x.beginPath();
x.moveTo(-25,-15);
x.lineTo(25,-15);
x.lineTo(21,15);
x.lineTo(-21,15);
x.closePath();
x.fill();

x.shadowBlur=0;

x.fillStyle='rgba(255,255,255,.7)';
x.fillRect(-17,-9,34,3);

x.restore();
});

particles.forEach(function(p){
x.globalAlpha=Math.max(0,p.life);
x.fillStyle='#9b8cff';
x.shadowColor='#9b8cff';
x.shadowBlur=8;
x.fillRect(p.x,p.y,p.size,p.size);
});

x.globalAlpha=1;
x.shadowBlur=0;
}

function loop(t){
if(!last)last=t;

let dt=Math.min((t-last)/16.67,2);

last=t;

if(playing){
update(dt);
}

draw();

requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);
</script>
</body>`;

export default createHtmlGameCommand({
  name: "pianorich",
  commands: ["pianorich"],
  description: "Neon Piano jogável dentro do WhatsApp.",
  usage: `${PREFIX}pianorich`,
  html: PIANO_HTML,
  submessageText: "TAKESHI NEON PIANO",
  displayName: "Neon Piano",
});
