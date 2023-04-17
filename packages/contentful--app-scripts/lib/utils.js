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
  const cachedEnvVar = process.env[cachedOptionEnvVar]
  const cachedElement = list.find(item => item.value === cachedEnvVar);

  if (cachedElement) {
    console.log(`
  ${message}
  Using environment variable: ${cachedElement.name} (${chalk.blue(cachedElement.value)})
    `)
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
      await cacheEnvVars({[cachedOptionEnvVar]: elementId});
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

    return manifest.actions.map((action) => ({ parameters: [], ...action })); // adding required parameters
  } catch {
    showManifestValidationError();
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

const showManifestValidationError = () => {
  console.warn(`${chalk.red('Error:')} Invalid JSON in manifest file at ${chalk.bold(DEFAULT_MANIFEST_PATH)}.`);
};

module.exports = {
  throwValidationException,
  throwError,
  selectFromList,
  showCreationError,
  getActionsManifest,
  showManifestValidationError,
};
