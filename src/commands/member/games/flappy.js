/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const FLAPPY_HTML = `<style>
${ARCADE_BASE_CSS}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">FLAPPY</div></div><div class="stats"><div><div class="label">PONTOS</div><div class="value" id="score">00000</div></div><div><div class="label">RECORDE</div><div class="value" id="best">00000</div></div></div></div>
<div class="main"><div class="board" id="board"><canvas id="game" width="560" height="420"></canvas><div class="overlay" id="overlay"><div class="overlay-title" id="overTitle">FLAPPY</div><div class="overlay-sub" id="overSub">TOQUE PARA VOAR</div><button class="button primary" id="start" style="margin-top:15px">COME&Ccedil;AR</button></div></div><div class="status" id="status">TOQUE NA TELA PARA SUBIR</div></div></div></div>
<script>
const c=document.getElementById('game'),x=c.getContext('2d'),boardEl=document.getElementById('board'),overlay=document.getElementById('overlay'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best');let bird,pipes,score=0,best=0,playing=false,last=0,spawn=0;
try{best=parseInt(localStorage.getItem('takeshi_flappy_best')||'0',10)||0}catch(e){}
function pad(v){return String(Math.floor(v)).padStart(5,'0')}function updateUI(){scoreEl.textContent=pad(score);bestEl.textContent=pad(best)}
function reset(){bird={x:120,y:203,vy:0};pipes=[];score=0;spawn=30;playing=true;last=0;overlay.classList.add('hidden');updateUI()}
function flap(){if(!playing)return;bird.vy=-7.4}
function addPipe(){const gap=128,top=53+Math.random()*171;pipes.push({x:590,top,bottom:top+gap,passed:false})}
function gameOver(){playing=false;best=Math.max(best,Math.floor(score));try{localStorage.setItem('takeshi_flappy_best',String(best))}catch(e){}document.getElementById('overTitle').textContent='GAME OVER';document.getElementById('overSub').textContent='PONTOS '+Math.floor(score);document.getElementById('start').textContent='JOGAR NOVAMENTE';overlay.classList.remove('hidden');updateUI()}
function update(dt){bird.vy+=.42*dt;bird.y+=bird.vy*dt;spawn-=dt;if(spawn<=0){addPipe();spawn=95}for(const p of pipes){p.x-=3.1*dt;if(!p.passed&&p.x+46<bird.x){p.passed=true;score++;updateUI()}if(bird.x+13>p.x&&bird.x-13<p.x+46&&(bird.y-12<p.top||bird.y+12>p.bottom))return gameOver()}pipes=pipes.filter(p=>p.x>-55);if(bird.y<10||bird.y>410)gameOver()}
function draw(){const bg=x.createLinearGradient(0,0,0,420);bg.addColorStop(0,'#18333e');bg.addColorStop(1,'#101b22');x.fillStyle=bg;x.fillRect(0,0,560,420);x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<7;i++)x.fillRect((i*97+score*9)%600-20,53+(i%3)*42,42,4);for(const p of pipes){x.fillStyle='#2f9b78';x.fillRect(p.x,0,46,p.top);x.fillRect(p.x,p.bottom,46,420-p.bottom);x.fillStyle='#57c99f';x.fillRect(p.x-4,p.top-12,54,12);x.fillRect(p.x-4,p.bottom,54,12)}x.save();x.translate(bird.x,bird.y);x.rotate(Math.max(-.35,Math.min(.6,bird.vy*.05)));x.fillStyle=playing?'#ffd166':'#a16d72';x.beginPath();x.arc(0,0,13,0,Math.PI*2);x.fill();x.fillStyle='#ff8b5e';x.fillRect(8,-2,12,5);x.fillStyle='#26343a';x.fillRect(3,-6,3,3);x.restore()}
function loop(t){if(!last)last=t;const dt=Math.min((t-last)/16.67,2);last=t;if(playing)update(dt);draw();requestAnimationFrame(loop)}
document.getElementById('start').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();reset()});boardEl.addEventListener('pointerdown',e=>{if(e.target===document.getElementById('start'))return;e.preventDefault();flap()});document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();flap()}});bird={x:120,y:203,vy:0};updateUI();requestAnimationFrame(loop);
</script></body>`;

export default createHtmlGameCommand({
  name: "flappy",
  commands: ["flappy", "richflappy"],
  description: "Flappy jogável por toque dentro do WhatsApp.",
  usage: `${PREFIX}flappy`,
  html: FLAPPY_HTML,
  submessageText: "TAKESHI FLAPPY",
  displayName: "Flappy",
});
