import fetch from 'node-fetch';
import { HTTPResponseError } from './types';
import chalk from 'chalk';

interface ContentResponse {
  type: string;
  name: string;
}

export async function getGithubFolderNames(version : string, isExample = true): Promise<string[]> {
  const CONTENTFUL_APPS_EXAMPLE_FOLDER =
    `https://api.github.com/repos/contentful/create-contentful-app-examples/contents/v${version}/examples`;
  const CONTENTFUL_APPS_TEMPLATE_FOLDER =
    `https://api.github.com/repos/contentful/create-contentful-app-examples/contents/v${version}/templates`;
  try {
    const response = isExample ? await fetch(CONTENTFUL_APPS_EXAMPLE_FOLDER) : await fetch(CONTENTFUL_APPS_TEMPLATE_FOLDER);
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
