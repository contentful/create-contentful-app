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

The following hooks and utilities are exported from the package:

### `useSDK`

This hook returns the appSDK. You can inject it anywhere in your Contentful app.

The only requirement for using it is that the component that uses it is wrapped within the `SDKProvider`, which ideally should be
located in the core of your application (e.g. `index.tsx`). If it is not, the hook will throw an error.

Here is an example of how you can use it:

```tsx
function App() {
  const sdk = useSDK<FieldExtensionSDK>();

  return <>App Id: {sdk.ids.app}</>
}

```


### Resources

- [Create Contentful App](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/)
