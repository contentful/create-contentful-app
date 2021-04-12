const ora = require('ora');
const chalk = require('chalk');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

async function activateBundle({ accessToken, organisation, definition, bundleId }) {
  const activationSpinner = ora('Activating your bundle').start();
  const client = createClient({ accessToken });
  const currentOrganisation = await client.getOrganization(organisation.value);
  const currentDefinition = await currentOrganisation.getAppDefinition(definition.value);

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
    )} in ${chalk.bold(organisation.name)}.

  Bundle Id: ${chalk.yellow(bundleId)}
  `
  );
}

exports.activateBundle = activateBundle;
