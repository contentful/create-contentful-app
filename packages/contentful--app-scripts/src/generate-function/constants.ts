export const EXAMPLES_PATH = 'contentful/apps/function-examples/';
export const APP_MANIFEST = 'app-manifest.json';
export const CONTENTFUL_APP_MANIFEST = 'contentful-app-manifest.json';
export const IGNORED_CLONED_FILES = [APP_MANIFEST, `package.json`];
export const REPO_URL = 'https://github.com/contentful/apps/function-examples';

export const ACCEPTED_EXAMPLE_FOLDERS = [
    'appevent-handler',
];

export const ACCEPTED_LANGUAGES = ['javascript', 'typescript'];

export const CONTENTFUL_FUNCTIONS_EXAMPLE_REPO_PATH =
  'https://api.github.com/repos/contentful/apps/contents/function-examples';

export const BANNED_FUNCTION_NAMES = ['example', ''];
  
export const VERSION_1 = '1'
export const VERSION_2 = '2'
export const ALL_VERSIONS = [VERSION_1, VERSION_2] // add here if more versions are added

export const CURRENT_VERSION = VERSION_1 // what is currently being used
export const LEGACY_VERSION = VERSION_1 // the last version that was used
export const NEWEST_VERSION = VERSION_2 // the most recent version (not always current version)
export const NEXT_VERSION = VERSION_2 // the next version that will be used (if current < newest)