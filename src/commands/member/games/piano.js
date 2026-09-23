import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export function noteFrequency(semitone, octave) {
  return 440 * 2 ** (((octave + 1) * 12 + semitone - 69) / 12);
}

export const PIANO_HTML = `<style>
${ARCADE_BASE_CSS}
.instrument{padding:18px 12px 14px;background:#10181d}
.range{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px}
.range button{width:42px;height:42px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:#263640;color:#fff;font-size:23px}
.range button:disabled{opacity:.35}
.range span{min-width:120px;text-align:center;font-size:13px;font-weight:700;color:#e7eef3}
.keyboard{position:relative;display:flex;height:190px;touch-action:none}
.white{position:relative;flex:1;min-width:0;border:1px solid #8d969e;border-radius:0 0 7px 7px;background:linear-gradient(#fff,#d9e0e5);color:#18242c;font-weight:700;font-size:11px;padding:0 2px 13px;display:flex;align-items:end;justify-content:center}
.white+.white{border-left:0}
.white.active{background:linear-gradient(#c8e9fb,#8ac7eb)}
.black{position:absolute;top:0;z-index:1;width:8%;height:113px;transform:translateX(-50%);border:1px solid #03080c;border-radius:0 0 6px 6px;background:linear-gradient(100deg,#2e3b46,#080e13 60%);box-shadow:0 4px 6px #0008;color:#e9f4fa;font-size:10px;font-weight:700;padding:0 1px 12px;display:flex;align-items:end;justify-content:center}
.black.active{background:linear-gradient(#286891,#124b70)}
.keyboard button{touch-action:none;-webkit-tap-highlight-color:transparent}
.hint{text-align:center;color:var(--ink-dim);font-size:11px;line-height:1.5;margin-top:13px}
</style><body><div class="wrap"><div class="card">
<div class="head"><div><div class="brand">TAKESHI ARCADE</div><div class="title">PIANO</div></div><div class="stats"><div><div class="label">NOTA</div><div class="value" id="note">—</div></div></div></div>
<div class="instrument"><div class="range"><button id="lower" aria-label="Oitava abaixo">−</button><span id="range">Dó4 a Dó5</span><button id="higher" aria-label="Oitava acima">+</button></div>
<div class="keyboard" id="keyboard">
<button class="white" data-note="0" aria-label="Dó">Dó</button>
<button class="white" data-note="2" aria-label="Ré">Ré</button>
<button class="white" data-note="4" aria-label="Mi">Mi</button>
<button class="white" data-note="5" aria-label="Fá">Fá</button>
<button class="white" data-note="7" aria-label="Sol">Sol</button>
<button class="white" data-note="9" aria-label="Lá">Lá</button>
<button class="white" data-note="11" aria-label="Si">Si</button>
<button class="white" data-note="12" aria-label="Dó">Dó</button>
<button class="black" data-note="1" style="left:12.5%" aria-label="Dó sustenido">Dó♯</button>
<button class="black" data-note="3" style="left:25%" aria-label="Ré sustenido">Ré♯</button>
<button class="black" data-note="6" style="left:50%" aria-label="Fá sustenido">Fá♯</button>
<button class="black" data-note="8" style="left:62.5%" aria-label="Sol sustenido">Sol♯</button>
<button class="black" data-note="10" style="left:75%" aria-label="Lá sustenido">Lá♯</button>
</div><div class="hint" id="hint">Toque nas teclas para ouvir as notas.<br>No teclado: A S D F G H J K e W E T Y U.</div></div></div></div>
<script>
${noteFrequency.toString()}
const names=['Dó','Dó♯','Ré','Ré♯','Mi','Fá','Fá♯','Sol','Sol♯','Lá','Lá♯','Si','Dó'];
const keyboard={a:0,w:1,s:2,e:3,d:4,f:5,t:6,g:7,y:8,h:9,u:10,j:11,k:12};
const keys=document.querySelectorAll('[data-note]');
const noteEl=document.getElementById('note');
const rangeEl=document.getElementById('range');
const hintEl=document.getElementById('hint');
let octave=4;
let audio;
function play(semitone){
  try{
    audio=audio||new(window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    const now=audio.currentTime;
    const oscillator=audio.createOscillator();
    const gain=audio.createGain();
    oscillator.type='triangle';
    oscillator.frequency.value=noteFrequency(semitone,octave);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.18,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+1.4);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now+1.42);
    noteEl.textContent=names[semitone]+(octave+(semitone===12?1:0));
  }catch(e){hintEl.textContent='Áudio indisponível neste WhatsApp.'}
}
keys.forEach(key=>{
  key.addEventListener('pointerdown',e=>{
    e.preventDefault();
    key.setPointerCapture(e.pointerId);
    key.classList.add('active');
    play(Number(key.dataset.note));
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])key.addEventListener(event,()=>key.classList.remove('active'));
});
document.addEventListener('keydown',e=>{
  const semitone=keyboard[e.key.toLowerCase()];
  if(semitone===undefined||e.repeat)return;
  e.preventDefault();
  const key=document.querySelector('[data-note="'+semitone+'"]');
  key.classList.add('active');
  play(semitone);
});
document.addEventListener('keyup',e=>{
  const semitone=keyboard[e.key.toLowerCase()];
  if(semitone!==undefined)document.querySelector('[data-note="'+semitone+'"]').classList.remove('active');
});
window.addEventListener('blur',()=>keys.forEach(key=>key.classList.remove('active')));
function setOctave(value){
  octave=Math.max(2,Math.min(6,value));
  rangeEl.textContent='Dó'+octave+' a Dó'+(octave+1);
  document.getElementById('lower').disabled=octave===2;
  document.getElementById('higher').disabled=octave===6;
}
document.getElementById('lower').addEventListener('click',()=>setOctave(octave-1));
document.getElementById('higher').addEventListener('click',()=>setOctave(octave+1));
setOctave(octave);
</script></body>`;

export default createHtmlGameCommand({
  name: "piano",
  commands: ["piano"],
  description: "Piano com teclas brancas e pretas para tocar dentro do WhatsApp.",
  usage: `${PREFIX}piano`,
  html: PIANO_HTML,
  submessageText: "TAKESHI PIANO",
  displayName: "Piano",
});
