export const CREATE_APP_DEFINITION_GUIDE_URL =
  'https://ctfl.io/app-tutorial#embed-your-app-in-the-contentful-web-app';
export const REPO_URL = 'https://github.com/contentful/create-contentful-app-examples/tree/main';
// These are the examples that are listed as templates instead of examples
// OR should otherwise not be included in the list of examples displayed in the interactive mode
export const IGNORED_EXAMPLE_FOLDERS = [
  'javascript',
  'typescript',
  'vue',
  'vite-react',
  'nextjs',
  'hosted-app-action-templates',
  'function-templates',
] as const;
interface GithubPathFunction {
  (version?: string): string;
}

export const examples_path: GithubPathFunction = function (version = CURRENT_VERSION) {
  return `contentful/create-contentful-app-examples/v${version}/examples/`;
};

export const templates_path: GithubPathFunction = function (version = CURRENT_VERSION) {
  return `contentful/create-contentful-app-examples/v${version}/templates/`;
}

export const CONTENTFUL_APP_MANIFEST = 'contentful-app-manifest.json';
export const IGNORED_CLONED_FILES = [CONTENTFUL_APP_MANIFEST, `package.json`];

export const VERSION_1 = "1"
export const VERSION_2 = "2"
export const ALL_VERSIONS = [VERSION_1, VERSION_2] // add here if more versions are added

export const CURRENT_VERSION = VERSION_1 // what is currently being used
export const LEGACY_VERSION = VERSION_1 // the last version that was used
export const NEWEST_VERSION = VERSION_2 // the most recent version (not always current version)
export const NEXT_VERSION = VERSION_2 // the next version that will be used (if current < newest)
