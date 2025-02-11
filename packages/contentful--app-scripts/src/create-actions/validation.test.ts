import { expect } from 'chai';
import { validateActionsManifest } from './validation';

describe('validateActionsManifest', () => {
	it('validates a valid function invocation action with custom category', async () => {
		const manifest = {
			actions: [{
				id: 'test_action',
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					description: 'Test parameter',
					type: 'Symbol',
					required: true
				}]
			}]
		};
		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});

	it('validates a valid endpoint action with native category', async () => {
		const manifest = {
			actions: [{
				type: 'endpoint',
				url: 'https://test.com',
				name: 'Test Action',
				category: 'Entries.v1.0'
			}]
		};
		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});

	it('throws if a function-invocation type action does not define a functionId', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				parameters: []
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if a function-invocation type action defines a url', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				functionId: 'test-function',
				url: 'https://test.com',
				parameters: []
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if an endpoint type action does not define an endpoint', async () => {
		const manifest = {
			actions: [{
				type: 'endpoint',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				parameters: []
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if an endpoint type action defines a functionId', async () => {
		const manifest = {
			actions: [{
				type: 'endpoint',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				url: 'https://test.com',
				functionId: 'test-function',
				parameters: []
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if an endpoint type action defines an id', async () => {
		const manifest = {
			actions: [{
				id: 'test_action',
				type: 'endpoint',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				url: 'https://test.com',
				parameters: []
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if a custom category action does not define parameters', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if a native category action defines parameters', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				description: 'Test description',
				category: 'Entries.v1.0',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					description: 'Test parameter',
					type: 'Symbol',
					required: true
				}]
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if the action sets an unknown category', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				description: 'Test description',
				category: 'Unknown',
				functionId: 'test-function'
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('throws if the action sets an unknown type', async () => {
		const manifest = {
			actions: [{
				type: 'unknown',
				name: 'Test Action',
				description: 'Test description',
				category: 'Custom',
				functionId: 'test-function'
			}]
		};

		try {
			await validateActionsManifest(manifest);
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('validates multiple actions', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action 1',
				description: 'Test description',
				category: 'Custom',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					description: 'Test parameter',
					type: 'Symbol',
					required: true
				}]
			}, {
				type: 'endpoint',
				url: 'https://test.com',
				name: 'Test Action 2',
				category: 'Entries.v1.0'
			}]
		};
		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});

	it('ignores additional properties in manifest', async () => {
		const manifest = {
			actions: [{
				type: 'endpoint',
				url: 'https://test.com',
				name: 'Test Action',
				category: 'Custom',
				parameters: []
			}],
			someOtherProp: true
		};
		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});
});