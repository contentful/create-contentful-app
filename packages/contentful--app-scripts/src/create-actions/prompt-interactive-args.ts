import { prompt } from 'inquirer';
import { DEFAULT_APP_MANIFEST_PATH } from '../constants';
import { CreateAppActionSettings } from './types';
import { getAppInfo } from '../get-app-info';

export async function promptCreateAppAction(
	options: Record<string, any>
): Promise<Required<CreateAppActionSettings>> {
	const { manifestFile, host } = options;
	const prompts = [];

	if (manifestFile === undefined) {
		prompts.push({
			type: 'input',
			name: 'manifestFile',
			message: `Path to your Contentful app manifest file:`,
			default: DEFAULT_APP_MANIFEST_PATH,
		});
	}

	if (!host) {
		prompts.push({
			name: 'host',
			message: `Contentful CMA endpoint URL:`,
			default: 'api.contentful.com',
		});
	}

	const { host: interactiveHost, manifestFile: interactiveManifest } = await prompt<{ host?: string; manifestFile?: string }>(prompts);
	const hostValue = host || interactiveHost;
	const manifestFileValue = manifestFile || interactiveManifest;
	const appInfo = await getAppInfo({ ...options, host: hostValue });

	return {
		host: hostValue,
		manifestFile: manifestFileValue,
		appDefinitionId: appInfo.definition.value,
		accessToken: appInfo.accessToken,
		organizationId: appInfo.organization.value,
	}
}
