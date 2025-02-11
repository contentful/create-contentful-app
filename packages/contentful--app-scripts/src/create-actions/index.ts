import { createAppActions } from './create-actions';
import { getCreateAppActionsArgs } from './get-cli-args';
import { promptCreateAppAction } from './prompt-interactive-args';
import { type CreateAppActionSettings } from './types';

const interactive = async (options: CreateAppActionSettings) => {
	const settings = await promptCreateAppAction(options);
	await createAppActions(settings);
};

const nonInteractive = async (options: CreateAppActionSettings) => {
	const settings = await getCreateAppActionsArgs(options);
	await createAppActions(settings);
};

export const createActions = {
	interactive,
	nonInteractive,
};
