/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const RICH_2048_HTML = `<style>
${ARCADE_BASE_CSS}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px;background:#10181d;touch-action:none}.tile{aspect-ratio:1;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.055);font:bold 24px Arial;color:#dfe6ea;transition:.12s}.v2{background:#32434b}.v4{background:#3e525b}.v8{background:#8b633c}.v16{background:#a7643e}.v32{background:#ad5146}.v64{background:#b83f43}.v128{background:#89733b;font-size:21px}.v256{background:#9b7a32;font-size:21px}.v512{background:#aa8128;font-size:21px}.v1024{background:#7458a8;font-size:17px}.v2048{background:#5d48bd;font-size:17px;box-shadow:0 0 20px rgba(126,92,255,.6)}.arrows{display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(2,44px);gap:6px;justify-content:center}.arrow{padding:0;font-size:18px}.up{grid-column:2}.left{grid-column:1}.down{grid-column:2}.right{grid-column:3}
</style><body><div class="wrap"><div class="card">
<div class="head"><div><div class="brand">TAKESHI PUZZLE</div><div class="title">2048</div></div><div class="stats"><div><div class="label">PONTOS</div><div class="value" id="score">00000</div></div><div><div class="label">RECORDE</div><div class="value" id="best">00000</div></div></div></div>
<div class="main"><div class="board"><div class="grid" id="grid"></div><div class="overlay hidden" id="overlay"><div class="overlay-title" id="overTitle">FIM DE JOGO</div><div class="overlay-sub" id="overSub">SEM MOVIMENTOS</div></div></div>
<div class="controls"><div class="arrows"><button class="button arrow up" data-dir="up">&#9650;</button><button class="button arrow left" data-dir="left">&#9664;</button><button class="button arrow down" data-dir="down">&#9660;</button><button class="button arrow right" data-dir="right">&#9654;</button></div><button class="button primary" id="newGame">NOVO JOGO</button></div><div class="status" id="status">JUNTE OS N&Uacute;MEROS IGUAIS</div></div>
</div></div><script>
const grid=document.getElementById('grid'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),overlay=document.getElementById('overlay'),statusEl=document.getElementById('status');
let board=[],score=0,best=0,startX=0,startY=0;
try{best=parseInt(localStorage.getItem('takeshi_2048_best')||'0',10)||0}catch(e){}
function pad(v){return String(v).padStart(5,'0')}
function addTile(){const empty=[];for(let i=0;i<16;i++)if(!board[i])empty.push(i);if(!empty.length)return;const at=empty[Math.floor(Math.random()*empty.length)];board[at]=Math.random()<.9?2:4}
function slide(line){const values=line.filter(Boolean);for(let i=0;i<values.length-1;i++){if(values[i]===values[i+1]){values[i]*=2;score+=values[i];values.splice(i+1,1)}}while(values.length<4)values.push(0);return values}
function indexes(dir,line){const a=[];for(let i=0;i<4;i++){if(dir==='left')a.push(line*4+i);if(dir==='right')a.push(line*4+3-i);if(dir==='up')a.push(i*4+line);if(dir==='down')a.push((3-i)*4+line)}return a}
function canMove(){if(board.includes(0))return true;for(let y=0;y<4;y++)for(let x=0;x<4;x++){const i=y*4+x;if(x<3&&board[i]===board[i+1])return true;if(y<3&&board[i]===board[i+4])return true}return false}
function move(dir){const before=board.join(',');for(let line=0;line<4;line++){const ids=indexes(dir,line),values=slide(ids.map(i=>board[i]));ids.forEach((id,i)=>board[id]=values[i])}if(board.join(',')===before)return;addTile();best=Math.max(best,score);try{localStorage.setItem('takeshi_2048_best',String(best))}catch(e){}render();if(!canMove()){overlay.classList.remove('hidden');statusEl.textContent='FIM DE JOGO'}}
function render(){grid.innerHTML='';board.forEach(v=>{const el=document.createElement('div');el.className='tile'+(v?' v'+Math.min(v,2048):'');el.textContent=v||'';grid.appendChild(el)});scoreEl.textContent=pad(score);bestEl.textContent=pad(best)}
function reset(){board=Array(16).fill(0);score=0;addTile();addTile();overlay.classList.add('hidden');statusEl.textContent='JUNTE OS NÚMEROS IGUAIS';render()}
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();move(b.dataset.dir)}));document.getElementById('newGame').addEventListener('pointerdown',e=>{e.preventDefault();reset()});grid.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY});grid.addEventListener('pointerup',e=>{const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))});document.addEventListener('keydown',e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d){e.preventDefault();move(d)}});reset();
</script></body>`;

export default createHtmlGameCommand({
  name: "rich2048",
  commands: ["rich2048", "2048"],
  description: "2048 jogável por toque dentro do WhatsApp.",
  usage: `${PREFIX}rich2048`,
  html: RICH_2048_HTML,
  submessageText: "TAKESHI 2048",
  displayName: "2048",
});
