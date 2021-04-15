const { cacheEnvVars } = require('./index');
const { DOTENV_FILE } = require('../constants');
const fs = require('fs');
const assert = require('assert');

const fsPromises = fs.promises;
const TEMP_DOTENV_FILE = '.env.temp';

describe('Caching environment variables', () => {
  before(async () => {
    try {
      await fsPromises.access(DOTENV_FILE, fs.constants.F_OK);
      await fsPromises.copyFile(DOTENV_FILE, TEMP_DOTENV_FILE);
      await fsPromises.unlink(DOTENV_FILE);
    } catch(_) {
      // ignore if file doesnt exist
    }
  });

  after(async () => {
    try {
      await fsPromises.unlink(DOTENV_FILE)
      await fsPromises.access(TEMP_DOTENV_FILE, fs.constants.F_OK);
      await fsPromises.copyFile(TEMP_DOTENV_FILE, DOTENV_FILE);
      await fsPromises.unlink(TEMP_DOTENV_FILE);
    } catch(_) {
      // ignore if file doesnt exist
    }
  });

  it('should create .env file if its missing', async () => {
    await cacheEnvVars({'CONTENTFUL_TOKEN': 'test_value'});
    const fileExists = (await fsPromises.access(DOTENV_FILE, fs.constants.F_OK)) === undefined;
    assert.ok(fileExists);
  })

  it('should replace old variable in .env file if it exists', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id\n
CONTENTFUL_TOKEN=old_value`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
CONTENTFUL_TOKEN=new_value`;

    await fsPromises.writeFile(DOTENV_FILE, envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value'});
    const fileData = await fsPromises.readFile(DOTENV_FILE, {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })

  it('should add variable in .env file if variable is missing', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
CONTENTFUL_TOKEN=new_value_2`;

    await fsPromises.writeFile(DOTENV_FILE, envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value_2'});
    const fileData = await fsPromises.readFile(DOTENV_FILE, {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })
});
