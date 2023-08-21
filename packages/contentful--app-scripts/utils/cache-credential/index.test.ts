import proxyquire from 'proxyquire';
import { DOTENV_FILE, ACCESS_TOKEN_ENV_KEY } from '../constants';
import assert from 'assert';

const mockFs = () => {
  let data = {} as Record<string, string>;

  return {
    promises: {
      async access(name: string) {
        if (data[name]) {
          return undefined;
        }
        throw new Error();
      },
      async writeFile(
        name: string,
        fileData: string,
        opts: { encoding?: string; flag?: string } = {},
      ) {
        if (opts.flag === 'a') {
          data[name] = `${data[name] || ''}${fileData}`;
        } else {
          data[name] = fileData;
        }
      },
      async readFile(name: string) {
        return data[name];
      },
    },
    resetData() {
      data = {};
    },
  };
};
const mockedFs = mockFs();
const { cacheEnvVars } = proxyquire('./index', { fs: mockedFs });

describe('Caching environment variables', () => {
  beforeEach(() => {
    mockedFs.resetData();
  });

  it('should create .env file if its missing', async () => {
    await cacheEnvVars({ [ACCESS_TOKEN_ENV_KEY]: 'test_value' });

    const fileExists = (await mockedFs.promises.access(DOTENV_FILE)) === undefined;
    assert.ok(fileExists);
  });

  it('should replace old variable in .env file if it exists', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id\n
${ACCESS_TOKEN_ENV_KEY}=old_value`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
${ACCESS_TOKEN_ENV_KEY}=new_value`;

    await mockedFs.promises.writeFile(DOTENV_FILE, envData);

    await cacheEnvVars({ [ACCESS_TOKEN_ENV_KEY]: 'new_value' });
    const fileData = await mockedFs.promises.readFile(DOTENV_FILE);
    assert.strictEqual(fileData, expectedData);
  });

  it('should add variable in .env file if variable is missing', async () => {
    const envData = `CONTENTFUL_APP_DEF_ID=some_app_def_id`;
    const expectedData = `CONTENTFUL_APP_DEF_ID=some_app_def_id
${ACCESS_TOKEN_ENV_KEY}=new_value_2`;

    await mockedFs.promises.writeFile(DOTENV_FILE, envData);

    await cacheEnvVars({ [ACCESS_TOKEN_ENV_KEY]: 'new_value_2' });
    const fileData = await mockedFs.promises.readFile(DOTENV_FILE);
    assert.strictEqual(fileData, expectedData);
  });
});
