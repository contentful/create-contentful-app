# In development

This library is still in development and should not be used in production.

# React Toolkit for Contentful Apps

This package consists of helpers and hooks to create a Contentful app with React.

This library can be used in apps created by [`create-contentful-app`](https://www.npmjs.com/package/create-contentful-app), but can also be used with any other React app using Contentful's [App SDK](https://www.npmjs.com/package/@contentful/app-sdk).

## Installation

```shell
npm install @contentful/react-apps-toolkit
# or
yarn add @contentful/react-apps-toolkit
```

## Available features

The following hooks and utilities are exported from the package: Nothing

#### SDKProvider

Wrapper component, which makes the Apps SDK available to children via React Context. To use any of the hooks contained in this package, an application must be wrapped in the SDK provider, as all hooks depend on the Apps SDK.

#### useCMAClient

Returns an initialized client for the Contentful Management API, which can immediately be used to communicate with the rest of your Contentful space. [Contentful Management API docs](https://www.contentful.com/developers/docs/references/content-management-api/).

### Resources

- [Create Contentful App](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/)
