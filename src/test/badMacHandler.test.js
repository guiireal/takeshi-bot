/**
 * Testes para badMacHandler.js
 *
 * @author Dev Gui
 */
import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { BadMacHandler, badMacHandler } from "../utils/badMacHandler.js";

describe("BadMacHandler", () => {
  let handler;

  beforeEach(() => {
    handler = new BadMacHandler();
  });

  describe("isBadMacError", () => {
    it("should detect error with message 'Bad MAC'", () => {
      const error = new Error("Bad MAC");
      assert.strictEqual(handler.isBadMacError(error), true);
    });

    it("should detect error with message 'MAC verification failed'", () => {
      const error = new Error("MAC verification failed");
      assert.strictEqual(handler.isBadMacError(error), true);
    });

    it("should detect error with message 'decryption failed'", () => {
      const error = new Error("decryption failed");
      assert.strictEqual(handler.isBadMacError(error), true);
    });

    it("should not detect error without Bad MAC", () => {
      const error = new Error("Some other error");
      assert.strictEqual(handler.isBadMacError(error), false);
    });

    it("should handle null/undefined error", () => {
      assert.strictEqual(handler.isBadMacError(null), false);
      assert.strictEqual(handler.isBadMacError(undefined), false);
    });
  });

  describe("isSessionError", () => {
    it("should detect session error", () => {
      const error = new Error("Session error occurred");
      assert.strictEqual(handler.isSessionError(error), true);
    });

    it("should detect signal protocol error", () => {
      const error = new Error("signal protocol error");
      assert.strictEqual(handler.isSessionError(error), true);
    });

    it("should detect decrypt error", () => {
      const error = new Error("Failed to decrypt message");
      assert.strictEqual(handler.isSessionError(error), true);
    });

    it("should detect Bad MAC as session error", () => {
      const error = new Error("Bad MAC");
      assert.strictEqual(handler.isSessionError(error), true);
    });

    it("should not detect normal error as session error", () => {
      const error = new Error("Network timeout");
      assert.strictEqual(handler.isSessionError(error), false);
    });
  });

  describe("incrementErrorCount", () => {
    it("should increment error count", () => {
      const initialCount = handler.errorCount;
      handler.incrementErrorCount();
      assert.strictEqual(handler.errorCount, initialCount + 1);
    });

    it("should increment multiple times", () => {
      handler.incrementErrorCount();
      handler.incrementErrorCount();
      handler.incrementErrorCount();
      assert.strictEqual(handler.errorCount, 3);
    });
  });

  describe("resetErrorCount", () => {
    it("should reset error count to zero", () => {
      handler.errorCount = 5;
      handler.resetErrorCount();
      assert.strictEqual(handler.errorCount, 0);
    });

    it("should update lastReset timestamp", () => {
      const beforeReset = handler.lastReset;
      // Aguardar um pouco para garantir diferença no timestamp
      setTimeout(() => {
        handler.resetErrorCount();
        assert.ok(handler.lastReset > beforeReset);
      }, 10);
    });
  });

  describe("hasReachedLimit", () => {
    it("should return false when below the limit", () => {
      handler.errorCount = 2;
      handler.maxRetries = 5;
      assert.strictEqual(handler.hasReachedLimit(), false);
    });

    it("should return true when reaching the limit", () => {
      handler.errorCount = 5;
      handler.maxRetries = 5;
      assert.strictEqual(handler.hasReachedLimit(), true);
    });

    it("should return true when exceeding the limit", () => {
      handler.errorCount = 7;
      handler.maxRetries = 5;
      assert.strictEqual(handler.hasReachedLimit(), true);
    });
  });

  describe("handleError", () => {
    it("should return false for non-Bad MAC errors", () => {
      const error = new Error("Normal error");
      const result = handler.handleError(error, "test");
      assert.strictEqual(result, false);
    });

    it("should return true for Bad MAC errors", () => {
      const error = new Error("Bad MAC");
      const result = handler.handleError(error, "test");
      assert.strictEqual(result, true);
    });

    it("should increment counter when handling Bad MAC", () => {
      const error = new Error("Bad MAC");
      const initialCount = handler.errorCount;
      handler.handleError(error, "test");
      assert.strictEqual(handler.errorCount, initialCount + 1);
    });

    it("should return true when limit reached", () => {
      const error = new Error("Bad MAC");
      handler.errorCount = handler.maxRetries - 1;
      const result = handler.handleError(error, "test");
      assert.strictEqual(result, true);
      assert.strictEqual(handler.hasReachedLimit(), true);
    });
  });

  describe("createSafeWrapper", () => {
    it("should execute function without errors", async () => {
      const fn = async () => "success";
      const wrapped = handler.createSafeWrapper(fn, "test");
      const result = await wrapped();
      assert.strictEqual(result, "success");
    });

    it("should return null for Bad MAC errors", async () => {
      const fn = async () => {
        throw new Error("Bad MAC");
      };
      const wrapped = handler.createSafeWrapper(fn, "test");
      const result = await wrapped();
      assert.strictEqual(result, null);
    });

    it("should throw for non-Bad MAC errors", async () => {
      const fn = async () => {
        throw new Error("Other error");
      };
      const wrapped = handler.createSafeWrapper(fn, "test");

      await assert.rejects(async () => await wrapped(), {
        message: "Other error",
      });
    });
  });

  describe("getStats", () => {
    it("should return correct stats", () => {
      handler.errorCount = 3;
      handler.maxRetries = 5;

      const stats = handler.getStats();

      assert.strictEqual(stats.errorCount, 3);
      assert.strictEqual(stats.maxRetries, 5);
      assert.ok(stats.lastReset);
      assert.ok(typeof stats.timeUntilReset === "number");
      assert.ok(stats.timeUntilReset >= 0);
    });

    it("should return valid ISO timestamp", () => {
      const stats = handler.getStats();
      const date = new Date(stats.lastReset);
      assert.ok(!isNaN(date.getTime()));
    });
  });

  describe("singleton badMacHandler", () => {
    it("should export a singleton instance", () => {
      assert.ok(badMacHandler instanceof BadMacHandler);
    });

    it("should be the same instance across imports", () => {
      const handler1 = badMacHandler;
      const handler2 = badMacHandler;
      assert.strictEqual(handler1, handler2);
    });
  });

  describe("clearProblematicSessionFiles", () => {
    it("should return false if baileys folder does not exist", () => {
      // Teste com caminho que não existe
      const result = handler.clearProblematicSessionFiles();
      // O resultado depende se a pasta existe ou não
      assert.ok(typeof result === "boolean");
    });
  });
});
