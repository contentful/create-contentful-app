import { upsertAppActions } from './upsert-actions';
import { getCreateAppActionsArgs } from './get-cli-args';
import { promptCreateAppAction } from './prompt-interactive-args';
import { type CreateAppActionSettings } from './types';

const interactive = async (options: CreateAppActionSettings) => {
	const settings = await promptCreateAppAction(options);
	await upsertAppActions(settings);
};

const nonInteractive = async (options: CreateAppActionSettings) => {
	const settings = await getCreateAppActionsArgs(options);
	await upsertAppActions(settings);
};

export const upsertActions = {
	interactive,
	nonInteractive,
};
