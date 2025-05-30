import chalk from 'chalk';
import ora from 'ora';
import { getAppInfo } from '../get-app-info';
import { validateArguments } from '../validate-arguments';
import { getFunctionsFromManifest } from '../utils';
import { UploadOptions, UploadSettings } from '../types';

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  bundleDir: '--bundle-dir',
  token: '--token',
};

export async function getUploadSettingsArgs(options: UploadOptions): Promise<UploadSettings> {
  const validateSpinner = ora('Validating your input...').start();
  const functionManifest = getFunctionsFromManifest();
  const { bundleDir, comment, skipActivation, host, userAgentApplication } = options;

  try {
    validateArguments(requiredOptions, options, 'upload');
    const appInfo = await getAppInfo(options);
    return {
      ...appInfo,
      bundleDirectory: bundleDir!,
      skipActivation,
      comment,
      host,
      userAgentApplication,
      functions: functionManifest,
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
