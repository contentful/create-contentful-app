// Needs to be published 3 times because we need:
//  - Main  CLI tool (@contentful/create-contentful-app)
//  - Parked name to avoid package squatting (create-contentful-app)
//  - Actual custom template package in accordance to create-react-app
//    - i.e: https://create-react-app.dev/docs/custom-templates/

const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');

const { PACKAGES, PACKAGES_ROOT, ORIGINAL_PACKAGE_JSON, MODULE_MAIN_PATH } = require('./constants');

try {
  for (const package of PACKAGES) {
    console.log('');
    console.log('📦 Preparing package:', package);

    const packageFolder = path.join(PACKAGES_ROOT, package.replace('/', '--'));

    fs.copySync(MODULE_MAIN_PATH, packageFolder, {
      filter: (src) => !src.includes('node_modules'),
    });

    const packageJson = { ...ORIGINAL_PACKAGE_JSON, name: package };

    console.log(` > 📝 Updating package.json with name: ${package}...`);
    fs.writeFileSync(`${packageFolder}/package.json`, JSON.stringify(packageJson));

    console.log(` > ⚙️ Updating package-lock.json...`);
    spawn.sync('npm', ['i'], { silent: true, cwd: packageFolder });

    console.log(` > 🌳 Committing changes...`);
    spawn.sync('git', ['add', '.'], { silent: true, cwd: packageFolder });
    spawn.sync('git', ['commit', '-m', `"chore: create ${package} folder"`], {
      silent: true,
      cwd: packageFolder,
    });

    console.log(`✅ Successfully prepared ${package}!`);
    console.log('');
  }
} catch (err) {
  throw new Error(err);
}
