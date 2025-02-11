import { yellow } from 'chalk';
import { CreateAppActionProps, createClient, PlainClientAPI } from 'contentful-management';
import fs from 'node:fs';
import ora from 'ora';
import { resolveManifestFile, throwError } from '../utils';
import { createAction, getExistingAction, updateAction } from './client';
import { makeAppActionCMAPayload } from './make-cma-payload';
import { AppActionManifest, CreateAppActionPayload, CreateAppActionSettings } from './types';
import { validateActionsManifest } from './validation';

export async function doUpsert(
	client: PlainClientAPI,
	appDefinitionId: string,
	payload: CreateAppActionPayload
) {
	if (payload.id) {
		const existingAction = await getExistingAction(client, appDefinitionId, payload.id);
		if (existingAction) {
			return await updateAction(
				client,
				appDefinitionId,
				payload.id,
				payload as CreateAppActionProps
			);
		} else if (!existingAction && payload.type === 'endpoint') {
			throw new Error(
				`Action with id ${payload.id} not found. Endpoint actions may not set a custom ID.`
			);
		}
	}
	return await createAction(client, appDefinitionId, payload as CreateAppActionProps);
}

function syncRemoteDataToManifest(
	manifestActions: AppActionManifest[],
	actionsToSync: AppActionManifest[],
	manifest: Record<string, any>,
	manifestFile: string
) {
	const dedupedActionsToSync = manifestActions
		.filter((action) => !actionsToSync.find((a) => a.name === action.name))
		.concat(actionsToSync);

	fs.writeFileSync(
		manifestFile,
		JSON.stringify({ ...manifest, actions: dedupedActionsToSync }, null, 2)
	);
	console.log(`Remote updates synced to your manifest file at ${yellow(manifestFile)}.`);
}

export async function upsertAppActions(settings: Required<CreateAppActionSettings>) {
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

	const actionsToSync: AppActionManifest[] = [];
	const errors: { details: any; path: (string | number)[] }[] = [];
	for (const i in actions) {
		const action = actions[i];
		const payload = makeAppActionCMAPayload(action);

		try {
			const appAction = await doUpsert(client, appDefinitionId, payload);
			actionsToSync.push({
				...action,
				id: appAction.sys.id,
			});
		} catch (err: any) {
			errors.push({ details: err, path: ['actions', i] });
		}
	}

	syncRemoteDataToManifest(actions, actionsToSync, manifest, manifestFile);

	if (errors.length) {
		const error = new Error(
			JSON.stringify({
				message: 'Something went wrong while syncing your actions manifest to Contentful',
				details: errors,
			})
		);
		throwError(error, 'Failed to upsert actions');
	}

	spinner.stop();
}
