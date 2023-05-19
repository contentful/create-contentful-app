const ora = require('ora');
const chalk = require('chalk');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

async function activateBundle({ accessToken, organization, definition, bundleId, host }) {
  const activationSpinner = ora('Activating your bundle').start();
  const plainClient = createClient({ accessToken, host }, { type: 'plain' });
  const defaultLocations = [{ location: 'dialog' }];

  const currentDefinition = await plainClient.appDefinition.get({
    appDefinitionId: definition.value,
    organizationId: organization.value,
  });

  currentDefinition.bundle = {
    sys: {
      id: bundleId,
      linkType: 'AppBundle',
      type: 'Link',
    },
  };
  if (!currentDefinition.locations.length) {
    currentDefinition.locations = defaultLocations;
  }
  delete currentDefinition.src;

  try {
    await plainClient.appDefinition.update(
      {
        appDefinitionId: definition.value,
        organizationId: organization.value,
      },
      currentDefinition
    );
  } catch (err) {
    throwError(
      err,
      'Something went wrong activating your bundle. Make sure you used the correct definition-id.'
    );
  } finally {
    activationSpinner.stop();
  }

  console.log(`
  ${chalk.cyan('Success!')} Your app bundle was activated for ${chalk.cyan(
    definition.name
  )} in ${chalk.bold(organization.name)}.

  Bundle Id: ${chalk.yellow(bundleId)}`);
  console.log(`
  ----------------------------

  Ready to share your app with the world? Submit it to the Developer Showcase (${chalk.cyan(
    'https://ctfl.io/dev-showcase'
  )}) or our Marketplace (${chalk.cyan('https://ctfl.io/submit-app')}).

 `);
}

module.exports = {
  activateBundle,
};
