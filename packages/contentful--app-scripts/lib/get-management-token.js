/* eslint-disable no-console, no-process-exit */

const chalk = require('chalk');
const open = require('open');
const inquirer = require('inquirer');
const { cacheEnvVars } = require('../utils/cache-credential');
const { createClient } = require('contentful-management');
const { ACCESS_TOKEN_ENV_KEY } = require('../utils/constants');

const checkTokenValidity = async (accessToken, host) => {
  try {
    const client = createClient({ accessToken, host });
    await client.getCurrentUser();
    return true;
  } catch (err) {
    return false;
  }
};

async function getManagementToken(host) {
  const redirectUrl = 'https://www.contentful.com/developers/cli-oauth-page/';
  const CLIENT_ID = '9f86a1d54f3d6f85c159468f5919d6e5d27716b3ed68fd01bd534e3dea2df864';
  const oauthUrl = `https://be.contentful.com/oauth/authorize?response_type=token&scope=content_management_manage&client_id=${CLIENT_ID}&&redirect_uri=${encodeURIComponent(
    redirectUrl
  )}`;

  const cachedAccessToken = process.env[ACCESS_TOKEN_ENV_KEY];
  const cachedTokenValid = await checkTokenValidity(cachedAccessToken, host);

  if (cachedTokenValid) {
    return cachedAccessToken;
  }

  try {
    open(oauthUrl);
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to open browser`);
    console.log(err.message);
    throw err;
  }

  const { mgmtToken } = await inquirer.prompt([
    {
      name: 'mgmtToken',
      message: 'Please paste your access token:',
      type: 'password',
      validate(answer) {
        if (!answer) {
          return `${chalk.red('Error:')} Failed to login into Contentful.`;
        }

        return true;
      },
    },
  ]);

  await cacheEnvVars({ [ACCESS_TOKEN_ENV_KEY]: mgmtToken });

  return mgmtToken;
}

module.exports = {
  getManagementToken,
};
