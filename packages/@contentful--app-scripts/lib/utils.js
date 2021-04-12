const chalk = require('chalk');

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

module.exports = {
  throwValidationException,
  throwError,
  showCreationError,
};
