# `@contentful/app-scripts`

This project makes it easier to perform some recurrent operations in [Contentful's App Framework](https://www.contentful.com/developers/docs/extensibility/app-framework/).

## 📥 Installation

Locally:

```shell
npm i @contentful/app-scripts
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
$ npx @contentful/app-scripts create-app-definition
```

### 👩‍💻 Programmatic

```javascript
const { createAppDefinition } = require('@contentful/app-scripts');
const { myCustomLogic } = require('./my-custom-logic')(async function main() {
  myCustomLogic();

  await createAppDefinition.interactive();
})();
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

### Generate Function
Allows generating a new function template from our [function examples](https://github.com/contentful/apps/tree/master/function-examples). Automatically updates `contentful-app-manifest.json` and merges scripts/dependencies from `package.json` into existing project.

#### Interactive mode:

In the interactive mode, the CLI will ask for all required options.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts generate-function
> ```

#### Non-interactive mode:

When passing the `--ci` argument the command will fail when the required variables are not set as arguments.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts generate-function --ci \
>     --name <name> \
>     --example <example> \
>     --language <javascript/typescript> \
> ```

**Options:**

| Argument            | Description                                                                                                                                | Default value        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `--name`      | The name of your function.                                                                                      |                      |
| `--example` | The name of the example as listed in our [function examples](https://github.com/contentful/apps/tree/master/function-examples)                                                                                                            |                      |
| `--language`   | Choice of javascript or typescript                                                                                          |                      |

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
It runs in interactive or non-interactive mode.

**Note:** The command will automatically activate the bundle. To skip the activation you can pass the `--skip-activation` argument in interactive and non-interactive mode and then manually [activate](#activate-an-appBundle) it.

#### Interactive mode:

In the interactive mode, the CLI will ask for all required options.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts upload
> ```

#### Non-interactive mode:

When passing the `--ci` argument the command will fail when the required variables are not set as arguments.

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

| Argument            | Description                                                                                                                                | Default value        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `--bundle-dir`      | The directory of your build folder (e.g.: `./build`)                                                                                       |                      |
| `--organization-id` | The ID of your organization                                                                                                                |                      |
| `--definition-id`   | The ID of the app to which to add the bundle                                                                                               |                      |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |                      |
| `--skip-activation` | (optional) Boolean flag to skip the automatic activation of the `AppBundle`                                                                | `false`              |
| `--comment`         | (optional) A comment which will be associated with the created `AppBundle`. Can be used to differentiate bundles.                          |                      |
| `--host`            | (optional) Contentful CMA-endpoint to use                                                                                                  | `api.contentful.com` |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Activate an AppBundle

Allows you to activate an AppBundle for an AppDefinition.
When activated the app will serve the newly activated AppBundle.

#### Interactive mode:

In the interactive mode, the CLI will ask for all required options.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts activate
> ```

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required.

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

| Argument            | Description                                                                                                                                | Default value        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `--bundle-id`       | The ID of the AppBundle you want to activate                                                                                               |                      |
| `--organization-id` | The ID of your organization                                                                                                                |                      |
| `--definition-id`   | The ID of the app to which to add the bundle                                                                                               |                      |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |                      |
| `--host`            | (optional) Contentful CMA-endpoint to use                                                                                                  | `api.contentful.com` |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Open Settings of an AppDefinition

It opens the settings in the contentful web app so that you can use the UI to change the settings of an [AppDefinition](https://www.contentful.com/developers/docs/extensibility/app-framework/app-definition/).

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts open-settings --definition-id some-definition-id
> ```

You can also execute this command without the argument if the environment variable (`CONTENTFUL_APP_DEF_ID`) has been set.

> **Example**
>
> ```shell
> $ CONTENTFUL_APP_DEF_ID=some-definition-id npx --no-install @contentful/app-scripts open-settings
> ```

**Options:**

| Argument          | Description                                  | Default value        |
| ----------------- | -------------------------------------------- | -------------------- |
|                   |
| `--definition-id` | The ID of the app to which to add the bundle |
| `--host`          | (optional) Contentful CMA-endpoint to use    | `api.contentful.com` |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Clean up bundles

Allows you to clean the list of previous bundles. It fetches the list and deletes all bundles except the 50 newest ones.
You can adjust the amount you want to keep by passing `--keep <amount>` to the argument, if not passed, the default is 50.

#### Interactive mode:

In the interactive mode, the CLI will ask for all required options.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts bundle-cleanup
> ```

You can also execute this command without the argument if the environment variable (`CONTENTFUL_APP_DEF_ID`) and (`CONTENTFUL_ORG_ID`) has been set.

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts bundle-cleanup --ci \
>     --organization-id some-org-id \
>     --definition-id some-app-def-id \
>     --token $MY_CONTENTFUL_PAT
>     --keep 30
> ```

**Options:**

| Argument            | Description                                                                                                                                | Default value        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `--organization-id` | The ID of your organization                                                                                                                |                      |
| `--definition-id`   | The ID of the app to which to add the bundle                                                                                               |                      |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |                      |
| `--keep`            | (optional) The amount of bundles to keep                                                                                                   | `50`                 |
| `--host`            | (optional) Contentful CMA-endpoint to use                                                                                                  | `api.contentful.com` |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Install the AppDefinition into a specific space / environment

It opens a dialog to select the space and environment where the app associated with the given [AppDefinition](https://www.contentful.com/developers/docs/extensibility/app-framework/app-definition/) should be installed.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts install --definition-id some-definition-id
> ```

You can also execute this command without the argument if the environment variable (`CONTENTFUL_APP_DEF_ID`) has been set.

> **Example**
>
> ```shell
> $ CONTENTFUL_APP_DEF_ID=some-definition-id npx --no-install @contentful/app-scripts install
> ```

By default, the script will install the app into the default host URL: `app.contentful.com`. If you want to install the app into a different host URL, you can set the argument `--host` to the desired host URL.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts install --definition-id some-definition-id --host api.eu.contentful.com
> ```

**Options:**

| Argument          | Description                                  | Default value        |
| ----------------- | -------------------------------------------- | -------------------- |
|                   |
| `--definition-id` | The ID of the app to which to add the bundle |
| `--host`          | (optional) Contentful CMA-endpoint to use    | `api.contentful.com` |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Tracking

We gather depersonalized usage data of our CLI tools in order to improve experience. If you do not want your data to be gathered, you can opt out by providing an env variable `DISABLE_ANALYTICS` set to any value:

> **Example**
>
> ```
> DISABLE_ANALYTICS=true npx create-contentful-app
> ```

### Build Contentful Function source

Builds the source code for a Contentful Function into an App Framework compatible bundle.

#### Interactive mode:

In the interactive mode, the CLI will prompt for custom configuration, but none of the options are required.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts build-functions
> ```

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts build-functions --ci \
>     --manifest-file path/to/contentful/app/manifest.json \
>     --esbuild-config path/to/custom/esbuild/config.js \
>     --watch
> ```

**Options:**

Options:
-e, --esbuild-config <path> custom esbuild config file path
-m, --manifest-file <path> Contentful app manifest file path
-w, --watch watch for changes
-h, --help display help for command

### Upsert App Actions

Creates or updates Actions for an App using the configuration in a Contentful App Manifest file. Created resources will be synced back to your manifest file.

#### Interactive mode:

In the interactive mode, the CLI will ask for all required options.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts upsert-actions
> ```

#### Non-interactive mode:

When passing the `--ci` argument adding all variables as arguments is required.

> **Example**
>
> ```shell
> $ npx --no-install @contentful/app-scripts upsert-actions --ci \
>     --manifest-file path/to/contentful-app-manifest.json \
>     --organization-id some-org-id \
>     --definition-id some-app-def-id \
>     --token $MY_CONTENTFUL_PAT
> ```

**Options:**

| Argument            | Description                                                                                                                                | Default value                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `--manifest-file`   | The path to the Contentful app manifest file                                                                                               | `contentful-app-manifest.json` |
| `--organization-id` | The ID of the organization which the app is defined in                                                                                     |                                |
| `--definition-id`   | The ID of the app to which to add the actions                                                                                              |                                |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |                                |
| `--host`            | (optional) Contentful CMA-endpoint to use                                                                                                  | `api.contentful.com`           |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.
