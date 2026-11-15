import assert from "node:assert/strict";
import { beforeEach, it, mock } from "node:test";

let calls;
let response;
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
      interceptors: { response: { use: () => {} } },
      post: async (url, body, options) => {
        calls.push({ url, body, options });
        return response;
      },
    }),
  },
});

const { specialTts } = await import("../services/spider-x-api.js");
beforeEach(() => {
  calls = [];
  token = "test-token";
  response = { data: Buffer.from("audio"), headers: { "content-type": "audio/mpeg" } };
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
      sendAudioFromBuffer: async (...args) => delivered.push(args),
      sendSuccessReact: async () => {},
    });
    assert.equal(calls[0].url, `https://spider.invalid/api/ai/special-tts/${voice}`);
    assert.deepEqual(calls[0].body, { text: "Bom dia!" });
    assert.equal(calls[0].options.headers["X-API-KEY"], token);
    assert.equal(calls[0].options.responseType, "arraybuffer");
    assert.deepEqual(delivered, [[response.data, true]]);
    const transform = calls[0].options.transformResponse[0];
    assert.deepEqual(transform(Buffer.from('{"errors":{"text":["Inválido"]}}'), { "content-type": "application/json" }), { errors: { text: ["Inválido"] } });
  });

  it(`${voice}: recusa texto vazio antes de chamar a API`, async () => {
    await assert.rejects(command.handle({ fullArgs: "  " }), /Informe o texto/);
    assert.equal(calls.length, 0);
  });
}

it("recusa resposta inválida e token ausente", async () => {
  response.headers["content-type"] = "application/json";
  await assert.rejects(specialTts("Olá", "lula"), /áudio válido/);
  token = "";
  calls = [];
  await assert.rejects(specialTts("Olá", "bolsonaro"), /não configurado/);
  assert.equal(calls.length, 0);
});
