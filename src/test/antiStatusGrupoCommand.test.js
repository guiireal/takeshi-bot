import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import antiStatusGrupo from "../commands/admin/anti-status-grupo.js";
import * as database from "../utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDatabasePath = path.resolve(__dirname, "..", "..", "database");
const groupRestrictionsPath = path.resolve(
  testDatabasePath,
  "group-restrictions.json",
);

function cleanupGroupRestrictions(backup) {
  if (backup !== undefined) {
    fs.writeFileSync(groupRestrictionsPath, backup);
    return;
  }

  if (fs.existsSync(groupRestrictionsPath)) {
    fs.unlinkSync(groupRestrictionsPath);
  }
}

describe("anti-status-grupo command", () => {
  const testGroupId = "anti-status-grupo-test@g.us";
  let groupRestrictionsBackup;

  before(() => {
    if (fs.existsSync(groupRestrictionsPath)) {
      groupRestrictionsBackup = fs.readFileSync(groupRestrictionsPath, "utf8");
    }

    database.updateIsActiveGroupRestriction(
      testGroupId,
      "anti-status-grupo",
      false,
    );
  });

  after(() => {
    cleanupGroupRestrictions(groupRestrictionsBackup);
  });

  it("should activate and deactivate anti-status-grupo", async () => {
    const replies = [];
    const sendSuccessReply = async (message) => replies.push(message);

    await antiStatusGrupo.handle({
      remoteJid: testGroupId,
      isGroup: true,
      args: ["1"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(testGroupId, "anti-status-grupo"),
      true,
    );

    await antiStatusGrupo.handle({
      remoteJid: testGroupId,
      isGroup: true,
      args: ["0"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(testGroupId, "anti-status-grupo"),
      false,
    );
    assert.deepStrictEqual(replies, [
      "Anti-status-grupo ativado com sucesso!",
      "Anti-status-grupo desativado com sucesso!",
    ]);
  });
});
