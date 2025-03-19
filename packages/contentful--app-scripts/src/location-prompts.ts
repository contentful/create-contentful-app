import { LocationsSettings } from "./types";

export const selectLocationsPrompt = {
    name: 'locations',
    message: `Select where your app can be rendered:`,
    type: 'checkbox',
    choices: [
      { name: 'App configuration screen ', value: 'app-config' },
      { name: 'Entry field', value: 'entry-field' },
      { name: 'Entry sidebar', value: 'entry-sidebar' },
      { name: 'Entry editor', value: 'entry-editor' },
      { name: 'Page', value: 'page' },
      { name: 'Home', value: 'home' },
    ],
  }

export const selectFieldsPrompt = {
    name: 'fields',
    message: 'Select the field types the app can be rendered:',
    type: 'checkbox',
    choices: [
        { name: 'Short text', value: { type: 'Symbol' } },
        { name: 'Short text, list', value: { type: 'Array', items: { type: 'Symbol' } } },
        { name: 'Long text', value: { type: 'Text' } },
        { name: 'Rich text', value: { type: 'RichText' } },
        { name: 'Number, integer', value: { type: 'Integer' } },
        { name: 'Number, decimal', value: { type: 'Number' } },
        { name: 'Date and time', value: { type: 'Date' } },
        { name: 'Location', value: { type: 'Location' } },
        { name: 'Boolean', value: { type: 'Boolean' } },
        { name: 'JSON object', value: { type: 'Object' } },
        { name: 'Entry reference', value: { type: 'Link', linkType: 'Entry' } },
        {
        name: 'Entry reference, list',
        value: {
            type: 'Array',
            items: {
            type: 'Link',
            linkType: 'Entry',
            },
        },
        },
        { name: 'Media reference', value: { type: 'Link', linkType: 'Asset' } },
        {
        name: 'Media reference, list',
        value: { type: 'Array', items: { type: 'Link', linkType: 'Asset' } },
        },
    ],
    when(answers: LocationsSettings) {
        return answers.locations.includes('entry-field');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(input: any) {
        if (input.length < 1) {
        return 'You must choose at least one field type.';
        }
        return true;
    },
}

export const pageNavPrompt = {
    name: 'pageNav',
    message: 'Page location: Would you like your page location to render in the main navigation?',
    type: 'confirm',
    default: false,
    when(answers: LocationsSettings) {
        return answers.locations.includes('page');
    },
    }

    export const pageNavLinkNamePrompt = {
    name: 'pageNavLinkName',
    message: 'Page location: Provide a name for the link in the main navigation:',
    when(answers: LocationsSettings) {
        return answers.locations.includes('page') && answers.pageNav;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(input: any) {
        if (input.length < 1 || input.length > 40) {
        return 'Size must be at least 1 and at most 40';
        }
        return true;
    },
}

export const pageNavLinkPathPrompt = {
    name: 'pageNavLinkPath',
    message:
        'Page location: Provide a path which starts with / and does not contain empty space:',
    default: '/',
    when(answers: LocationsSettings) {
      return answers.locations.includes('page') && answers.pageNav;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(input: any) {
      if (input.length > 512) {
        return 'Maximum 512 characters';
      }
      if (input.includes(' ')) {
        return 'Path cannot contain empty space';
      }
      if (!input.startsWith('/')) {
        return 'Path must start with /';
      }
      return true;
    },
}
