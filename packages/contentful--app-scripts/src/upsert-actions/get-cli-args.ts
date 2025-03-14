import chalk from "chalk";
import ora from "ora";
import { getAppInfo } from "../get-app-info";
import { validateArguments } from "../validate-arguments";
import { CreateAppActionSettings } from "./types";
import { DEFAULT_APP_MANIFEST_PATH } from "../constants";

const requiredOptions = {
	organizationId: '--organization-id',
	definitionId: '--definition-id',
	token: '--token',
};

export async function getCreateAppActionsArgs(
	settings: Record<string, any>,
): Promise<Required<CreateAppActionSettings>> {
	const validateSpinner = ora('Validating your input').start();

	try {
		validateArguments(requiredOptions, settings, 'upsert-actions');
		const appInfo = await getAppInfo(settings);
		return {
			host: settings.host || 'api.contentful.com',
			manifestFile: settings.manifestFile || DEFAULT_APP_MANIFEST_PATH,
			accessToken: settings.token,
			appDefinitionId: appInfo.definition.value,
			organizationId: appInfo.organization.value,
		};
	} catch (err: any) {
		console.log(`
			${chalk.red('Validation failed')}
			${err.message}
		`);
		// eslint-disable-next-line no-process-exit
		process.exit(1);
	} finally {
		validateSpinner.stop();
	}
}