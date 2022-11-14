const { DEFAULT_BUNDLES_TO_KEEP } = require('../../utils/constants');
const { getAppInfo } = require('../get-app-info');

async function buildCleanUpSettings(options) {
  const appInfo = await getAppInfo(options);
  return {
    ...appInfo,
    keep: options.keep !== undefined ? +options.keep : DEFAULT_BUNDLES_TO_KEEP,
    host: options.host,
  };
}

module.exports = {
  buildCleanUpSettings,
};
