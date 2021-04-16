const dotenv = require('dotenv');
const fs = require('fs');
const { EOL } = require('os');
const ignore = require('ignore')();
const chalk = require('chalk');
const { DOTENV_FILE } = require('../constants')


const fsPromises = fs.promises;
const fsConstants = fs.constants;

// Always export set env vars by default
dotenv.config();

async function removeOldEnv(envKey) {
  const envFileData = await fsPromises.readFile(DOTENV_FILE, {encoding: 'utf-8',});
  const envVarsData = dotenv.parse(envFileData);

  if (envVarsData[envKey]) {
    delete envVarsData[envKey];
    const stringifiedEnvData = Object.keys(envVarsData).map(key => `${key}=${envVarsData[key]}`).join(EOL);
    await fsPromises.writeFile(DOTENV_FILE, stringifiedEnvData, {
      encoding: 'utf-8'
    });
  }
}

function addEnvFileToGitIgnore() {
  try {
    if (!ignore.ignores(DOTENV_FILE)) {
      ignore.add(DOTENV_FILE);
    }
  } catch(err) {
    console.log(`${
      chalk.yellow('Warning: could not add .env file to .gitignore. Please don\'t forget to add it manually.')
    }`)
  }
}

async function checkFileEnvExists() {
  try {
    await fsPromises.access(DOTENV_FILE, fsConstants.F_OK);
    return true
  } catch(_) {
    return false
  }
}

async function cacheEnvVars(envObj) {
  try {
    let envVars = '';
    let envFileExists = await checkFileEnvExists();

    for (const [key, val] of Object.entries(envObj)) {
      if (envFileExists) {
        await removeOldEnv(key);
      }
      envVars += `${EOL}${key}=${val}`
    }

    await fsPromises.writeFile(DOTENV_FILE, envVars, {
      encoding: 'utf-8',
      flag: 'a'
    });

    addEnvFileToGitIgnore();

    console.log(`
      Saved new Environment variable(s) locally: ${ chalk.cyan(Object.keys(envObj).join(", ")) }.
    `)
  } catch(err) {
    console.log(`
      ${chalk.red('Couldn\'t save environment variables locally.')}
      ${err.message}
    `)
  }
}

module.exports = {
  cacheEnvVars,
}
