const { getAppInfo } = require('../get-app-info');

async function buildCleanUpSettings(options) {
  const appInfo = await getAppInfo(options);
  // Add app-config & dialog automatically
  return {
    ...appInfo,
  };
}

module.exports = {
  buildCleanUpSettings,
};
