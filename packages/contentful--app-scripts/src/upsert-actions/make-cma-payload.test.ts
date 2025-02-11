import { expect } from 'chai';
import { makeAppActionCMAPayload } from './make-cma-payload';
import { AppActionManifest } from './types';

describe('makeAppActionCMAPayload', () => {
	it('should create payload for function-invocation type action', () => {
		const action: AppActionManifest = {
			name: 'Test Function Action',
			description: 'Test description',
			type: 'function-invocation',
			category: 'Custom',
			functionId: 'test-function-id',
			parameters: [{
				id: 'param1',
				name: 'Parameter 1',
				description: 'Test parameter',
				type: 'Symbol',
				required: true
			}]
		};

		const result = makeAppActionCMAPayload(action);

		expect(result).to.deep.equal({
			name: 'Test Function Action',
			description: 'Test description',
			type: 'function-invocation',
			function: {
				sys: {
					id: 'test-function-id',
					linkType: 'Function',
					type: 'Link'
				}
			},
			category: 'Custom',
			parameters: [{
				id: 'param1',
				name: 'Parameter 1',
				description: 'Test parameter',
				type: 'Symbol',
				required: true
			}]
		});
	});

	it('should allow optional id for function-invocation type action', () => {
		const action: AppActionManifest = {
			name: 'Test Function Action',
			type: 'function-invocation',
			category: 'Native',
			functionId: 'test-function-id',
			id: 'custom-id'
		};

		const result = makeAppActionCMAPayload(action);

		expect(result).to.have.property('id', 'custom-id');
	});

	it('should create payload for endpoint action', () => {
		const action: AppActionManifest = {
			name: 'Test Endpoint Action',
			type: 'endpoint',
			category: 'Native',
			url: 'https://api.example.com'
		};

		const result = makeAppActionCMAPayload(action);

		expect(result).to.deep.equal({
			name: 'Test Endpoint Action',
			type: 'endpoint',
			url: 'https://api.example.com',
			category: 'Native'
		});
	});
});