const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { cacheEnvVars } = require('../utils/cache-credential');
const { URL } = require('url');

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

const throwValidationException = (subject, message, details) => {
  console.log(`${chalk.red('Validation Error:')} Missing or invalid ${subject}.`);
  message && console.log(message);
  details && console.log(`${chalk.dim(details)}`);

  throw new TypeError(message);
};

const validateIpAddress = (ipAddress) => {
  const ipRegex = /^((?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::([0-9]{1,5}))?$/i;
  return ipRegex.test(ipAddress);
};

const removeProtocolFromUrl = (url) => {
  try {
    const prefixedUrl = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/.test(url) ? `http://${url}` : url;
    const { host } = new URL(prefixedUrl);
    return host;
  } catch (e) {
    //swallow error here to throw more suitable error in getActionsManifest function
    return;
  }
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
      const allowedNetworks = Array.isArray(action.allowedNetworks) ? action.allowedNetworks : [];

      const validAllowedNetworks = allowedNetworks
        .map(removeProtocolFromUrl)
        .filter(validateIpAddress);

      if (validAllowedNetworks.length !== allowedNetworks.length) {
        console.log(
          `${chalk.red(
            'Error:'
          )} Invalid IP address found in the allowedNetworks array for action "${action.name}".`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      return {
        parameters: [],
        ...action,
        allowedNetworks:
          validAllowedNetworks.length > 0
            ? validAllowedNetworks
            : ['api.contentful.com', '127.0.0.1'],
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
};
