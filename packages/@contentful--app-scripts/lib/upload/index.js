const {getManagementToken} = require("../get-management-token");
const {buildAppUploadSettings} = require('./build-upload-settings')

module.exports = {
  async interactive() {
    const settings = await buildAppUploadSettings()
    console.log(settings);
  },
  async nonInteractive() {
    console.log("NON-INTERACTIVE UPLOAD")
  }
}
