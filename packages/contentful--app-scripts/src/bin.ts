#!/usr/bin/env node

import { program } from 'commander';
import { version } from '../package.json';

import { createAppDefinition, upload, activate, cleanup, open, track } from './index';

type Command = typeof createAppDefinition | typeof upload | typeof activate | typeof cleanup | typeof open;

async function runCommand(command: Command, options?: any) {
  const { ci } = program.opts();
  return ci ? await command.nonInteractive(options) : await command.interactive(options);
}

(async function main() {
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
    .option('--definition-id [defId]', 'The id of your apps definition')
    .option('--token [accessToken]', 'Your content management access token')
    .option('--comment [comment]', 'Optional comment for the created bundle')
    .option('--skip-activation', 'A Boolean flag to skip automatic activation')
    .option('--host [host]', 'Contentful domain to use')
    .action(async (options) => {
      await runCommand(upload, options);
    });

  program
    .command('activate')
    .description('Mark an AppBundle as "active" for a given AppDefinition')
    .option('--bundle-id [bundleId]', 'The id of your bundle')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', 'The id of your apps definition')
    .option('--token [accessToken]', 'Your content management access token')
    .option('--host [host]', 'Contentful domain to use')
    .action(async (options) => {
      await runCommand(activate, options);
    });

  program
    .command('open-settings')
    .description('Opens the app editor for a given AppDefinition')
    .option('--definition-id  [defId]', 'The id of your apps definition')
    .action(async (options) => {
      await runCommand(open, options);
    });

  program
    .command('bundle-cleanup')
    .description('Removes old, non-active bundles, only keeps the 50 most recent ones')
    .option('--organization-id [orgId]', 'The id of your organization')
    .option('--definition-id  [defId]', 'The id of your apps definition')
    .option('--token [accessToken]', 'Your content management access token')
    .option('--keep [keepAmount]', 'The amount of bundles that should remain')
    .option('--host [host]', 'Contentful domain to use')
    .action(async (options) => {
      await runCommand(cleanup, options);
    });

  program.hook('preAction', (thisCommand) => {
    track({ command: thisCommand.args[0], ci: `${thisCommand.opts().ci}` });
  });

  await program.parseAsync(process.argv);
})().catch((e) => {
  console.error(e);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
