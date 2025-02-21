#!/usr/bin/env node
import { resolve } from 'path';
import { program } from 'commander';
import tildify from 'tildify';
import { normalizeOptions } from './utils';
import { CLIOptions } from './types';
import { code, error, highlight, success, wrapInBlanks } from './logger';
import chalk from 'chalk';
import { cloneFunction } from './includeFunction';
import { EXAMPLES_REPO_URL } from './constants';
import { getTemplateSource } from './getTemplateSource';
import { track } from './analytics';
import inquirer from 'inquirer';


function successMessage(folder: string) {
  console.log(`
${success('Success!')} You've added functions to your Contentful app in ${highlight(tildify(folder))}.`);

  wrapInBlanks(highlight('---- Next Steps'));

  console.log(`Now, build and upload your app bundle to Contentful:

    ${code('npm run build && npm run upload')}
  `);
}

async function createFunction(functionName: string, options: CLIOptions) {
  const normalizedOptions = normalizeOptions(options);
  console.log(options)
  try {
    functionName = await validateFunctionName(functionName)
    console.log(`functionName: ${functionName}`)
    const fullAppFolder = resolve(process.cwd());

    console.log(`Adding functions folder and ${highlight('contentful-app-manifest.json')}`);

    // this is not currently working properly
    const templateSource = await getTemplateSource(options);

    track({
      template: templateSource,
      manager: normalizedOptions.npm ? 'npm' : 'yarn',
    });

    await cloneFunction(
      fullAppFolder,
      templateSource
    );
    
    successMessage(fullAppFolder);
  } catch (err) {
    error(`Failed to create ${highlight(chalk.cyan(functionName))}`, err);
    process.exit(1);
  }
}

// todo: validate function name
async function validateFunctionName(functionName : string) {
 if (!functionName || functionName === "create-app-functions") {
  functionName = await promptFunctionName()
 }
 
 return functionName
}

async function promptFunctionName() {
  return await inquirer.prompt([
    {
      name: 'name',
      message: 'Function name',
      default: `function${Math.floor(100000 + Math.random() * 900000)}`,
    },
  ]);
}

(async function main() {
  program
    .name(`npx ${code('create-app-function')}`)
    .helpOption(true, 'shows all available CLI options')
    .description(
      [
        'Add a function to your Contentful app.',
        '',
        code('  contentful-app-functions my-function'),
        '',
        'or specify your own template',
        '',
        code('   contentful-app-functions my-function --source "github:user/repo"'),
      ].join('\n')
    )
    .argument('[function-name]', 'function name')
    .option('-e, --example <example-name>', `bootstrap an example function from ${EXAMPLES_REPO_URL}`)

    .option('-ts, --typescript', 'use TypeScript template (default)')
    .option('-js, --javascript', 'use JavaScript template')
    .option(
      '-s, --source <url>',
      [
        `provide a template by its source repository.`,
        `format: URL (HTTPS or SSH) or ${code('vendor:user/repo')} (e.g., ${code(
          'github:user/repo'
        )})`,
      ].join('\n')
    )
    .action(createFunction);
  await program.parseAsync();
})();
