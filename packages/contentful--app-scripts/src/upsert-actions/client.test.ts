import { expect } from 'chai';
import { PlainClientAPI } from 'contentful-management';
import sinon from 'sinon';
import { getExistingAction } from './client';

describe('wrapped CMA client', () => {
	describe('getExistingAction', () => {
		it('should return null if the action does not exist', async () => {
			const error = new Error('Not Found');
			Object.assign(error, { name: 'NotFound' });
			const client = { appAction: { get: sinon.stub().rejects(error) } } as unknown as PlainClientAPI;

			const result = await getExistingAction(client, 'appDefId', 'actionId');

			expect(result).to.eq(null);
		});

		it('should throw an error if an unexpected error occurs', async () => {
			const error = new Error('Something else went wrong');
			const client = { appAction: { get: sinon.stub().rejects(error) } } as unknown as PlainClientAPI;

			try {
				await getExistingAction(client, 'appDefId', 'actionId');
			} catch (e) {
				expect(e).to.eq(error);
			}
		});
	});
});