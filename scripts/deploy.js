/*

 Needs to be deployed 3 times because we need:
  - Main  CLI tool (@contentful/create-contentful-app)
  - Parked named to avoid package squatting (create-contentful-app)
  - Actual custom template package in accordance to create-react-app
    - i.e: https://create-react-app.dev/docs/custom-templates/

*/

const fs = require('fs');
const spawn = require('cross-spawn');

const PACKAGES = [
  '@contentful/create-contentful-app',
  'create-contentful-app',
  '@contentful/cra-template-create-contentful-app'
];
const MODULE_MAIN_PATH = `${__dirname}/../`;
const ORIGINAL_PACKAGE_JSON = require(`${MODULE_MAIN_PATH}/package.json`);

function restoreFiles() {
  fs.writeFileSync(
    `${MODULE_MAIN_PATH}/package.json`,
    JSON.stringify(ORIGINAL_PACKAGE_JSON, null, 2)
  );
  spawn.sync('npm', ['i'], { silent: true, cwd: MODULE_MAIN_PATH });
}

if (!process.env.NPM_TOKEN) {
  throw new Error('Missing NPM_TOKEN!');
}

try {
  for (const package of PACKAGES) {
    console.log('');
    console.log('📦 Deploying package:', package);
    const packageJson = { ...ORIGINAL_PACKAGE_JSON, name: package };

    console.log(` > 📝 Updating package.json with name: ${package}...`);
    fs.writeFileSync(`${MODULE_MAIN_PATH}/package.json`, JSON.stringify(packageJson));

    console.log(` > ⚙️  Updating package-lock.json by means of "npm i"...`);
    spawn.sync('npm', ['i'], { silent: true, cwd: MODULE_MAIN_PATH });

    console.log(` > 📚 Publishing ${package} on the registry...`);
    let { error } = spawn.sync('npm', ['publish', '--access', 'public'], {
      stdio: 'inherit',
      cwd: MODULE_MAIN_PATH
    });
    if (error) {
      throw new Error(error);
    }

    console.log(`✅ Successfully published ${package}@${ORIGINAL_PACKAGE_JSON.version}!`);
    console.log();
  }
} catch (err) {
  restoreFiles();
  throw new Error(err);
}

restoreFiles();
