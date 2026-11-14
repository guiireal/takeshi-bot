import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import {
  __clearViewOnceCache,
  getViewOnceMedia,
  rememberViewOnceMedia,
} from "../utils/viewOnceCache.js";

const chatJid = "view-once-cache-test@g.us";
const id = "ORIGINAL_VIEW_ONCE_ID";
const media = { mediaKey: new Uint8Array([1, 2, 3]), directPath: "/v/t62/x" };

describe("view once cache", () => {
  beforeEach(() => {
    __clearViewOnceCache();
  });

  it("returns the media recorded for the same chat, id and type", () => {
    rememberViewOnceMedia({ chatJid, id, type: "imageMessage", media });

    assert.strictEqual(
      getViewOnceMedia({ chatJid, id, type: "imageMessage" }),
      media,
    );
  });

  it("does not leak media to another chat or another type", () => {
    rememberViewOnceMedia({ chatJid, id, type: "imageMessage", media });

    assert.strictEqual(
      getViewOnceMedia({ chatJid: "other@g.us", id, type: "imageMessage" }),
      undefined,
    );
    assert.strictEqual(
      getViewOnceMedia({ chatJid, id, type: "videoMessage" }),
      undefined,
    );
  });

  it("ignores media without a mediaKey", () => {
    rememberViewOnceMedia({
      chatJid,
      id,
      type: "imageMessage",
      media: { viewOnce: true },
    });

    assert.strictEqual(
      getViewOnceMedia({ chatJid, id, type: "imageMessage" }),
      undefined,
    );
  });

  it("expires entries after the TTL", (t) => {
    t.mock.timers.enable({ apis: ["Date"], now: 0 });
    rememberViewOnceMedia({ chatJid, id, type: "imageMessage", media });

    t.mock.timers.tick(31 * 60 * 1000);

    assert.strictEqual(
      getViewOnceMedia({ chatJid, id, type: "imageMessage" }),
      undefined,
    );
  });

  it("keeps at most 300 entries, dropping the oldest", () => {
    for (let index = 0; index < 301; index++) {
      rememberViewOnceMedia({
        chatJid,
        id: `ID_${index}`,
        type: "imageMessage",
        media,
      });
    }

    assert.strictEqual(
      getViewOnceMedia({ chatJid, id: "ID_0", type: "imageMessage" }),
      undefined,
    );
    assert.strictEqual(
      getViewOnceMedia({ chatJid, id: "ID_300", type: "imageMessage" }),
      media,
    );
  });
});
