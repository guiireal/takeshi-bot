import assert from "node:assert/strict";
import { it, mock } from "node:test";

const baseUrl = "https://spider.invalid/api";
const image = "https://spider.invalid/assets/images/signs/cancer.png";
const text = "♋ *CÂNCER* ♋\n\nPrevisão do dia";
const get = mock.fn(async (_url, { timeout }) => {
  if (timeout < 20000) {
    throw new Error(`timeout of ${timeout}ms exceeded`);
  }
  return { data: { image, text } };
});

mock.module("../config.js", {
  namedExports: { PREFIX: "/", SPIDER_API_BASE_URL: baseUrl },
});
mock.module("../utils/database.js", {
  namedExports: { getSpiderApiToken: () => "test-token" },
});
mock.module("axios", {
  defaultExport: { create: () => ({ interceptors: { response: { use() {} } }, get }) },
});

const { default: command } = await import("../commands/member/diversos/horoscopo.js");

it("aguarda a primeira consulta do dia e envia a imagem com a previsão na legenda", async () => {
  const sendImageFromURL = mock.fn();
  assert.deepEqual(command.commands, ["horoscopo", "signo"]);

  await command.handle({
    fullArgs: "  Câncer  ",
    sendWaitReact: async () => {},
    sendImageFromURL,
    sendSuccessReact: async () => {},
  });

  const [url, options] = get.mock.calls[0].arguments;
  assert.equal(url, `${baseUrl}/misc/horoscope`);
  assert.equal(options.params.sign, "Câncer");
  assert.equal(options.headers["X-API-KEY"], "test-token");
  assert.deepEqual(sendImageFromURL.mock.calls[0].arguments, [image, text]);
});

it("exige um signo e recusa uma previsão incompleta", async () => {
  get.mock.resetCalls();
  await assert.rejects(command.handle({ fullArgs: "  " }), /informar o seu signo/);
  assert.equal(get.mock.callCount(), 0);

  get.mock.mockImplementationOnce(async () => ({ data: { image, text: "" } }));
  const sendImageFromURL = mock.fn();
  await assert.rejects(
    command.handle({ fullArgs: "câncer", sendWaitReact: async () => {}, sendImageFromURL }),
    /imagem e o texto/,
  );
  assert.equal(sendImageFromURL.mock.callCount(), 0);
});
