import { delay } from "zapo-js";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";

export default {
  name: "enviar-documento-de-arquivo",
  description: "Exemplo de como enviar documentos a partir de arquivos locais",
  commands: ["enviar-documento-de-arquivo"],
  usage: `${PREFIX}enviar-documento-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendDocumentFromFile, sendReact }) => {
    await sendReact("📄");

    await delay(3000);

    await sendReply(
      "Vou enviar diferentes tipos de documentos a partir de arquivos locais"
    );

    await delay(3000);

    await sendDocumentFromFile(
      path.join(ASSETS_DIR, "samples", "sample-document.pdf"),
      "application/pdf",
      "documento-exemplo.pdf"
    );

    await delay(3000);

    await sendDocumentFromFile(
      path.join(ASSETS_DIR, "samples", "sample-text.txt"),
      "text/plain",
      "arquivo-texto-exemplo.txt"
    );

    await delay(3000);

    await sendDocumentFromFile(
      path.join(ASSETS_DIR, "samples", "sample-document.txt"),
      "text/plain",
      "outro-documento.txt"
    );

    await delay(3000);

    await sendReply("Você também pode enviar documentos com mimetype padrão:");

    await delay(3000);

    await sendDocumentFromFile(
      path.join(ASSETS_DIR, "samples", "sample-document.pdf")
    );

    await delay(3000);

    await sendReply(
      "Para enviar documentos de arquivo, use a função sendDocumentFromFile(filePath, mimetype, fileName).\n\n" +
        "Isso é útil quando você tem documentos armazenados localmente no servidor."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Você pode especificar o mimetype para diferentes tipos: PDF, TXT, DOC, XLS, etc."
    );
  },
};
