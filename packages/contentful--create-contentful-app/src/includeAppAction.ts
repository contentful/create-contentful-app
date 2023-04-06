import inquirer from 'inquirer';
import { cloneTemplateIn } from './template';

type PromptIncludeAppAction = ({
  fullAppFolder,
  templateSource,
}: {
  fullAppFolder: string;
  templateSource: string;
}) => void;

export const promptIncludeAppAction: PromptIncludeAppAction = async ({
  fullAppFolder,
  templateSource,
}) => {
  const { includeAppAction } = await inquirer.prompt([
    {
      name: 'includeAppAction',
      message: 'Do you want to include a hosted app action?',
      type: 'confirm',
      default: false,
    },
  ]);

  const isTypescript = templateSource.includes('typescript');

  // resolve action path here
  const actionPath = '';

  // put app action into the template
  if (includeAppAction) {
    cloneTemplateIn(`${fullAppFolder}/actions`, actionPath);
  }
};
