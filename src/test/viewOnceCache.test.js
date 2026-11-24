import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import {
  __clearViewOnceCache,
  getViewOnceMessage,
  rememberViewOnceMessage,
} from "../utils/viewOnceCache.js";

const chatJid = "view-once-cache-test@g.us";
const id = "ORIGINAL_VIEW_ONCE_ID";
const media = { mediaKey: new Uint8Array([1, 2, 3]), directPath: "/v/t62/x" };

describe("view once cache", () => {
  beforeEach(() => {
    __clearViewOnceCache();
  });

  it("returns the media recorded for the same chat, id and type", () => {
    rememberViewOnceMessage({ chatJid, id, type: "imageMessage", content: media });

    assert.strictEqual(
      getViewOnceMessage({ chatJid, id, type: "imageMessage" }),
      media,
    );
  });

  it("does not leak media to another chat or another type", () => {
    rememberViewOnceMessage({ chatJid, id, type: "imageMessage", content: media });

    assert.strictEqual(
      getViewOnceMessage({ chatJid: "other@g.us", id, type: "imageMessage" }),
      undefined,
    );
    assert.strictEqual(
      getViewOnceMessage({ chatJid, id, type: "videoMessage" }),
      undefined,
    );
  });

  it("ignores media without a mediaKey", () => {
    rememberViewOnceMessage({
      chatJid,
      id,
      type: "imageMessage",
      content: { viewOnce: true },
    });

    assert.strictEqual(
      getViewOnceMessage({ chatJid, id, type: "imageMessage" }),
      undefined,
    );
  });

  it("stores text without requiring a mediaKey and isolates it by chat and type", () => {
    const content = { text: "Texto secreto", viewOnce: true };
    rememberViewOnceMessage({ chatJid, id, type: "extendedTextMessage", content });

    assert.strictEqual(getViewOnceMessage({ chatJid, id, type: "extendedTextMessage" }), content);
    assert.strictEqual(getViewOnceMessage({ chatJid: "other@g.us", id, type: "extendedTextMessage" }), undefined);
    assert.strictEqual(getViewOnceMessage({ chatJid, id, type: "imageMessage" }), undefined);
  });

  it("does not replace original text with an empty quoted placeholder", () => {
    const content = { text: "Texto original", viewOnce: true };
    rememberViewOnceMessage({ chatJid, id, type: "extendedTextMessage", content });
    rememberViewOnceMessage({ chatJid, id, type: "extendedTextMessage", content: { viewOnce: true } });

    assert.strictEqual(getViewOnceMessage({ chatJid, id, type: "extendedTextMessage" }), content);
  });

  it("expires entries after the TTL", (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 0 });
    rememberViewOnceMessage({ chatJid, id, type: "imageMessage", content: media });

    t.mock.timers.tick(31 * 60 * 1000);

    assert.strictEqual(
      getViewOnceMessage({ chatJid, id, type: "imageMessage" }),
      undefined,
    );
  });

  it("keeps at most 300 entries, dropping the oldest", () => {
    for (let index = 0; index < 301; index++) {
      rememberViewOnceMessage({
        chatJid,
        id: `ID_${index}`,
        type: "imageMessage",
        content: media,
      });
    }

    assert.strictEqual(
      getViewOnceMessage({ chatJid, id: "ID_0", type: "imageMessage" }),
      undefined,
    );
    assert.strictEqual(
      getViewOnceMessage({ chatJid, id: "ID_300", type: "imageMessage" }),
      media,
    );
  });
});
