#!/usr/bin/env node

import { program } from 'commander';

import {
  createAppDefinition,
  upload,
  activate,
  cleanup,
  open,
  track,
  install,
  buildFunctions,
  generateFunction,
  upsertActions,
  addLocations,
} from './index';
import { feedback } from './feedback';

type Command =
  | typeof createAppDefinition
  | typeof upload
  | typeof activate
  | typeof cleanup
  | typeof open
  | typeof install
  | typeof buildFunctions
  | typeof generateFunction
  | typeof upsertActions
  | typeof addLocations;

async function runCommand(command: Command, options?: any) {
  const { ci } = program.opts();
  return ci ? await command.nonInteractive(options) : await command.interactive(options);
}

(async function main() {
  const version = process.env.npm_package_version ?? '';
  program.version(version).option('--ci', 'Execute in non-interactive mode', false);

  program
    .command('create-app-definition')
    .description('Create a new AppDefinition for an App')
    .action(async () => {
      await runCommand(createAppDefinition);
    });

  program
    .command('upload')
    .description('Upload your build folder and create an AppBundle')
    .option('--bundle-dir [directory]', 'The directory of your build folder')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id [defId]', "The id of your app's definition")
    .option('--token [accessToken]', 'Your content management access token')
    .option('--comment [comment]', 'Optional comment for the created bundle')
    .option('--skip-activation', 'A Boolean flag to skip automatic activation')
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(upload, options);
    });

  program
    .command('activate')
    .description('Mark an AppBundle as "active" for a given AppDefinition')
    .option('--bundle-id [bundleId]', 'The id of your bundle')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--token [accessToken]', 'Your content management access token')
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(activate, options);
    });

  program
    .command('open-settings')
    .description('Opens the app editor for a given AppDefinition')
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(open, options);
    });

  program
    .command('bundle-cleanup')
    .description('Removes old, non-active bundles, only keeps the 50 most recent ones')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--token [accessToken]', 'Your content management access token')
    .option('--keep [keepAmount]', 'The amount of bundles that should remain')
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(cleanup, options);
    });

  program
    .command('feedback')
    .description('Provide Contentful with feedback on the CLI')
    .action(async (options) => {
      await runCommand(feedback, options);
    });

  program
    .command('install')
    .description(
      'Opens a picker to select the space and environment for installing the app associated with a given AppDefinition'
    )
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(install, options);
    });

  program
    .command('build-functions')
    .description('Builds Contentful Function source into an App Framework compatible bundle.')
    .option('-e, --esbuild-config <path>', 'custom esbuild config file path')
    .option('-m, --manifest-file <path>', 'Contentful app manifest file path')
    .option('-w, --watch', 'watch for changes')
    .action(async (options) => {
      await runCommand(buildFunctions, options);
    });

  program
    .command('generate-function')
    .description('Generate a new Contentful Function')
    .option('-n, --name <name>', 'Name of the function')
    .option('-e, --example <example>', 'Name of the reference example')
    .option('-l, --language <language>', 'Select a language for the function')
    .action(async (options) => {
      await runCommand(generateFunction, options);
    });

  program
    .command('upsert-actions')
    .description('Upsert Action(s) for an App')
    .option('-m, --manifest-file <path>', 'Contentful app manifest file path')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--token [accessToken]', 'Your content management access token')
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(upsertActions, options);
    });

  program
    .command('add-locations')
    .description('Add locations(s) to an App')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', "The id of your app's definition")
    .option('--token [accessToken]', 'Your content management access token')
    .option('--host [host]', 'Contentful subdomain to use, e.g. "api.contentful.com"')
    .action(async (options) => {
      await runCommand(addLocations, options);
    });

  program.hook('preAction', (thisCommand) => {
    track({ command: thisCommand.args[0], ci: thisCommand.opts().ci });
  });

  await program.parseAsync(process.argv);
})().catch((e) => {
  console.error(e);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
