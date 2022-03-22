# Create Contentful App

This repository includes multiple npm packages to improve the development experience when writing [Contentful Apps](https://www.contentful.com/developers/docs/extensibility/app-framework/).

### Packages

### `create-contentful-app`

A CLI to easily bootstrap Contentful apps

[More information](packages/contentful--create-contentful-app/README.md)

### `@contentful/app-scripts`

A CLI to perform recurrent operations for Contentful's App Framework.

[More information](packages/contentful--app-scripts/README.md)

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
