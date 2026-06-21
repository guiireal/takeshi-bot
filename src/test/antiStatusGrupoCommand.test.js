import assert from "node:assert";
import { describe, it } from "node:test";
import antiStatusGrupo from "../commands/admin/anti-status-grupo.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";
import * as database from "../utils/database.js";

describe("anti-status-grupo command", () => {
  const testGroupId = "anti-status-grupo-test@g.us";

  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(
      testGroupId,
      "anti-status-grupo",
      false,
    );
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
