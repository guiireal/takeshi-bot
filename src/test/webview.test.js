import assert from "node:assert/strict";
import { test } from "node:test";
import { proto } from "zapo-js";
import command from "../commands/member/exemplos/enviar-webview.js";
import { createSocketAdapter } from "../services/wa.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";

test("Exemplo de Web View preserva a ordem dos botões e o site da Spider API", async () => {
  const sent = [];
  const socket = createSocketAdapter({
    message: {
      async send(jid, payload) {
        sent.push(payload);
        return { id: "test-message", ack: 1 };
      },
    },
  });
  await command.handle(loadCommonFunctions({
    socket,
    webMessage: {
      key: { remoteJid: "test@g.us", participant: "member@lid", id: "source" },
      message: { conversation: "/enviar-webview" },
    },
  }));

  const decoded = proto.Message.decode(proto.Message.encode(sent[0]).finish());
  const interactive = decoded.viewOnceMessageV2.message.interactiveMessage;
  assert.deepEqual(
    interactive.nativeFlowMessage.buttons.map(button => button.name),
    ["cta_url", "open_webview"],
  );
  assert.equal(interactive.carouselMessage, null);
  const [browser, webview] = interactive.nativeFlowMessage.buttons.map(
    button => JSON.parse(button.buttonParamsJson),
  );
  assert.equal(browser.url, "https://api.spiderx.com.br");
  assert.deepEqual(webview.link, {
    url: browser.url,
    in_app_webview: true,
    full_screen: true,
  });
  assert.equal(sent[1].emoji, "✅");
});
