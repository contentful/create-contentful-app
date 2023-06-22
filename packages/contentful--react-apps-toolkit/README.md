# React Toolkit for Contentful Apps

React Hooks for the App Framework offer a simple way to bring frequently needed functionality into your react based [Contentful apps](/developers/docs/extensibility/app-framework/).

They can be used in apps created with [`create-contentful-app`](https://www.npmjs.com/package/@contentful/create-contentful-app), as well as any other React app using Contentful's [App SDK](https://www.npmjs.com/package/@contentful/app-sdk).

## Installation

```shell
npm install @contentful/react-apps-toolkit
# or
yarn add @contentful/react-apps-toolkit
```

## Available features

The following hooks and utilities are exported from the package:

### SDKProvider

The `SDKProvider` is a wrapper component, which automatically makes the Contentful [App SDK](https://www.npmjs.com/package/@contentful/app-sdk) available to any child components using React Context. To use any of the hooks contained in this package, they must be wrapped in the `<SDKProvider>`, because all of the hooks depend on the App SDK.

Usage:

```tsx
import { SDKProvider, useSDK } from '@contentful/react-apps-toolkit';

function ChildComponentUsingHook() {
  const sdk = useSDK<FieldExtensionSDK>();

  return <>App Id: {sdk.ids.app}</>;
}

function App() {
  return (
    <SDKProvider>
      <ChildComponentUsingHook />
    </SDKProvider>
  );
}
```

### useSDK

`useSDK` returns an instance of the Contentful [App SDK](https://www.npmjs.com/package/@contentful/app-sdk).

It must be wrapped it within the `SDKProvider`, otherwise, it will throw an error.

Usage:

```tsx
import { SDKProvider, useSDK } from '@contentful/react-apps-toolkit';

function ComponentUsingSDK() {
  const sdk = useSDK<FieldExtensionSDK>();

  return <>App Id: {sdk.ids.app}</>;
}

function App() {
  return (
    <SDKProvider>
      <ChildComponentUsingSDK />
    </SDKProvider>
  );
}
```

### useCMA
> :warning: **DEPRECATED** If you are using App SDK v4.20 or greater use `sdk.cma` instead.

`useCMA` returns an initialized [client for the Contentful Management API](https://www.npmjs.com/package/contentful-management). This can be used immediately to communicate with the environment the app is rendered in. [Contentful Management API docs](/developers/docs/references/content-management-api/).

**Note**: The CMA client instance returned by this hook is automatically scoped to the contentful space and environment in which it is called.

Usage:

```tsx
import { SDKProvider, useCMA } from '@contentful/react-apps-toolkit';

function ComponentUsingCMA() {
  const cma = useCMA();
  const [entries, setEntries] = useState();

  useEffect(() => {
    cma.entry.getMany().then((data) => setEntries(data.items));
  }, [cma]);

  return <>{entries?.length}</>;
}

function App() {
  return (
    <SDKProvider>
      <ComponentUsingCMA />
    </SDKProvider>
  );
}
```

### useFieldValue

`useFieldValue` provides the current value, and a setter function for updating the current value, of a given field in Contentful. If used in the [field location](/developers/docs/extensibility/app-framework/locations/#entry-field), it will initialize using the current field id by default.

If used in the [entry sidebar location](/developers/docs/extensibility/app-framework/locations/#entry-sidebar), or the [entry editor location](/developers/docs/extensibility/app-framework/locations/#entry-editor), it must be passed a field ID to initialize.

`useFieldValue` also optionally accepts a locale, if the field has multiple locales. If no locale is passed, it will use the environment's default locale.

Usage:

```tsx
import { SDKProvider, useFieldValue } from '@contentful/react-apps-toolkit';

function ComponentUsingFieldValue() {
  const [value, setValue] = useFieldValue('slug', 'en-US');

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

function App() {
  return (
    <SDKProvider>
      <ComponentUsingFieldValue />
    </SDKProvider>
  );
}
```

### useAutoResizer

`useAutoResizer` listens for DOM changes and updates the app's height when the size changes.

Usage:

```tsx
import { SDKProvider, useAutoResizer } from '@contentful/react-apps-toolkit';

function ComponentUsingAutoResizer() {
  useAutoResizer();

  return <div>Component will be auto-resized</div>;
}

function App() {
  return (
    <SDKProvider>
      <ComponentUsingAutoResizer />
    </SDKProvider>
  );
}
```

### Resources

- [create-contentful-app](https://www.npmjs.com/package/create-contentful-app): A starter that makes it easy to bootstrap apps for Contentful.
