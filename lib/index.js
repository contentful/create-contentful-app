#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

const chalk = require('chalk');
const spawn = require('cross-spawn');
const path = require('path');
const tildify = require('tildify');
const Spinner = require('cli-spinner').Spinner;
const promptAppDefinitionSettings = require('./prompt-app-definition');
const createAppDefinition = require('./create-app-definition');
const readline = require('readline');
const stream = process.stdout;

const command = process.argv[2];
const appFolder = process.argv[3];

const localCommand = 'create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function onSuccess(spinner, folder) {
  spinner.stop(true);

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

    const spinner = new Spinner({
      text: 'Installing packages. This might take a while.',
      onTick: msg => {
        readline.clearLine(stream, 0);
        readline.cursorTo(stream, 0);
        stream.write(chalk.dim(msg));
      },
      stream
    });

    spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');

    const initCommand = 'npx';
    const execPath = path.resolve(__dirname, '../');

    const args = [
      'create-react-app',
      appFolder,
      '--template',
      `file:${execPath}`,
      '--silent',
      '--use-npm'
    ];

    // start creating app
    const appCreateProcess = spawn(initCommand, args, {
      silent: true
    });

    console.log(
      `Creating a Contentful app in ${chalk.bold(tildify(path.resolve(process.cwd(), appFolder)))}.`
    );
    spinner.start();
    appCreateProcess.on('exit', onSuccess.bind(null, spinner, appFolder));
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to create ${appFolder}:
        
      ${err}
      `);
  }
}

(async function main() {
  let appDefinitionSettings;

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
      appDefinitionSettings = await promptAppDefinitionSettings();
      await createAppDefinition(appDefinitionSettings);
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
