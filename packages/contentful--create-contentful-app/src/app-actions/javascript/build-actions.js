const fs = require('fs');
const { readdirSync, readFileSync, writeFileSync, mkdirSync } = fs;

const buildActions = () => {
  mkdirSync('build/actions', { recursive: true });

  const actionsFiles = readdirSync('actions', {
    encoding: 'utf-8',
  });

  actionsFiles.forEach((fileName) => {
    const action = readFileSync(`actions/${fileName}`, {
      encoding: 'utf-8',
    }).toString();

    writeFileSync(`build/actions/${fileName}`, action);
  });
};

buildActions();
