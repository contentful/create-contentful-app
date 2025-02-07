#!/usr/bin/env node
import { resolve } from 'path';
import { program } from 'commander';
import tildify from 'tildify';
import { normalizeOptions } from './utils';
import { CLIOptions } from './types';
import { code, error, highlight, success, wrapInBlanks } from './logger';
import chalk from 'chalk';
import { cloneFunction } from './includeFunction';


function successMessage(folder: string) {
  console.log(`
${success('Success!')} You've added functions to your Contentful app in ${highlight(tildify(folder))}.`);

  wrapInBlanks(highlight('---- Next Steps'));

  console.log(`Now, build and upload your app bundle to Contentful:

    ${code('npm run build && npm run upload')}
  `);
}

async function initProject(appName: string, options: CLIOptions) {
  const normalizedOptions = normalizeOptions(options);
  try {
    const fullAppFolder = resolve(process.cwd());

    console.log(`Adding functions folder and ${highlight('contentful-app-manifest.json')}`);

    await cloneFunction(
      fullAppFolder,
      !!normalizedOptions.javascript,
      "appevent-handler"
    );
    
    successMessage(fullAppFolder);
  } catch (err) {
    error(`Failed to create ${highlight(chalk.cyan(appName))}`, err);
    process.exit(1);
  }
}

(async function main() {
  program
    .name(`npx ${code('contentful-app-functions')}`)
    .helpOption(true, 'shows all available CLI options')
    .description(
      [
        'Add a function to your Contentful app.',
        '',
        code('  contentful-app-functions --create `my-function`'),
        '',
      ].join('\n')
    )
    .option('-javascript, --javascript', 'use JavaScript template')
    .option('-typescript, --typescript', 'use TypeScript template (default)')
    .action(initProject);
  await program.parseAsync();
})();
