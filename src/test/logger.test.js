/**
 * Testes para logger.js
 *
 * @author Dev Gui
 */
import assert from "node:assert";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import * as logger from "../utils/logger.js";

describe("Logger Functions", () => {
  let consoleLogMock;
  let originalConsoleLog;

  beforeEach(() => {
    // Salvar console.log original
    originalConsoleLog = console.log;
    // Criar mock do console.log
    consoleLogMock = mock.fn();
    console.log = consoleLogMock;
  });

  afterEach(() => {
    // Restaurar console.log original
    console.log = originalConsoleLog;
  });

  describe("sayLog", () => {
    it("should call console.log with formatted message", () => {
      logger.sayLog("Teste de mensagem");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[36m[TAKESHI BOT | TALK]\x1b[0m");
      assert.strictEqual(args[1], "Teste de mensagem");
    });

    it("should accept different message types", () => {
      logger.sayLog("String");
      logger.sayLog(123);
      logger.sayLog(true);

      assert.strictEqual(consoleLogMock.mock.calls.length, 3);
    });
  });

  describe("inputLog", () => {
    it("should call console.log with input color", () => {
      logger.inputLog("Entrada do usuário");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[30m[TAKESHI BOT | INPUT]\x1b[0m");
      assert.strictEqual(args[1], "Entrada do usuário");
    });
  });

  describe("infoLog", () => {
    it("should call console.log with blue color", () => {
      logger.infoLog("Informação importante");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[34m[TAKESHI BOT | INFO]\x1b[0m");
      assert.strictEqual(args[1], "Informação importante");
    });

    it("should accept objects as message", () => {
      logger.infoLog({ key: "value" });

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
    });
  });

  describe("successLog", () => {
    it("should call console.log with green color", () => {
      logger.successLog("Operação bem-sucedida");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[32m[TAKESHI BOT | SUCCESS]\x1b[0m");
      assert.strictEqual(args[1], "Operação bem-sucedida");
    });

    it("should work with numbers", () => {
      logger.successLog(100);

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[1], 100);
    });
  });

  describe("errorLog", () => {
    it("should call console.log with red color", () => {
      logger.errorLog("Erro crítico");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[31m[TAKESHI BOT | ERROR]\x1b[0m");
      assert.strictEqual(args[1], "Erro crítico");
    });

    it("should accept error objects", () => {
      const error = new Error("Teste de erro");
      logger.errorLog(error);

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
    });

    it("should accept multiple data types", () => {
      logger.errorLog("String de erro");
      logger.errorLog({ error: "Objeto de erro" });
      logger.errorLog(new Error("Error object"));

      assert.strictEqual(consoleLogMock.mock.calls.length, 3);
    });
  });

  describe("warningLog", () => {
    it("should call console.log with yellow color", () => {
      logger.warningLog("Aviso importante");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[0], "\x1b[33m[TAKESHI BOT | WARNING]\x1b[0m");
      assert.strictEqual(args[1], "Aviso importante");
    });

    it("should work with empty strings", () => {
      logger.warningLog("");

      assert.strictEqual(consoleLogMock.mock.calls.length, 1);
      const args = consoleLogMock.mock.calls[0].arguments;
      assert.strictEqual(args[1], "");
    });
  });

  describe("bannerLog", () => {
    it("should display bot banner", () => {
      logger.bannerLog();

      // Banner deve ter múltiplas linhas
      assert.ok(consoleLogMock.mock.calls.length > 3);
    });

    it("should include ASCII art text", () => {
      logger.bannerLog();

      const calls = consoleLogMock.mock.calls;
      const firstLine = calls[0].arguments[0];

      // Deve conter caracteres do banner
      assert.ok(typeof firstLine === "string");
      assert.ok(firstLine.length > 0);
    });

    it("should include version information", () => {
      logger.bannerLog();

      const calls = consoleLogMock.mock.calls;
      const hasVersion = calls.some((call) => {
        const arg = call.arguments[0];
        return typeof arg === "string" && arg.includes("Versão");
      });

      assert.ok(hasVersion, "Banner should include version information");
    });

    it("should use ANSI colors in banner", () => {
      logger.bannerLog();

      const calls = consoleLogMock.mock.calls;
      const hasColors = calls.some((call) => {
        const arg = call.arguments[0];
        return typeof arg === "string" && arg.includes("\x1b[36m");
      });

      assert.ok(hasColors, "Banner should use ANSI color codes");
    });
  });

  describe("ANSI Colors", () => {
    it("all functions should reset color at the end", () => {
      const logFunctions = [
        { fn: logger.sayLog, name: "sayLog" },
        { fn: logger.inputLog, name: "inputLog" },
        { fn: logger.infoLog, name: "infoLog" },
        { fn: logger.successLog, name: "successLog" },
        { fn: logger.errorLog, name: "errorLog" },
        { fn: logger.warningLog, name: "warningLog" },
      ];

      for (const { fn, name } of logFunctions) {
        consoleLogMock.mock.resetCalls();
        fn("teste");

        const args = consoleLogMock.mock.calls[0].arguments;
        const colorCode = args[0];

        assert.ok(
          colorCode.includes("\x1b[0m"),
          `${name} should include color reset code`
        );
      }
    });

    it("should use different colors for each log type", () => {
      const colors = new Set();

      logger.sayLog("test");
      colors.add(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.infoLog("test");
      colors.add(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.successLog("test");
      colors.add(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.errorLog("test");
      colors.add(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.warningLog("test");
      colors.add(consoleLogMock.mock.calls[0].arguments[0]);

      // Should have at least 4 different colors
      assert.ok(colors.size >= 4, "Should use different colors");
    });
  });

  describe("Prefixes", () => {
    it("all logs should have prefix [TAKESHI BOT]", () => {
      const logFunctions = [
        logger.sayLog,
        logger.inputLog,
        logger.infoLog,
        logger.successLog,
        logger.errorLog,
        logger.warningLog,
      ];

      for (const fn of logFunctions) {
        consoleLogMock.mock.resetCalls();
        fn("teste");

        const args = consoleLogMock.mock.calls[0].arguments;
        const prefix = args[0];

        assert.ok(
          prefix.includes("TAKESHI BOT"),
          "Should include 'TAKESHI BOT' in prefix"
        );
      }
    });

    it("each log type should have a unique identifier", () => {
      const identifiers = [];

      logger.sayLog("test");
      identifiers.push(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.inputLog("test");
      identifiers.push(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.infoLog("test");
      identifiers.push(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.successLog("test");
      identifiers.push(consoleLogMock.mock.calls[0].arguments[0]);

      consoleLogMock.mock.resetCalls();
      logger.errorLog("test");
      identifiers.push(consoleLogMock.mock.calls[0].arguments[0]);

      // Check that TALK, INPUT, INFO, SUCCESS, ERROR appear
      assert.ok(identifiers.some((id) => id.includes("TALK")));
      assert.ok(identifiers.some((id) => id.includes("INPUT")));
      assert.ok(identifiers.some((id) => id.includes("INFO")));
      assert.ok(identifiers.some((id) => id.includes("SUCCESS")));
      assert.ok(identifiers.some((id) => id.includes("ERROR")));
    });
  });
});
