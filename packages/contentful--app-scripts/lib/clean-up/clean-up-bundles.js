const chalk = require('chalk');
const ora = require('ora');
const Bottleneck = require('bottleneck');
const {
  MAX_CONCURRENT_DELETION_CALLS,
  DEFAULT_BUNDLES_TO_FETCH,
} = require('../../utils/constants');
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
  console.log(`${chalk.green('Done:')} ${index + 1}/${maxIndex} bundles deleted successfully`);
}

const scheduleBundleDeletion = async (bundlesToDelete, client, settings) => {
  const limiter = new Bottleneck({ maxConcurrent: MAX_CONCURRENT_DELETION_CALLS });
  await Promise.all(
    bundlesToDelete.map((bundle, index) =>
      limiter.schedule(() =>
        deleteBundle(bundle.sys.id, index, bundlesToDelete.length, client, settings)
      )
    )
  );
};

async function cleanUpBundles(settings) {
  let bundlesToDelete, definition;

  const client = createClient(
    {
      host: settings.host,
      accessToken: settings.accessToken,
    },
    { type: 'plain' }
  );

  const fetchAppBundles = async (limit = DEFAULT_BUNDLES_TO_FETCH, skip = 0) => {
    return await client.appBundle.getMany({
      appDefinitionId: settings.definition.value,
      organizationId: settings.organization.value,
      query: {
        limit,
        skip,
      },
    });
  };

  const getAppBundles = async (requestedAmount = DEFAULT_BUNDLES_TO_FETCH) => {
    if (requestedAmount < 1) {
      throw new Error('Requested amount of bundles to fetch must be greater than 0');
    }
    const getBundles = async (limit, skip) => {
      const result = await fetchAppBundles(limit, skip);
      const currLength = skip + result.items.length;

      if (result.total > currLength) {
        return [...result.items, ...(await getBundles(result.items.length, currLength))];
      } else {
        return result.items;
      }
    };

    const all = await getBundles(DEFAULT_BUNDLES_TO_FETCH, 0);
    return all.reverse().slice(0, requestedAmount);
  };

  const getAppBundleCount = async () => {
    return await fetchAppBundles(1, 0);
  };

  const bundlesSpinner = ora(`Fetching all bundles...`).start();
  try {
    const { total } = await getAppBundleCount();
    const amountToDelete = total - settings.keep;
    if (amountToDelete < 1) {
      console.log(`${chalk.yellow('Warning:')} There is nothing to delete`);
      bundlesSpinner.stop();
      return;
    }
    bundlesToDelete = await getAppBundles(amountToDelete);
    definition = await client.appDefinition.get({
      appDefinitionId: settings.definition.value,
      organizationId: settings.organization.value,
    });
  } catch (e) {
    throwError(e, 'Something went wrong fetching the bundles');
  }

  bundlesSpinner.stop();

  if (definition.bundle) {
    bundlesToDelete = bundlesToDelete.filter(
      (bundle) => bundle.sys.id !== definition.bundle.sys.id
    );
  }

  if (bundlesToDelete.length < 1) {
    console.log(`${chalk.yellow('Warning:')} There is nothing to delete`);
  }

  console.log(`

${chalk.cyan('Info:')} ${bundlesToDelete.length} bundle${
    bundlesToDelete.length > 1 ? 's' : ''
  } will be deleted

  `);

  try {
    await scheduleBundleDeletion(bundlesToDelete, client, settings);
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
