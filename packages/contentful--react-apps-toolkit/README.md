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

This hook returns the App SDK.

The only requirement for using it is that the component that uses it is wrapped within the `SDKProvider`.
If it is not, the hook will throw an error.

Here is an example of how you can use it:

```tsx
import { useSDK } from '@contentful/react-apps-toolkit'

function App() {
  const sdk = useSDK<FieldExtensionSDK>();

  return <>App Id: {sdk.ids.app}</>
}

```

### `useCMA`

Returns an initialized [plain client](https://github.com/contentful/contentful-management.js/#alternative-plain-api) for the Contentful Management API, which can immediately be used to communicate with the rest of your Contentful space. [Contentful Management API docs](https://www.contentful.com/developers/docs/references/content-management-api/).


```tsx
import { useCMA } from '@contentful/react-apps-toolkit'

function App() {
  const cma = useCMA();

  useEffect(() => {
    cma.entry.get({ entryId: '2VO9yOaeSyAFA19e649SxG' }).then((entry) => {
      console.log(entry);
    });
  }, [cma]);

  return <>Hello world!</>
}

```

### `useFieldValue`

Returns a tuple including the value and an update method for an entry field - similar to React's builtin `useState(...)`. The value automatically updates when the user or another app changes the the field.

```ts
import { useFieldValue } from '@contentful/react-apps-toolkit'

function App() {
  const [value, setValue] = useFieldValue(
    'fieldId', // can be omitted in field location, defaults to the current field
    'en-US' // can be omitted, defaults to the default locale
  );

  return <input value={value} onChange={e => setValue(e.target.value)} />
}

```

#### SDKProvider

Wrapper component, which makes the Apps SDK available to children via React Context. To use any of the hooks contained in this package, an application must be wrapped in the SDK provider, as all hooks depend on the Apps SDK.

### Resources

- [Create Contentful App](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/)
