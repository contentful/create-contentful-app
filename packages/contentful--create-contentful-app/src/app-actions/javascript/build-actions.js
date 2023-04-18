const fs = require('fs');
const { readdirSync, readFileSync, writeFileSync, mkdirSync } = fs;

const buildActions = () => {
  const actionsFiles = readdirSync('actions', {
    encoding: 'utf-8',
  });

  const actions = actionsFiles.map((fileName) => {
    return readFileSync(`actions/${fileName}`, {
      encoding: 'utf-8',
    }).toString();
  });

  mkdirSync('build/actions', { recursive: true });

  actionsFiles.map((fileName, index) => {
    return writeFileSync(`build/actions/${fileName}`, actions[index]);
  });
};

buildActions();
