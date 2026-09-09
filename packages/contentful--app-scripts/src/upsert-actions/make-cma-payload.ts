import {
	AppActionManifest,
	BaseAppActionProps,
	CreateAppActionPayload,
	CustomCategoryAppActionProps,
	EndpointAppActionProps,
	FunctionAppActionProps,
	BuiltInCategoryAppActionProps,
} from './types';

export function makeAppActionCMAPayload(action: AppActionManifest): CreateAppActionPayload {
	const baseProps: BaseAppActionProps = {
		name: action.name,
		...(action.description && { description: action.description }),
		...(action.id && { id: action.id }),
	};

	const additionalPropsByType =
		action.type === 'function-invocation'
			? ({
				type: action.type,
				function: {
					sys: {
						id: action.functionId,
						linkType: 'Function',
						type: 'Link',
					},
				},
			} as FunctionAppActionProps)
			: ({
				type: action.type,
				url: action.url,
			} as EndpointAppActionProps);

	const customAction = action as CustomCategoryAppActionProps;
	const additionalPropsByCategory =
		action.category === 'Custom'
			? ({
				category: action.category,
				...(customAction.parameters !== undefined && { parameters: customAction.parameters }),
				...(customAction.parametersSchema !== undefined && { parametersSchema: customAction.parametersSchema }),
			} as CustomCategoryAppActionProps)
			: ({
				category: action.category,
			} as BuiltInCategoryAppActionProps);

	const payload = {
		...baseProps,
		...additionalPropsByType,
		...additionalPropsByCategory,
		...(action.resultSchema !== undefined && { resultSchema: action.resultSchema }),
	};
	return payload;
}
