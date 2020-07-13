#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

const spawn = require('cross-spawn');
const path = require('path');
const Spinner = require('cli-spinner').Spinner;
const promptAppDefinitionSettings = require('./prompt-app-definition');
const createAppDefinition = require('./create-app-definition');

const command = process.argv[2];
const appFolder = process.argv[3];

const mainCommand = 'npx create-contentful-app';

function onSuccess(spinner, folder) {
  spinner.stop(true);

  console.log();
  console.log(`Success! Created ./${folder}`);
  console.log();
  console.log(`We suggest that you begin by running:`);
  console.log();
  console.log(`   cd ${folder}`);
  console.log(`   ${mainCommand} create-definition`);
  console.log();
  process.exit();
}

function initProject() {
  try {
    if (!appFolder) {
      console.log();
      console.log(`Please provide a name for your app. E.g: "${mainCommand} init my-app"`);
      console.log();
      process.exit(1);
    }

    const spinner = new Spinner('Installing packages. This might take a while.');
    spinner.setSpinnerString('/-\\');

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

    console.log(`Creating a Contentful App in ./${appFolder}`);
    spinner.start();
    appCreateProcess.on('exit', onSuccess.bind(null, spinner, appFolder));
  } catch (err) {
    console.log(
      `Failed to create ${appFolder}:
        
        ${err}
      `
    );
  }
}

(async function main() {
  let appDefinitionSettings;

  function printHelpText() {
    console.log('Available commands:');
    console.log();
    console.log(`${mainCommand} init app-name`);
    console.log(`   Bootstraps your app inside of a new folder "app-name"`);
    console.log();
    console.log(`${mainCommand} create-definition`);
    console.log(`   Creates an app definition for your app.`);
    console.log(`   This will prompt you to login into Contentful,`);
    console.log(
      `   paste your access token after obtaining it and select in which organization the app definition should be created`
    );
    console.log();
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

    default:
      console.log();
      console.log(`Unknown command.`);
      printHelpText();
      process.exit(1);
  }
})();
