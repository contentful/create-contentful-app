#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

const chalk = require('chalk');
const spawn = require('cross-spawn');
const path = require('path');
const tildify = require('tildify');
const { createAppDefinition } = require('@contentful/app-scripts');
const { version } = require('../package.json');

const command = process.argv[2];
const appFolder = process.argv[3];

const localCommand = '@contentful/create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function getTemplate() {
  const templatePkg = '@contentful/cra-template-create-contentful-app';

  if (!process.env.USE_LINKED_TEMPLATE) {
    return `${templatePkg}@${version}`;
  }

  const linkedTemplatePath = path.relative(
    process.cwd(),
    path.dirname(require.resolve(templatePkg))
  );

  console.log();
  console.log(chalk.dim('> Using linked template at %s'), chalk.blueBright(linkedTemplatePath));
  console.log();

  return `file:${linkedTemplatePath}`;
}

function onSuccess(folder) {
  console.log(`
${chalk.cyan('Success!')} Created a new Contentful app in ${chalk.bold(
    tildify(path.resolve(process.cwd(), folder))
  )}.

We suggest that you begin by running:

    ${chalk.cyan(`cd ${folder}`)}
    ${chalk.cyan(`${mainCommand} create-definition`)}
  `);

  process.exit();
}

function initProject() {
  try {
    if (!appFolder) {
      console.log();
      console.log(
        `Please provide a name for your app, e.g. ${chalk.cyan(`\`${mainCommand} init my-app\``)}.`
      );
      console.log();
      process.exit(1);
    }

    const initCommand = 'node';
    const createReactApp = require.resolve('create-react-app');
    const template = getTemplate();

    const args = [createReactApp, appFolder, '--template', template, '--use-npm'];

    console.log(
      `Creating a Contentful app in ${chalk.bold(tildify(path.resolve(process.cwd(), appFolder)))}.`
    );

    const appCreateProcess = spawn(initCommand, args, { stdio: 'inherit' });
    appCreateProcess.on('exit', (exitCode) => {
      if (exitCode === 0) {
        onSuccess(appFolder);
      } else {
        process.exit(exitCode);
      }
    });
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to create ${appFolder}:

      ${err}
      `);
    process.exit(1);
  }
}

(async function main() {
  function printHelpText() {
    console.log(`
${chalk.bold(localCommand)}

${chalk.dim('Available commands:')}

${chalk.cyan(`$ ${mainCommand} init app-name`)}

  Bootstraps your app inside a new folder "app-name".

${chalk.cyan(`$ ${mainCommand} create-definition`)}

  Creates an app definition for your app in a Contentful
  organization of your choice.
  `);
  }

  switch (command) {
    case 'init':
      initProject();
      break;

    case 'create-definition':
      await createAppDefinition.interactive();
      break;

    case 'help':
      printHelpText();
      break;

    case undefined:
      printHelpText();
      break;

    default:
      console.log();
      console.log(`${chalk.red('Error:')} Unknown command.`);
      printHelpText();
      process.exit(1);
  }
})();
