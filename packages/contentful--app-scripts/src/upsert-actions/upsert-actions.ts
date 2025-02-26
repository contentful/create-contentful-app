import { yellow } from 'chalk';
import { AppActionProps, CreateAppActionProps, createClient, PlainClientAPI } from 'contentful-management';
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
): Promise<AppActionProps> {
	if (payload.id) {
		const existingAction = await getExistingAction(client, appDefinitionId, payload.id);
		if (existingAction) {
			const { id, ...update } = payload;
			return updateAction(
				client,
				appDefinitionId,
				id,
				update as CreateAppActionProps
			);
		} else if (!existingAction && payload.type === 'endpoint') {
			throw new Error(
				`Action with id ${payload.id} not found. Endpoint actions may not set a custom ID.`
			);
		}
	}
	return createAction(client, appDefinitionId, payload as CreateAppActionProps);
}

export function syncUpsertToManifest(
	manifestActions: AppActionManifest[],
	actionsToSync: { [i: number]: AppActionManifest },
	manifest: Record<string, any>,
	manifestFile: string
) {
	const actions = manifestActions.map((action, i) => {
		const syncedAction = actionsToSync[i];
		return syncedAction || action;
	});

	fs.writeFileSync(
		manifestFile,
		JSON.stringify({ ...manifest, actions }, null, 2)
	);
	console.log(`Remote updates synced to your manifest file at ${yellow(manifestFile)}.`);
}

export async function processActionManifests(actions: AppActionManifest[], doUpsert: (payload: CreateAppActionPayload) => Promise<AppActionProps>) {
	const actionsToSync: { [i: number]: AppActionManifest } = {}
	const errors: { details: any; path: (string | number)[] }[] = [];
	for (const i in actions) {
		const action = actions[i];
		const payload = makeAppActionCMAPayload(action);

		try {
			const appAction = await doUpsert(payload);
			actionsToSync[i] = {
				...action,
				id: appAction.sys.id,
			};
		} catch (err: any) {
			errors.push({ details: err, path: ['actions', i] });
		}
	}

	return { actionsToSync, errors };
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

	const { actionsToSync, errors } = await processActionManifests(actions, async (payload) => doUpsert(client, appDefinitionId, payload));

	syncUpsertToManifest(actions, actionsToSync, manifest, manifestFile);

	if (errors.length) {
		const error = new Error(
			`Failed to upsert actions`
		);
		Object.assign(error, { details: errors.map(({ details }) => details) });
		throwError(error, 'Failed to upsert actions');
	}

	spinner.stop();
}
