import { getRandomNumber } from "./index.js";

const PRESENCE_REFRESH_ONLINE_DURATION_MS = 5 * 1000;
const PRESENCE_REFRESH_MIN_DELAY_MS = 12 * 60 * 60 * 1000;
const PRESENCE_REFRESH_MAX_DELAY_MS = 18 * 60 * 60 * 1000;

export function installPresenceRefresh(client, logger) {
  let refreshTimer = null;
  let unavailableTimer = null;
  let connectionVersion = 0;

  const clearTimers = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    if (unavailableTimer) {
      clearTimeout(unavailableTimer);
      unavailableTimer = null;
    }
  };

  const refreshPresence = (version) => {
    void client.presence
      .send("available")
      .then(() => {
        if (version !== connectionVersion) {
          return;
        }

        unavailableTimer = setTimeout(() => {
          unavailableTimer = null;

          if (version !== connectionVersion) {
            return;
          }

          void client.presence.send("unavailable").catch((error) => {
            logger.error(
              { error: String(error) },
              "presence refresh unavailable failed",
            );
          });
        }, PRESENCE_REFRESH_ONLINE_DURATION_MS);
      })
      .catch((error) => {
        logger.error(
          { error: String(error) },
          "presence refresh available failed",
        );
      });
  };

  const scheduleRefresh = (version) => {
    refreshTimer = setTimeout(() => {
      refreshTimer = null;

      if (version !== connectionVersion) {
        return;
      }

      refreshPresence(version);
      scheduleRefresh(version);
    }, getRandomNumber(
      PRESENCE_REFRESH_MIN_DELAY_MS,
      PRESENCE_REFRESH_MAX_DELAY_MS,
    ));
  };

  client.on("connection", (event) => {
    clearTimers();
    connectionVersion += 1;

    if (event.status === "open") {
      scheduleRefresh(connectionVersion);
    }
  });
}
