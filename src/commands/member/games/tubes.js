import { PREFIX } from "../../../config.js";

const SITE_URL = "https://games.devgui.dev/tubes";

export default {
  name: "tubes",
  description: "Abre o jogo Tubes na Web View do WhatsApp.",
  commands: ["tubes"],
  usage: `${PREFIX}tubes`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendButtons, sendSuccessReact }) => {
    await sendButtons({
      text: "🧪 *Tubes*\n\nOrganize as cores nos tubos! Toque em *Jogar no WhatsApp* para abrir o jogo.",
      footer: "Takeshi Bot • Games",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: {
            display_text: "🧪",
            id: "🧪",
          },
        },
        {
          name: "open_webview",
          buttonParamsJson: {
            title: "Jogar no WhatsApp",
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
