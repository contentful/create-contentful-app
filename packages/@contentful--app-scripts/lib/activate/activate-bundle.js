const ora = require('ora');
const chalk = require('chalk');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

async function activateBundle({ accessToken, organization, definition, bundleId }) {
  const activationSpinner = ora('Activating your bundle').start();
  const client = createClient({ accessToken });
  const currentOrganization = await client.getOrganization(organization.value);
  const currentDefinition = await currentOrganization.getAppDefinition(definition.value);

  currentDefinition.bundle = {
    sys: {
      id: bundleId,
      linkType: 'AppBundle',
      type: 'Link',
    },
  };
  currentDefinition.src = undefined;
  try {
    await currentDefinition.update();
  } catch (err) {
    throwError(
      err,
      'Something went wrong activating your bundle. Make sure you used the correct definition-id'
    );
  } finally {
    activationSpinner.stop();
  }

  console.log(
    `${chalk.cyan('Success!')} Your app bundle was activated for ${chalk.cyan(
      definition.name
    )} in ${chalk.bold(organization.name)}.

  Bundle Id: ${chalk.yellow(bundleId)}
  `
  );
}

module.exports = {
  activateBundle,
};
