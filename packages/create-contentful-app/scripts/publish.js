//@ts-check
const spawn = require('cross-spawn');
const path = require('path')
const { PACKAGES, PACKAGES_ROOT, ORIGINAL_PACKAGE_JSON } = require("./constants");

try {
  for (const package of PACKAGES.concat(ORIGINAL_PACKAGE_JSON.name)) {
    console.log('');
    console.log('📦 Publishing package:', package);

    const packageFolder = path.join(PACKAGES_ROOT, package);

    console.log(` > 📚 Publishing ${package} on the registry...`);
    const { status } = spawn.sync('npm', ['publish', '--access', 'public', '--dry-run'], {
      stdio: 'inherit',
      cwd: packageFolder
    });
    if (status !== 0) {
      throw new Error(
        'Failed to publish. Please check the output above and make sure you have the correct credentials, working network and npm is not down.'
      );
    }

    console.log(`✅ Successfully prepared ${package}!`);
    console.log('');
  }
} catch (err) {
  throw new Error(err);
}