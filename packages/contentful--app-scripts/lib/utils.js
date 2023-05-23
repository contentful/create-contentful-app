const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { cacheEnvVars } = require('../utils/cache-credential');

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

const throwValidationException = (subject, message, details) => {
  console.log(`${chalk.red('Validation Error:')} Missing or invalid ${subject}.`);
  message && console.log(message);
  details && console.log(`${chalk.dim(details)}`);

  throw new TypeError(message);
};

const isValidNetwork = (address) => {
  const addressRegex =
    /^(?:localhost|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(\[(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\]|(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}))(?::\d{1,5})?$/;
  return addressRegex.test(address);
};

const stripProtocol = (url) => {
  const protocolRemovedUrl = url.replace(/^https?:\/\//, '');

  return protocolRemovedUrl.split('/')[0];
};

const showCreationError = (subject, message) => {
  console.log(`
    ${chalk.red('Creation error:')}

      Something went wrong while creating the ${chalk.bold(subject)}.

      Message:  ${chalk.red(message)}
    `);
};

const throwError = (err, message) => {
  console.log(`
${chalk.red('Error:')} ${message}.

${err.message}
    `);

  throw err;
};

const selectFromList = async (list, message, cachedOptionEnvVar) => {
  const cachedEnvVar = process.env[cachedOptionEnvVar];
  const cachedElement = list.find((item) => item.value === cachedEnvVar);

  if (cachedElement) {
    console.log(`
  ${message}
  Using environment variable: ${cachedElement.name} (${chalk.blue(cachedElement.value)})
    `);
    return cachedElement;
  } else {
    const { elementId } = await inquirer.prompt([
      {
        name: 'elementId',
        message: message,
        type: 'list',
        choices: list,
      },
    ]);

    if (cachedOptionEnvVar) {
      await cacheEnvVars({ [cachedOptionEnvVar]: elementId });
    }

    return list.find((el) => el.value === elementId);
  }
};

function getActionsManifest() {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
      return;
    }

    console.log('');
    console.log(`  ----------------------------
  App actions manifest found in ${chalk.bold(DEFAULT_MANIFEST_PATH)}.
  ----------------------------`);
    console.log('');

    const actions = manifest.actions.map((action) => {
      const allowNetworks = Array.isArray(action.allowNetworks)
        ? action.allowNetworks.map(stripProtocol)
        : [];

      const hasInvalidNetwork = allowNetworks.find((netWork) => !isValidNetwork(netWork));
      if (hasInvalidNetwork) {
        console.log(
          `${chalk.red(
            'Error:'
          )} Invalid IP address ${hasInvalidNetwork} found in the allowNetworks array for action "${
            action.name
          }".`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // EntryFile is not used but we do want to strip it from action
      // eslint-disable-next-line no-unused-vars
      const { entryFile: _, ...actionWithoutEntryFile } = action;

      return {
        ...actionWithoutEntryFile,
        allowNetworks,
      };
    });

    return actions;
  } catch {
    console.log(
      `${chalk.red('Error:')} Invalid JSON in manifest file at ${chalk.bold(
        DEFAULT_MANIFEST_PATH
      )}.`
    );
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

module.exports = {
  throwValidationException,
  throwError,
  selectFromList,
  showCreationError,
  getActionsManifest,
  isValidNetwork,
  stripProtocol,
};
