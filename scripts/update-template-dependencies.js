const fs = require('fs');
const { dependencies, devDependencies } = require('../package.json');
const template = require('../template.json');

const allPackageDependencies = { ...dependencies, ...devDependencies };

const updatedDependencies = Object.entries(template.package.dependencies).reduce(
  (acc, [dependency, currentVersion]) => {
    console.log(dependency, allPackageDependencies[dependency], currentVersion);
    if (allPackageDependencies[dependency] !== undefined) {
      acc[dependency] = allPackageDependencies[dependency];
    } else {
      acc[dependency] = currentVersion;
    }

    return acc;
  },
  {}
);

template.package.dependencies = updatedDependencies;

fs.writeFile('template.json', JSON.stringify(template), err => {
  if (err) {
    console.log(err);
  }
});
