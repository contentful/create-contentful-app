"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptIncludeActionInTemplate = exports.cloneAppAction = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const constants_1 = require("./constants");
const tiged_1 = __importDefault(require("tiged"));
const logger_1 = require("./logger");
const package_1 = require("./utils/package");
const file_1 = require("./utils/file");
const addBuildCommand = (0, package_1.getAddBuildCommandFn)({
    name: 'build:actions',
    command: 'node build-actions.js',
});
async function cloneAppAction(destination, templateIsJavascript) {
    try {
        console.log((0, logger_1.highlight)('---- Cloning hosted app action.'));
        // Clone the app actions template to the created directory under the folder 'actions'
        const templateSource = (0, path_1.join)('contentful/apps/examples/hosted-app-action-templates', templateIsJavascript ? 'javascript' : 'typescript');
        const appActionDirectoryPath = (0, path_1.resolve)(`${destination}/actions`);
        const d = await (0, tiged_1.default)(templateSource, { mode: 'tar', disableCache: true });
        await d.clone(appActionDirectoryPath);
        // move the manifest from the actions folder to the root folder
        const writeAppManifest = await (0, file_1.mergeJsonIntoFile)({
            source: `${appActionDirectoryPath}/${constants_1.CONTENTFUL_APP_MANIFEST}`,
            destination: `${destination}/${constants_1.CONTENTFUL_APP_MANIFEST}`,
        });
        // move the build file from the actions folder to the root folder
        const copyBuildFile = await (0, promises_1.rename)(`${appActionDirectoryPath}/build-actions.js`, `${destination}/build-actions.js`);
        // modify package.json build commands
        const packageJsonLocation = (0, path_1.resolve)(`${destination}/package.json`);
        const packageJsonExists = await (0, file_1.exists)(packageJsonLocation);
        if (!packageJsonExists) {
            console.error(`Failed to add app action build commands: ${packageJsonLocation} does not exist.`);
            return;
        }
        const writeBuildCommand = await (0, file_1.mergeJsonIntoFile)({
            source: `${appActionDirectoryPath}/package.json`,
            destination: packageJsonLocation,
            mergeFn: addBuildCommand,
        });
        await Promise.all([writeAppManifest, copyBuildFile, writeBuildCommand]);
        await d.remove(appActionDirectoryPath, destination, { action: 'remove', files: constants_1.IGNORED_CLONED_FILES.map(fileName => `${appActionDirectoryPath}/${fileName}`) });
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
}
exports.cloneAppAction = cloneAppAction;
const promptIncludeActionInTemplate = async ({ fullAppFolder, templateSource, }) => {
    const { includeAppAction } = await inquirer_1.default.prompt([
        {
            name: 'includeAppAction',
            message: 'Do you want to include a hosted app action?',
            type: 'confirm',
            default: false,
        },
    ]);
    // put app action into the template
    if (includeAppAction) {
        const templateIsTypescript = templateSource.includes('typescript');
        cloneAppAction(fullAppFolder, templateIsTypescript);
    }
};
exports.promptIncludeActionInTemplate = promptIncludeActionInTemplate;
