# Create Contentful App

This project makes it easy to bootstrap [Contentful Apps](https://www.contentful.com/developers/docs/extensibility/app-framework/) with [React](https://reactjs.org/) and [Forma 36](https://f36.contentful.com/) (Contentful's design system).

## Requirements

Node.js, NPM latest LTS

## Quick Overview

To start developing your app:

```
npx @contentful/create-contentful-app my-first-app
cd my-first-app
npm start
```

[Read more](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/) and check out the video on how to use the CLI.

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
