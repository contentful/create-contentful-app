const chalk = require('chalk');

const throwValidationException = (subject, message, details) => {
  console.log(`${chalk.red('Validation Error:')} Missing or invalid ${subject}.`);
  message && console.log(message);
  details && console.log(`${chalk.dim(details)}`)

  throw new TypeError(message);
};

exports.throwValidationException = throwValidationException;
