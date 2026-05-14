import { delay } from "baileys";
import { BOT_EMOJI } from "../config.js";
import { clearChat } from "../messages.js";

export function buildCleanChatMessage() {
  return {
    botInvokeMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadataVersion: 2,
          deviceListMetadata: {},
        },
        imageMessage: {
          url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f1/m234/up-oil-image-e1bbfe2b-334b-4c5d-b716-d80edff29301?ccb=9-4&oh=01_Q5AaID0uZoxsi9v2I7KJZEgeJ7IVkFPZkt2yeYf6ps0IWG2g&oe=66E7130B&_nc_sid=000000&mms3=true",
          mimetype: "image/png",
          caption: `${BOT_EMOJI} Limpo ✅️`,
          fileSha256: "YVuPx9PoIxL0Oc3xsUc3n3uhttmVYlqUV97LKKvIjL8=",
          fileLength: "999999999",
          height: 10000000000000000,
          width: 99999999999999999999999,
          mediaKey: "4T8WJKuKvJ9FXSwldCXe5+/IA7aYi5ycf301J0xIZwA=",
          fileEncSha256: "jfG3tesFLdqtCzO6cqU51HGGkEtd7+w22aJtaEm2yjE=",
          directPath:
            "/v/t62.7118-24/29631950_1467571294644184_4827066390759523804_n.enc?ccb=11-4&oh=01_Q5AaIFPK_QoDRMR4vZIBbMTdy6GreGhSA2HHRAIu0-vAMgqN&oe=66E72F5E&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1723839207",
          jpegThumbnail: "imagenMiniaturaBase64",
          scansSidecar:
            "il8IxPgrhGdtn37jGMVgQVRKlPd/CERE+Nr822DZe2UT9r0YT3KPSQ==",
          scanLengths: [5373, 24562, 15656, 22918],
          midQualityFileSha256: "s8Li+/zg2VmzMvJtRAZHPVres8nAPEWcd11nK5b/keY=",
        },
      },
      expiration: 0,
      ephemeralSettingTimestamp: "1723838053",
      disappearingMode: {
        initiator: "CHANGED_IN_CHAT",
        trigger: "UNKNOWN",
        initiatedByMe: true,
      },
    },
  };
}

export async function sendCleanChat({
  socket,
  remoteJid,
  sendText,
  sendSuccessReply,
  successMessage,
}) {
  if (sendText) {
    await sendText(`\n\n${clearChat()}`);
  } else {
    await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} \n\n${clearChat()}`,
    });
  }

  await delay(2000);

  await socket.relayMessage(remoteJid, buildCleanChatMessage(), {});

  if (!successMessage) {
    return;
  }

  await delay(2000);

  if (sendSuccessReply) {
    await sendSuccessReply(successMessage);
    return;
  }

  await socket.sendMessage(remoteJid, {
    text: `${BOT_EMOJI} ✅ ${successMessage}`,
  });
}
