import { PREFIX } from "../../../config.js";

const SITE_URL = "https://api.spiderx.com.br";

export default {
  name: "enviar-webview",
  description:
    "Exemplo de abertura de um site no navegador ou na Web View do WhatsApp.",
  commands: ["enviar-webview", "webview", "exemplo-webview"],
  usage: `${PREFIX}enviar-webview`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendButtons, sendSuccessReact }) => {
    await sendButtons({
      text: "🌐 *Spider X API*\n\nEscolha como abrir o site: no navegador ou dentro do WhatsApp.",
      footer: "Takeshi Bot • Web View",
      interactiveButtons: [
        {
          name: "cta_url",
          buttonParamsJson: {
            display_text: "Abrir no navegador",
            url: SITE_URL,
          },
        },
        {
          name: "open_webview",
          buttonParamsJson: {
            title: "Abrir webview",
            link: {
              url: SITE_URL,
              in_app_webview: true,
              full_screen: true,
            },
          },
        },
      ],
      viewOnce: true,
    });

    await sendSuccessReact();
  },
};
