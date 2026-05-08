import { getJsonData } from '../../src/utils/file';
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
