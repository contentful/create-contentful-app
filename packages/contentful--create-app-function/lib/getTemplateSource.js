"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateSource = exports.makeContentfulExampleSource = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const types_1 = require("./types");
const logger_1 = require("./logger");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const getGithubFolderNames_1 = require("./getGithubFolderNames");
async function promptExampleSelection() {
    let template = 'typescript';
    // ask user whether to start with a blank template or use an example
    const { starter } = await inquirer_1.default.prompt([
        {
            name: 'starter',
            message: 'Do you want to start with a blank template or use one of our examples?',
            type: 'list',
            choices: [
                { name: 'Template', value: 'template' },
                { name: 'Example', value: 'example' },
            ],
            default: 'template',
        },
    ]);
    // if the user chose to use a template, ask which language they prefer
    if (starter === 'template') {
        const { language } = await inquirer_1.default.prompt([
            {
                name: 'language',
                message: 'Pick a template',
                type: 'list',
                choices: [
                    { name: 'TypeScript', value: 'typescript' },
                    { name: 'JavaScript', value: 'javascript' },
                    { name: 'Next.js', value: 'nextjs' },
                    { name: 'React + Vite', value: 'vite-react' },
                    { name: 'Vue', value: 'vue' },
                ],
                default: 'typescript',
            },
        ]);
        template = language;
    }
    else {
        // get available templates from examples
        const availableTemplates = await (0, getGithubFolderNames_1.getGithubFolderNames)();
        // filter out the ignored ones that are listed as templates instead of examples
        const filteredTemplates = availableTemplates.filter((template) => !constants_1.IGNORED_EXAMPLE_FOLDERS.includes(template));
        console.log(availableTemplates.length, filteredTemplates.length);
        // ask user to select a template from the available examples
        const { example } = await inquirer_1.default.prompt([
            {
                name: 'example',
                message: 'Select a template',
                type: 'list',
                choices: filteredTemplates,
            },
        ]);
        template = example;
    }
    // return the selected template
    return selectTemplate(template);
}
function selectTemplate(template) {
    (0, logger_1.wrapInBlanks)((0, logger_1.highlight)(`---- Cloning the ${chalk_1.default.cyan(template)} template...`));
    return constants_1.EXAMPLES_PATH + template;
}
async function makeContentfulExampleSource(options) {
    if (options.example) {
        // check to see if the example is valid
        const availableTemplates = await (0, getGithubFolderNames_1.getGithubFolderNames)();
        const isValidContentfulExample = availableTemplates.includes(options.example);
        if (!isValidContentfulExample) {
            throw new types_1.InvalidTemplateError(`${chalk_1.default.red(`Invalid template:`)} The example name ${(0, logger_1.highlight)(chalk_1.default.cyan(options.example))} is not valid. Please use one of Contentful's public example apps from ${(0, logger_1.highlight)(`https://github.com/contentful/apps/tree/master/examples`)}. Use the ${(0, logger_1.code)(`--example`)} option followed by the example name.`);
        }
        const templateSource = selectTemplate(options.example);
        return templateSource;
    }
    if (options.javascript) {
        return selectTemplate(types_1.ContentfulExample.Javascript);
    }
    if (options.typescript) {
        return selectTemplate(types_1.ContentfulExample.Typescript);
    }
    if (options.function || options.action) {
        return selectTemplate(types_1.ContentfulExample.Typescript);
    }
    return await promptExampleSelection();
}
exports.makeContentfulExampleSource = makeContentfulExampleSource;
async function getTemplateSource(options) {
    const source = options.source ?? (await makeContentfulExampleSource(options));
    if (options.source && !(0, utils_1.isContentfulTemplate)(source)) {
        (0, logger_1.warn)(`Template at ${(0, logger_1.highlight)(source)} is not an official Contentful app template!`);
    }
    return source;
}
exports.getTemplateSource = getTemplateSource;
