const dotenv = require('dotenv');
const fs = require('fs');
const { EOL } = require('os');
const chalk = require('chalk');


const fsPromises = fs.promises;
const fsConstants = fs.constants;
const envFileName = '.env';

// Always export set env vars by default
dotenv.config();

async function removeOldEnv(envKey) {
  const envFileData = await fsPromises.readFile(envFileName, {encoding: 'utf-8',});
  const envVarRegex = new RegExp(`(${EOL}|^)${envKey}=.+(${EOL})?`); // find line with envVar defined

  if (envVarRegex.test(envFileData)) {
    await fsPromises.writeFile(envFileName, envFileData.replace(envVarRegex, ''), {
      encoding: 'utf-8'
    });
  }
}

async function addEnvFileToGitIgnore() {
  try {
    const gitIgnoreFile = '.gitignore';
    await fsPromises.access(gitIgnoreFile, fs.constants.F_OK);
    const gitIgnoreFileData = await fsPromises.readFile(gitIgnoreFile, {encoding: 'utf-8'});
    const envFileNameRegex = new RegExp(`(^|${EOL})?${envFileName}*?${EOL}?`);

    if (!envFileNameRegex.test(gitIgnoreFileData)) {
      await fsPromises.writeFile(gitIgnoreFile, `${EOL}${envFileName}${EOL}`, {
        encoding: 'utf-8',
        flag: 'a'
      });
    }

  } catch(err) {
    console.log(`${
      chalk.yellow('Warning: could not add .env file to .gitignore. Please don\'t forget to add it manually')
    }`)
  }
}

async function checkFileEnvExists() {
  let envFileExists = false;
  try {
    await fsPromises.access(envFileName, fsConstants.F_OK);
    envFileExists = true;
  } catch(_) {
    envFileExists = false;
  }
  return envFileExists;
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

    await fsPromises.writeFile(envFileName, envVars, {
      encoding: 'utf-8',
      flag: 'a'
    });

    await addEnvFileToGitIgnore();

    console.log(`
      Saved new Environment variable(s) locally: ${ chalk.cyan(Object.keys(envObj).join(", ")) }
    `)
  } catch(err) {
    console.log(`
      ${chalk.red('Couldn\'t save environment variabels locally')}
      ${err.message}
    `)
  }
}

module.exports = {
  cacheEnvVars,
}
