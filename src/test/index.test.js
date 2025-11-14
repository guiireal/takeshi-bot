/**
 * Testes para index.js (funções utilitárias)
 *
 * @author Dev Gui
 */
import assert from "node:assert";
import { describe, it } from "node:test";
import * as utils from "../utils/index.js";

describe("Utility Functions", () => {
  describe("onlyNumbers", () => {
    it("should remove all non-numeric characters", () => {
      assert.strictEqual(utils.onlyNumbers("abc123def456"), "123456");
    });

    it("should keep only numbers", () => {
      assert.strictEqual(utils.onlyNumbers("123456"), "123456");
    });

    it("should remove special characters", () => {
      assert.strictEqual(utils.onlyNumbers("(11) 98765-4321"), "11987654321");
    });

    it("should return empty string for text without numbers", () => {
      assert.strictEqual(utils.onlyNumbers("abcdef"), "");
    });
  });

  describe("toUserLid", () => {
    it("should convert number to LID", () => {
      assert.strictEqual(utils.toUserLid("5511999999999"), "5511999999999@lid");
    });

    it("should strip non-digit characters before converting", () => {
      assert.strictEqual(
        utils.toUserLid("(55) 11 99999-9999"),
        "5511999999999@lid"
      );
    });
  });

  describe("onlyLettersAndNumbers", () => {
    it("should keep only letters and numbers", () => {
      assert.strictEqual(utils.onlyLettersAndNumbers("abc123!@#"), "abc123");
    });

    it("should remove spaces", () => {
      assert.strictEqual(
        utils.onlyLettersAndNumbers("hello world"),
        "helloworld"
      );
    });

    it("should remove special characters", () => {
      assert.strictEqual(
        utils.onlyLettersAndNumbers("test-command_2024"),
        "testcommand2024"
      );
    });
  });

  describe("removeAccentsAndSpecialCharacters", () => {
    it("should remove accents", () => {
      assert.strictEqual(
        utils.removeAccentsAndSpecialCharacters("café"),
        "cafe"
      );
    });

    it("should remove accents in uppercase", () => {
      assert.strictEqual(
        utils.removeAccentsAndSpecialCharacters("JOSÉ"),
        "JOSE"
      );
    });

    it("should handle multiple accents", () => {
      assert.strictEqual(
        utils.removeAccentsAndSpecialCharacters("ação é útil"),
        "acao e util"
      );
    });

    it("should return empty string for null/undefined", () => {
      assert.strictEqual(utils.removeAccentsAndSpecialCharacters(null), "");
      assert.strictEqual(
        utils.removeAccentsAndSpecialCharacters(undefined),
        ""
      );
    });
  });

  describe("formatCommand", () => {
    it("should format command to lowercase", () => {
      assert.strictEqual(utils.formatCommand("MENU"), "menu");
    });

    it("should remove accents from command", () => {
      assert.strictEqual(utils.formatCommand("açúcar"), "acucar");
    });

    it("should remove spaces and special characters", () => {
      assert.strictEqual(utils.formatCommand("meu comando!"), "meucomando");
    });

    it("should trim the text", () => {
      assert.strictEqual(utils.formatCommand("  comando  "), "comando");
    });
  });

  describe("isGroup", () => {
    it("should return true for group JID", () => {
      assert.strictEqual(utils.isGroup("123456789@g.us"), true);
    });

    it("should return false for user JID", () => {
      assert.strictEqual(utils.isGroup("5511999999999@s.whatsapp.net"), false);
    });

    it("should return false for LID JID", () => {
      assert.strictEqual(utils.isGroup("123456789@lid"), false);
    });
  });

  describe("splitByCharacters", () => {
    it("should split by slash /", () => {
      const result = utils.splitByCharacters("arg1 / arg2 / arg3", [
        "/",
        "|",
        "\\",
      ]);
      assert.deepStrictEqual(result, ["arg1", "arg2", "arg3"]);
    });

    it("should split by pipe |", () => {
      const result = utils.splitByCharacters("arg1 | arg2", ["/", "|", "\\"]);
      assert.deepStrictEqual(result, ["arg1", "arg2"]);
    });

    it("should split by backslash", () => {
      const result = utils.splitByCharacters("arg1 \\ arg2", ["/", "|", "\\"]);
      assert.deepStrictEqual(result, ["arg1", "arg2"]);
    });

    it("should trim each argument", () => {
      const result = utils.splitByCharacters("  arg1  /  arg2  ", [
        "/",
        "|",
        "\\",
      ]);
      assert.deepStrictEqual(result, ["arg1", "arg2"]);
    });

    it("should remove empty strings", () => {
      const result = utils.splitByCharacters("arg1 / / arg2", ["/", "|", "\\"]);
      assert.deepStrictEqual(result, ["arg1", "arg2"]);
    });
  });

  describe("extractDataFromMessage", () => {
    it("should extract data from simple message", () => {
      const webMessage = {
        key: {
          remoteJid: "123456789@g.us",
          participant: "5511999999999@s.whatsapp.net",
        },
        message: {
          conversation: "=menu arg1 arg2",
        },
      };

      const data = utils.extractDataFromMessage(webMessage);

      assert.strictEqual(data.remoteJid, "123456789@g.us");
      assert.strictEqual(data.fullMessage, "=menu arg1 arg2");
      assert.strictEqual(data.commandName, "menu");
      assert.strictEqual(data.prefix, "=");
      assert.strictEqual(data.fullArgs, "arg1 arg2");
    });

    it("should extract data from extended message", () => {
      const webMessage = {
        key: {
          remoteJid: "123456789@g.us",
        },
        message: {
          extendedTextMessage: {
            text: "=comando teste",
          },
        },
      };

      const data = utils.extractDataFromMessage(webMessage);

      assert.strictEqual(data.fullMessage, "=comando teste");
      assert.strictEqual(data.commandName, "comando");
    });

    it("should detect reply message", () => {
      const webMessage = {
        key: {
          remoteJid: "123456789@g.us",
        },
        message: {
          extendedTextMessage: {
            text: "=comando",
            contextInfo: {
              quotedMessage: {
                conversation: "mensagem original",
              },
              participant: "5511888888888@s.whatsapp.net",
            },
          },
        },
      };

      const data = utils.extractDataFromMessage(webMessage);

      assert.strictEqual(data.isReply, true);
      assert.strictEqual(data.replyLid, "5511888888888@s.whatsapp.net");
      assert.strictEqual(data.replyText, "mensagem original");
    });

    it("should return null values for message without content", () => {
      const webMessage = {
        key: {
          remoteJid: "123456789@g.us",
        },
        message: {},
      };

      const data = utils.extractDataFromMessage(webMessage);

      assert.strictEqual(data.fullMessage, null);
      assert.strictEqual(data.commandName, null);
      assert.strictEqual(data.prefix, null);
    });

    it("should process image message with caption", () => {
      const webMessage = {
        key: {
          remoteJid: "123456789@g.us",
        },
        message: {
          imageMessage: {
            caption: "=figurinha",
          },
        },
      };

      const data = utils.extractDataFromMessage(webMessage);

      assert.strictEqual(data.fullMessage, "=figurinha");
      assert.strictEqual(data.commandName, "figurinha");
    });
  });

  describe("baileysIs", () => {
    it("should detect image message", () => {
      const webMessage = {
        message: {
          imageMessage: { url: "..." },
        },
      };

      assert.strictEqual(utils.baileysIs(webMessage, "image"), true);
    });

    it("should detect video message", () => {
      const webMessage = {
        message: {
          videoMessage: { url: "..." },
        },
      };

      assert.strictEqual(utils.baileysIs(webMessage, "video"), true);
    });

    it("should return false for nonexistent type", () => {
      const webMessage = {
        message: {
          conversation: "texto",
        },
      };

      assert.strictEqual(utils.baileysIs(webMessage, "image"), false);
    });
  });

  describe("getContent", () => {
    it("should get content from image message", () => {
      const imageData = { url: "test.jpg" };
      const webMessage = {
        message: {
          imageMessage: imageData,
        },
      };

      const content = utils.getContent(webMessage, "image");
      assert.strictEqual(content, imageData);
    });

    it("should get content from quoted message", () => {
      const stickerData = { url: "test.webp" };
      const webMessage = {
        message: {
          extendedTextMessage: {
            contextInfo: {
              quotedMessage: {
                stickerMessage: stickerData,
              },
            },
          },
        },
      };

      const content = utils.getContent(webMessage, "sticker");
      assert.strictEqual(content, stickerData);
    });
  });

  describe("getRandomNumber", () => {
    it("should generate number within range", () => {
      const num = utils.getRandomNumber(1, 10);
      assert.ok(num >= 1 && num <= 10);
    });

    it("should return the same number when min=max", () => {
      const num = utils.getRandomNumber(5, 5);
      assert.strictEqual(num, 5);
    });

    it("should generate different numbers", () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(utils.getRandomNumber(1, 100));
      }
      // Deve ter gerado pelo menos alguns números diferentes
      assert.ok(numbers.size > 10);
    });
  });

  describe("readMore", () => {
    it("should return string with invisible characters", () => {
      const result = utils.readMore();
      assert.ok(typeof result === "string");
      assert.ok(result.length > 0);
    });
  });

  describe("getRandomName", () => {
    it("should generate name without extension", () => {
      const name = utils.getRandomName();
      assert.ok(name.startsWith("takeshi_temp_"));
      assert.ok(!name.includes("."));
    });

    it("should generate name with extension", () => {
      const name = utils.getRandomName("jpg");
      assert.ok(name.startsWith("takeshi_temp_"));
      assert.ok(name.endsWith(".jpg"));
    });

    it("should generate different names", () => {
      const name1 = utils.getRandomName("png");
      const name2 = utils.getRandomName("png");
      // Muito provavelmente serão diferentes
      assert.notStrictEqual(name1, name2);
    });
  });

  describe("isAtLeastMinutesInPast", () => {
    it("should return true for old timestamp", () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutos atrás
      assert.strictEqual(utils.isAtLeastMinutesInPast(oldTimestamp, 5), true);
    });

    it("should return false for recent timestamp", () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minuto atrás
      assert.strictEqual(
        utils.isAtLeastMinutesInPast(recentTimestamp, 5),
        false
      );
    });

    it("should return false for current timestamp", () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      assert.strictEqual(
        utils.isAtLeastMinutesInPast(currentTimestamp, 5),
        false
      );
    });

    it("should use 5 minutes as default", () => {
      const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;
      assert.strictEqual(utils.isAtLeastMinutesInPast(sixMinutesAgo), true);
    });
  });

  describe("GROUP_PARTICIPANT constants", () => {
    it("should have constant GROUP_PARTICIPANT_ADD", () => {
      assert.strictEqual(utils.GROUP_PARTICIPANT_ADD, 27);
    });

    it("should have constant GROUP_PARTICIPANT_LEAVE", () => {
      assert.strictEqual(utils.GROUP_PARTICIPANT_LEAVE, 32);
    });

    it("should have isAddOrLeave array with correct values", () => {
      assert.deepStrictEqual(utils.isAddOrLeave, [27, 32]);
    });
  });

  describe("findCommandImport", () => {
    it("should return object with type and command", async () => {
      const result = await utils.findCommandImport("menu");

      assert.ok(typeof result === "object");
      assert.ok("type" in result);
      assert.ok("command" in result);
    });

    it("should return empty strings for nonexistent command", async () => {
      const result = await utils.findCommandImport(
        "comando_que_nao_existe_xyz123"
      );

      assert.strictEqual(result.type, "");
      assert.strictEqual(result.command, null);
    });
  });

  describe("readCommandImports", () => {
    it("should return object with imported commands", async () => {
      const commands = await utils.readCommandImports();

      assert.ok(typeof commands === "object");
    });

    it("should have arrays of commands for each type", async () => {
      const commands = await utils.readCommandImports();

      for (const type in commands) {
        assert.ok(Array.isArray(commands[type]));
      }
    });
  });
});
