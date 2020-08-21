const path = require('path');
const fs = require('fs');

const ROOT_PATH = path.resolve(__dirname, '..', '..');
const SANDBOX_PATH = path.resolve(ROOT_PATH, 'dependency-check');
const TEMPLATE_PATH = path.join(ROOT_PATH, 'template.json');
const OUTDATED_PATH = path.join(SANDBOX_PATH, 'outdated.json');

const getStyledString = (style, string) => {
  if (!process.stdout.hasColors()) {
    return string
  }

  switch (style) {
    case 'red':
      return `\x1b[31m${string}\x1b[0m`
    case 'yellow':
      return `\x1b[33m${string}\x1b[0m`
    case 'green':
      return `\x1b[32m${string}\x1b[0m`
    default:
      string
  }
} 

const printError = (error, details) => {
  console.error('');
  console.error(getStyledString('red', ` !!! ${error}`));
  if (details) {
    console.error('Details: ')
    console.group()
    console.error(details)
    console.groupEnd()
  }
  console.error('');
}

const printErrorAndExit = (error, details, statusCode = 1) => {
  printError(error, details);
  process.exit(statusCode);
}

const printInfo = (message) => {
  console.log(` > ${message}`);
}

const printHeader = (message) => {
  console.log('');
  console.log(getStyledString('yellow', ` > ${message} < `));
  console.log('');
}

const printSuccess = (message) => {
  console.log(getStyledString('green', ` ✓ ${message}`));
}

const validateAndRequire = (path) => {
  try {
    require.resolve(path);
  } catch (e) {
    printErrorAndExit(`Unable to find file at ${path}`);
  }

  return require(path);
}

module.exports = {
  printError,
  printErrorAndExit,
  printInfo,
  printHeader,
  printSuccess,
  validateAndRequire,
  ROOT_PATH,
  SANDBOX_PATH,
  OUTDATED_PATH,
  TEMPLATE_PATH
}