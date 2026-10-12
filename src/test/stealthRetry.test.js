import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  __clearStealthRetryState,
  resolveStealthRetry,
  waitForStealthRetry,
} from "../utils/stealthRetry.js";

const detection = {
  groupJid: "stealth-retry-test@g.us",
  messageId: "RETRY_ID",
  authorIds: ["111111111@lid"],
};
const key = {
  remoteJid: detection.groupJid,
  id: detection.messageId,
  participant: detection.authorIds[0],
};

afterEach(__clearStealthRetryState);

it("cancels defense only when the same author's message arrives readable", async () => {
  const pending = waitForStealthRetry(detection);
  assert.equal(waitForStealthRetry(detection), pending);
  assert.equal(resolveStealthRetry({ key, message: null }), false);
  assert.equal(
    resolveStealthRetry({ key, message: { senderKeyDistributionMessage: {} } }),
    false,
  );
  assert.equal(
    resolveStealthRetry({
      key: { ...key, participant: "999@lid" },
      message: { conversation: "Texto" },
    }),
    false,
  );
  assert.equal(
    resolveStealthRetry({ key, message: { conversation: "Texto" } }),
    true,
  );
  assert.equal(await pending, true);
});

it("allows defense after the retry grace period expires", async () => {
  const pending = waitForStealthRetry(detection, 10);
  await delay(20);
  assert.equal(await pending, false);
});
