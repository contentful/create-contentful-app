// @ts-check

const path = require('path');
const fs = require('fs');

const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');

const PULL_REQUEST_TITLE = `chore(deps): daily update 'template.json'`;

const OWNER = 'contentful';
const REPOSITORY = 'create-contentful-app';

const ROOT_PATH = path.resolve(__dirname, '..', '..');
const SANDBOX_PATH = path.resolve(ROOT_PATH, 'dependency-check');
const TEMPLATE_PATH = path.join(ROOT_PATH, 'template.json');
const OUTDATED_PATH = path.join(SANDBOX_PATH, 'outdated.json');
const TEST_REPORT_PATH = path.join(SANDBOX_PATH, 'test-report');

const getStyledString = (style, string) => {
  if (!process.stdout.hasColors()) {
    return string;
  }

  switch (style) {
    case 'red':
      return `\x1b[31m${string}\x1b[0m`;
    case 'yellow':
      return `\x1b[33m${string}\x1b[0m`;
    case 'green':
      return `\x1b[32m${string}\x1b[0m`;
    default:
      string;
  }
};

const printError = (error, details) => {
  console.error('');
  console.error(getStyledString('red', ` !!! ${error}`));
  if (details) {
    console.error('Details: ');
    console.group();
    console.error(details);
    console.groupEnd();
  }
  console.error('');
};

const printErrorAndExit = (error, details, statusCode = 1) => {
  printError(error, details);
  // eslint-disable-next-line no-process-exit
  process.exit(statusCode);
};

const printInfo = (message) => {
  console.log(` > ${message}`);
};

const printHeader = (message) => {
  console.log('');
  console.log(getStyledString('yellow', ` > ${message} < `));
  console.log('');
};

const printSuccess = (message) => {
  console.log(getStyledString('green', ` ✓ ${message}`));
};

const validateAndRequire = (path) => {
  try {
    require.resolve(path);
  } catch (e) {
    printErrorAndExit(`Unable to find file at ${path}`);
  }

  return require(path);
};

const validateAndRead = (filePath) => {
  try {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
  } catch (e) {
    printErrorAndExit(`Unable to read file at ${path}`, e);
  }
};

function createGithubClient() {
  return new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
  });
}

function createGitClient() {
  return simpleGit(ROOT_PATH);
}

module.exports = {
  printError,
  printErrorAndExit,
  printInfo,
  printHeader,
  printSuccess,
  validateAndRequire,
  validateAndRead,
  PULL_REQUEST_TITLE,
  OWNER,
  REPOSITORY,
  ROOT_PATH,
  SANDBOX_PATH,
  OUTDATED_PATH,
  TEMPLATE_PATH,
  TEST_REPORT_PATH,
  createGithubClient,
  createGitClient,
};
