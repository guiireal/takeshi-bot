import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, it, mock } from "node:test";

let calls = [];
let remoteError = null;

mock.module("../config.js", {
  namedExports: {
    PREFIX: "/",
    SPIDER_API_BASE_URL: "https://spider.invalid/api",
  },
});
mock.module("../utils/database.js", {
  namedExports: { getSpiderApiToken: () => "test-token" },
});
mock.module("../utils/index.js", {
  namedExports: { getRandomName: () => "text-ai-test-image" },
});
mock.module("axios", {
  defaultExport: {
    create: () => ({
      interceptors: { response: { use: () => {} } },
      post: async (url, body) => {
        calls.push({ url, body });
        if (remoteError) {
          throw remoteError;
        }
        return { data: { response: "Vejo um gato." } };
      },
    }),
  },
});

const models = [
  ["gemini", "gemini", "gemini"],
  ["qwen-3-7-flash", "qwen37Flash", "qwen3-7-flash"],
  ["qwen-3-8-flash", "qwen38Flash", "qwen3-8-flash"],
  ["gpt-5-6-luna", "gpt56Luna", "gpt-5-6-luna"],
  ["gpt-6-luna", "gpt6Luna", "gpt-6-luna"],
  ["claude-haiku-5-5", "claudeHaiku55", "claude-haiku-5-5"],
];
const service = await import("../services/spider-x-api.js");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=", "base64");

function createProps(overrides = {}) {
  return {
    args: ["o que vc ve"], replyText: "", isImage: false,
    sendWaitReply: async () => {},
    sendSuccessReply: async () => {},
    ...overrides,
  };
}

async function withImage(buffer, run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takeshi-text-ai-"));
  const imagePath = path.join(directory, "image.png");
  fs.writeFileSync(imagePath, buffer);
  const webMessage = { message: { imageMessage: { caption: "/gemini o que vc ve" } } };
  const props = createProps({
    isImage: true,
    webMessage,
    downloadImage: async (message) => {
      assert.equal(message, webMessage);
      return imagePath;
    },
  });

  try {
    await run(props, imagePath);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

beforeEach(() => {
  calls = [];
  remoteError = null;
});

for (const [file, serviceName, route] of models) {
  const { default: command } = await import(`../commands/member/ia/${file}.js`);

  it(`${file}: encaminha imagem e legenda até o corpo HTTP e limpa o arquivo`, async () => {
    await withImage(png, async (props, imagePath) => {
      const replies = [];
      props.webMessage.message.imageMessage.caption = `/${command.commands[0]} o que vc ve`;
      props.sendSuccessReply = async (text) => { replies.push(text); };
      await command.handle(props);
      assert.deepEqual(calls, [{
        url: `https://spider.invalid/api/ai/${route}?api_key=test-token`,
        body: { text: "o que vc ve", image: `data:image/png;base64,${png.toString("base64")}` },
      }]);
      assert.equal(fs.existsSync(imagePath), false);
      assert.deepEqual(replies, ["Vejo um gato."]);
    });
  });

  it(`${file}: mantém texto, contexto e imagem opcional`, async () => {
    await command.handle(createProps());
    assert.deepEqual(calls[0].body, { text: "o que vc ve" });
    await command.handle(createProps({ replyText: "Uma mensagem anterior." }));
    assert.deepEqual(calls[1].body, { text: "o que vc ve\n\nComplemento: Uma mensagem anterior." });
    await command.handle(createProps({ args: [], replyText: "Uma mensagem anterior." }));
    assert.deepEqual(calls[2].body, { text: "Uma mensagem anterior." });
  });

  it(`${file}: continua exigindo texto mesmo com imagem`, async () => {
    await assert.rejects(command.handle(createProps({ args: [], isImage: true })), /precisa me dizer/);
    assert.equal(calls.length, 0);
    await assert.rejects(service[serviceName]("", "data:image/png;base64,AA=="), /parâmetro de texto/);
  });
}

const { default: gemini } = await import("../commands/member/ia/gemini.js");

for (const [mime, buffer] of [
  ["image/jpeg", Buffer.from("ffd8ffe000104a46494600010100000100010000", "hex")],
  ["image/webp", Buffer.from("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", "base64")],
]) {
  it(`envia o MIME real ${mime} mesmo com extensão .png`, async () => {
    await withImage(buffer, async (props, imagePath) => {
      await gemini.handle(props);
      assert.equal(calls[0].body.image, `data:${mime};base64,${buffer.toString("base64")}`);
      assert.equal(fs.existsSync(imagePath), false);
    });
  });
}

for (const [buffer, message] of [
  [Buffer.alloc(5 * 1024 * 1024 + 1), /no máximo 5 MB/],
  [Buffer.from("GIF89a1234567890"), /JPEG, PNG ou WebP/],
]) {
  it(`rejeita imagem inválida (${message}) e limpa o arquivo`, async () => {
    await withImage(buffer, async (props, imagePath) => {
      await assert.rejects(gemini.handle(props), message);
      assert.equal(calls.length, 0);
      assert.equal(fs.existsSync(imagePath), false);
    });
  });
}

it("limpa a imagem também quando a API falha", async () => {
  remoteError = new Error("Falha de conexão simulada");
  await withImage(png, async (props, imagePath) => {
    await assert.rejects(gemini.handle(props), remoteError);
    assert.equal(fs.existsSync(imagePath), false);
    assert.match(calls[0].body.image, /^data:image\/png;base64,/);
  });
});

it("propaga falha no download sem consultar a API", async () => {
  await assert.rejects(gemini.handle(createProps({
    isImage: true,
    downloadImage: async () => { throw new Error("Falha no download"); },
  })), /Falha no download/);
  assert.equal(calls.length, 0);
});

it("GPT-5 Mini e DeepSeek continuam enviando somente texto", async () => {
  await service.gpt5Mini("o que vc ve", "data:image/png;base64,AA==");
  await service.deepseekV4Flash("o que vc ve", "data:image/png;base64,AA==");
  assert.deepEqual(calls.map(({ body }) => body), [{ text: "o que vc ve" }, { text: "o que vc ve" }]);
});
