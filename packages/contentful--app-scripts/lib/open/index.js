const { openSettings } = require('./open-settings');

module.exports = {
  async run(options) {
    openSettings(options);
  },
};
