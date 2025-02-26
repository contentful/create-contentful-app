import { expect } from 'chai';
import { PlainClientAPI } from 'contentful-management';
import sinon from 'sinon';
import * as clientWrapper from './client';
import { AppActionManifest, CreateAppActionPayload } from './types';
import { doUpsert, processActionManifests, syncUpsertToManifest } from './upsert-actions';
import fs from 'node:fs';

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

describe('syncUpsertToManifest', () => {
	let writeFileSyncStub: sinon.SinonStub;
	let consoleLogStub: sinon.SinonStub;

	beforeEach(() => {
		writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
		consoleLogStub = sinon.stub(console, 'log');
	});

	afterEach(() => {
		writeFileSyncStub.restore();
		consoleLogStub.restore();
	});

	it('should sync actions and write updated manifest to file in order', () => {
		const manifestActions = [
			{ id: '1', name: 'action1', type: 'endpoint', url: 'https://example.com/1' },
			{ id: '2', name: 'action2', type: 'endpoint', url: 'https://example.com/2' },
			{ id: '3', name: 'action3', type: 'endpoint', url: 'https://example.com/3' }
		];

		const actionsToSync = {
			1: { id: '2', name: 'updated-action2', type: 'endpoint', url: 'https://example.com/1' }
		};

		const manifest = {
			functions: [{ id: '1', name: 'function1' }],
			actions: manifestActions
		};

		const manifestFile = 'manifest.json';

		syncUpsertToManifest(manifestActions as any as AppActionManifest[], actionsToSync as any as { [i: number]: AppActionManifest }, manifest, manifestFile);

		expect(writeFileSyncStub.calledOnce).to.be.true;
		expect(writeFileSyncStub.firstCall.args[0]).to.equal(manifestFile);
		expect(JSON.parse(writeFileSyncStub.firstCall.args[1])).to.deep.equal({
			// preserve other properties of the manifest
			functions: [{ id: '1', name: 'function1' }],
			actions: [
				{ id: '1', name: 'action1', type: 'endpoint', url: 'https://example.com/1' },
				{ id: '2', name: 'updated-action2', type: 'endpoint', url: 'https://example.com/1' },
				{ id: '3', name: 'action3', type: 'endpoint', url: 'https://example.com/3' }
			]
		});
	});
});

describe('processActionManifests', () => {
	it('should process actions and return synced actions when successful', async () => {
		const actions = [
			{ name: 'action1', type: 'endpoint' },
			{ name: 'action2', type: 'endpoint' }
		];

		const doUpsertStub = () => Promise.resolve({
			sys: {
				id: 'test-id'
			},
			name: 'action1',
			type: 'endpoint'
		});

		const { actionsToSync, errors } = await processActionManifests(actions as AppActionManifest[], doUpsertStub as any);

		expect(Object.keys(actionsToSync).length).to.equal(2);
		expect(actionsToSync[0]).to.deep.include({
			name: 'action1',
			type: 'endpoint',
			id: 'test-id'
		});
		expect(errors).to.be.empty;
	});

	it('should collect errors when action processing fails', async () => {
		const actions = [
			{ name: 'action1', type: 'endpoint' },
			{ name: 'action2', type: 'endpoint' }
		];

		const error = new Error('Processing failed')
		const doUpsertStub = () => Promise.reject(error);

		const { actionsToSync, errors } = await processActionManifests(actions as AppActionManifest[], doUpsertStub);

		expect(Object.keys(actionsToSync)).to.be.empty;
		expect(errors).to.have.length(2);
		expect(errors[0].details).to.equal(error);
		expect(errors[0].path).to.deep.equal(['actions', '0']);
		expect(errors[1].details).to.equal(error);
		expect(errors[1].path).to.deep.equal(['actions', '1']);
	});

	it('should handle mixed success and failure cases', async () => {
		const actions = [
			{ name: 'action1', type: 'endpoint' },
			{ name: 'action2', type: 'endpoint' }
		];

		const successResponse = { sys: { id: 'success-id' } };
		const error = new Error('Processing failed');

		const doUpsertStubMixed = sinon.stub();
		doUpsertStubMixed.onFirstCall().resolves(successResponse);
		doUpsertStubMixed.onSecondCall().rejects(error);

		const { actionsToSync, errors } = await processActionManifests(actions as AppActionManifest[], doUpsertStubMixed);

		expect(Object.keys(actionsToSync)).to.have.length(1);
		expect(actionsToSync[0]).to.deep.include({
			name: 'action1',
			type: 'endpoint',
			id: 'success-id'
		});
		expect(errors).to.have.length(1);
		expect(errors[0].details).to.equal(error);
		expect(errors[0].path).to.deep.equal(['actions', '1']);
	});
});

