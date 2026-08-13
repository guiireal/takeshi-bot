import assert from "node:assert";
import { describe, it } from "node:test";
import deleteCommand from "../commands/admin/delete.js";

describe("delete command", () => {
  it("should explain that the bot needs admin permission when deletion fails", async () => {
    await assert.rejects(
      deleteCommand.handle({
        deleteMessage: async () => {
          throw new Error("not authorized");
        },
        remoteJid: "delete-command-test@g.us",
        socket: {},
        webMessage: {
          key: {
            id: "command-id",
            remoteJid: "delete-command-test@g.us",
            participant: "admin@lid",
          },
          message: {
            extendedTextMessage: {
              contextInfo: {
                participant: "member@lid",
                stanzaId: "target-id",
              },
            },
          },
        },
      }),
      {
        name: "DangerError",
        message:
          "Não consegui apagar a mensagem. Verifique se sou administrador do grupo e tente novamente.",
      },
    );
  });
});
