import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "exemplo-album",
  description: "Exemplo de como enviar várias imagens em um álbum",
  commands: ["exemplo-album"],
  usage: `${PREFIX}exemplo-album`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendAlbumFromURLs, sendReply, sendReact }) => {
    await sendReact("🖼️");

    await delay(2000);

    await sendReply("Vou enviar várias imagens em um único álbum");

    await delay(3000);

    await sendAlbumFromURLs(
      [
        "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
        "https://api.spiderx.com.br/assets/images/logo.png",
        "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
      ],
      "🖼️ Este é um exemplo de álbum",
    );

    await delay(3000);

    await sendReply(`📋 *Como enviar álbuns:*

\`\`\`
await sendAlbumFromURLs(
  ["url-da-imagem-1", "url-da-imagem-2", "url-da-imagem-3"],
  "Legenda do álbum"
);
\`\`\`

💡 *Dicas:*
• O álbum agrega várias imagens em uma única mensagem
• O máximo é de 10 imagens por álbum
• A legenda aparece na primeira imagem
• Se o envio do álbum falhar, as imagens são enviadas separadamente`);
  },
};
