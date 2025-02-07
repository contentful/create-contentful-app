#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const commander_1 = require("commander");
const tildify_1 = __importDefault(require("tildify"));
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const chalk_1 = __importDefault(require("chalk"));
const includeFunction_1 = require("./includeFunction");
function successMessage(folder) {
    console.log(`
${(0, logger_1.success)('Success!')} You've added functions to your Contentful app in ${(0, logger_1.highlight)((0, tildify_1.default)(folder))}.`);
    (0, logger_1.wrapInBlanks)((0, logger_1.highlight)('---- Next Steps'));
    console.log(`Now, build and upload your app bundle to Contentful:

    ${(0, logger_1.code)('npm run build && npm run upload')}
  `);
}
async function initProject(appName, options) {
    const normalizedOptions = (0, utils_1.normalizeOptions)(options);
    try {
        const fullAppFolder = (0, path_1.resolve)(process.cwd());
        console.log(`Adding functions folder and ${(0, logger_1.highlight)('contentful-app-manifest.json')}`);
        await (0, includeFunction_1.cloneFunction)(fullAppFolder, !!normalizedOptions.javascript, "appevent-handler");
        successMessage(fullAppFolder);
    }
    catch (err) {
        (0, logger_1.error)(`Failed to create ${(0, logger_1.highlight)(chalk_1.default.cyan(appName))}`, err);
        process.exit(1);
    }
}
(async function main() {
    commander_1.program
        .name(`npx ${(0, logger_1.code)('contentful-app-functions')}`)
        .helpOption(true, 'shows all available CLI options')
        .description([
        'Add a function to your Contentful app.',
        '',
        (0, logger_1.code)('  contentful-app-functions --create `my-function`'),
        '',
    ].join('\n'))
        .option('-javascript, --javascript', 'use JavaScript template')
        .option('-typescript, --typescript', 'use TypeScript template (default)')
        .action(initProject);
    await commander_1.program.parseAsync();
})();
