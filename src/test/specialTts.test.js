import assert from "node:assert/strict";
import { beforeEach, it, mock } from "node:test";

let calls;
let response;
let remoteError;
let rejectResponse;
let token = "test-token";
mock.module("../config.js", {
  namedExports: { PREFIX: "/", SPIDER_API_BASE_URL: "https://spider.invalid/api" },
});
mock.module("../utils/database.js", {
  namedExports: { getSpiderApiToken: () => token },
});
mock.module("axios", {
  defaultExport: {
    create: () => ({
      interceptors: { response: { use: (_, reject) => { rejectResponse = reject; } } },
      post: async (url, body, options) => {
        calls.push({ url, body, options });
        if (remoteError) {
          return rejectResponse(remoteError);
        }
        return response;
      },
    }),
  },
});

const { specialTts } = await import("../services/spider-x-api.js");
beforeEach(() => {
  calls = [];
  token = "test-token";
  response = { data: { success: true, url: "https://spider.invalid/storage/aB7kP2mX9qRt.mp3" } };
  remoteError = null;
});

for (const voice of ["lula", "bolsonaro"]) {
  const { default: command } = await import(`../commands/member/ia/voz-${voice}.js`);

  it(`${voice}: envia texto para a rota correta e entrega o áudio`, async () => {
    const delivered = [];
    assert.equal(command.name, `voz-${voice}`);
    assert.deepEqual(command.commands, [`voz${voice}`, `${voice}voz`, `voice${voice}`, `${voice}voice`]);
    await command.handle({
      fullArgs: "  Bom dia!  ",
      sendWaitReply: async () => {},
      sendAudioFromURL: async (...args) => delivered.push(args),
      sendSuccessReact: async () => {},
    });
    assert.equal(calls[0].url, `https://spider.invalid/api/ai/special-tts/${voice}`);
    assert.deepEqual(calls[0].body, { text: "Bom dia!" });
    assert.equal(calls[0].options.headers["X-API-KEY"], token);
    assert.equal(calls[0].options.responseType, undefined);
    assert.deepEqual(delivered, [[response.data.url, true]]);
  });

  it(`${voice}: recusa texto vazio antes de chamar a API`, async () => {
    await assert.rejects(command.handle({ fullArgs: "  " }), /Informe o texto/);
    assert.equal(calls.length, 0);
  });
}

it("recusa resposta inválida e token ausente", async () => {
  for (const data of [{ success: false }, { success: true }, { success: true, url: "" }, { success: true, url: "file:///tmp/audio.mp3" }]) {
    response = { data };
    await assert.rejects(specialTts("Olá", "lula"), /URL de áudio válida/);
  }
  token = "";
  calls = [];
  await assert.rejects(specialTts("Olá", "bolsonaro"), /não configurado/);
  assert.equal(calls.length, 0);
});

it("preserva os erros de validação e serviço sem enviar áudio", async () => {
  remoteError = { response: { data: { errors: { text: ["O texto deve ter até 512 caracteres."] } } } };
  await assert.rejects(specialTts("Olá", "lula"), /até 512 caracteres/);
  remoteError = new Error("Serviço indisponível");
  await assert.rejects(specialTts("Olá", "bolsonaro"), /Serviço indisponível/);
});
