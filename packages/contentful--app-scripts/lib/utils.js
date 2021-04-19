const chalk = require('chalk');
const inquirer = require('inquirer');

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

const selectFromList = async (list, message, defaultFallbackId) => {
  const defaultOption = list.findIndex(item => item.value === defaultFallbackId);
  const { elementId } = await inquirer.prompt([
    {
      name: 'elementId',
      message: message,
      type: 'list',
      choices: list,
      ...(defaultFallbackId ? {default: defaultOption} : {}),
    },
  ]);
  return list.find((el) => el.value === elementId);
};

module.exports = {
  throwValidationException,
  throwError,
  selectFromList,
  showCreationError,
};
