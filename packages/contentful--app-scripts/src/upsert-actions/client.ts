import { cyan } from 'chalk';
import { AppActionProps, CreateAppActionProps, PlainClientAPI } from 'contentful-management';

export async function createAction(
	client: PlainClientAPI,
	appDefinitionId: string,
	payload: CreateAppActionProps
) {
	const action = await client.appAction.create(
		{
			appDefinitionId,
		},
		payload
	);
	console.log(`
			${cyan('Success!')} Created Action ${cyan(action.name)} with ID ${cyan(
		action.sys.id
	)} for App ${cyan(appDefinitionId)}.`);
	return action;
}

export async function getExistingAction(
	client: PlainClientAPI,
	appDefinitionId: string,
	appActionId: string
) {
	try {
		return await client.appAction.get({
			appDefinitionId,
			appActionId,
		});
	} catch (err: any) {
		if (err.name === 'NotFound') {
			return null;
		}
		throw err;
	}
}

export async function updateAction(
	client: PlainClientAPI,
	appDefinitionId: string,
	appActionId: string,
	payload: CreateAppActionProps
): Promise<AppActionProps> {
	const action = await client.appAction.update(
		{
			appDefinitionId,
			appActionId,
		},
		payload
	);
	console.log(`
			${cyan('Success!')} Updated Action ${cyan(action.name)} with ID ${cyan(appActionId)} for App ${cyan(
		appDefinitionId
	)}.`);
	return action;
}