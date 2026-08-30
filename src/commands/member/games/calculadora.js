/**
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { ARCADE_BASE_CSS, createHtmlGameCommand } from "./_htmlGameCommand.js";

export function evaluateCalculatorExpression(source) {
  let at = 0;

  function skipSpaces() {
    while (source[at] === " ") at++;
  }

  function readNumber() {
    skipSpaces();
    const start = at;
    while (/[0-9.]/.test(source[at] || "")) at++;
    if (start === at) throw new Error("Número esperado.");

    const value = Number(source.slice(start, at));
    if (!Number.isFinite(value)) throw new Error("Número inválido.");
    return value;
  }

  function readFactor() {
    skipSpaces();
    if (source[at] === "+") {
      at++;
      return readFactor();
    }
    if (source[at] === "-") {
      at++;
      return -readFactor();
    }
    if (source[at] === "(") {
      at++;
      const value = readAddition();
      skipSpaces();
      if (source[at] !== ")") throw new Error("Parêntese não fechado.");
      at++;
      return value;
    }
    return readNumber();
  }

  function readMultiplication() {
    let value = readFactor();
    while (true) {
      skipSpaces();
      const operator = source[at];
      if (operator !== "*" && operator !== "/") return value;
      at++;
      const right = readFactor();
      value = operator === "*" ? value * right : value / right;
    }
  }

  function readAddition() {
    let value = readMultiplication();
    while (true) {
      skipSpaces();
      const operator = source[at];
      if (operator !== "+" && operator !== "-") return value;
      at++;
      const right = readMultiplication();
      value = operator === "+" ? value + right : value - right;
    }
  }

  const value = readAddition();
  skipSpaces();
  if (at !== source.length) throw new Error("Expressão inválida.");
  return value;
}

export const CALCULATOR_HTML = `<style>
${ARCADE_BASE_CSS}
.calculator{padding:13px;background:#10181d}.display{min-height:83px;padding:13px 15px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:#071015;text-align:right;overflow:hidden}.expression{height:20px;font:13px monospace;color:rgba(255,255,255,.4);white-space:nowrap;overflow:hidden}.result{margin-top:8px;font:700 29px monospace;color:#fff;white-space:nowrap;overflow:hidden}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:10px}.key{height:49px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.065);color:#eef3f5;font:bold 16px Arial}.operator{color:#9ddcff;background:rgba(61,139,179,.16)}.danger{color:#ff9aa8;background:rgba(181,66,84,.14)}.equals{background:linear-gradient(135deg,#7c54e3,#3a7dbf);grid-row:span 2;height:auto}.zero{grid-column:span 2}
</style><body><div class="wrap"><div class="card"><div class="head"><div><div class="brand">TAKESHI UTILIT&Aacute;RIOS</div><div class="title">CALCULADORA</div></div><div class="stats"><div><div class="label">MODO</div><div class="value">DEC</div></div></div></div>
<div class="main"><div class="calculator"><div class="display"><div class="expression" id="expression">PRONTA</div><div class="result" id="result">0</div></div><div class="keys" id="keys"><button class="key danger" data-key="clear">C</button><button class="key operator" data-key="(">(</button><button class="key operator" data-key=")">)</button><button class="key operator" data-key="back">&#8592;</button><button class="key" data-key="7">7</button><button class="key" data-key="8">8</button><button class="key" data-key="9">9</button><button class="key operator" data-key="/">&divide;</button><button class="key" data-key="4">4</button><button class="key" data-key="5">5</button><button class="key" data-key="6">6</button><button class="key operator" data-key="*">&times;</button><button class="key" data-key="1">1</button><button class="key" data-key="2">2</button><button class="key" data-key="3">3</button><button class="key operator" data-key="-">&minus;</button><button class="key zero" data-key="0">0</button><button class="key" data-key=".">.</button><button class="key operator" data-key="+">+</button><button class="key equals" data-key="equals">=</button></div></div><div class="status">C&Aacute;LCULO LOCAL &bull; SEM ENVIO DE DADOS</div></div></div></div>
<script>
const expressionEl=document.getElementById('expression'),resultEl=document.getElementById('result');let expression='',justSolved=false;
function show(){expressionEl.textContent=expression||'PRONTA';resultEl.textContent=expression||'0'}
${evaluateCalculatorExpression.toString()}
function calculate(){if(!expression)return;if(!/^[-0-9+*/(). ]+$/.test(expression))return error();try{const value=evaluateCalculatorExpression(expression);if(typeof value!=='number'||!Number.isFinite(value))return error();const shown=String(Math.round((value+Number.EPSILON)*1e10)/1e10);expressionEl.textContent=expression+' =';resultEl.textContent=shown;expression=shown;justSolved=true}catch(e){error()}}
function error(){expressionEl.textContent='ERRO';resultEl.textContent='0';expression='';justSolved=false}
function input(key){if(key==='clear'){expression='';justSolved=false;return show()}if(key==='back'){expression=expression.slice(0,-1);justSolved=false;return show()}if(key==='equals')return calculate();if(justSolved&&!['+','-','*','/'].includes(key))expression='';justSolved=false;if(expression.length>=28)return;expression+=key;show()}
document.getElementById('keys').addEventListener('pointerdown',e=>{const button=e.target.closest('[data-key]');if(!button)return;e.preventDefault();input(button.dataset.key)});document.addEventListener('keydown',e=>{if(/^[-0-9+*/().]$/.test(e.key))input(e.key);else if(e.key==='Enter'||e.key==='=')input('equals');else if(e.key==='Backspace')input('back');else if(e.key==='Escape')input('clear')});show();
</script></body>`;

export default createHtmlGameCommand({
  name: "calculadora",
  commands: ["calculadora", "calc", "richcalc"],
  description: "Calculadora interativa dentro do WhatsApp.",
  usage: `${PREFIX}calculadora`,
  html: CALCULATOR_HTML,
  submessageText: "TAKESHI CALCULADORA",
  displayName: "Calculadora",
});
