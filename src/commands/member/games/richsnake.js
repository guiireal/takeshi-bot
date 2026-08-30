/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const RICH_SNAKE_HTML = `<style>
${ARCADE_BASE_CSS}
.pad{display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(2,44px);gap:6px}.pad .button{padding:0;font-size:18px}.up{grid-column:2}.left{grid-column:1}.down{grid-column:2}.right{grid-column:3}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">NEON SNAKE</div></div><div class="stats"><div><div class="label">PONTOS</div><div class="value" id="score">00000</div></div><div><div class="label">RECORDE</div><div class="value" id="best">00000</div></div></div></div>
<div class="main"><div class="board" id="board"><canvas id="game" width="560" height="420"></canvas><div class="overlay" id="overlay"><div class="overlay-title" id="overTitle">NEON SNAKE</div><div class="overlay-sub" id="overSub">COMA OS PONTOS &bull; N&Atilde;O BATA</div><button class="button primary" id="start" style="margin-top:15px">COME&Ccedil;AR</button></div></div><div class="controls"><div class="pad"><button class="button up" data-dir="up">&#9650;</button><button class="button left" data-dir="left">&#9664;</button><button class="button down" data-dir="down">&#9660;</button><button class="button right" data-dir="right">&#9654;</button></div></div><div class="status" id="status">VELOCIDADE 1.0x</div></div></div></div>
<script>
const c=document.getElementById('game'),x=c.getContext('2d'),overlay=document.getElementById('overlay'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),statusEl=document.getElementById('status');const size=20,cols=28,rows=21;let snake,food,dir,next,score=0,best=0,playing=false,timer,startX=0,startY=0;
try{best=parseInt(localStorage.getItem('takeshi_snake_best')||'0',10)||0}catch(e){}
function pad(v){return String(v).padStart(5,'0')}function placeFood(){do{food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)}}while(snake.some(p=>p.x===food.x&&p.y===food.y))}
function speedDelay(){return Math.max(80,150-Math.floor(score/20)*7)}function schedule(){clearInterval(timer);timer=setInterval(tick,speedDelay())}
function reset(){snake=[{x:8,y:7},{x:7,y:7},{x:6,y:7}];dir={x:1,y:0};next={x:1,y:0};score=0;playing=true;placeFood();overlay.classList.add('hidden');schedule();updateUI();draw()}
function setDir(name){const d={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[name];if(!d||d.x===-dir.x&&d.y===-dir.y)return;next=d}
function tick(){if(!playing)return;dir=next;const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.x>=cols||head.y<0||head.y>=rows||snake.some(p=>p.x===head.x&&p.y===head.y))return gameOver();snake.unshift(head);if(head.x===food.x&&head.y===food.y){score+=10;best=Math.max(best,score);placeFood();schedule()}else snake.pop();updateUI();draw()}
function gameOver(){playing=false;clearInterval(timer);try{localStorage.setItem('takeshi_snake_best',String(best))}catch(e){}document.getElementById('overTitle').textContent='GAME OVER';document.getElementById('overSub').textContent='PONTOS '+score;document.getElementById('start').textContent='JOGAR NOVAMENTE';overlay.classList.remove('hidden')}
function updateUI(){scoreEl.textContent=pad(score);bestEl.textContent=pad(best);statusEl.textContent='TAMANHO '+snake.length+' • VELOCIDADE '+(150/speedDelay()).toFixed(1)+'x'}
function draw(){const bg=x.createLinearGradient(0,0,0,420);bg.addColorStop(0,'#17272e');bg.addColorStop(1,'#091014');x.fillStyle=bg;x.fillRect(0,0,560,420);x.strokeStyle='rgba(255,255,255,.025)';for(let i=0;i<=cols;i++){x.beginPath();x.moveTo(i*size,0);x.lineTo(i*size,420);x.stroke()}for(let i=0;i<=rows;i++){x.beginPath();x.moveTo(0,i*size);x.lineTo(560,i*size);x.stroke()}x.fillStyle='#ff667f';x.shadowColor='#ff667f';x.shadowBlur=14;x.beginPath();x.arc(food.x*size+10,food.y*size+10,6,0,Math.PI*2);x.fill();x.shadowBlur=0;snake.forEach((p,i)=>{x.fillStyle=i===0?'#91ffe0':'#00b98d';x.fillRect(p.x*size+2,p.y*size+2,16,16)})}
document.getElementById('start').addEventListener('pointerdown',e=>{e.preventDefault();reset()});document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();setDir(b.dataset.dir)}));document.addEventListener('keydown',e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d){e.preventDefault();setDir(d)}});c.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY});c.addEventListener('pointerup',e=>{const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.max(Math.abs(dx),Math.abs(dy))<16)return;setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))});snake=[{x:8,y:7},{x:7,y:7},{x:6,y:7}];food={x:18,y:7};updateUI();draw();
</script></body>`;

export default createHtmlGameCommand({
  name: "richsnake",
  commands: ["richsnake", "snake", "snakezapo"],
  description: "Snake jogável por toque dentro do WhatsApp.",
  usage: `${PREFIX}richsnake`,
  html: RICH_SNAKE_HTML,
  submessageText: "TAKESHI NEON SNAKE",
  displayName: "Neon Snake",
});
