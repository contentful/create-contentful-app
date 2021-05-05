const { openSettings } = require('./open-settings');

module.exports = {
  interactive(options) {
    openSettings(options);
  },
  nonInteractive() {
    throw new Error(`"open-settings" is not available in non-interactive mode`);
  },
};
