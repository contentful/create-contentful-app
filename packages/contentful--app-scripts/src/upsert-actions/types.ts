import { AppActionCategoryType, AppActionParameterDefinition, CreateAppActionProps } from "contentful-management";

export type BaseAppActionProps = {
	id?: string;
	name: string;
	description?: string;
}
export type FunctionAppActionManifestProps = {
	type: 'function-invocation';
	functionId: string;
}
export type EndpointAppActionProps = {
	type: 'endpoint';
	url: string;
}
export type CustomCategoryAppActionProps = {
	category: 'Custom';
	parameters: AppActionParameterDefinition[];
}
export type BuiltInCategoryAppActionProps = {
	category: Omit<AppActionCategoryType, 'Custom'>;
}
type CategoryProps = CustomCategoryAppActionProps | BuiltInCategoryAppActionProps;

export type FunctionAppActionProps = {
	id?: string;
	type: 'function-invocation';
	function: {
		sys: {
			id: string;
			linkType: string;
			type: string;
		}
	}
}

export type AppActionManifest = BaseAppActionProps & (FunctionAppActionManifestProps | EndpointAppActionProps) & CategoryProps;
export type CreateAppActionPayload = BaseAppActionProps & (FunctionAppActionProps | EndpointAppActionProps) & CategoryProps;

export type AppActionToCreate = {
	actions: AppActionManifest[];
}

export type CreateAppActionOptions = AppActionToCreate & {
	organizationId: string;
	appDefinitionId: string;
	accessToken: string;
	host: string;
};

export type CreateAppActionSettings = {
	manifestFile?: string;
	organizationId?: string;
	appDefinitionId?: string;
	accessToken?: string;
	host?: string;
}