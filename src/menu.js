/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import pkg from "../package.json" with { type: "json" };
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";

export function menuMessage(groupJid) {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${prefix}
▢ • Versão: ${pkg.version}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢
▢ • ${prefix}exec
▢ • ${prefix}getgroupid
▢ • ${prefix}off
▢ • ${prefix}on
▢ • ${prefix}setlinkertoken
▢ • ${prefix}setmenugif
▢ • ${prefix}setmenuimage
▢ • ${prefix}setprefix
▢ • ${prefix}setspiderapitoken
▢
╰━━─「🌌」─━━

╭━━⪩ ADMINS ⪨━━
▢
▢ • ${prefix}abrir
▢ • ${prefix}addautoresponder
▢ • ${prefix}agendarmensagem
▢ • ${prefix}antiaudio (1/0)
▢ • ${prefix}anticall (1/0)
▢ • ${prefix}antidocument (1/0)
▢ • ${prefix}antievent (1/0)
▢ • ${prefix}antiimage (1/0)
▢ • ${prefix}antilink (1/0)
▢ • ${prefix}antilottie-sticker (1/0)
▢ • ${prefix}antipayment (1/0)
▢ • ${prefix}antiproduct (1/0)
▢ • ${prefix}antisticker (1/0)
▢ • ${prefix}antistatus-grupo (1/0)
▢ • ${prefix}antivideo (1/0)
▢ • ${prefix}autoresponder (1/0)
▢ • ${prefix}autosticker (1/0)
▢ • ${prefix}ban
▢ • ${prefix}delete
▢ • ${prefix}deleteautoresponder
▢ • ${prefix}exit (1/0)
▢ • ${prefix}fechar
▢ • ${prefix}hidetag
▢ • ${prefix}legendabv
▢ • ${prefix}legendasaiu
▢ • ${prefix}limparchat
▢ • ${prefix}linkgrupo
▢ • ${prefix}listautoresponder
▢ • ${prefix}mute
▢ • ${prefix}onlyadmin (1/0)
▢ • ${prefix}promover
▢ • ${prefix}rebaixar
▢ • ${prefix}revelar
▢ • ${prefix}saldo
▢ • ${prefix}unmute
▢ • ${prefix}welcome (1/0)
▢
╰━━─「⭐」─━━

╭━━⪩ PRINCIPAL ⪨━━
▢
▢ • ${prefix}attp
▢ • ${prefix}brat
▢ • ${prefix}bratvid
▢ • ${prefix}cep
▢ • ${prefix}comandos
▢ • ${prefix}exemplosdemensagens
▢ • ${prefix}fakechat
▢ • ${prefix}gerarlink
▢ • ${prefix}info
▢ • ${prefix}meulid
▢ • ${prefix}perfil
▢ • ${prefix}ping
▢ • ${prefix}raw-message
▢ • ${prefix}rename
▢ • ${prefix}removebg
▢ • ${prefix}sticker
▢ • ${prefix}suporte
▢ • ${prefix}togif
▢ • ${prefix}toimage
▢ • ${prefix}tomp3
▢ • ${prefix}ttp
▢ • ${prefix}yt-search
▢
╰━━─「🚀」─━━

╭━━⪩ DOWNLOADS ⪨━━
▢
▢ • ${prefix}facebook
▢ • ${prefix}instagram
▢ • ${prefix}playaudio
▢ • ${prefix}playvideo
▢ • ${prefix}pinterest
▢ • ${prefix}tiktok
▢ • ${prefix}tiktokaudio
▢ • ${prefix}xtwitter
▢ • ${prefix}ytmp3
▢ • ${prefix}ytmp4
▢
╰━━─「🎶」─━━

╭━━⪩ BRINCADEIRAS ⪨━━
▢
▢ • ${prefix}abracar
▢ • ${prefix}beijar
▢ • ${prefix}dado
▢ • ${prefix}jantar
▢ • ${prefix}lutar
▢ • ${prefix}matar
▢ • ${prefix}socar
▢
╰━━─「🎡」─━━

╭━━⪩ IA ⪨━━
▢
▢ • ${prefix}deepseek
▢ • ${prefix}flux
▢ • ${prefix}gemini
▢ • ${prefix}gpt5mini
▢ • ${prefix}iasticker
▢ • ${prefix}transcrever
▢ • ${prefix}tts
▢
╰━━─「🚀」─━━

╭━━⪩ CANVAS ⪨━━
▢
▢ • ${prefix}blur
▢ • ${prefix}bolsonaro
▢ • ${prefix}cadeia
▢ • ${prefix}contraste
▢ • ${prefix}espelhar
▢ • ${prefix}gray
▢ • ${prefix}inverter
▢ • ${prefix}pixel
▢ • ${prefix}rip
▢
╰━━─「❇」─━━

╭━━⪩ JOGOS ⪨━━
▢
▢ • ${prefix}breakout
▢ • ${prefix}calculadora
▢ • ${prefix}dino
▢ • ${prefix}flappy
▢ • ${prefix}pianorich
▢ • ${prefix}rich2048
▢ • ${prefix}richpong
▢ • ${prefix}richslots
▢ • ${prefix}richsnake
▢ • ${prefix}richxo
▢
╰━━─「🎮」─━━`;
}
