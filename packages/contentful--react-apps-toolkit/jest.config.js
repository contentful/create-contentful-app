module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '^.+\\.spec\\.ts$'
};
