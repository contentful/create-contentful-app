const fs = require('fs-extra');
const path = require('path');

const { PACKAGES, PACKAGES_ROOT } = require('./constants');

console.log('🧹 Cleaning up after publishing...');
for (const package of PACKAGES) {
  const packageDir = path.join(PACKAGES_ROOT, package.replace('/', '--'));
  console.log(` > 🗑️ Removing ${package} folder`);
  fs.removeSync(packageDir);
}

console.log(`✅ Successfully cleaned!`);
console.log('');