export const EXAMPLES_PATH = 'contentful/apps/function-examples/';
export const APP_MANIFEST = 'app-manifest.json';
export const CONTENTFUL_APP_MANIFEST = 'contentful-app-manifest.json';
export const IGNORED_CLONED_FILES = [APP_MANIFEST, `package.json`];
export const REPO_URL = 'https://github.com/contentful/create-contentful-app-examples';

export const ACCEPTED_TEMPLATE_LANGUAGES = ['javascript', 'typescript'];

export function examplePath(version = CURRENT_VERSION) {
  return  `https://api.github.com/repos/contentful/create-contentful-app-examples/contents/v${version}/examples`;
}

export function templatePath(version = CURRENT_VERSION) {
  return `https://api.github.com/repos/contentful/create-contentful-app-examples/contents/v${version}/templates`;
}

export const BANNED_FUNCTION_NAMES = ['example', ''];
  
export const VERSION_1 = '1'
export const VERSION_2 = '2'
export const ALL_VERSIONS = [VERSION_1, VERSION_2] // add here if more versions are added

export const CURRENT_VERSION = VERSION_1 // what is currently being used
export const LEGACY_VERSION = VERSION_1 // the last version that was used
export const NEWEST_VERSION = VERSION_2 // the most recent version (not always current version)
export const NEXT_VERSION = VERSION_2 // the next version that will be used (if current < newest)