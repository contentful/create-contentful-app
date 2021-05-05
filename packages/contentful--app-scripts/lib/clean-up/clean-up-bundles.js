const chalk = require('chalk');
const ora = require('ora');
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
  const client = createClient({ accessToken: settings.accessToken }, { type: 'plain' });
  const bundles = await client.appBundle.getMany({
    appDefinitionId: settings.definition.value,
    organizationId: settings.organization.value,
  });

  const bundlesToDelete = bundles.items.slice(settings.keep);

  if (bundlesToDelete.length < 1) {
    console.log(`${chalk.yellow('Warning:')} There is nothing to delete`);
  }

  console.log(`${chalk.cyan('Info:')} ${bundlesToDelete.length} bundles will be deleted`);

  for (const [index, bundle] of bundlesToDelete.entries()) {
    await deleteBundle(bundle.sys.id, index, bundlesToDelete.length);
  }
}

module.exports = {
  cleanUpBundles,
};
