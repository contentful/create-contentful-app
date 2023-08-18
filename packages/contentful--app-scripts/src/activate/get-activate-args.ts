import chalk from 'chalk';
import ora from 'ora';
import { getAppInfo } from '../get-app-info';
import { validateArguments } from '../validate-arguments';
import { ActivateOptions, ActivateSettings } from '.';

const requiredOptions = {
  organizationId: '--organization-id',
  definitionId: '--definition-id',
  bundleId: '--bundle-id',
  token: '--token',
};

export async function getActivateSettingsArgs(options: ActivateOptions): Promise<ActivateSettings> {
  const validateSpinner = ora('Validating your input').start();

  try {
    validateArguments(requiredOptions, options, 'activate');
    const appInfo = await getAppInfo(options);
    return {
      ...appInfo,
      bundleId: options.bundleId,
      host: options.host,
    };
  } catch (err: any) {
    console.log(`
      ${chalk.red('Validation failed')}
      ${err.message}
    `);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  } finally {
    validateSpinner.stop();
  }
}
