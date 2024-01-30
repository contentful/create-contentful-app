export type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  javascript: boolean;
  typescript: boolean;
  source: string;
  example: string;
  action: boolean;
  function: boolean;
}>;

export const ContentfulExample = {
  Javascript: 'javascript',
  Typescript: 'typescript',
};
