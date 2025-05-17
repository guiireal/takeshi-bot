const { delay } = require("baileys");
const { BOT_EMOJI } = require(`${BASE_DIR}/config`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "limpar",
  description: "Limpa o histórico de mensagens do grupo.",
  commands: ["limpar", "limpa", "clear", "clear-chat"],
  usage: `${PREFIX}limpar`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, isGroup, sendSuccessReact }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    await sendSuccessReact();

    await delay(1000);

    const cleanMessage = {
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
            midQualityFileSha256:
              "s8Li+/zg2VmzMvJtRAZHPVres8nAPEWcd11nK5b/keY=",
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

    await socket.relayMessage(remoteJid, cleanMessage, {});
  },
};
