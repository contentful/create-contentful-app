const chalk = require('chalk');

function validateArguments(requiredOptions, options, command) {
  Object.entries(requiredOptions).forEach(([option, argument]) => {
    if (!options[option]) {
      console.log(
        `
  ${chalk.red('Invalid Arguments:')} the argument ${chalk.cyan(argument)} was not defined
  Run ${chalk.dim(`npx @contentful/app-scripts ${command} --help`)} to see all required arguments
        `
      );
      throw new Error('Invalid Arguments');
    }
  });
}

exports.validateArguments = validateArguments;
