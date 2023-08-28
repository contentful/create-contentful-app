import chalk from 'chalk';

export function validateArguments(
  requiredOptions: Record<string, string>,
  options: Record<string, any>,
  command?: string,
) {
  Object.entries(requiredOptions).forEach(([option, argument]) => {
    if (!options[option]) {
      console.log(
        `
  ${chalk.red('Invalid Arguments:')} the argument ${chalk.cyan(argument)} was not defined.
        `);
      if (command) {
        console.log(`
  Run ${chalk.dim(`npx @contentful/app-scripts ${command} --help`)} to see all required arguments
        `);
      }
      throw new Error('Invalid Arguments');
    }
  });
}
