import { getAddBuildCommandFn } from '../../src/utils/package';
import { expect } from 'chai';

describe('getAddBuildCommandFn', () => {
  it('should add the command to the scripts property', () => {
    // Arrange
    const name = 'build:foo';
    const command = 'npx bar';

    // Act
    const addBuildCommandFn = getAddBuildCommandFn({ name, command });
    const packageJson = addBuildCommandFn({});

    // Assert
    expect(packageJson).to.eql({
      scripts: {
        [name]: command,
        build: `npm run ${name}`,
      },
    });
  });

  it('should append the existing build command with the new command', () => {
    // Arrange
    const name = 'build:foo';
    const command = 'npx bar';
    const originalBuildCommand = 'tsc';

    // Act
    const addBuildCommandFn = getAddBuildCommandFn({ name, command });
    const packageJson = addBuildCommandFn({ scripts: { build: originalBuildCommand } });

    // Assert
    expect(packageJson).to.eql({
      scripts: {
        [name]: command,
        build: `${originalBuildCommand} && npm run ${name}`,
      },
    });
  });

  [
    'npm run build:foo',
    'tsc && npm run build:foo',
    'npm run build:foo && tsc',
    'tsc & npm run build:foo && webpack build',
  ].forEach((existingBuildCommand) => {
    it(`should not append to the existing build command when it already contains the new command (e.g. ${existingBuildCommand})`, () => {
      // Arrange
      const name = 'build:foo';
      const command = 'npx bar';

      // Act
      const addBuildCommandFn = getAddBuildCommandFn({ name, command });
      const packageJson = addBuildCommandFn({ scripts: { build: existingBuildCommand } });

      // Assert
      expect(packageJson).to.eql({
        scripts: {
          [name]: command,
          build: existingBuildCommand,
        },
      });
    });
  });

  it('should not override other properties', () => {
    // Arrange
    const name = 'build:foo';
    const command = 'npx bar';
    const originalPackageJson = {
      foo: 'bar',
      scripts: {
        bar: 'baz',
      },
    };

    // Act
    const addBuildCommandFn = getAddBuildCommandFn({ name, command });
    const packageJson = addBuildCommandFn(originalPackageJson);

    // Assert
    expect(packageJson.foo).to.eql(originalPackageJson.foo);
    expect(packageJson.scripts.bar).to.eql(originalPackageJson.scripts.bar);
  });

  it('should not mutate the original packageJson or additionalProperties', () => {
    // Arrange
    const name = 'build:foo';
    const command = 'npx bar';
    const originalPackageJson = {};
    const additionalProperties = {};

    // Act
    const addBuildCommandFn = getAddBuildCommandFn({ name, command });
    const packageJson = addBuildCommandFn(originalPackageJson, additionalProperties);

    // Assert
    expect(Object.keys(originalPackageJson).length).to.equal(0);
    expect(Object.keys(additionalProperties).length).to.equal(0);
    expect(Object.keys(packageJson).length).to.equal(1);
  });

  it('should recursively merge properties from packageJson and additionalProperties', () => {
    // Arrange
    const name = 'build:foo';
    const command = 'npx bar';
    const originalPackageJson = {
      foo: 'bar',
      bar: {
        baz: [42],
        foo: 'bar',
      },
    };
    const additionalProperties = {
      foo: 'baz',
      bar: {
        baz: [1337],
        bar: 'bar',
      },
    };

    // Act
    const addBuildCommandFn = getAddBuildCommandFn({ name, command });
    const packageJson = addBuildCommandFn(originalPackageJson, additionalProperties);

    // Assert
    expect(packageJson.foo).to.eql('baz');
    expect(packageJson.bar).to.eql({
      baz: [1337],
      foo: 'bar',
      bar: 'bar',
    });
  });
});
