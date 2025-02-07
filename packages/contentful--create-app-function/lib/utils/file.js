"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.mergeJsonIntoFile = exports.getJsonData = void 0;
const merge_options_1 = __importDefault(require("merge-options"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function getJsonData(path) {
    if (!path) {
        return undefined;
    }
    const normalizedPath = (0, path_1.resolve)(path);
    if (!(await exists(normalizedPath))) {
        return undefined;
    }
    return JSON.parse(await (0, promises_1.readFile)(normalizedPath, { encoding: 'utf-8' }));
}
exports.getJsonData = getJsonData;
async function mergeJsonIntoFile({ source, destination, mergeFn = merge_options_1.default.bind({ concatArrays: false }), }) {
    const sourceJson = await getJsonData(source);
    const destinationJson = await getJsonData(destination);
    const mergedJson = mergeFn(destinationJson, sourceJson);
    await (0, promises_1.writeFile)((0, path_1.resolve)(destination), JSON.stringify(mergedJson, null, '  '));
}
exports.mergeJsonIntoFile = mergeJsonIntoFile;
function exists(path) {
    return (0, promises_1.access)(path)
        .then(() => true)
        .catch(() => false);
}
exports.exists = exists;
