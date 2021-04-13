const chalk = require('chalk');
const ora = require('ora');
const { getDefinitionById } = require('../definition-api');
const { getOrganizationById } = require('../organization-api');

const { createClient } = require('contentful-management');

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  bundleDir: '--bundle-dir',
  token: '--token',
};

function validateArguments(options) {
  Object.entries(requiredOptions).forEach(([option, argument]) => {
    if (!options[option]) {
      console.log(
        `
  ${chalk.red('Invalid Arguments:')} the argument ${chalk.cyan(argument)} was not defined
  Run ${chalk.dim('npx @contentful/app-scripts --help')} to see all required arguments
        `
      );
      throw new TypeError('Invalid Arguments');
    }
  });
}

async function getUploadSettingsArgs(options) {
  const validateSpinner = ora('Validating your input...').start();

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
      bundleDirectory: options.bundleDir,
      organisation: selectedOrg,
      definition: selectedDefinition,
      accessToken: options.token,
      comment: options.comment,
    };
  } catch (err) {
    console.log(`
      ${chalk.red('Validation failed!')}
      ${err.message}
    `);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  } finally {
    validateSpinner.stop();
  }
}

module.exports = {
  getUploadSettingsArgs,
};
