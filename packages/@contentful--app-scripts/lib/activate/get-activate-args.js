const chalk = require('chalk');
const ora = require('ora');
const { getDefinitionById } = require('../definition-api');
const { getOrganizationById } = require('../organization-api');

const { createClient } = require('contentful-management');

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  bundleId: '--bundle-id',
  token: '--token',
};

function validateArguments(options) {
  Object.entries(requiredOptions).forEach(([option, argument]) => {
    if (!options[option]) {
      console.log(
        `
  ${chalk.red('Invalid Arguments:')} the argument ${chalk.cyan(argument)} was not defined
  Run ${chalk.dim('contentful-app-scripts upload --help')} to see all required arguments
        `
      );
      throw new Error('Invalid Arguments');
    }
  });
}

async function getActivateSettingsArgs(options) {
  const validateSpinner = ora('Validating your input').start();

  try {
    validateArguments(options);
    const client = createClient({ accessToken: options.token });
    const selectedOrg = await getOrganizationById(client, options.organizationId);
    const selectedDefinition = await getDefinitionById(
      client,
      options.organizationId,
      options.definitionId
    );
    return {
      bundleId: options.bundleId,
      organisation: selectedOrg,
      definition: selectedDefinition,
      accessToken: options.token,
      comment: options.comment,
    };
  } catch (err) {
    console.log(`
      ${chalk.red('Validation failed')}
      ${err.message}
    `);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  } finally {
    validateSpinner.stop();
  }
}

exports.getActivateSettingsArgs = getActivateSettingsArgs;
