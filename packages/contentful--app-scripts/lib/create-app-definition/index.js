const {buildAppDefinitionSettings} = require('./build-app-definition-settings')
const {createAppDefinition} = require('./create-app-definition')
const {getManagementToken} = require('../get-management-token')

module.exports = {
  async interactive() {
    const appDefinitionSettings = await buildAppDefinitionSettings();
    const managementToken = await getManagementToken();

    return createAppDefinition(managementToken, appDefinitionSettings);
  },
  async nonInteractive() {
    throw new Error(`"create-app-definition" is not available in non-interactive mode`)
  }
}