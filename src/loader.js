const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./config");
const { onMessagesUpsert } = require("./middlewares/onMesssagesUpsert");
const {
  onGroupParticipantsUpdate,
} = require("./middlewares/onGroupParticipantsUpdate");

exports.load = (socket) => {
  socket.ev.on("messages.upsert", async ({ messages }) => {
    setTimeout(() => {
      onMessagesUpsert({ socket, messages });
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  socket.ev.on("group-participants.update", async (data) => {
    setTimeout(() => {
      try {
        onGroupParticipantsUpdate({ socket, groupParticipantsUpdate: data });
      } catch (error) {
        console.error(error);
      }
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });
};
