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
  
  createAppDefinition.interactive()
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
> $ contentful-app-scripts create-app-definition
> ```
