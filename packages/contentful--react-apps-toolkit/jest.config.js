module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.t(s|sx)$': 'ts-jest',
  },
  testRegex: '^.+\\.spec\\.t(s|sx)$',
};
