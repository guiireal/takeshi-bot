/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const PONG_HTML = `<style>
${ARCADE_BASE_CSS}
.move{min-width:72px;font-size:18px}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">NEON PONG</div></div><div class="stats"><div><div class="label">VOC&Ecirc;</div><div class="value" id="player">00</div></div><div><div class="label">CPU</div><div class="value" id="cpu">00</div></div></div></div>
<div class="main"><div class="board" id="board"><canvas id="game" width="560" height="420"></canvas><div class="overlay" id="overlay"><div class="overlay-title" id="overTitle">NEON PONG</div><div class="overlay-sub" id="overSub">PRIMEIRO A 5 VENCE</div><button class="button primary" id="start" style="margin-top:15px">COME&Ccedil;AR</button></div></div><div class="controls"><button class="button move" data-move="up">&#9650;</button><button class="button move" data-move="down">&#9660;</button></div><div class="status">ARRASTE OU MOVA SUA RAQUETE</div></div></div></div>
<script>
const c=document.getElementById('game'),x=c.getContext('2d'),boardEl=document.getElementById('board'),overlay=document.getElementById('overlay'),playerEl=document.getElementById('player'),cpuEl=document.getElementById('cpu');let playerY=180,cpuY=180,ball,ps=0,cs=0,playing=false,last=0,move=0;
function ui(){playerEl.textContent=String(ps).padStart(2,'0');cpuEl.textContent=String(cs).padStart(2,'0')}function serve(dir){ball={x:280,y:210,vx:dir*4.1,vy:(Math.random()*4)-2}}
function reset(){playerY=180;cpuY=180;ps=0;cs=0;serve(Math.random()>.5?1:-1);playing=true;last=0;overlay.classList.add('hidden');ui()}
function finish(won){playing=false;document.getElementById('overTitle').textContent=won?'VOCÊ VENCEU':'CPU VENCEU';document.getElementById('overSub').textContent='PLACAR '+ps+' × '+cs;document.getElementById('start').textContent='JOGAR NOVAMENTE';overlay.classList.remove('hidden')}
function point(cpu){if(cpu)cs++;else ps++;ui();if(ps>=5||cs>=5)return finish(ps>=5);serve(cpu?-1:1)}
function update(dt){playerY=Math.max(0,Math.min(360,playerY+move*6*dt));cpuY+=Math.max(-3.25,Math.min(3.25,ball.y-(cpuY+30)))*dt;cpuY=Math.max(0,Math.min(360,cpuY));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<7){ball.y=7;ball.vy=Math.abs(ball.vy)}if(ball.y>413){ball.y=413;ball.vy=-Math.abs(ball.vy)}if(ball.vx<0&&ball.x<31&&ball.x>18&&ball.y>playerY&&ball.y<playerY+60){ball.x=31;ball.vx=Math.abs(ball.vx)*1.035;ball.vy+=(ball.y-(playerY+30))*.075}if(ball.vx>0&&ball.x>529&&ball.x<542&&ball.y>cpuY&&ball.y<cpuY+60){ball.x=529;ball.vx=-Math.abs(ball.vx)*1.035;ball.vy+=(ball.y-(cpuY+30))*.075}if(ball.x<-12)point(true);if(ball.x>572)point(false)}
function draw(){x.fillStyle='#07131a';x.fillRect(0,0,560,420);x.setLineDash([8,10]);x.strokeStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(280,0);x.lineTo(280,420);x.stroke();x.setLineDash([]);x.shadowBlur=12;x.shadowColor='#58d3ff';x.fillStyle='#e8f8ff';x.fillRect(18,playerY,10,60);x.shadowColor='#ff6ea8';x.fillRect(532,cpuY,10,60);x.shadowColor='#ffd166';x.beginPath();x.arc(ball.x,ball.y,7,0,Math.PI*2);x.fill();x.shadowBlur=0}
function loop(t){if(!last)last=t;const dt=Math.min((t-last)/16.67,2);last=t;if(playing)update(dt);draw();requestAnimationFrame(loop)}
function pointY(e){const rect=c.getBoundingClientRect();return(e.clientY-rect.top)*420/rect.height}boardEl.addEventListener('pointermove',e=>{if(playing)playerY=Math.max(0,Math.min(360,pointY(e)-30))});document.querySelectorAll('[data-move]').forEach(b=>{const dir=b.dataset.move==='up'?-1:1;b.addEventListener('pointerdown',e=>{e.preventDefault();move=dir});b.addEventListener('pointerup',()=>move=0);b.addEventListener('pointercancel',()=>move=0)});document.addEventListener('pointerup',()=>move=0);document.getElementById('start').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();reset()});serve(1);ui();requestAnimationFrame(loop);
</script></body>`;

export default createHtmlGameCommand({
  name: "richpong",
  commands: ["richpong"],
  description: "Pong contra a CPU dentro do WhatsApp.",
  usage: `${PREFIX}richpong`,
  html: PONG_HTML,
  submessageText: "TAKESHI NEON PONG",
  displayName: "Neon Pong",
});
