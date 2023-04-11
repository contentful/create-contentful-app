const chalk = require('chalk');
const inquirer = require('inquirer');
const { cacheEnvVars } = require('../utils/cache-credential');

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

const showAppManifestFound = (path) => {
  console.log(`  ----------------------------`);
  console.log(`  App manifest found in ${chalk.bold(path)}. Applying...`);
  console.log(`  ----------------------------`);
};

const showManifestValidationError = () => {
  console.log('----------------------------');
  console.warn(
    `${chalk.red(
      'Warning:'
    )} Invalid JSON in manifest file. App actions will not be applied!`
  );
  console.log('----------------------------');
};

module.exports = {
  throwValidationException,
  throwError,
  selectFromList,
  showCreationError,
  showAppManifestFound,
  showManifestValidationError,
};
