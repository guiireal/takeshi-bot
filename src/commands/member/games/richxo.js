/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export const RICH_XO_HTML = `<style>
${ARCADE_BASE_CSS}
.modes{display:flex;gap:7px;margin-bottom:10px}.modes .button{flex:1}.active{background:#00a884;color:#071713;border-color:#00c69b}.xo-grid{display:grid;grid-template-columns:repeat(3,1fr);background:#10191e}.cell{aspect-ratio:1;border:0;background:transparent;color:#edf2f4;font:bold 52px Arial;border-right:1px solid #34434b;border-bottom:1px solid #34434b}.cell:nth-child(3n){border-right:0}.cell:nth-last-child(-n+3){border-bottom:0}.cell.o{color:#00c99a}.cell.win{background:rgba(0,168,132,.18)}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">JOGO DA VELHA</div></div><div class="stats"><div><div class="label">X</div><div class="value" id="sx">0</div></div><div><div class="label">EMPATES</div><div class="value" id="sd">0</div></div><div><div class="label">O</div><div class="value" id="so">0</div></div></div></div>
<div class="main"><div class="modes"><button class="button active" id="ai">CONTRA IA</button><button class="button" id="pvp">2 JOGADORES</button></div><div class="board"><div class="xo-grid" id="grid"></div><div class="overlay hidden" id="overlay"><div class="overlay-title" id="result">VIT&Oacute;RIA</div><div class="overlay-sub">TOQUE EM NOVA RODADA</div></div></div><div class="controls"><button class="button primary" id="reset">NOVA RODADA</button></div><div class="status" id="status">SUA VEZ &bull; JOGUE COM X</div></div></div></div>
<script>
const grid=document.getElementById('grid'),statusEl=document.getElementById('status'),overlay=document.getElementById('overlay'),resultEl=document.getElementById('result');let board=Array(9).fill(''),turn='X',mode='ai',over=false,scores={X:0,O:0,D:0};const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b){for(const line of wins)if(b[line[0]]&&b[line[0]]===b[line[1]]&&b[line[0]]===b[line[2]])return {who:b[line[0]],line};return b.every(Boolean)?{who:'D',line:[]}:null}
function render(win=[]){grid.innerHTML='';board.forEach((v,i)=>{const b=document.createElement('button');b.className='cell'+(v==='O'?' o':'')+(win.includes(i)?' win':'');b.textContent=v;b.disabled=!!v||over;b.addEventListener('pointerdown',e=>{e.preventDefault();play(i)});grid.appendChild(b)});document.getElementById('sx').textContent=scores.X;document.getElementById('so').textContent=scores.O;document.getElementById('sd').textContent=scores.D}
function finish(r){over=true;scores[r.who]++;render(r.line);resultEl.textContent=r.who==='D'?'EMPATE':r.who+' VENCEU';overlay.classList.remove('hidden');statusEl.textContent=resultEl.textContent}
function play(i){if(over||board[i])return;board[i]=turn;let r=winner(board);if(r)return finish(r);turn=turn==='X'?'O':'X';render();statusEl.textContent='VEZ DE '+turn;if(mode==='ai'&&turn==='O')setTimeout(aiMove,280)}
function aiMove(){if(over)return;let pick=null;for(const who of ['O','X'])for(const line of wins){const vals=line.map(i=>board[i]);if(vals.filter(v=>v===who).length===2&&vals.includes('')){pick=line[vals.indexOf('')];break}if(pick!==null)break}if(pick===null&&board[4]==='')pick=4;if(pick===null){const empty=board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);pick=empty[Math.floor(Math.random()*empty.length)]}play(pick)}
function reset(){board=Array(9).fill('');turn='X';over=false;overlay.classList.add('hidden');statusEl.textContent=mode==='ai'?'SUA VEZ • JOGUE COM X':'VEZ DO JOGADOR X';render()}
function setMode(next){mode=next;document.getElementById('ai').classList.toggle('active',mode==='ai');document.getElementById('pvp').classList.toggle('active',mode==='pvp');reset()}
document.getElementById('ai').addEventListener('pointerdown',()=>setMode('ai'));document.getElementById('pvp').addEventListener('pointerdown',()=>setMode('pvp'));document.getElementById('reset').addEventListener('pointerdown',reset);reset();
</script></body>`;

export default createHtmlGameCommand({
  name: "richxo",
  commands: ["richxo", "velharich"],
  description: "Jogo da Velha Rich contra IA ou para dois jogadores.",
  usage: `${PREFIX}richxo`,
  html: RICH_XO_HTML,
  submessageText: "TAKESHI RICH XO",
  displayName: "Jogo da Velha Rich",
});
