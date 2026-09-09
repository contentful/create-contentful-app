import {
	isValidActionId,
	validateActionParameter,
	ActionParameterDefinition,
	MIN_ACTION_ID_LENGTH,
	MAX_ACTION_ID_LENGTH,
	// eslint-disable-next-line node/no-missing-import
} from '@contentful/node-apps-toolkit/validation';
import { CreateAppActionOptions as UpsertAppActionOptions } from './types';

const validateParameters = (parameters: unknown[]) => {
	const errors: string[] = [];
	parameters.forEach((parameter, index) => {
		const parameterErrors = validateActionParameter(parameter as ActionParameterDefinition);
		parameterErrors.forEach((error) => errors.push(`parameters[${index}]: ${error}`));
	});
	return errors;
}

const isJsonSchemaObject = (value: unknown): boolean => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const validateId = (id: string) => {
	if (!isValidActionId(id)) {
		return {
			ok: false,
			message: `Invalid "id" (must be ${MIN_ACTION_ID_LENGTH}-${MAX_ACTION_ID_LENGTH} alphanumeric characters). Received: ${id}.`,
		}
	}
	return { ok: true };
}

export function validateActionsManifest(
	manifest: Record<string, any>,
): UpsertAppActionOptions['actions'] {
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

		if (action.type === 'endpoint' && (!action.url || action.functionId)) {
			acc.push(new Error('Invalid App Action manifest: "endpoint" Actions must define a "url" and may not target a "functionId".'));
		}

		if (action.id) {
			const { ok, message } = validateId(action.id);
			if (!ok) {
				acc.push(new Error(`Invalid App Action manifest: ${message}`));
			}
		}

		if (action.category !== 'Custom' && action.parameters) {
			acc.push(new Error('Invalid App Action manifest: native Action categories may not define "parameters"'));
		}

		if (action.category !== 'Custom' && action.parametersSchema) {
			acc.push(new Error('Invalid App Action manifest: native Action categories may not define "parametersSchema"'));
		}

		if (action.category !== 'Custom' && action.resultSchema) {
			acc.push(new Error('Invalid App Action manifest: native Action categories may not define "resultSchema"'));
		}

		if (action.category === 'Custom') {
			if (action.parameters !== undefined && !Array.isArray(action.parameters)) {
				acc.push(new Error('Invalid App Action manifest: "parameters" must be an array'));
			}

			const hasParameters = Array.isArray(action.parameters);
			const hasParametersSchema = action.parametersSchema !== undefined;

			if (!hasParameters && !hasParametersSchema) {
				acc.push(new Error('Invalid App Action manifest: "Custom" Action categories must define "parameters" or "parametersSchema"'));
			}

			if (hasParameters && hasParametersSchema) {
				acc.push(new Error('Invalid App Action manifest: "Custom" Action categories may not define both "parameters" and "parametersSchema"'));
			}

			if (hasParameters) {
				const parameterErrors = validateParameters(action.parameters as unknown[]);
				if (parameterErrors.length) {
					acc.push(new Error(`Invalid App Action manifest: invalid "parameters" - ${JSON.stringify(parameterErrors)}`));
				}
			}

			if (hasParametersSchema && !isJsonSchemaObject(action.parametersSchema)) {
				acc.push(new Error('Invalid App Action manifest: "parametersSchema" must be a JSON Schema object'));
			}
		}

		if (action.resultSchema !== undefined && !isJsonSchemaObject(action.resultSchema)) {
			acc.push(new Error('Invalid App Action manifest: "resultSchema" must be a JSON Schema object'));
		}

		return acc;
	}, []);

	if (errors.length) {
		throw new Error(errors.map((error) => error.message).join('\n'));
	}

	return actions
}
