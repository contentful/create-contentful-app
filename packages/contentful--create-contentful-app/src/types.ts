export type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  Js: boolean;
  Ts: boolean;
  templateSource: string
}>

export const ContentfulTemplate = {
  Javascript: 'javascript',
  Typescript: 'typescript'
};
