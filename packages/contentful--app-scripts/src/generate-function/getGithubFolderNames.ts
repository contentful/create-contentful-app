import { CONTENTFUL_FUNCTIONS_EXAMPLE_REPO_PATH } from './constants';
import axios from 'axios';
import { HTTPResponseError } from './types';
import chalk from 'chalk';

interface ContentResponse {
  type: string;
  name: string;
}

export async function getGithubFolderNames(): Promise<string[]> {
  try {
    const response = await axios.get(CONTENTFUL_FUNCTIONS_EXAMPLE_REPO_PATH);
    const contents = response.data;
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
