import { rename } from 'fs/promises';
import { resolve, join } from 'path';
import { CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES } from './constants';
import degit from 'degit';
import { highlight } from './logger';
import { exists, mergeJsonIntoFile } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';

const addBuildCommand = getAddBuildCommandFn({
  name: 'build:delivery-functions',
  command: 'node build-delivery-functions.js',
});

export async function cloneDeliveryFunction(destination: string, templateIsJavascript: boolean) {
  try {
    console.log(highlight('---- Cloning hosted delivery function.'));
    // Clone the delivery function template to the created directory under the folder 'actions'
    const templateSource = join(
      'contentful/apps/examples/hosted-delivery-function-templates',
      templateIsJavascript ? 'javascript' : 'typescript',
    );

    const deliveryFunctionDirectoryPath = resolve(`${destination}/delivery-functions`);

    const d = degit(templateSource, { mode: 'tar', cache: false });
    await d.clone(deliveryFunctionDirectoryPath);

    // merge the manifest from the template folder to the root folder
    const writeAppManifest = mergeJsonIntoFile({
      source: `${deliveryFunctionDirectoryPath}/${CONTENTFUL_APP_MANIFEST}`,
      destination: `${destination}/${CONTENTFUL_APP_MANIFEST}`,
    });

    // move the build file from the actions folder to the root folder
    const copyBuildFile = rename(
      `${deliveryFunctionDirectoryPath}/build-delivery-functions.js`,
      `${destination}/build-delivery-functions.js`,
    );

    // modify package.json build commands
    const packageJsonLocation = resolve(`${destination}/package.json`);
    const packageJsonExists = await exists(packageJsonLocation);

    if (!packageJsonExists) {
      console.error(
        `Failed to add delivery function build commands: ${packageJsonLocation} does not exist.`,
      );
      return;
    }

    const writeBuildCommand = mergeJsonIntoFile({
      source: `${deliveryFunctionDirectoryPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });

    await Promise.all([writeAppManifest, copyBuildFile, writeBuildCommand]);

    await d.remove(deliveryFunctionDirectoryPath, destination, { action: "remove", files: IGNORED_CLONED_FILES.map(fileName => `${deliveryFunctionDirectoryPath}/${fileName}`) });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
