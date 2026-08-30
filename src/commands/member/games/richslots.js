/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { createHtmlGameCommand } from "./_htmlGameCommand.js";

export const RICH_SLOTS_HTML = String.raw`<style>
*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box}body{margin:0;background:transparent;font-family:Arial,sans-serif;color:#e8edf0;touch-action:manipulation}.wrap{width:100%;max-width:620px;margin:auto;padding:16px}.card{background:rgba(29,40,47,.97);border:1px solid rgba(255,255,255,.13);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)}.head{padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center}.brand{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.42)}.title{font-size:15px;font-weight:bold;color:#fff}.stats{display:flex;gap:16px;text-align:right}.value{font:700 18px monospace;color:#fff}.label{font-size:8px;color:rgba(255,255,255,.38);letter-spacing:1px}.main{padding:16px}.board{position:relative;background:rgba(4,9,12,.32);border:1px solid rgba(255,255,255,.09);border-radius:12px;overflow:hidden}.board canvas{display:block;width:100%;height:auto}.controls{display:grid;grid-template-columns:1fr 1.8fr;gap:8px;margin-top:10px}.button{height:48px;border:1px solid rgba(255,255,255,.15);border-radius:9px;color:#fff;font-weight:bold;font-size:12px;background:rgba(255,255,255,.07)}.spin{background:linear-gradient(135deg,rgba(124,84,227,.75),rgba(58,125,191,.7));border-color:rgba(158,133,255,.65);box-shadow:0 0 18px rgba(108,88,225,.25)}.button:disabled{opacity:.45}.status{text-align:center;font:10px monospace;color:rgba(255,255,255,.45);margin-top:10px;min-height:12px}
</style>
<body>
<div class="wrap"><div class="card">
<div class="head">
<div><div class="brand">TAKESHI CASINO</div><div class="title">NEON SLOTS</div></div>
<div class="stats"><div><div class="label">CRÉDITOS</div><div class="value" id="credits">00500</div></div><div><div class="label">MELHOR</div><div class="value" id="best">00000</div></div></div>
</div>
<div class="main">
<div class="board"><canvas id="game" width="560" height="420"></canvas></div>
<div class="controls"><button class="button" id="bet">APOSTA 10</button><button class="button spin" id="spin">GIRAR</button></div>
<div class="status" id="status">3 IGUAIS PAGAM 6× • PAR PAGA 2×</div>
</div></div></div>
<script>
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const creditsEl=document.getElementById('credits');
const bestEl=document.getElementById('best');
const betButton=document.getElementById('bet');
const spinButton=document.getElementById('spin');
const statusEl=document.getElementById('status');
const symbols=['7','♦','★','BAR','●','♣'];
const colors=['#f27286','#75dcff','#ffd166','#e9eef2','#a98bff','#7ee0a3'];
const bets=[10,20,50];
let betIndex=0;
let credits=500;
let best=0;
let result=[0,1,2];
let spinning=false;
let spinStart=0;
let flash=0;
let message='BOA SORTE';

try{credits=parseInt(localStorage.getItem('takeshi_richslots_credits')||'500',10)||500;best=parseInt(localStorage.getItem('takeshi_richslots_best')||'0',10)||0}catch(e){}

function pad(value){return String(Math.max(0,Math.floor(value))).padStart(5,'0')}
function save(){try{localStorage.setItem('takeshi_richslots_credits',String(credits));localStorage.setItem('takeshi_richslots_best',String(best))}catch(e){}}
function updateUI(){creditsEl.textContent=pad(credits);bestEl.textContent=pad(best);betButton.textContent='APOSTA '+bets[betIndex];betButton.disabled=spinning;spinButton.disabled=spinning}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function symbol(index,x,y,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=colors[index];ctx.shadowColor=colors[index];ctx.shadowBlur=18;ctx.font=index===3?'bold 27px Arial':'bold 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(symbols[index],x,y);ctx.restore()}

function draw(time){
ctx.clearRect(0,0,560,420);
const bg=ctx.createLinearGradient(0,0,0,420);bg.addColorStop(0,'#16242c');bg.addColorStop(1,'#080d12');ctx.fillStyle=bg;ctx.fillRect(0,0,560,420);
for(let i=0;i<24;i++){ctx.fillStyle='rgba(150,126,255,'+(0.025+(i%3)*.012)+')';ctx.fillRect((i*79)%560,(i*67)%420,2,2)}
ctx.fillStyle='rgba(255,255,255,.035)';rounded(42,102,476,202,18);ctx.fill();
ctx.strokeStyle='rgba(157,135,255,.32)';ctx.lineWidth=2;rounded(42,102,476,202,18);ctx.stroke();
for(let reel=0;reel<3;reel++){
const rx=64+reel*154;
const glow=flash>0?'rgba(122,224,168,.20)':'rgba(255,255,255,.055)';ctx.fillStyle=glow;rounded(rx,126,124,154,12);ctx.fill();
ctx.strokeStyle=flash>0?'rgba(122,224,168,.72)':'rgba(255,255,255,.13)';ctx.lineWidth=1;rounded(rx,126,124,154,12);ctx.stroke();
let value=result[reel];
let offset=0;
if(spinning){const elapsed=time-spinStart;const pace=54+reel*11;offset=(elapsed/pace)%1;value=Math.floor(elapsed/pace+reel*2)%symbols.length}
symbol((value+symbols.length-1)%symbols.length,rx+62,151-offset*54,.18);
symbol(value,rx+62,203-offset*54,1);
symbol((value+1)%symbols.length,rx+62,257-offset*54,.18);
}
ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='10px monospace';ctx.textAlign='center';ctx.fillText(message,280,330);
if(flash>0)flash--;
requestAnimationFrame(draw);
}

function finishSpin(){
spinning=false;
result=[0,0,0].map(function(){return Math.floor(Math.random()*symbols.length)});
const bet=bets[betIndex];
let payout=0;
if(result[0]===result[1]&&result[1]===result[2])payout=bet*(result[0]===0?10:6);
else if(result[0]===result[1]||result[1]===result[2]||result[0]===result[2])payout=bet*2;
if(payout){credits+=payout;best=Math.max(best,payout);message='PRÊMIO +'+payout;statusEl.textContent='✨ VOCÊ GANHOU '+payout+' CRÉDITOS';flash=38}else{message='TENTE NOVAMENTE';statusEl.textContent='SEM PRÊMIO • TENTE OUTRA VEZ'}
if(credits<10){credits=500;statusEl.textContent='🎁 BÔNUS DE 500 CRÉDITOS'}
save();updateUI();
}

function spin(){
if(spinning)return;
const bet=bets[betIndex];
if(credits<bet){statusEl.textContent='CRÉDITOS INSUFICIENTES';return}
credits-=bet;spinning=true;spinStart=performance.now();message='GIRANDO...';statusEl.textContent='BOA SORTE!';updateUI();setTimeout(finishSpin,1250);
}

betButton.addEventListener('pointerdown',function(e){e.preventDefault();if(spinning)return;betIndex=(betIndex+1)%bets.length;updateUI()});
spinButton.addEventListener('pointerdown',function(e){e.preventDefault();spin()});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();spin()}});
updateUI();requestAnimationFrame(draw);
</script>
</body>`;

export default createHtmlGameCommand({
  name: "richslots",
  commands: ["richslots"],
  description: "Neon Slots jogável dentro do WhatsApp.",
  usage: `${PREFIX}richslots`,
  html: RICH_SLOTS_HTML,
  submessageText: "TAKESHI NEON SLOTS",
  displayName: "Neon Slots",
});
