"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneFunction = exports.functionTemplateFromName = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = require("path");
const rimraf_1 = require("rimraf");
const tiged_1 = __importDefault(require("tiged"));
const constants_1 = require("./constants");
const logger_1 = require("./logger");
const types_1 = require("./types");
const file_1 = require("./utils/file");
const package_1 = require("./utils/package");
// TODO: after appActions work we can change this getAddBuildCommandFn params from command -> defaultCommand as examples will have build commands
const addBuildCommand = (0, package_1.getAddBuildCommandFn)({
    name: 'build:functions',
    command: 'contentful-app-scripts build-functions --ci',
});
const VALID_FUNCTION_TEMPLATES_DIRS = [
    'appevent-filter',
    'appevent-handler',
    'appevent-transformation',
    'external-references',
    'comment-bot',
];
function functionTemplateFromName(functionName, destination) {
    let dirName = functionName;
    if (!VALID_FUNCTION_TEMPLATES_DIRS.includes(dirName)) {
        // cleanup in case of invalid example
        rimraf_1.rimraf.sync(destination);
        throw new types_1.InvalidTemplateError(`${chalk_1.default.red(`Invalid function template:`)} The function name ${(0, logger_1.highlight)(chalk_1.default.cyan(functionName))} is not valid. Must be one of: ${(0, logger_1.highlight)(VALID_FUNCTION_TEMPLATES_DIRS.join(', '))}.`);
    }
    if (functionName === 'external-references')
        dirName = 'templates'; // backwards compatible for the apps repo examples folder for delivery functions (external-references)
    return dirName;
}
exports.functionTemplateFromName = functionTemplateFromName;
async function cloneFunction(destination, templateIsJavascript, functionName) {
    try {
        console.log((0, logger_1.highlight)(`---- Cloning function ${chalk_1.default.cyan(functionName)}...`));
        // Clone the function template to the created directory under the folder 'actions'
        const templateSource = (0, path_1.join)(`contentful/apps/examples/function-${functionTemplateFromName(functionName, destination)}`, templateIsJavascript ? 'javascript' : 'typescript');
        const functionDirectoryPath = (0, path_1.resolve)(`${destination}/functions`);
        const d = (0, tiged_1.default)(templateSource, { mode: 'tar', disableCache: true });
        await d.clone(functionDirectoryPath);
        // merge the manifest from the template folder to the root folder
        let writeAppManifest;
        const appManifestExists = await (0, file_1.exists)(`${destination}/${constants_1.CONTENTFUL_APP_MANIFEST}`);
        // modify package.json build commands
        const packageJsonLocation = (0, path_1.resolve)(`${destination}/package.json`);
        const packageJsonExists = await (0, file_1.exists)(packageJsonLocation);
        if (!packageJsonExists) {
            throw new Error(`Failed to add function build commands: ${packageJsonLocation} does not exist.`);
        }
        let writeBuildCommand;
        if (!appManifestExists) {
            writeAppManifest = (0, file_1.mergeJsonIntoFile)({
                source: `${functionDirectoryPath}/${constants_1.CONTENTFUL_APP_MANIFEST}`,
                destination: `${destination}/${constants_1.CONTENTFUL_APP_MANIFEST}`,
            });
            writeBuildCommand = (0, file_1.mergeJsonIntoFile)({
                source: `${functionDirectoryPath}/package.json`,
                destination: packageJsonLocation,
                mergeFn: addBuildCommand,
            });
        }
        await Promise.all([writeAppManifest, writeBuildCommand]);
        await d.remove(functionDirectoryPath, destination, {
            action: 'remove',
            files: constants_1.IGNORED_CLONED_FILES.map((fileName) => `${functionDirectoryPath}/${fileName}`),
        });
    }
    catch (e) {
        (0, logger_1.error)(`Failed to clone function ${(0, logger_1.highlight)(chalk_1.default.cyan(functionName))}`, e);
        process.exit(1);
    }
}
exports.cloneFunction = cloneFunction;
