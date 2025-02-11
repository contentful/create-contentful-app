import { bold, cyan, yellow } from 'chalk';
import { AppActionProps, CreateAppActionProps, createClient } from 'contentful-management';
import ora from 'ora';
import { resolveManifestFile, throwError } from '../utils';
import { makeAppActionCMAPayload } from './make-cma-payload';
import {
	CreateAppActionSettings
} from './types';
import { validateActionsManifest } from './validation';

export async function createAppActions(settings: Required<CreateAppActionSettings>) {
	const { accessToken, appDefinitionId, host, organizationId, manifestFile } = settings;
	const manifest = await resolveManifestFile({ manifestFile });
	const actions = validateActionsManifest(manifest);
	const spinner = ora('Creating your app action(s)').start();

	const client = createClient(
		{
			accessToken,
			host,
		},
		{
			type: 'plain',
			defaults: {
				organizationId,
			},
		}
	);

	for await (const action of actions) {
		const payload = makeAppActionCMAPayload(action);

		let appAction: AppActionProps;
		try {
			appAction = await client.appAction.create(
				{
					appDefinitionId,
				},
				payload as CreateAppActionProps
			);
		} catch (err: any) {
			throwError(err, `Something went wrong creating your app action ${action.name}.`);
		} finally {
			console.log(`
			${cyan('Success!')} Created your app action ${cyan(action.name)} for App ${cyan(
				appDefinitionId
			)} in Organization ${bold(organizationId)}.
			App Action ID: ${yellow(appAction!.sys.id)}`);
		}
	}
	spinner.stop();
}
