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

### 👨‍💻 Programmatic

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

| Argument            | Description                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--bundle-dir`      | The directory of your build folder (e.g.: `./build`)                                                                                       |
| `--organization-id` | The ID of your organisation                                                                                                                |
| `--definition-id`   | The ID of the app to which to add the bundle                                                                                               |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |
| `--skip-activation` | (optional) Boolean flag to skip the automatic activation of the `AppBundle`                                                                |
| `--comment`         | (optional) A comment which will be associated with the created `AppBundle`. Can be used to differentiate bundles.                          |

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

| Argument            | Description                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--bundle-id`       | The ID of the AppBundle you want to activate                                                                                               |
| `--organization-id` | The ID of your organisation                                                                                                                |
| `--definition-id`   | The ID of the app to which to add the bundle                                                                                               |
| `--token`           | A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens) |

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

| Argument            | Description                                  |
| ------------------- | -------------------------------------------- |
| `--bundle-id`       | The ID of the AppBundle you want to activate |
| `--organization-id` | The ID of your organisation                  |
| `--definition-id`   | The ID of the app to which to add the bundle |
| `--keep`            | Optional, the amount of bundles to keep      |
| `--host`            | Optional, the Contentful CMA-endpoint to use |

**Note:** You can also pass all arguments in interactive mode to skip being asked for it.

### Tracking

We gather depersonalized usage data of our CLI tools in order to improve experience. If you do not want your data to be gathered, you can opt out by providing an env variable `DISABLE_ANALYTICS` set to any value:

> **Example**
>
> ```
> DISABLE_ANALYTICS=true npx create-contentful-app
> ```
