import z from 'zod';
import { CreateAppActionOptions } from './types';

const parametersSchema = z
	.array(
		z.object({
			id: z.string(),
			name: z.string(),
			description: z.string().optional(),
			type: z.enum(['Symbol', 'Enum', 'Number', 'Boolean']),
			required: z.boolean(),
			default: z.union([z.string(), z.number(), z.boolean()]).optional(),
		})
	)

export function validateActionsManifest(
	manifest: Record<string, any>,
): CreateAppActionOptions['actions'] {
	if (!manifest.actions) {
		throw new Error('Invalid App Action manifest: missing "actions" field');
	}

	const { actions } = manifest;

	if (!Array.isArray(actions)) {
		throw new Error('Invalid App Action manifest: "actions" must be an array');
	}

	const errors: Error[] = actions.reduce((acc: Error[], action: Record<string, any>) => {
		if (!action.name) {
			acc.push(new Error('Invalid App Action manifest: Actions must define a "name".'));
		}

		if (!action.type) {
			acc.push(new Error('Invalid App Action manifest: Actions must define a "type".'));
		}

		if (!action.category) {
			acc.push(new Error('Invalid App Action manifest: Actions must define a "category".'));
		}

		if (action.type === 'function-invocation' && (!action.functionId || action.url)) {
			acc.push(new Error('Invalid App Action manifest: "function-invocation" Actions must define a "functionId" and may not target a "url".'));
		}

		if (action.type === 'endpoint' && (!action.url || action.functionId || action.id)) {
			acc.push(new Error('Invalid App Action manifest: "endpoint" Actions must define a "url", may not target a "functionId", or set a custom "id".'));
		}

		if (action.category !== 'Custom' && action.parameters) {
			acc.push(new Error('Invalid App Action manifest: native Action categories may not define "parameters"'));
		}

		if (action.category === 'Custom' && !action.parameters) {
			acc.push(new Error('Invalid App Action manifest: "Custom" Action categories must define "parameters"'));
		}

		if (action.category === 'Custom' && action.parameters) {
			const parametersValidationResult = parametersSchema.safeParse(action.parameters);
			if (!parametersValidationResult.success) {
				acc.push(new Error(`Invalid App Action manifest: invalid "parameters" - ${JSON.stringify(parametersValidationResult.error.errors)}`));
			}
		}

		return acc;
	}, []);

	if (errors.length) {
		throw new Error(errors.map((error) => error.message).join('\n'));
	}

	return actions
}
