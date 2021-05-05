const chalk = require('chalk');
const ora = require('ora');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

async function deleteBundle(bundleId, index, maxIndex, client, settings) {
  const deleteSpinner = ora(`Deleting ${index + 1} out of ${maxIndex} bundles...`).start();
  await client.appBundle.delete({
    appBundleId: bundleId,
    appDefinitionId: settings.definition.value,
    organizationId: settings.organization.value,
  });
  deleteSpinner.stop();
  console.log(
    `${chalk.green('Done:')} ${index + 1} out of ${maxIndex} bundles was deleted successfully`
  );
}

async function cleanUpBundles(settings) {
  let bundles;
  const client = createClient({ accessToken: settings.accessToken }, { type: 'plain' });
  const bundlesSpinner = ora(`Fetching all bundles...`).start();
  try {
    bundles = await client.appBundle.getMany({
      appDefinitionId: settings.definition.value,
      organizationId: settings.organization.value,
    });
  } catch (e) {
    throwError(e, 'Something went wrong fetching the bundles');
  }

  bundlesSpinner.stop();

  const bundlesToDelete = bundles.items.slice(settings.keep);

  if (bundlesToDelete.length < 1) {
    console.log(`${chalk.yellow('Warning:')} There is nothing to delete`);
  }

  console.log(`

${chalk.cyan('Info:')} ${bundlesToDelete.length} bundles will be deleted

  `);

  try {
    for (const [index, bundle] of bundlesToDelete.entries()) {
      await deleteBundle(bundle.sys.id, index, bundlesToDelete.length, client, settings);
    }
    console.log(
      `${chalk.green('Success:')} All ${bundlesToDelete.length} bundles are deleted successfully`
    );
  } catch (e) {
    throwError(e, 'Something went wrong deleting the bundles');
  }
}

module.exports = {
  cleanUpBundles,
};
