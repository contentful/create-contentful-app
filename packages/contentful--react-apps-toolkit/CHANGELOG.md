# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.1 (2022-04-07)


### Bug Fixes

* 1.0.0 did not include the build output


# 1.0.0 (2022-04-07)


### Features

* React Apps Toolkit v1 ([#982](https://github.com/contentful/create-contentful-app/issues/982)) ([3b484f9](https://github.com/contentful/create-contentful-app/commit/3b484f9f64cb4ea63db4ce2714d637972c2b4353))


### BREAKING CHANGES

* React Apps Toolkit v1

**React Hooks for building apps faster**

React is the most popular framework when it comes to writing Contentful apps and with the new React Apps Toolkit, we provide multiple new React hooks that abstract the most common use cases. That way, you have to write less boilerplate code and can focus on the core functionality of your Contentful app.  Combined with Contentful’s open source Forma 36 design library it allows developers to seamlessly integrate into Contentful so that you can build editorial apps faster with less manual work. To learn more about the new React Apps Toolkit, check out the [package on npm](https://www.npmjs.com/package/@contentful/react-apps-toolkit).

**Usage:**

```tsx
ReactDOM.render(
  // wrap the app with the SDK Provider, so the new hooks can be used
  <SDKProvider>
    <App />
  </SDKProvider>,
  document.getElementById(‘root’)
);

function App() {
  // returns an instance of the App SDK
  const sdk = useSDK();
  
  // returns an initialized plain CMA client
  const cma = useCMA();

  // returns the current state of a field and an update method
  const [value, setValue] = useFieldValue();

  // …
}
```

# [0.7.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.6.1...@contentful/react-apps-toolkit@0.7.0) (2022-04-07)


### Features

* React Apps Toolkit v1 ([#982](https://github.com/contentful/create-contentful-app/issues/982)) ([3b484f9](https://github.com/contentful/create-contentful-app/commit/3b484f9f64cb4ea63db4ce2714d637972c2b4353))


### BREAKING CHANGES

* React Apps Toolkit v1

**React Hooks for building apps faster**

React is the most popular framework when it comes to writing Contentful apps and with the new React Apps Toolkit, we provide multiple new React hooks that abstract the most common use cases. That way, you have to write less boilerplate code and can focus on the core functionality of your Contentful app.  Combined with Contentful’s open source Forma 36 design library it allows developers to seamlessly integrate into Contentful so that you can build editorial apps faster with less manual work. To learn more about the new React Apps Toolkit, check out the [package on npm](https://www.npmjs.com/package/@contentful/react-apps-toolkit).

**Usage:**

```tsx
ReactDOM.render(
  // wrap the app with the SDK Provider, so the new hooks can be used
  <SDKProvider>
    <App />
  </SDKProvider>,
  document.getElementById(‘root’)
);

function App() {
  // returns an instance of the App SDK
  const sdk = useSDK();
  
  // returns an initialized plain CMA client
  const cma = useCMA();

  // returns the current state of a field and an update method
  const [value, setValue] = useFieldValue();

  // …
}
```





## [0.6.1](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.6.0...@contentful/react-apps-toolkit@0.6.1) (2022-04-07)

**Note:** Version bump only for package @contentful/react-apps-toolkit





# [0.6.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.11...@contentful/react-apps-toolkit@0.6.0) (2022-04-06)


### Features

* return updated value when setting a field value via `useFieldValue` ([#979](https://github.com/contentful/create-contentful-app/issues/979)) ([ee17b55](https://github.com/contentful/create-contentful-app/commit/ee17b5598f799b0aac0b7b8a282f12346992f09b))





## [0.5.11](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.10...@contentful/react-apps-toolkit@0.5.11) (2022-04-05)


### Bug Fixes

* use `environmentAlias` in useCMA ([#978](https://github.com/contentful/create-contentful-app/issues/978)) ([4f538fd](https://github.com/contentful/create-contentful-app/commit/4f538fdc544fd7f4f0d946df9930331775fc832c))





## [0.5.10](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.9...@contentful/react-apps-toolkit@0.5.10) (2022-03-29)


### Bug Fixes

* set `sideEffects` to `false` ([#959](https://github.com/contentful/create-contentful-app/issues/959)) ([8893254](https://github.com/contentful/create-contentful-app/commit/8893254c8644986289506ba910216de5c8c66b7c))





## [0.5.9](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.8...@contentful/react-apps-toolkit@0.5.9) (2022-03-25)


### Bug Fixes

* values returned by `useFieldValue` can always be `undefined` ([#960](https://github.com/contentful/create-contentful-app/issues/960)) ([1d2a101](https://github.com/contentful/create-contentful-app/commit/1d2a101713f38122be57845643b7d89f5c19155e))





## [0.5.8](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.7...@contentful/react-apps-toolkit@0.5.8) (2022-03-25)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.5.7](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.6...@contentful/react-apps-toolkit@0.5.7) (2022-03-25)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.5.6](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.5...@contentful/react-apps-toolkit@0.5.6) (2022-03-23)


### Bug Fixes

* `useCMA()` return value ([#949](https://github.com/contentful/create-contentful-app/issues/949)) ([17cecf2](https://github.com/contentful/create-contentful-app/commit/17cecf259c6061d64794afef5d04686b558a2235))





## [0.5.5](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.4...@contentful/react-apps-toolkit@0.5.5) (2022-03-23)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.5.4](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.3...@contentful/react-apps-toolkit@0.5.4) (2022-03-21)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.5.3](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.2...@contentful/react-apps-toolkit@0.5.3) (2022-03-18)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.5.2](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.1...@contentful/react-apps-toolkit@0.5.2) (2022-03-17)


### Bug Fixes

* **deps:** bump contentful-management from 8.2.1 to 8.2.2 ([ba3cef6](https://github.com/contentful/create-contentful-app/commit/ba3cef66133bc30e4627cd822eedd7a5fe57413e))





## [0.5.1](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.5.0...@contentful/react-apps-toolkit@0.5.1) (2022-03-15)


### Bug Fixes

* **deps:** bump contentful-management from 8.2.0 to 8.2.1 ([de00667](https://github.com/contentful/create-contentful-app/commit/de00667daaeb01730a86261ca959d274d8ed44a8))





# [0.5.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.4.2...@contentful/react-apps-toolkit@0.5.0) (2022-03-10)


### Features

* useFieldValue [EXT-3492] ([#923](https://github.com/contentful/create-contentful-app/issues/923)) ([3f1c25f](https://github.com/contentful/create-contentful-app/commit/3f1c25fca2b6458e2bd393efccdcedcb679f5754))





## [0.4.2](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.4.1...@contentful/react-apps-toolkit@0.4.2) (2022-03-10)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.4.1](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.4.0...@contentful/react-apps-toolkit@0.4.1) (2022-03-10)

**Note:** Version bump only for package @contentful/react-apps-toolkit





# [0.4.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.3.0...@contentful/react-apps-toolkit@0.4.0) (2022-03-04)


### Features

* [EXT-3491] add useCMAClient hook ([#917](https://github.com/contentful/create-contentful-app/issues/917)) ([2c53ddf](https://github.com/contentful/create-contentful-app/commit/2c53ddf2a2ffd341fadd8aa59425b8f1b07b6d7b))





# [0.3.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.2.1...@contentful/react-apps-toolkit@0.3.0) (2022-03-04)


### Features

* [] add timeout and console warn ([#919](https://github.com/contentful/create-contentful-app/issues/919)) ([9afcad6](https://github.com/contentful/create-contentful-app/commit/9afcad6f26ae7f0023942a8fa2110096f6cb3fd5))





## [0.2.1](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.2.0...@contentful/react-apps-toolkit@0.2.1) (2022-03-03)


### Bug Fixes

* **deps:** bump @contentful/app-sdk from 4.0.0 to 4.3.5 ([4698249](https://github.com/contentful/create-contentful-app/commit/4698249ee278ecf9097660da78bd187cb09a911e))





# [0.2.0](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.1.2...@contentful/react-apps-toolkit@0.2.0) (2022-03-03)


### Features

* [EXT-3490] add useSDK hook ([#909](https://github.com/contentful/create-contentful-app/issues/909)) ([73ba639](https://github.com/contentful/create-contentful-app/commit/73ba63902d1800930c047ff04c5f4c65c0b953b2))





## [0.1.2](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.1.1...@contentful/react-apps-toolkit@0.1.2) (2022-03-01)

**Note:** Version bump only for package @contentful/react-apps-toolkit





## [0.1.1](https://github.com/contentful/create-contentful-app/compare/@contentful/react-apps-toolkit@0.1.0...@contentful/react-apps-toolkit@0.1.1) (2022-02-23)

**Note:** Version bump only for package @contentful/react-apps-toolkit





# 0.1.0 (2022-02-22)


### Features

* React Apps Toolkit package [EXT-3489] ([#881](https://github.com/contentful/create-contentful-app/issues/881)) ([e9b48d1](https://github.com/contentful/create-contentful-app/commit/e9b48d1cb1d7b0ee38a03928e377a31b5cc26d17))
