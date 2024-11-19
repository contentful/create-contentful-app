#!/usr/bin/env node

// This is a convenience wrapper.
// It allows you to run `npx create-contentful-app` directly,
// instead of `npx @contentful/create-contentful-app`.

// The following warning is emitted from eslint: [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
// eslint has a dependency on ajv v6, which is where this punycode deprecation warning is coming from
// this warning is visible to users when running the create-contentful-app command on node v22, so we are suppressing warnings here until dependencies are updated
process.removeAllListeners('warning');

import '@contentful/create-contentful-app';
