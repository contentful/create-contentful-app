import dotenv from 'dotenv';
import fs from 'fs';
import { EOL } from 'os';
import ignore  from 'ignore';
import chalk from 'chalk';
import { DOTENV_FILE } from '../constants';

const ig = ignore();

const fsPromises = fs.promises;
const fsConstants = fs.constants;

// Always export set env vars by default
dotenv.config();

async function removeOldEnv(envKey: string) {
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
    if (!ig.ignores(DOTENV_FILE)) {
      ig.add(DOTENV_FILE);
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

export async function cacheEnvVars(envObj: Record<string, string>) {
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
  } catch(err: any) {
    console.log(`
      ${chalk.red('Couldn\'t save environment variables locally.')}
      ${err.message}
    `)
  }
}
