const ora = require('ora');
const chalk = require('chalk');
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
  await currentDefinition.update();
  activationSpinner.stop();
  console.log(
    `${chalk.cyan('Success!')} Your app bundle was activated for ${chalk.cyan(
      definition.name
    )} in ${chalk.bold(organisation.name)}.

  Bundle Id: ${chalk.yellow(bundleId)}
  `
  );
}

exports.activateBundle = activateBundle;
