const { cacheEnvVars } = require('./index');
const fs = require('fs');
const assert = require('assert');

const fsPromises = fs.promises;

describe('Caching environemnt variables', () => {
  before(async () => {
    try {
      await fsPromises.access('.env', fs.constants.F_OK);
      await fsPromises.copyFile('.env', '.env.temp');
      await fsPromises.unlink('.env');
      console.log(`
      
        RUNNING BEFORE
      
      `)
    } catch(_) {
      // ignore if file doesnt exist
    }
  });

  after(async () => {
    try {
      await fsPromises.unlink('.env')
      await fsPromises.access('.env.temp', fs.constants.F_OK);
      await fsPromises.copyFile('.env.temp', '.env');
      await fsPromises.unlink('.env.temp');
      console.log(`
      
        RUNNING AFTER
      
      `)
    } catch(_) {
      // ignore if file doesnt exist
    }
  });

  it('should create .env file if its missing', async () => {
    await cacheEnvVars({'CONTENTFUL_TOKEN': 'test_value'});
    const fileExists = (await fsPromises.access('.env', fs.constants.F_OK)) === undefined;
    assert.ok(fileExists);
  })

  it('should replace old variable in .env file if it exists', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id\n
CONTENTFUL_TOKEN=old_value`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id\n
CONTENTFUL_TOKEN=new_value`;

    await fsPromises.writeFile('.env', envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value'});
    const fileData = await fsPromises.readFile('.env', {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })

  it('should add variable in .env file if variable is missing', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
CONTENTFUL_TOKEN=new_value_2`;

    await fsPromises.writeFile('.env', envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value_2'});
    const fileData = await fsPromises.readFile('.env', {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })
});
