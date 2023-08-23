import chalk from 'chalk';
import ora from 'ora';
import { DEFAULT_BUNDLES_TO_KEEP } from '../constants';
import { validateArguments } from '../validate-arguments';
import { getAppInfo } from '../get-app-info';
import { CleanupOptions, CleanupSettings } from '.';

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  token: '--token',
};

export async function getCleanUpSettingsArgs(options: CleanupOptions): Promise<CleanupSettings> {
  const validateSpinner = ora('Validating your input...').start();

  try {
    validateArguments(requiredOptions, options, 'upload');
    const appInfo = await getAppInfo(options);
    return {
      ...appInfo,
      keep: options.keep !== undefined ? +options.keep : DEFAULT_BUNDLES_TO_KEEP,
      host: options.host,
    };
  } catch (err: any) {
    console.log(`
      ${chalk.red('Validation failed!')}
      ${err.message}
    `);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  } finally {
    validateSpinner.stop();
  }
}
