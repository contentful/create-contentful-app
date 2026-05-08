import { expect } from 'chai';
import * as nodeFetch from 'node-fetch';
import sinon from 'sinon';
import { getGithubFolderNames } from '../src/getGithubFolderNames';

describe('getGithubFolderNames', () => {
  let stubbedFetch: sinon.SinonStub;
  const responseBody = [
    { name: 'page-location', path: 'examples/page-location', type: 'dir' },
    { name: 'home-location', path: 'examples/home-location', type: 'dir' },
  ];
  const responseSuccessInit = {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  const responseFailureInit = {
    status: 404,
    statusText: 'Not Found',
    headers: { 'content-type': 'application/json' },
  };

  beforeEach(() => {
    stubbedFetch = sinon.stub(nodeFetch, 'default');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns the folder result when fetch is successful', async () => {
    stubbedFetch.resolves(
      new nodeFetch.Response(JSON.stringify(responseBody), responseSuccessInit)
    );
    const folders = await getGithubFolderNames();
    expect(folders).to.have.lengthOf(2);
  });

  it('should throw an error when fetch fails', async () => {
    stubbedFetch.rejects(new nodeFetch.Response(JSON.stringify({}), responseFailureInit));
    try {
      await getGithubFolderNames();
    } catch (error) {
      expect(error).to.be.an('error');
      expect(error.message).to.contain('Failed to fetch Contentful app templates:');
    }
  });
});
