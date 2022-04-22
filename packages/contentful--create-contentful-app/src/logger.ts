import chalk from 'chalk';

export function warn(message: string): void {
  console.log(`${chalk.yellow('Warning:')} ${message}`);
}

export function error(message: string, error: string | Error): void {
  if (error instanceof Error) {
    console.log(`${chalk.red('Error:')} ${message}\n`);
    console.log(error);
  } else {
    console.log(`${chalk.red('Error:')} ${message}

  ${error.startsWith('Error: ') ? error.substring(7) : error}
`);
  }
}

export function highlight(str: string) {
  return chalk.bold(str);
}

export function choice(str: string) {
  return chalk.cyan(str);
}

export function success(str: string) {
  return chalk.greenBright(str);
}

export function code(str: string) {
  return chalk.bold(str);
}
