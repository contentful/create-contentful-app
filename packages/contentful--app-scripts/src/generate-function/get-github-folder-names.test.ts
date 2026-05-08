import { stub, SinonStub } from 'sinon';
import assert from 'assert';
import axios from 'axios';
import { getGithubFolderNames } from './get-github-folder-names';
import { HTTPResponseError } from './types';

describe('getGithubFolderNames', () => {
    let axiosGetStub: SinonStub;

    beforeEach(() => {
        axiosGetStub = stub(axios, 'get');
    });

    afterEach(() => {
        axiosGetStub.restore();
    });

    it('should return a list of available examples', async () => {
        const mockResponse = {
            data: [
                { type: 'dir', name: 'example1' },
                { type: 'dir', name: 'example2' },
                { type: 'file', name: 'file1' }
            ]
        };
        axiosGetStub.resolves(mockResponse);

        const result = await getGithubFolderNames();
        assert.deepStrictEqual(result, ['example1', 'example2']);
    });

    it('should throw an HTTPResponseError if axios throws an HTTPResponseError', async () => {
        const error = new HTTPResponseError('HTTP error');
        axiosGetStub.rejects(error);

        await assert.rejects(async () => {
            await getGithubFolderNames();
        }, HTTPResponseError);
    });

    it('should throw a generic error if axios throws a non-HTTPResponseError', async () => {
        const error = new Error('Network error');
        axiosGetStub.rejects(error);

        await assert.rejects(async () => {
            await getGithubFolderNames();
        }, new Error(`Failed to fetch Contentful app templates: ${error}`));
    });
});

