export const CREATE_APP_DEFINITION_GUIDE_URL =
  'https://ctfl.io/app-tutorial#embed-your-app-in-the-contentful-web-app';
export const EXAMPLES_REPO_URL = 'https://github.com/contentful/apps/tree/master/examples';
// These are the examples that are listed as templates instead of examples
// OR should otherwise not be included in the list of examples displayed in the interactive mode
export const IGNORED_EXAMPLE_FOLDERS = [
  'javascript',
  'typescript',
  'vue',
  'vite-react',
  'nextjs',
] as const;
export const EXAMPLES_PATH = 'contentful/apps/examples/';
export const CONTENTFUL_APP_MANIFEST = 'contentful-app-manifest.json';
export const IGNORED_CLONED_FILES = [CONTENTFUL_APP_MANIFEST, `package.json`];
