const fs = require('fs');
const { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } = fs;

const buildActions = () => {
  const buildFolderExists = existsSync('build');

  if (!buildFolderExists) {
    mkdirSync('build');
  }

  const actionsFiles = readdirSync('actions', {
    encoding: 'utf-8',
  });

  const actions = actionsFiles.map((fileName) => {
    return readFileSync(`actions/${fileName}`, {
      encoding: 'utf-8',
    }).toString();
  });

  mkdirSync('build/actions');

  actionsFiles.map((fileName, index) => {
    return writeFileSync(`build/actions/${fileName}`, actions[index]);
  });
};

buildActions();
