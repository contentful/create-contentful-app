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
    let destBuildCommand = packageJson?.scripts?.build ?? '';
    const sourceBuildCommand = additionalProperties?.scripts?.build ?? command;
    const triggerCommand = `npm run ${name}`;

    if (destBuildCommand === '') {
      destBuildCommand = triggerCommand;
    } else if (!destBuildCommand.split(/\s*&+\s*/).includes(triggerCommand)) {
      destBuildCommand += ` && ${triggerCommand}`;
    }

    return mergeOptions({}, packageJson, additionalProperties, {
      scripts: { [name]: sourceBuildCommand, build: destBuildCommand },
    });
  };
}
