const fs = require('fs-extra');
const path = require('path');

const { PACKAGES, PACKAGES_ROOT } = require('./constants');

for (const package of PACKAGES) {
  fs.rmSync(path.join(PACKAGES_ROOT, package))
}