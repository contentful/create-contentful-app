export type BuildCommandOptions = {
  name: string,
  command: string,
}

export function getAddBuildCommandFn({name, command}: BuildCommandOptions) {
  return (packageJson?: Record<string, any>): Record<string, any> => {
    let buildCommand = packageJson?.scripts?.build ?? ''
    const triggerCommand = `npm run ${name}`

    if (buildCommand === '') {
      buildCommand = triggerCommand
    } else if (!(new RegExp(`(^|&)\\s*${command}\\s*($|&)`).test(buildCommand))) {
      buildCommand += `&& ${triggerCommand}`
    }

    return {
      ...packageJson,
      scripts: {
        ...packageJson?.scripts,
        [name]: command,
        build: buildCommand,
      }
    }

  }
}
