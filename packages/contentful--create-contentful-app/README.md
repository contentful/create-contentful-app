<!-- Don't forget to also update the corresponding README.md of the create-contentful-app package -->

# Create Contentful App

`create-contentful-app` is a command line interface to easily bootstrap [Contentful Apps](https://www.contentful.com/developers/docs/extensibility/app-framework/).

# Requirements

- Node.js v18.12 or later
- npm v9 or later

# Usage

To start developing your first app, run:

```bash
npx create-contentful-app my-first-app
```

![Screenshot of `npx create-contentful-app my-app`](https://raw.githubusercontent.com/contentful/create-contentful-app/master/packages/contentful--create-contentful-app/docs/screenshot.png)

## Bootstrap

You can run `create-contentful-app` using one of the following commands:

```bash
# npx
npx create-contentful-app <app-name>

# npm
npm init contentful-app <app-name>

# Yarn
yarn create contentful-app <app-name>
```

## CLI Options

### Package Manager

`--npm` or `--yarn`

Use npm or Yarn to manage dependencies. If omitted, defaults to the manager used to run `create-contentful-app`.

Both flags are mutually exclusive.

### Template

Select between predefined and custom templates:

- `-ts, --typescript`: Use TypeScript template (default)
- `-js, --javascript`: Use JavaScript template
- `-e, --example <example-name>`: Select a predefined template from https://github.com/contentful/apps/tree/master/examples
- `-s, --source <url>`: Use a custom template. Format: URL (HTTPS or SSH) or vendor:user/repo (e.g., github:user/repo)

These flags are mutually exclusive. If no flag is provided, the TypeScript template is used.

Some popular templates are:

| Template                                                                         | CLI Command                                       |
| -------------------------------------------------------------------------------- | :------------------------------------------------ |
| [typescript](https://github.com/contentful/apps/tree/master/examples/typescript) | `yarn create contentful-app -ts`                  |
| [javascript](https://github.com/contentful/apps/tree/master/examples/javascript) | `yarn create contentful-app -js`                  |
| [nextjs](https://github.com/contentful/apps/tree/master/examples/nextjs)         | `yarn create contentful-app --example nextjs`     |
| [vite-react](https://github.com/contentful/apps/tree/master/examples/vite-react) | `yarn create contentful-app --example vite-react` |
| [vue](https://github.com/contentful/apps/tree/master/examples/vue)               | `yarn create contentful-app --example vue`        |

### Help

`--help`

Shows all available CLI options:

```
Usage: npx create-contentful-app [options] [app-name]

Bootstrap your app inside a new folder `my-app`

  create-contentful-app my-app

or specify your own template

  create-contentful-app my-app --source "github:user/repo"

Official Contentful templates are hosted at https://github.com/contentful/apps/tree/master/examples.

Arguments:
  app-name                                      app name

Options:
  --npm                                         use npm
  --yarn                                        use Yarn
  -js, --javascript                             use default JavaScript template
  -ts, --typescript                             use default TypeScript template
  -e, --example <example-name>                  bootstrap an example app from https://github.com/contentful/apps/tree/master/examples
  -s, --source <url>                            provide a template by its source repository.
                                                format: URL (HTTPS or SSH) or vendor:user/repo (e.g., github:user/repo)
  -a, --actions                                 includes a hosted app action in ts or js template
  -f, --function <function-template-name>       include the specified function template
  -h, --help                                    shows all available CLI options
```

In order to run the app within Contentful run `npm run create-app-definition` within your app directory to create an app definition.

### Tracking

We gather depersonalized usage data of our CLI tools in order to improve experience. If you do not want your data to be gathered, you can opt out by providing an env variable `DISABLE_ANALYTICS` set to any value:

> **Example**
>
> ```
> DISABLE_ANALYTICS=true npx create-contentful-app
> ```
