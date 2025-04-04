import Path from 'node:path';
import fs from 'node:fs';
import chalk from 'chalk';
import { UploadSettings } from '../types';

const ACCEPTED_ENTRY_FILES = ['index.html'];
const getEntryFile = (files: string[]) => files.find((file) => ACCEPTED_ENTRY_FILES.includes(file));

const ABSOLUTE_PATH_REG_EXP = /(src|href)="\/([^/])([^"]*)+"/g;

const fileContainsAbsolutePath = (fileContent: string) => {
  return [...fileContent.matchAll(ABSOLUTE_PATH_REG_EXP)].length > 0;
};

export const validateBundle = (
  path: string,
  { functions }: Pick<UploadSettings, 'functions'>
) => {
  const buildFolder = Path.join('.', path);
  const files = fs.readdirSync(buildFolder, { recursive: true, encoding: 'utf-8' });
  const entry = getEntryFile(files);

  if (!entry && !functions) {
    throw new Error(
      'Ensure your bundle includes a valid index.html file in its root folder, or a valid Contentful Function entrypoint (defined in your contentful-app-manifest.json file).'
    );
  }

  if (entry) {
    const entryFile = fs.readFileSync(Path.join(buildFolder, entry), { encoding: 'utf8' });

    if (fileContainsAbsolutePath(entryFile)) {
      console.log('----------------------------');
      console.warn(
        `${chalk.red(
          'Warning:'
        )} This bundle uses absolute paths. Please use relative paths instead for correct rendering. See more details here https://www.contentful.com/developers/docs/extensibility/app-framework/app-bundle/#limitations`
      );
      console.log('----------------------------');
    }
  }

  if (functions) {
    const posixFormattedFiles = new Set(files.map((file) => file.replace(/\\/g, '/')));
    const functionWithoutEntryFile = functions.find(({ path }) => !posixFormattedFiles.has(path));
    if (functionWithoutEntryFile) {
      throw new Error(
        `Function "${functionWithoutEntryFile.id}" is missing its entry file at "${Path.join(
          buildFolder,
          functionWithoutEntryFile.path
        )}".`
      );
    }
  }
};
