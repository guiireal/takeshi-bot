import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-documento-de-url",
  description: "Exemplo de como enviar documentos a partir de URLs",
  commands: ["enviar-documento-de-url"],
  usage: `${PREFIX}enviar-documento-de-url`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendDocumentFromURL, sendReact }) => {
    await sendReact("📄");

    await delay(3000);

    await sendReply(
      "Vou enviar diferentes tipos de documentos a partir de URLs"
    );

    await delay(3000);

    await sendDocumentFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-document.pdf",
      "application/pdf",
      "documento-pdf-da-url.pdf"
    );

    await delay(3000);

    await sendDocumentFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-text.txt",
      "text/plain",
      "arquivo-texto-da-url.txt"
    );

    await delay(3000);

    await sendDocumentFromURL(
      "https://raw.githubusercontent.com/guiireal/takeshi-bot/refs/heads/main/README.md",
      "text/markdown",
      "readme-exemplo.md"
    );

    await delay(3000);

    await sendReply("Você também pode enviar documentos com mimetype padrão:");

    await delay(3000);

    await sendDocumentFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-document.pdf"
    );

    await delay(3000);

    await sendReply(
      "Para enviar documentos de URL, use a função sendDocumentFromURL(url, mimetype, fileName).\n\n" +
        "Isso é útil quando você tem documentos hospedados online ou obtidos de APIs."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Certifique-se de que a URL aponta para um arquivo válido e acessível."
    );
  },
};
