const chalk = require('chalk');
const ora = require('ora');
const { throwError } = require('../utils');
const { createClient } = require('contentful-management');

const deleteMOCK = () =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, 2000);
  });

async function deleteBundle(bundleId, index, maxIndex) {
  const deleteSpinner = ora(`Deleting ${index + 1} out of ${maxIndex} bundles...`).start();
  await deleteMOCK();
  deleteSpinner.stop();
  console.log(
    `${chalk.cyan('Info:')} ${index + 1} out of ${maxIndex} bundles was deleted successfully`
  );
}

async function cleanUpBundles(settings) {
  let bundles;
  const bundlesSpinner = ora(`Fetching all bundles...`).start();
  try {
    const client = createClient({ accessToken: settings.accessToken }, { type: 'plain' });
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

  console.log(`${chalk.cyan('Info:')} ${bundlesToDelete.length} bundles will be deleted`);

  try {
    for (const [index, bundle] of bundlesToDelete.entries()) {
      await deleteBundle(bundle.sys.id, index, bundlesToDelete.length);
    }
  } catch (e) {
    throwError(e, 'Something went wrong deleting the bundles');
  }
}

module.exports = {
  cleanUpBundles,
};
