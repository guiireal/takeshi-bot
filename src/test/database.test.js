/**
 * Testes para database.js
 *
 * @author Dev Gui
 */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as database from "../utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDatabasePath = path.resolve(__dirname, "..", "..", "database");

function cleanupJsonFile(fileName, backup) {
  const filePath = path.resolve(testDatabasePath, `${fileName}.json`);
  try {
    if (backup !== undefined) {
      fs.writeFileSync(filePath, backup);
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error(`Failed to cleanup ${fileName}.json:`, error.message);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (deleteError) {
        console.error(
          `Failed to delete ${fileName}.json:`,
          deleteError.message
        );
      }
    }
  }
}

describe("Database Functions", () => {
  describe("Exit Groups", () => {
    const testGroupId = "123456789@g.us";
    let exitGroupsBackup;

    before(() => {
      const exitGroupsPath = path.resolve(testDatabasePath, "exit-groups.json");
      if (fs.existsSync(exitGroupsPath)) {
        exitGroupsBackup = fs.readFileSync(exitGroupsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("exit-groups", exitGroupsBackup);
    });

    it("should activate exit group", () => {
      database.activateExitGroup(testGroupId);
      assert.strictEqual(database.isActiveExitGroup(testGroupId), true);
    });

    it("should deactivate exit group", () => {
      database.activateExitGroup(testGroupId);
      database.deactivateExitGroup(testGroupId);
      assert.strictEqual(database.isActiveExitGroup(testGroupId), false);
    });

    it("should not duplicate group when activating twice", () => {
      database.activateExitGroup(testGroupId);
      database.activateExitGroup(testGroupId);

      const exitGroupsFile = path.resolve(testDatabasePath, "exit-groups.json");
      const exitGroups = JSON.parse(fs.readFileSync(exitGroupsFile, "utf8"));

      const count = exitGroups.filter((id) => id === testGroupId).length;
      assert.strictEqual(count, 1);
    });
  });

  describe("Welcome Groups", () => {
    const testGroupId = "987654321@g.us";
    let welcomeGroupsBackup;

    before(() => {
      const welcomeGroupsPath = path.resolve(
        testDatabasePath,
        "welcome-groups.json"
      );
      if (fs.existsSync(welcomeGroupsPath)) {
        welcomeGroupsBackup = fs.readFileSync(welcomeGroupsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("welcome-groups", welcomeGroupsBackup);
    });

    it("should activate welcome group", () => {
      database.activateWelcomeGroup(testGroupId);
      assert.strictEqual(database.isActiveWelcomeGroup(testGroupId), true);
    });

    it("should deactivate welcome group", () => {
      database.activateWelcomeGroup(testGroupId);
      database.deactivateWelcomeGroup(testGroupId);
      assert.strictEqual(database.isActiveWelcomeGroup(testGroupId), false);
    });
  });

  describe("Active Groups", () => {
    const testGroupId = "111222333@g.us";
    let inactiveGroupsBackup;

    before(() => {
      const inactiveGroupsPath = path.resolve(
        testDatabasePath,
        "inactive-groups.json"
      );
      if (fs.existsSync(inactiveGroupsPath)) {
        inactiveGroupsBackup = fs.readFileSync(inactiveGroupsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("inactive-groups", inactiveGroupsBackup);
    });

    it("should return true for active group by default", () => {
      assert.strictEqual(database.isActiveGroup(testGroupId), true);
    });

    it("should deactivate group", () => {
      database.deactivateGroup(testGroupId);
      assert.strictEqual(database.isActiveGroup(testGroupId), false);
    });

    it("should activate previously deactivated group", () => {
      database.deactivateGroup(testGroupId);
      database.activateGroup(testGroupId);
      assert.strictEqual(database.isActiveGroup(testGroupId), true);
    });
  });

  describe("Auto Responder", () => {
    let autoResponderBackup;

    before(() => {
      const autoResponderPath = path.resolve(
        testDatabasePath,
        "auto-responder.json"
      );
      if (fs.existsSync(autoResponderPath)) {
        autoResponderBackup = fs.readFileSync(autoResponderPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("auto-responder", autoResponderBackup);
    });

    it("should return null for nonexistent match", () => {
      const response = database.getAutoResponderResponse(
        "texto_inexistente_xyz"
      );
      assert.strictEqual(response, null);
    });

    it("should add auto responder item", () => {
      const match = "oi_teste_" + Date.now();
      const answer = "olá teste";

      const result = database.addAutoResponderItem(match, answer);
      assert.strictEqual(result, true);

      const response = database.getAutoResponderResponse(match);
      assert.strictEqual(response, answer.trim());
    });

    it("should not add duplicate item", () => {
      const match = "duplicado_" + Date.now();
      const answer = "resposta";

      database.addAutoResponderItem(match, answer);
      const result = database.addAutoResponderItem(match, answer);

      assert.strictEqual(result, false);
    });

    it("should list auto responder items", () => {
      const items = database.listAutoResponderItems();
      assert.ok(Array.isArray(items));

      if (items.length > 0) {
        assert.ok(items[0].key);
        assert.ok(items[0].match);
        assert.ok(items[0].answer);
      }
    });

    it("should remove item by key", () => {
      const match = "remover_" + Date.now();
      const answer = "teste";

      database.addAutoResponderItem(match, answer);
      const items = database.listAutoResponderItems();
      const item = items.find((i) => i.match === match);

      if (item) {
        const result = database.removeAutoResponderItemByKey(item.key);
        assert.strictEqual(result, true);
      }
    });

    it("should return false when removing invalid key", () => {
      const result = database.removeAutoResponderItemByKey(999999);
      assert.strictEqual(result, false);
    });

    it("should be case insensitive when searching", () => {
      const match = "MAIUSCULA_" + Date.now();
      const answer = "resposta";

      database.addAutoResponderItem(match, answer);

      const response1 = database.getAutoResponderResponse(match.toLowerCase());
      const response2 = database.getAutoResponderResponse(match.toUpperCase());

      assert.strictEqual(response1, answer.trim());
      assert.strictEqual(response2, answer.trim());
    });
  });

  describe("Auto Responder Groups", () => {
    const testGroupId = "444555666@g.us";
    let autoResponderGroupsBackup;

    before(() => {
      const autoResponderGroupsPath = path.resolve(
        testDatabasePath,
        "auto-responder-groups.json"
      );
      if (fs.existsSync(autoResponderGroupsPath)) {
        autoResponderGroupsBackup = fs.readFileSync(
          autoResponderGroupsPath,
          "utf8"
        );
      }
    });

    after(() => {
      cleanupJsonFile("auto-responder-groups", autoResponderGroupsBackup);
    });

    it("should activate auto responder in group", () => {
      database.activateAutoResponderGroup(testGroupId);
      assert.strictEqual(
        database.isActiveAutoResponderGroup(testGroupId),
        true
      );
    });

    it("should deactivate auto responder in group", () => {
      database.activateAutoResponderGroup(testGroupId);
      database.deactivateAutoResponderGroup(testGroupId);
      assert.strictEqual(
        database.isActiveAutoResponderGroup(testGroupId),
        false
      );
    });
  });

  describe("Anti-Link Groups", () => {
    const testGroupId = "777888999@g.us";
    let antiLinkGroupsBackup;

    before(() => {
      const antiLinkGroupsPath = path.resolve(
        testDatabasePath,
        "anti-link-groups.json"
      );
      if (fs.existsSync(antiLinkGroupsPath)) {
        antiLinkGroupsBackup = fs.readFileSync(antiLinkGroupsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("anti-link-groups", antiLinkGroupsBackup);
    });

    it("should activate anti-link in group", () => {
      database.activateAntiLinkGroup(testGroupId);
      assert.strictEqual(database.isActiveAntiLinkGroup(testGroupId), true);
    });

    it("should deactivate anti-link in group", () => {
      database.activateAntiLinkGroup(testGroupId);
      database.deactivateAntiLinkGroup(testGroupId);
      assert.strictEqual(database.isActiveAntiLinkGroup(testGroupId), false);
    });
  });

  describe("Muted Members", () => {
    const testGroupId = "101010101@g.us";
    const testMemberId = "5511999999999@s.whatsapp.net";
    let mutedBackup;

    before(() => {
      const mutedPath = path.resolve(testDatabasePath, "muted.json");
      if (fs.existsSync(mutedPath)) {
        mutedBackup = fs.readFileSync(mutedPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("muted", mutedBackup);
    });

    it("should mute member", () => {
      database.muteMember(testGroupId, testMemberId);
      assert.strictEqual(
        database.checkIfMemberIsMuted(testGroupId, testMemberId),
        true
      );
    });

    it("should unmute member", () => {
      database.muteMember(testGroupId, testMemberId);
      database.unmuteMember(testGroupId, testMemberId);
      assert.strictEqual(
        database.checkIfMemberIsMuted(testGroupId, testMemberId),
        false
      );
    });

    it("should return false for non-muted member", () => {
      const result = database.checkIfMemberIsMuted(
        testGroupId,
        "9999999999@s.whatsapp.net"
      );
      assert.strictEqual(result, false);
    });

    it("should not duplicate muted member", () => {
      database.muteMember(testGroupId, testMemberId);
      database.muteMember(testGroupId, testMemberId);

      const mutedFile = path.resolve(testDatabasePath, "muted.json");
      const mutedData = JSON.parse(fs.readFileSync(mutedFile, "utf8"));

      const count =
        mutedData[testGroupId]?.filter((id) => id === testMemberId).length || 0;
      assert.strictEqual(count, 1);
    });
  });

  describe("Only Admins", () => {
    const testGroupId = "202020202@g.us";
    let onlyAdminsBackup;

    before(() => {
      const onlyAdminsPath = path.resolve(testDatabasePath, "only-admins.json");
      if (fs.existsSync(onlyAdminsPath)) {
        onlyAdminsBackup = fs.readFileSync(onlyAdminsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("only-admins", onlyAdminsBackup);
    });

    it("should activate only-admins mode", () => {
      database.activateOnlyAdmins(testGroupId);
      assert.strictEqual(database.isActiveOnlyAdmins(testGroupId), true);
    });

    it("should deactivate only-admins mode", () => {
      database.activateOnlyAdmins(testGroupId);
      database.deactivateOnlyAdmins(testGroupId);
      assert.strictEqual(database.isActiveOnlyAdmins(testGroupId), false);
    });
  });

  describe("Prefix Management", () => {
    const testGroupId = "303030303@g.us";
    const customPrefix = "!";
    let prefixGroupsBackup;

    before(() => {
      const prefixGroupsPath = path.resolve(
        testDatabasePath,
        "prefix-groups.json"
      );
      if (fs.existsSync(prefixGroupsPath)) {
        prefixGroupsBackup = fs.readFileSync(prefixGroupsPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("prefix-groups", prefixGroupsBackup);
    });

    it("should set custom prefix", () => {
      database.setPrefix(testGroupId, customPrefix);
      const prefix = database.getPrefix(testGroupId);
      assert.strictEqual(prefix, customPrefix);
    });

    it("should return default prefix for group without customization", () => {
      const prefix = database.getPrefix("grupo_inexistente@g.us");
      assert.ok(prefix);
    });
  });

  describe("Config Management", () => {
    let configBackup;

    before(() => {
      const configPath = path.resolve(testDatabasePath, "config.json");
      if (fs.existsSync(configPath)) {
        configBackup = fs.readFileSync(configPath, "utf8");
      }
    });

    after(() => {
      cleanupJsonFile("config", configBackup);
    });

    it("should set and get Spider API token", () => {
      const testToken = "test_token_" + Date.now();
      database.setSpiderApiToken(testToken);
      const token = database.getSpiderApiToken();
      assert.strictEqual(token, testToken);
    });
  });

  describe("Group Restrictions", () => {
    const testGroupId = "404040404@g.us";
    const testRestriction = "sticker";
    let groupRestrictionsBackup;

    before(() => {
      const groupRestrictionsPath = path.resolve(
        testDatabasePath,
        "group-restrictions.json"
      );
      if (fs.existsSync(groupRestrictionsPath)) {
        groupRestrictionsBackup = fs.readFileSync(
          groupRestrictionsPath,
          "utf8"
        );
      }
    });

    after(() => {
      cleanupJsonFile("group-restrictions", groupRestrictionsBackup);
    });

    it("should read group restrictions", () => {
      const restrictions = database.readGroupRestrictions();
      assert.ok(typeof restrictions === "object");
    });

    it("should save group restrictions", () => {
      const restrictions = { [testGroupId]: { [testRestriction]: true } };
      database.saveGroupRestrictions(restrictions);

      const saved = database.readGroupRestrictions();
      assert.strictEqual(saved[testGroupId]?.[testRestriction], true);
    });

    it("should check if restriction is active", () => {
      database.updateIsActiveGroupRestriction(
        testGroupId,
        testRestriction,
        true
      );
      const isActive = database.isActiveGroupRestriction(
        testGroupId,
        testRestriction
      );
      assert.strictEqual(isActive, true);
    });

    it("should update restriction", () => {
      database.updateIsActiveGroupRestriction(
        testGroupId,
        testRestriction,
        false
      );
      const isActive = database.isActiveGroupRestriction(
        testGroupId,
        testRestriction
      );
      assert.strictEqual(isActive, false);
    });

    it("should return false for nonexistent restriction", () => {
      const isActive = database.isActiveGroupRestriction(
        "grupo_inexistente@g.us",
        "video"
      );
      assert.strictEqual(isActive, false);
    });
  });

  describe("Restricted Message Types", () => {
    let restrictedMessagesBackup;

    before(() => {
      const restrictedMessagesPath = path.resolve(
        testDatabasePath,
        "restricted-messages.json"
      );
      if (fs.existsSync(restrictedMessagesPath)) {
        restrictedMessagesBackup = fs.readFileSync(
          restrictedMessagesPath,
          "utf8"
        );
      }
    });

    after(() => {
      cleanupJsonFile("restricted-messages", restrictedMessagesBackup);
    });

    it("should read restricted message types", () => {
      const types = database.readRestrictedMessageTypes();

      assert.ok(typeof types === "object");
      assert.ok(types.sticker);
      assert.ok(types.video);
      assert.ok(types.image);
      assert.ok(types.audio);
    });

    it("should return correct structure", () => {
      const types = database.readRestrictedMessageTypes();

      assert.strictEqual(types.sticker, "stickerMessage");
      assert.strictEqual(types.video, "videoMessage");
      assert.strictEqual(types.image, "imageMessage");
    });
  });
});
