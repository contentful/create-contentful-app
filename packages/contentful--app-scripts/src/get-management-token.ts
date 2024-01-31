/* eslint-disable no-console, no-process-exit */

import chalk from 'chalk';
import open from 'open';
import inquirer from 'inquirer';
import { cacheEnvVars } from './cache-credential';
import { createClient } from 'contentful-management';
import { ACCESS_TOKEN_ENV_KEY } from './constants';

const checkTokenValidity = async (accessToken = '', host?: string) => {
  try {
    const client = createClient({ accessToken, host });
    await client.getCurrentUser();
    return true;
  } catch (err) {
    return false;
  }
};

export async function getManagementToken(host?: string) {
  const redirectUrl = 'https://www.contentful.com/developers/cli-oauth-page/';
  const CLIENT_ID = '9f86a1d54f3d6f85c159468f5919d6e5d27716b3ed68fd01bd534e3dea2df864';
  const oauthHost = host?.includes('.eu.contentful.com')
    ? 'be.eu.contentful.com'
    : 'be.contentful.com';
  const oauthUrl = `https://${oauthHost}/oauth/authorize?response_type=token&scope=content_management_manage&client_id=${CLIENT_ID}&&redirect_uri=${encodeURIComponent(
    redirectUrl
  )}`;

  const cachedAccessToken = process.env[ACCESS_TOKEN_ENV_KEY];
  const cachedTokenValid = await checkTokenValidity(cachedAccessToken, host);

  if (cachedTokenValid) {
    return cachedAccessToken as string;
  }

  try {
    open(oauthUrl);
  } catch (err: any) {
    console.log(`${chalk.red('Error:')} Failed to open browser`);
    console.log(err.message);
    throw err;
  }

  const { mgmtToken } = await inquirer.prompt<{ mgmtToken: string }>([
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
