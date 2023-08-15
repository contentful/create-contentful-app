import mergeOptions from 'merge-options';

export type BuildCommandOptions = {
  name: string;
  command: string;
};

export function getAddBuildCommandFn({ name, command }: BuildCommandOptions) {
  return (
    packageJson?: Record<string, any>,
    additionalProperties?: Record<string, any>,
  ): Record<string, any> => {
    let buildCommand = packageJson?.scripts?.build ?? '';
    const triggerCommand = `npm run ${name}`;

    if (buildCommand === '') {
      buildCommand = triggerCommand;
    } else if (!buildCommand.split(/\s*&+\s*/).includes(triggerCommand)) {
      buildCommand += ` && ${triggerCommand}`;
    }

    return mergeOptions({}, packageJson, additionalProperties, {
      scripts: { [name]: command, build: buildCommand },
    });
  };
}
