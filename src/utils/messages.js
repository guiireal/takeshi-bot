/**
 * Mensagens do bot
 *
 * @author Dev Gui
 */
const { BOT_NAME, PREFIX } = require("../config");

exports.waitMessage = "Carregando dados...";

exports.menuMessage = () => {
  const date = new Date();

  return `╭━━⪩ BEM VINDO! ⪨━━
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${PREFIX}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢
▢ • ${PREFIX}exec 
▢ • ${PREFIX}getcmd
▢ • ${PREFIX}idget
▢ • ${PREFIX}off
▢ • ${PREFIX}on
▢ • ${PREFIX}restart (Caso pm2)
▢
╰━━─「🌌」─━━

╭━━⪩ ADMINS ⪨━━
▢
▢ • ${PREFIX}add
▢ • ${PREFIX}agp
▢ • ${PREFIX}anti-link (1/0)
▢ • ${PREFIX}auto-responder (1/0)
▢ • ${PREFIX}ban
▢ • ${PREFIX}exit (1/0)
▢ • ${PREFIX}fgp
▢ • ${PREFIX}hidetag
▢ • ${PREFIX}limpar
▢ • ${PREFIX}promover
▢ • ${PREFIX}rebaixar
▢ • ${PREFIX}resetname
▢ • ${PREFIX}reviver
▢ • ${PREFIX}setname
▢ • ${PREFIX}welcome (1/0)
▢
╰━━─「⭐」─━━

╭━━⪩ PRINCIPAL ⪨━━
▢
▢ • ${PREFIX}attp
▢ • ${PREFIX}cep
▢ • ${PREFIX}google-search
▢ • ${PREFIX}perfil
▢ • ${PREFIX}ping
▢ • ${PREFIX}sticker
▢ • ${PREFIX}tik-tok-search
▢ • ${PREFIX}to-image
▢ • ${PREFIX}ttp
▢ • ${PREFIX}yt-search
▢
╰━━─「🚀」─━━

╭━━⪩ DOWNLOADS ⪨━━
▢
▢ • ${PREFIX}play-audio
▢ • ${PREFIX}play-video
▢ • ${PREFIX}tik-tok
▢ • ${PREFIX}yt-mp3
▢ • ${PREFIX}yt-mp4
▢
╰━━─「🎶」─━━

╭━━⪩ IA ⪨━━
▢
▢ • ${PREFIX}gpt-4
▢ • ${PREFIX}ia-sticker
▢ • ${PREFIX}pixart
▢ • ${PREFIX}stable-diffusion-turbo
▢
╰━━─「🚀」─━━

╭━━⪩ CANVAS ⪨━━
▢
▢ • ${PREFIX}bolsonaro
▢ • ${PREFIX}cadeia
▢ • ${PREFIX}inverter
▢ • ${PREFIX}rip
▢
╰━━─「❇」─━━

╭━━⪩ BRINCADEIRAS ⪨━━
▢
▢ • ${PREFIX}abracar
▢ • ${PREFIX}beijar
▢ • ${PREFIX}jantar
▢ • ${PREFIX}lutar
▢ • ${PREFIX}matar
▢ • ${PREFIX}socar
▢ • ${PREFIX}tapa
▢
╰━━─「🌀」─━━`;
};