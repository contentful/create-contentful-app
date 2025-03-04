import { ACCEPTED_TEMPLATE_LANGUAGES, examplePath, templatePath } from './constants';
import axios from 'axios';
import { HTTPResponseError } from './types';

interface ContentResponse {
  type: string;
  name: string;
}

export async function getGithubFolderNames(version: string, isExample : boolean): Promise<string[]> {
  try {
    const response = isExample ? await axios.get(examplePath(version)) : await axios.get(templatePath(version));
    const contents = response.data;
    let filteredContents = contents.filter((content: ContentResponse) => content.type === 'dir');
    filteredContents = filteredContents.map((content: ContentResponse) => content.name);
    
    return filteredContents.filter(
         (template: string) => template.includes('function-')
      );
  } catch (err) {
    if (err instanceof HTTPResponseError) {
      throw err;
    } else {
      throw new Error(`Failed to fetch Contentful app templates: ${err}`);
    }
  }
}

export async function checkIfFolderHasLanguageOptions(version: string, exampleFolder: string): Promise<string[]> {
  try {
    const response = await axios.get(`${examplePath(version)}/${exampleFolder}`);
    const contents = response.data;
    return contents
      .filter((content: ContentResponse) => ACCEPTED_TEMPLATE_LANGUAGES.includes(content.name))
      .map((content: ContentResponse) => content.name);
  } catch (err) {
    if (err instanceof HTTPResponseError) {
      throw err;
    } else {
      throw new Error(`Failed to fetch Contentful app templates: ${err}`);
    }
  }
}