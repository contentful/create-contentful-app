'use strict';

process.env.NODE_ENV = 'test';

require('ts-node').register({
  transpileOnly: true,
});

require('chai').use(require('sinon-chai')).use(require('chai-as-promised'));
