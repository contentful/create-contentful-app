import { expect } from 'chai';
import { PlainClientAPI } from 'contentful-management';
import sinon from 'sinon';
import * as clientWrapper from './client';
import { CreateAppActionPayload } from './types';
import { doUpsert } from './upsert-actions';

describe('doUpsert', () => {
	let createStub: sinon.SinonStub;
	let updateStub: sinon.SinonStub;
	let getExistingStub: sinon.SinonStub;
	let client: PlainClientAPI;

	beforeEach(() => {
		client = {
			appAction: {
				create: sinon.stub(),
				update: sinon.stub(),
				get: sinon.stub(),
			},
		} as any as PlainClientAPI;
		createStub = sinon.stub(clientWrapper, 'createAction');
		updateStub = sinon.stub(clientWrapper, 'updateAction');
		getExistingStub = sinon.stub(clientWrapper, 'getExistingAction');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should create new action when no id provided', async () => {
		const payload = { type: 'action', name: 'test' } as unknown as CreateAppActionPayload;
		const expected = { sys: { id: 'new-id' } };
		createStub.resolves(expected);

		const result = await doUpsert(client, 'app-id', payload);

		expect(createStub.calledOnce).to.be.true;
		expect(result).to.equal(expected);
		expect(getExistingStub.called).to.be.false;
		expect(updateStub.called).to.be.false;
	});

	it('should update existing action when id exists and action found', async () => {
		const payload = {
			id: 'existing-id',
			type: 'action',
			name: 'test',
		} as unknown as CreateAppActionPayload;
		const existing = { sys: { id: 'existing-id' } };
		const expected = { sys: { id: 'existing-id' }, name: 'test' };

		getExistingStub.resolves(existing);
		updateStub.resolves(expected);

		const result = await doUpsert(client, 'app-id', payload);

		expect(updateStub.calledOnce).to.be.true;
		expect(result).to.equal(expected);
		expect(createStub.called).to.be.false;
	});

	it('should create new action when id exists, but action not found, and action type is "function-invocation"', async () => {
		const payload = {
			id: 'new-id',
			type: 'function-invocation',
			name: 'test',
		} as unknown as CreateAppActionPayload;
		const expected = { sys: { id: 'new-id' } };

		getExistingStub.resolves(null);
		createStub.resolves(expected);

		const result = await doUpsert(client, 'app-id', payload);

		expect(createStub.calledOnce).to.be.true;
		expect(result).to.equal(expected);
		expect(updateStub.called).to.be.false;
	});

	it('should throw error when endpoint action not found with specified id and action type is "endpoint"', async () => {
		const payload = {
			id: 'missing-id',
			type: 'endpoint',
			name: 'test',
		} as unknown as CreateAppActionPayload;
		getExistingStub.resolves(null);

		try {
			await doUpsert(client, 'app-id', payload);
			expect.fail('Should have thrown error');
		} catch (error: any) {
			expect(error.message).to.include('Endpoint actions may not set a custom ID');
		}

		expect(createStub.called).to.be.false;
		expect(updateStub.called).to.be.false;
	});
});
