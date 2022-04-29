import chalk from 'chalk';

export function warn(message: string): void {
  console.log(`${chalk.yellow('Warning:')} ${message}`);
}

export function error(message: string, error: unknown): void {
  console.log(`${chalk.red('Error:')} ${message}`);
  if (error === undefined) {
    return;
  } else if (error instanceof Error) {
    console.log();
    console.log(error);
  } else {
    const strigifiedError = String(error);
    console.log();
    console.log(
      `${strigifiedError.startsWith('Error: ') ? strigifiedError.substring(7) : strigifiedError}`
    );
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
