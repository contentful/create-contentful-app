import fetch, { RequestInit } from 'node-fetch';
import { HTTPResponseError } from './types';
import chalk from 'chalk';

interface ContentResponse {
  type: string;
  name: string;
}

export const CONTENTFUL_APPS_EXAMPLE_FOLDER =
  'https://api.github.com/repos/contentful/apps/contents/examples';

export async function getGithubFolderNames(): Promise<string[]> {
  try {
    const options: RequestInit = {};
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      options.headers = {
        Authorization: `Bearer ${githubToken}`,
      };
    }
    const response = await fetch(CONTENTFUL_APPS_EXAMPLE_FOLDER, options);
    if (!response.ok) {
      throw new HTTPResponseError(
        `${chalk.red('Error:')} Failed to fetch Contentful app templates: ${response.status} ${
          response.statusText
        }`
      );
    }
    const contents = await response.json();
    const filteredContents = contents.filter((content: ContentResponse) => content.type === 'dir');
    return filteredContents.map((content: ContentResponse) => content.name);
  } catch (err) {
    if (err instanceof HTTPResponseError) {
      throw err;
    } else {
      throw new Error(`Failed to fetch Contentful app templates: ${err}`);
    }
  }
}
