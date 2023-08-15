import { getJsonData, mergeJsonIntoFile } from '../../src/utils/file';
import { expect } from 'chai';
import * as sinon from 'sinon';

import * as fs from 'fs';

describe('getJsonData', () => {
  const accessStub = sinon.stub();
  const readFileStub = sinon.stub();

  beforeEach(() => {
    sinon.stub(fs.promises, 'access').callsFake(accessStub);
    sinon.stub(fs.promises, 'readFile').callsFake(readFileStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return `undefined` if path is `undefined`', async () => {
    // Arrange
    const path = undefined;

    // Act
    const result = await getJsonData(path);

    // Assert
    expect(result).to.equal(undefined);
  });

  it('should return `undefined` if path does not exist`', async () => {
    // Arrange
    const path = '/foo';

    accessStub.rejects();

    // Act
    const result = await getJsonData(path);

    // Assert
    expect(result).to.equal(undefined);
  });

  it('should return the JSON parse error if the file does not contain valid JSON`', async () => {
    // Arrange
    const path = '/foo';
    const fileContent = 'foo';

    accessStub.resolves();
    readFileStub.resolves(fileContent);

    // Act
    const result = getJsonData(path);

    // Assert
    await expect(result).to.eventually.be.rejectedWith(SyntaxError);
  });
});

describe('mergeJsonIntoFile', () => {
  const accessStub = sinon.stub();
  const readFileStub = sinon.stub();
  const writeFileStub = sinon.stub().resolves();

  const stringify = (obj: Record<string, any>): string => JSON.stringify(obj, null, '  ');

  beforeEach(() => {
    sinon.stub(fs.promises, 'access').callsFake(accessStub);
    sinon.stub(fs.promises, 'readFile').callsFake(readFileStub);
    sinon.stub(fs.promises, 'writeFile').callsFake(writeFileStub);

    accessStub.resolves();
    writeFileStub.resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should write an empty object if none of the files exist', async () => {
    // Arrange
    const destination = '/foo';

    accessStub.rejects();

    // Act
    const result = await mergeJsonIntoFile({ destination });

    // Assert
    expect(result).to.equal(undefined);
    expect(writeFileStub).to.be.calledWith('/foo', `{}`);
  });

  it('should write the same data back to the destination if only the destination file exists', async () => {
    // Arrange
    const destination = '/foo';
    const destinationJson = stringify({ foo: { bar: 'baz' } });

    readFileStub.resolves(destinationJson);

    // Act
    const result = await mergeJsonIntoFile({ destination });

    // Assert
    expect(result).to.equal(undefined);
    expect(writeFileStub).to.be.calledWith('/foo', destinationJson);
  });

  it('should merge source and destination file before writing the json data back to the destination', async () => {
    // Arrange
    const destination = '/foo';
    const destinationObject = { foo: { bar: 'baz', baz: [1337] } };
    const destinationJson = stringify(destinationObject);

    const source = '/bar';
    const sourceObject = { foo: { baz: [42], foo: 'foo' } };
    const sourceJson = stringify(sourceObject);

    readFileStub.withArgs(destination).resolves(destinationJson);
    readFileStub.withArgs(source).resolves(sourceJson);

    // Act
    const result = await mergeJsonIntoFile({ destination, source });

    // Assert
    expect(result).to.equal(undefined);
    expect(writeFileStub).to.be.calledWith(
      '/foo',
      stringify({ foo: { bar: 'baz', baz: [42], foo: 'foo' } }),
    );
  });

  it('should call the custom merge function and write the return value to the destination file', async () => {
    // Arrange
    const destination = '/foo';
    const destinationObject = { foo: { bar: 'baz', baz: [1337] } };
    const destinationJson = stringify(destinationObject);

    const source = '/bar';
    const sourceObject = { foo: { baz: [42], foo: 'foo' } };
    const sourceJson = stringify(sourceObject);

    const resultObject = { foo: 'bar' };
    const resultJson = stringify(resultObject);
    const mergeFn = sinon.stub().returns(resultObject);

    readFileStub.withArgs(destination).resolves(destinationJson);
    readFileStub.withArgs(source).resolves(sourceJson);

    // Act
    const result = await mergeJsonIntoFile({ destination, source, mergeFn });

    // Assert
    expect(result).to.equal(undefined);
    expect(mergeFn).to.be.calledWith(destinationObject, sourceObject);
    expect(writeFileStub).to.be.calledWith('/foo', resultJson);
  });
});
