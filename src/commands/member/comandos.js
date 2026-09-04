import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";

export default {
  name: "comandos",
  description: "Lista todos os comandos existentes no formato de imagem.",
  commands: [
    "comandos",
    "comando",
    "commandlist",
    "listacomando",
    "listacomandos",
    "listadecomando",
    "listadecomandos",
    "listcomando",
    "listcomandos",
    "catalogo",
    "catalog",
  ],
  usage: `${PREFIX}comandos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendImageFromFile, sendSuccessReact }) => {
    await sendSuccessReact();
    await sendImageFromFile(
      path.resolve(ASSETS_DIR, "images", "guia-de-comandos.png"),
    );
  },
};
