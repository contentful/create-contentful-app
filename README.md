# Create Contentful App

This repository includes multiple npm packages to improve the development experience when writing [Contentful Apps](https://www.contentful.com/developers/docs/extensibility/app-framework/).

### Packages

### `create-contentful-app`

A CLI to easily bootstrap Contentful apps

[More information](packages/contentful--create-contentful-app/README.md)

### `@contentful/app-scripts`

A CLI to perform recurrent operations for Contentful's App Framework.

[More information](packages/contentful--app-scripts/README.md)

### `@contentful/react-apps-toolkit`

Toolkit for building a Contentful app in React.

[More information](packages/contentful--react-apps-toolkit/README.md)

## Development

### Publishing

A new package version is automatically published to npm upon merging on the mainline branch.

To manually publish the package, run `npm run publish`.

#### Canary releases

This package has two main development streams: `latest` and `canary`. Canary releases are labeled as `${CANDIDATE_VERSION}-alpha.${BUILD_NUMBER}` in npm.

Changes on the `canary` branch are automatically published. However, you can still manually make a canary release using `npm run publish:canary`.

#### Stability

The default and stable releases are always published under the `latest` tag (as per npm convention).
The release under the `canary` tag is to be considered unstable and potentially breaking.
You should not rely on it in production.

#### Local testing of an examples in the apps repo
When creating or editing an example in the apps repo on a branch other than main, follow these steps to use that branch as a source for the CCA CLI:

- Fetching Examples from the apps Branch
- Cloning Examples from the apps Branch using tiged
- Building the create-contentful-app package
- Linking the create-contentful-app package
- Running the create-contentful-app interactively

##### Fetching Examples from the apps Branch

In the packages/contentful--create-contentful-app/src/getGithubFolderNames.ts file change:

``` javascript
export const CONTENTFUL_APPS_EXAMPLE_FOLDER = 'https://api.github.com/repos/contentful/apps/contents/examples';
```
TO 
``` javascript
export const CONTENTFUL_APPS_EXAMPLE_FOLDER = 'https://api.github.com/repos/contentful/apps/contents/examples?ref=<branchname>';
``` 
Where <branchname> is the branch with the example under development


##### Cloning Examples from the apps Branch using tiged

In the packages/contentful--create-contentful-app/template.ts file change:

``` javascript
const d = tiged(source, { mode: 'tar', disableCache: true });
```
TO 
``` javascript
const d = tiged(`${source}#<branchname>`, { mode: 'tar', disableCache: true });
```
Where <branchname> is the branch with the example under development


##### Building the create-contentful-app package

From root
``` sh
cd packages/contentful--create-contentful-app
npm run build
```


##### Linking the create-contentful-app package
From packages/contentful--create-contentful-app

``` sh
npm link
cd ../create-contentful-app
npm link @contentful/create-contentful-app
```


##### Running the create-contentful-app interactively
From packages/create-contentful-app

``` sh
node index
```
