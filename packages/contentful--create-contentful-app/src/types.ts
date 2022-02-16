export type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  Js: boolean;
  Ts: boolean;
  source: string;
  example: string;
}>

export const ContentfulExample = {
  Javascript: 'javascript',
  Typescript: 'typescript'
};
