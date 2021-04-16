const proxyquire = require('proxyquire');
const { DOTENV_FILE } = require('../constants');
const assert = require('assert');

const mockFs = () => {
  let data = {};

  return {
    promises: {
      async access(name){
        if (data[name]) {
          return undefined;
        }
        throw new Error();
      },
      async writeFile(name, fileData, opts = {}){
        if (opts.flag === 'a') {
          data[name] = `${data[name] || ''}${fileData}`;
        } else {
          data[name] = fileData
        }
      },
      async readFile(name){ return data[name] },
    },
    constants: {
      F_OK: true
    },
    resetData() {
      data = {}
    },
  };
}
const mockedFs = mockFs();
const { cacheEnvVars } = proxyquire('./index', {'fs': mockedFs});

describe('Caching environment variables', () => {

  beforeEach(() => {
    mockedFs.resetData();
  })

  it('should create .env file if its missing', async () => {
    await cacheEnvVars({'CONTENTFUL_TOKEN': 'test_value'});

    const fileExists = await mockedFs.promises.access(DOTENV_FILE, mockedFs.constants.F_OK) === undefined;
    assert.ok(fileExists);
  })

  it('should replace old variable in .env file if it exists', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id\n
CONTENTFUL_TOKEN=old_value`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
CONTENTFUL_TOKEN=new_value`;

    await mockedFs.promises.writeFile(DOTENV_FILE, envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value'});
    const fileData = await mockedFs.promises.readFile(DOTENV_FILE, {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })

  it('should add variable in .env file if variable is missing', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
CONTENTFUL_TOKEN=new_value_2`;

    await mockedFs.promises.writeFile(DOTENV_FILE, envData, {encoding: 'utf-8'});

    await cacheEnvVars({'CONTENTFUL_TOKEN': 'new_value_2'});
    const fileData = await mockedFs.promises.readFile(DOTENV_FILE, {encoding: 'utf-8'});
    assert.strictEqual(fileData, expectedData);
  })
});
