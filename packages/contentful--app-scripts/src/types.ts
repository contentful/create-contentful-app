import { Definition } from './definition-api';
import { Organization } from './organization-api';

export interface ContentfulFunction {
  id: string;
  name: string;
  description: string;
  path: string;
  accepts: string[];
  allowNetworks?: string[];
  entryFile?: string;
}

export interface ActivateOptions {
  bundleId: string;
  organizationId?: string;
  definitionId?: string;
  token?: string;
  host?: string;
}

export interface ActivateSettings {
  bundleId: string;
  organization: Organization;
  definition: Definition;
  accessToken: string;
  host?: string;
}

export interface CleanupOptions {
  organizationId?: string;
  definitionId?: string;
  token?: string;
  host?: string;
  keep?: string;
}

export interface CleanupSettings {
  keep: number;
  host?: string;
  accessToken: string;
  organization: Organization;
  definition: Definition;
}

export interface OpenSettingsOptions {
  definitionId?: string;
  host?: string;
}

export interface InstallOptions {
  definitionId?: string;
  host?: string;
}

export interface UploadOptions {
  organizationId?: string;
  definitionId?: string;
  token?: string;
  bundleDir?: string;
  comment?: string;
  skipActivation?: boolean;
  host?: string;
  userAgentApplication?: string;
}

export interface UploadSettings {
  organization: Organization;
  definition: Definition;
  accessToken: string;
  comment?: string;
  bundleDirectory: string;
  skipActivation?: boolean;
  userAgentApplication?: string;
  host?: string;
  functions?: ContentfulFunction[];
}

export interface BuildFunctionsOptions {
  manifestFile?: string;
  esbuildConfig?: string;
  watch?: boolean;
}

export type SourceType = 'template' | 'example';
export type Language = 'javascript' | 'typescript';
export type AcceptedFunctionExamples = 'appevent-handler'; // Union type of each accepted example folder name in apps/function-examples repo
export type SourceName = Language | AcceptedFunctionExamples;

export interface GenerateFunctionSettings {
  name: string;
  sourceType: SourceType;
  sourceName: SourceName;
  language: Language;
}

export type GenerateFunctionOptions = {
  name: string;
} & ({
  example: AcceptedFunctionExamples;
  language: Language
} | {
  template: Language;
})
