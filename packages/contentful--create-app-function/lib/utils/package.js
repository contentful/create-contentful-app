"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddBuildCommandFn = void 0;
const merge_options_1 = __importDefault(require("merge-options"));
function getAddBuildCommandFn({ name, command }) {
    return (packageJson, additionalProperties) => {
        let destBuildCommand = packageJson?.scripts?.build ?? '';
        const sourceBuildCommand = additionalProperties?.scripts?.build ?? command;
        const triggerCommand = `npm run ${name}`;
        if (destBuildCommand === '') {
            destBuildCommand = triggerCommand;
        }
        else if (!destBuildCommand.split(/\s*&+\s*/).includes(triggerCommand)) {
            destBuildCommand += ` && ${triggerCommand}`;
        }
        return (0, merge_options_1.default)({}, packageJson, additionalProperties, {
            scripts: { [name]: sourceBuildCommand, build: destBuildCommand },
        });
    };
}
exports.getAddBuildCommandFn = getAddBuildCommandFn;
