const {
  PROXY_USERNAME,
  PROXY_PASSWORD,
  PROXY_PROTOCOL,
  PROXY_HOST,
  PROXY_PORT,
} = require("../config");

exports.getProxyData = () => {
  const usernameEncoded = encodeURIComponent(PROXY_USERNAME);
  const passwordEncoded = encodeURIComponent(PROXY_PASSWORD);

  return {
    proxy: {
      protocol: PROXY_PROTOCOL,
      host: PROXY_HOST,
      port: PROXY_PORT,
      auth: {
        username: usernameEncoded,
        password: passwordEncoded,
      },
    },
    proxyConnectionString: `${PROXY_PROTOCOL}://${usernameEncoded}:${passwordEncoded}@${PROXY_HOST}:${PROXY_PORT}`,
  };
};
