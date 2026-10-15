import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it, mock } from "node:test";

let token = "test-spider-token";
let calls = [];
let response = { response: "Resposta do suporte." };
let remoteError = null;
let rejectResponse;

mock.module("../config.js", {
  namedExports: {
    BOT_EMOJI: "🤖",
    PREFIX: "/",
    SPIDER_API_BASE_URL: "https://spider.invalid/api",
  },
});
mock.module("../utils/database.js", {
  namedExports: { getSpiderApiToken: () => token },
});
mock.module("../utils/index.js", {
  namedExports: { getRandomName: () => "support-test-image" },
});
mock.module("axios", {
  defaultExport: {
    create: () => ({
      interceptors: {
        response: { use: (_, reject) => { rejectResponse = reject; } },
      },
      post: async (url, body) => {
        calls.push({ url, body });

        if (remoteError) {
          return rejectResponse(remoteError);
        }

        return { data: response };
      },
    }),
  },
});

const { default: suporte } = await import("../commands/member/suporte.js");

function createProps(overrides = {}) {
  const replies = [];
  const reactions = [];
  const waits = [];

  return {
    fullArgs: "Como instalar o Takeshi?",
    args: ["Como", "instalar", "o", "Takeshi?"],
    replyText: "",
    isImage: false,
    isVideo: false,
    isAudio: false,
    sendReply: async (text) => { replies.push(text); },
    sendReact: async (emoji) => { reactions.push(emoji); },
    sendWaitReply: async (text) => { waits.push(text); },
    replies,
    reactions,
    waits,
    ...overrides,
  };
}

describe("suporte pela Spider X API", () => {
  beforeEach(() => {
    token = "test-spider-token";
    calls = [];
    response = { response: "Resposta do suporte." };
    remoteError = null;
  });

  it("envia a pergunta ao endpoint de suporte e responde no WhatsApp", async () => {
    const props = createProps();
    await suporte.handle(props);

    assert.deepEqual(calls, [{
      url: "https://spider.invalid/api/ai/takeshi-support?api_key=test-spider-token",
      body: { text: props.fullArgs, reply_text: null, image: null },
    }]);
    assert.deepEqual(props.replies, [response.response]);
    assert.deepEqual(props.reactions, ["🤖"]);
    assert.deepEqual(props.waits, ["Analisando sua pergunta..."]);
  });

  it("envia pergunta e mensagem citada separadamente", async () => {
    const props = createProps({ replyText: "Meu bot desliga sozinho." });
    await suporte.handle(props);
    assert.equal(calls[0].body.text, props.fullArgs);
    assert.equal(calls[0].body.reply_text, props.replyText);
  });

  it("preserva a mensagem citada sem pergunta adicional", async () => {
    const props = createProps({ args: [], fullArgs: "", replyText: "Erro no bot." });
    await suporte.handle(props);
    assert.deepEqual(calls[0].body, {
      text: null, reply_text: "Erro no bot.", image: null,
    });
  });

  it("consulta o token configurado em tempo de execução", async () => {
    await suporte.handle(createProps());
    token = "updated-test-token";
    await suporte.handle(createProps());
    assert.ok(calls[1].url.endsWith("api_key=updated-test-token"));
  });

  it("exibe ajuda sem consultar a API quando não há conteúdo", async () => {
    const props = createProps({ args: [], fullArgs: "" });
    await suporte.handle(props);
    assert.equal(calls.length, 0);
    assert.match(props.replies[0], /Takeshi Suporte/);
  });

  it("mantém os limites do texto combinado e rejeita áudio e vídeo", async () => {
    for (const [overrides, message] of [
      [{ fullArgs: "oi" }, /no mínimo 5/],
      [{ fullArgs: "a".repeat(2049) }, /no máximo 2048/],
      [{ fullArgs: "a".repeat(2030), replyText: "Mensagem anterior" }, /no máximo 2048/],
      [{ fullArgs: "😀😀" }, /no mínimo 5/],
      [{ isVideo: true }, /interpretar vídeos/],
      [{ isAudio: true }, /interpretar áudios/],
    ]) {
      await assert.rejects(suporte.handle(createProps(overrides)), message);
    }

    assert.equal(calls.length, 0);
  });

  it("explica quando o token da Spider não está configurado", async () => {
    token = "seu_token_aqui";
    await assert.rejects(suporte.handle(createProps()), /Token da API do Spider X não configurado/);
    assert.equal(calls.length, 0);
  });

  it("preserva erros de validação e falhas da API", async () => {
    remoteError = {
      response: { data: { errors: { image: ["A imagem deve ter no máximo 5 MB."] } } },
    };
    await assert.rejects(suporte.handle(createProps()), {
      name: "InvalidParameterError", message: "A imagem deve ter no máximo 5 MB.",
    });

    remoteError = new Error("Falha de conexão simulada");
    await assert.rejects(suporte.handle(createProps()), remoteError);
  });

  it("rejeita respostas vazias ou inválidas", async () => {
    for (const answer of [undefined, null, "", "   ", []]) {
      response = { response: answer };
      await assert.rejects(suporte.handle(createProps()), {
        name: "DangerError", message: /Não consegui encontrar uma resposta/,
      });
    }
  });

  it("envia imagens sem texto com MIME real e apaga o arquivo temporário", async () => {
    const images = [
      ["image/png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=", "base64")],
      ["image/jpeg", Buffer.from("ffd8ffe000104a46494600010100000100010000", "hex")],
      ["image/webp", Buffer.from("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", "base64")],
    ];
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takeshi-support-"));

    try {
      for (const [mime, buffer] of images) {
        const imagePath = path.join(directory, "download.png");
        fs.writeFileSync(imagePath, buffer);
        const props = createProps({
          args: [], fullArgs: "", isImage: true,
          downloadImage: async () => imagePath,
        });
        await suporte.handle(props);
        assert.deepEqual(calls.at(-1).body, {
          text: null, reply_text: null,
          image: `data:${mime};base64,${buffer.toString("base64")}`,
        });
        assert.equal(fs.existsSync(imagePath), false);
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("apaga a imagem também em falhas e rejeita formatos e tamanhos inválidos", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takeshi-support-"));
    const imagePath = path.join(directory, "download.png");
    const props = createProps({ isImage: true, downloadImage: async () => imagePath });

    try {
      fs.writeFileSync(imagePath, Buffer.alloc(5 * 1024 * 1024 + 1));
      await assert.rejects(suporte.handle(props), /no máximo 5 MB/);
      assert.equal(fs.existsSync(imagePath), false);

      fs.writeFileSync(imagePath, "GIF89a1234567890");
      await assert.rejects(suporte.handle(props), /JPEG, PNG ou WebP/);
      assert.equal(fs.existsSync(imagePath), false);
      assert.equal(calls.length, 0);

      fs.writeFileSync(imagePath, Buffer.from("ffd8ffe000104a46494600010100000100010000", "hex"));
      remoteError = new Error("Falha de conexão simulada");
      await assert.rejects(suporte.handle(props), remoteError);
      assert.equal(fs.existsSync(imagePath), false);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].body.text, props.fullArgs);
      assert.match(calls[0].body.image, /^data:image\/jpeg;base64,/);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
