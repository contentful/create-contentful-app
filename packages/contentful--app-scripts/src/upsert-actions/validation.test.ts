import { expect } from 'chai';
import { validateActionsManifest } from './validation';

describe('validateActionsManifest', () => {
	it('validates a valid function invocation action with custom category', async () => {
		const manifest = {
			actions: [{
				id: 'testAction',
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

	it('throws if an action defines an invalid id', async () => {
		const manifest = {
			actions: [{
				id: 'test-action',
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

	it('throws if an action id exceeds 64 characters', async () => {
		const manifest = {
			actions: [{
				id: 'a'.repeat(65),
				type: 'endpoint',
				name: 'Test Action',
				category: 'Entries.v1.0',
				url: 'https://test.com',
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
		}
	});

	it('accepts a parameter with no "required" field', async () => {
		// Regression: the previous zod schema marked "required" as
		// non-optional, even though contentful-management's own type (and
		// the backend's actual schema) treats it as optional.
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					type: 'Symbol',
				}]
			}]
		};

		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});

	it('throws if a parameter id exceeds 64 characters', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parameters: [{
					id: 'a'.repeat(65),
					name: 'Parameter 1',
					type: 'Symbol',
				}]
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('Invalid App Action manifest');
			expect(error.message).to.include('invalid "parameters"');
		}
	});

	it('throws if a parameter description exceeds 255 characters', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					description: 'a'.repeat(256),
					type: 'Symbol',
				}]
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('invalid "parameters"');
		}
	});

	it('throws if a parameter options array is empty', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parameters: [{
					id: 'param1',
					name: 'Parameter 1',
					type: 'Enum',
					options: [],
				}]
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('invalid "parameters"');
		}
	});

	it('throws if a custom category action does not define parameters or parametersSchema', async () => {
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
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('must define "parameters" or "parametersSchema"');
		}
	});

	it('validates a custom category action with parametersSchema', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'initiateGdocOauth',
				name: 'Initiate Gdoc OAuth Flow',
				description: 'Initiates the OAuth flow for Drive Integration',
				category: 'Custom',
				parametersSchema: {
					type: 'object',
				},
				resultSchema: {
					type: 'object',
				},
			}]
		};

		const result = await validateActionsManifest(manifest);
		expect(result).to.deep.equal(manifest.actions);
	});

	it('throws if a custom category action defines both parameters and parametersSchema', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parameters: [],
				parametersSchema: {
					type: 'object',
				},
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('may not define both "parameters" and "parametersSchema"');
		}
	});

	it('throws if parametersSchema is not a JSON Schema object', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parametersSchema: [],
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('"parametersSchema" must be a JSON Schema object');
		}
	});

	it('throws if resultSchema is not a JSON Schema object', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				functionId: 'test-function',
				name: 'Test Action',
				category: 'Custom',
				parametersSchema: {
					type: 'object',
				},
				resultSchema: 'invalid',
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('"resultSchema" must be a JSON Schema object');
		}
	});

	it('throws if a native category action defines parametersSchema', async () => {
		const manifest = {
			actions: [{
				type: 'function-invocation',
				name: 'Test Action',
				category: 'Entries.v1.0',
				functionId: 'test-function',
				parametersSchema: {
					type: 'object',
				},
			}]
		};

		try {
			await validateActionsManifest(manifest);
			expect.fail('expected validateActionsManifest to throw');
		} catch (error) {
			expect(error).to.be.instanceOf(Error);
			expect(error.message).to.include('may not define "parametersSchema"');
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