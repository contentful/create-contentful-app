const ora = require('ora');
const chalk = require('chalk');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

async function activateBundle({ accessToken, organization, definition, bundleId }) {
  const activationSpinner = ora('Activating your bundle').start();
  const client = createClient({ accessToken });

  const definitionUrl = `/organizations/${organization.value}/app_definitions/${definition.value}`;

  const currentDefinition = await client.rawRequest({
    url: definitionUrl,
  });

  currentDefinition.bundle = {
    sys: {
      id: bundleId,
      linkType: 'AppBundle',
      type: 'Link',
    },
  };
  delete currentDefinition.src;

  try {
    await client.rawRequest({ url: definitionUrl, method: 'PUT', data: currentDefinition });
  } catch (err) {
    throwError(
      err,
      'Something went wrong activating your bundle. Make sure you used the correct definition-id.'
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
