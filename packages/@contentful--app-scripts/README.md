# `@contentful/app-scripts`

This project makes easy to perform some recurrent operations in [Contentful's App Framework](https://www.contentful.com/developers/docs/extensibility/app-framework/).

## 📥 Installation

Locally:

```shell
npm i --save @contentful/app-scripts
```

Globally:

```shell
npm i -g @contentful/app-scripts
```


## ⚙️ Usage

### 💻 CLI

When installed
```
$ contentful-app-scripts create-app-definition 
```

Otherwise
```
$ npx --no-install @contentful/app-scripts create-app-definition 
```

### 👨‍💻 Programmatic

```javascript
// my-script.js

const { createAppDefinition } = require('@contentful/app-scripts')
const { myCustomLogic } = require('./my-custom-logic')

(async function main() {
  myCustomLogic();

  await createAppDefinition.interactive()
})()
```

## 📜 API

Scripts exported from this module will all be in the following shape

```typescript
interface Script<Result, Options> {
  // query the user or local cache for required information
  interactive: () => Result;
  // run by automation (`--ci` flag), they would need all the information upfront
  nonInteractive: (...options: Options) => Result;
}
```

> **:warning: Please note**
>
> Both interactive and nonInteractive version of the same script is meant to return the same result.

### Create App Definition

Allows creating a new [AppDefinition](https://www.contentful.com/developers/docs/extensibility/app-framework/app-definition/)
provided a Content Management Token (more details [here](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)).

It only runs in interactive mode.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts create-app-definition
> ``` 

### Upload a bundle to an App Definition

Allows you to upload a build directory and create a new AppBundle that is bound to an [AppDefinition](https://www.contentful.com/developers/docs/extensibility/app-framework/app-definition/).
It runs in interactive or non-interactive mode

**Note:** To make the app serve the bundle you need to [activate](#activate-an-appBundle) it

#### Interactive mode:

In interactive mode, it will ask for all required options

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts upload
> ```

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts upload --ci \
>     --bundle-dir ./built \
>     --organization-id some-org-id \ 
>     --definition-id some-app-def-id \ 
>     --token $MY_CONTENTFUL_PAT
> ```

**Options:**

| Argument                 | Description                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `--bundle-dir`           | The directory of your build folder (e.g.: `./build`)                                                                                            |
| `--organization-id`      | The ID of your organisation                                                                                                                    |
| `--definition-id`        | The ID of the app to which to add the bundle                                                                                                   |
| `--token`                | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)     |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.


### Activate an AppBundle

Allows you to activate an AppBundle for an AppDefinition.
When activated the app will serve the newly activated AppBundle.

#### Interactive mode:

In interactive mode, it will ask for all required options

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts activate
> ```

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts activate --ci \
>     --bundle-id some-bundle-id \
>     --organization-id some-org-id \ 
>     --definition-id some-app-def-id \ 
>     --token $MY_CONTENTFUL_PAT
> ```

**Options:**

| Argument                 | Description                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `--bundle-id`            | The ID of the AppBundle you want to activate                                                                                                   |
| `--organization-id`      | The ID of your organisation                                                                                                                    |
| `--definition-id`        | The ID of the app to which to add the bundle                                                                                                   |
| `--token`                | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)     |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it. 
