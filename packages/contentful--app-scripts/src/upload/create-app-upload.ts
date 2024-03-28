import ora from 'ora';
import { createZipFileFromDirectory } from './create-zip-from-directory';
import { validateBundle } from './validate-bundle';
import { showCreationError } from '../utils';
import { createClient } from 'contentful-management';
import { UploadSettings } from '../types';

async function createAppBundleFromFile(orgId: string, token: string, zip: Buffer, host = '') {
  const client = createClient({
    accessToken: token,
    host,
    hostUpload: host.replace(/^api/i, 'upload'),
  });
  const org = await client.getOrganization(orgId);
  return await org.createAppUpload(zip);
}

export async function createAppUpload(settings: UploadSettings) {
  validateBundle(settings.bundleDirectory || '.', settings);
  let appUpload = null;
  const zipFileSpinner = ora('Preparing your files for upload...').start();
  const zipFile = await createZipFileFromDirectory(settings.bundleDirectory || '../types');
  zipFileSpinner.stop();

  if (!zipFile) return;

  const uploadSpinner = ora('Uploading your files...').start();
  try {
    appUpload = await createAppBundleFromFile(
      settings.organization.value,
      settings.accessToken,
      zipFile,
      settings.host
    );
  } catch (err: any) {
    showCreationError('app bundle', err.message);
  }

  uploadSpinner.stop();
  return appUpload;
}
