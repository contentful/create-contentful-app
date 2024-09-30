import inquirer from 'inquirer';
import { InstallationParameterType, ParameterDefinition } from 'contentful-management';
import { isNumber, isPlainObject, isString, uniq } from 'lodash';

const PARAMETER_ID_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const validateDefault = (input: string, type: string, options: string[]) => {
  if (input === '') return true;
  switch (type) {
    case 'Symbol':
      return isString(input) || 'Default value must be a string.';
    case 'Enum':
      if (!isString(input)) return 'Default value must be a string.';
      else if (options && !options.includes(input))
        return 'Default value must be one of the options.';
      return true;
    case 'Number':
      return isNumber(Number(input)) || 'Default value must be a number.';
    case 'Boolean':
      return input === 'true' || input === 'false' || 'Default value must be a boolean.';
    default:
      return true;
  }
};

const validateEnumOptions = (input: string[], type: string) => {
  if (type !== 'Enum') return true;
  const allString = input.every(isString);
  const allLabelled = input.every(isPlainObject);
  return allString || allLabelled || 'Options should be all strings or all label objects.';
};

async function promptForParameter(): Promise<
  ParameterDefinition & {
    instanceOrInstallation: 'Instance' | 'Installation';
    booleanLabels?: string;
    enumEmptyLabel?: string;
  }
> {
  const parameter = await inquirer.prompt([
    {
      name: 'instanceOrInstallation',
      message: 'Is this an Instance or an Installation parameter?',
      type: 'list',
      choices: ['Instance', 'Installation'],
    },
    {
      name: 'name',
      message: 'Parameter name:',
      validate(input) {
        return input ? true : 'Parameter name is required.';
      },
    },
    {
      name: 'id',
      message: 'Parameter ID:',
      validate(input) {
        if (!input) return 'Parameter ID is required.';
        else if (!PARAMETER_ID_RE.test(input))
          return 'Parameter ID must start with a letter and contain only letters, numbers, and underscores.';
        return true;
      },
    },
    {
      name: 'description',
      message: 'Parameter description (optional):',
    },
    {
      name: 'type',
      message: 'Parameter type:',
      type: 'list',
      choices(answers) {
        const parameterTypes = ['Boolean', 'Symbol', 'Number', 'Enum'];
        if (answers.instanceOrInstallation === 'Installation') {
          parameterTypes.push('Secret');
        }
        return parameterTypes;
      },
    },
    {
      name: 'required',
      message: 'Is this parameter required?',
      type: 'confirm',
      default: false,
    },
    {
      name: 'options',
      message: 'Parameter options (comma-separated) (optional):',
      when(answers) {
        return answers.type === 'Enum';
      },
      filter(input) {
        return input ? input.split(',').map((opt: string) => opt.trim()) : [];
      },
      validate(input, answers) {
        if (!input) return 'Options are required for Enum parameters.'
        return validateEnumOptions(input, answers.type);
      },
    },
    {
      name: 'default',
      message: 'Default value (leave blank if none):',
      when(answers) {
        return answers.type !== 'Secret';
      },
      validate(input, answers) {
        return validateDefault(input, answers.type, answers.options);
      },
    },
    {
      name: 'booleanLabels',
      message: 'Parameter labels (true/false comma-separated) (optional):',
      when(answers) {
        return answers.type === 'Boolean';
      },
      filter(input) {
        const labels = input ? input.split(',').map((label: string) => label.trim()) : [];
        return JSON.stringify({
          true: labels[0] || '',
          false: labels[1] || '',
        });
      },
    },
    {
      name: 'enumEmptyLabel',
      message: 'Empty label (optional):',
      filter(input) {
        return JSON.stringify({
          empty: input.trim(),
        });
      },
      when(answers) {
        return answers.type === 'Enum';
      },
    },
  ]);
  return parameter;
}

export async function buildAppParameterSettings() {
  const parameters: {
    instance: ParameterDefinition[];
    installation: ParameterDefinition<InstallationParameterType>[];
  } = {
    instance: [],
    installation: [],
  };

  let addMore = true;

  while (addMore) {
    try {
      const parameter = await promptForParameter();

      const labels = parameter.booleanLabels || parameter.enumEmptyLabel;

      parameters[parameter.instanceOrInstallation.toLowerCase() as keyof typeof parameters].push({
        id: parameter.id,
        name: parameter.name,
        description: parameter.description,
        type: parameter.type,
        required: parameter.required,
        default: parameter.default,
        options: parameter.options,
        labels: labels ? JSON.parse(labels) : undefined,
      });
    } catch (e) {
      console.error('Failed to build parameter', e);
    }

    const { addAnother } = await inquirer.prompt({
      name: 'addAnother',
      message: 'Do you want to add another parameter?',
      type: 'confirm',
      default: false,
    });

    addMore = addAnother;
  }

  if (uniq(parameters.instance.map((p) => p.id)).length !== parameters.instance.length) {
    console.log('Instance parameter IDs must be unique.');
    return buildAppParameterSettings();
  }

  if (uniq(parameters.installation.map((p) => p.id)).length !== parameters.installation.length) {
    console.log('Installation parameter IDs must be unique.');
    return buildAppParameterSettings();
  }

  return parameters;
}
