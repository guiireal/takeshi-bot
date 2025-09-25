const {
  updateIsActiveGroupRestriction,
} = require(`${BASE_DIR}/utils/database`);

const { isActiveGroupRestriction } = require(`${BASE_DIR}/utils/database`);

const { WarningError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "anti-audio",
  description:
    "Ativa/desativa o recurso de anti-audio no grupo, apagando a mensagem de áudio se estiver ativo.",
  commands: ["anti-audio", "anti-audios"],
  usage: `${PREFIX}anti-audio (1/0)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, isGroup, args, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só deve ser usado em grupos!");
    }

    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const antiAudioOn = args[0] == "1";
    const antiAudioOff = args[0] == "0";

    if (!antiAudioOn && !antiAudioOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive =
      antiAudioOn && isActiveGroupRestriction(remoteJid, "anti-audio");

    const hasInactive =
      antiAudioOff && !isActiveGroupRestriction(remoteJid, "anti-audio");

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-audio já está ${
          antiAudioOn ? "ativado" : "desativado"
        }!`
      );
    }

    updateIsActiveGroupRestriction(remoteJid, "anti-audio", antiAudioOn);

    const status = antiAudioOn ? "ativado" : "desativado";

    await sendSuccessReply(`Anti-audio ${status} com sucesso!`);
  },
};
