/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const BREAKOUT_HTML = `<style>
${ARCADE_BASE_CSS}
.move{min-width:72px;font-size:18px}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">BREAKOUT</div></div><div class="stats"><div><div class="label">PONTOS</div><div class="value" id="score">00000</div></div><div><div class="label">VIDAS</div><div class="value" id="lives">03</div></div></div></div>
<div class="main"><div class="board" id="board"><canvas id="game" width="560" height="420"></canvas><div class="overlay" id="overlay"><div class="overlay-title" id="overTitle">BREAKOUT</div><div class="overlay-sub" id="overSub">DESTRUA TODOS OS BLOCOS</div><button class="button primary" id="start" style="margin-top:15px">COME&Ccedil;AR</button></div></div><div class="controls"><button class="button move" data-move="left">&#9664;</button><button class="button move" data-move="right">&#9654;</button></div><div class="status">ARRASTE OU USE OS BOT&Otilde;ES</div></div></div></div>
<script>
const c=document.getElementById('game'),x=c.getContext('2d'),boardEl=document.getElementById('board'),overlay=document.getElementById('overlay'),scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives');let paddle,ball,bricks,score=0,lives=3,playing=false,last=0,move=0;
function pad(v){return String(v).padStart(5,'0')}function ui(){scoreEl.textContent=pad(score);livesEl.textContent=String(lives).padStart(2,'0')}
function makeBricks(){bricks=[];for(let r=0;r<6;r++)for(let col=0;col<8;col++)bricks.push({x:18+col*67,y:24+r*25,w:58,h:16,on:true,hue:188+r*24})}
function serve(){paddle={x:235,y:394,w:90,h:9};ball={x:280,y:377,vx:(Math.random()>.5?1:-1)*3.1,vy:-3.8,r:6}}
function reset(){score=0;lives=3;makeBricks();serve();playing=true;last=0;overlay.classList.add('hidden');ui()}
function finish(title,sub){playing=false;document.getElementById('overTitle').textContent=title;document.getElementById('overSub').textContent=sub;document.getElementById('start').textContent='JOGAR NOVAMENTE';overlay.classList.remove('hidden')}
function update(dt){paddle.x=Math.max(0,Math.min(560-paddle.w,paddle.x+move*6.5*dt));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)}if(ball.x>560-ball.r){ball.x=560-ball.r;ball.vx=-Math.abs(ball.vx)}if(ball.y<ball.r){ball.y=ball.r;ball.vy=Math.abs(ball.vy)}if(ball.vy>0&&ball.y+ball.r>=paddle.y&&ball.y-ball.r<=paddle.y+paddle.h&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){ball.y=paddle.y-ball.r;const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);ball.vx=hit*5.2;ball.vy=-Math.max(3.4,Math.abs(ball.vy))}for(const b of bricks){if(!b.on)continue;if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){b.on=false;score+=10;ball.vy*=-1;ui();break}}if(bricks.every(b=>!b.on))return finish('VOCÊ VENCEU','PONTOS '+score);if(ball.y>432){lives--;ui();if(lives<=0)return finish('GAME OVER','PONTOS '+score);serve()}}
function draw(){x.fillStyle='#0d171d';x.fillRect(0,0,560,420);x.strokeStyle='rgba(255,255,255,.035)';for(let i=0;i<560;i+=28){x.beginPath();x.moveTo(i,0);x.lineTo(i,420);x.stroke()}for(const b of bricks){if(!b.on)continue;x.fillStyle='hsl('+b.hue+',62%,48%)';x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(b.x,b.y,b.w,3)}x.fillStyle='#dfe8ec';x.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);x.beginPath();x.fillStyle='#ffd166';x.arc(ball.x,ball.y,ball.r,0,Math.PI*2);x.fill()}
function loop(t){if(!last)last=t;const dt=Math.min((t-last)/16.67,2);last=t;if(playing)update(dt);draw();requestAnimationFrame(loop)}
function pointX(e){const rect=c.getBoundingClientRect();return(e.clientX-rect.left)*560/rect.width}boardEl.addEventListener('pointermove',e=>{if(!playing)return;paddle.x=Math.max(0,Math.min(560-paddle.w,pointX(e)-paddle.w/2))});document.querySelectorAll('[data-move]').forEach(b=>{const dir=b.dataset.move==='left'?-1:1;b.addEventListener('pointerdown',e=>{e.preventDefault();move=dir});b.addEventListener('pointerup',()=>move=0);b.addEventListener('pointercancel',()=>move=0)});document.addEventListener('pointerup',()=>move=0);document.getElementById('start').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();reset()});makeBricks();serve();ui();requestAnimationFrame(loop);
</script></body>`;

export default createHtmlGameCommand({
  name: "breakout",
  commands: ["breakout", "richbreakout"],
  description: "Breakout jogável por toque dentro do WhatsApp.",
  usage: `${PREFIX}breakout`,
  html: BREAKOUT_HTML,
  submessageText: "TAKESHI BREAKOUT",
  displayName: "Breakout",
});
