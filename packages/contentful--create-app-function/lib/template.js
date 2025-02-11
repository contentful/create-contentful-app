"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneTemplateIn = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const tiged_1 = __importDefault(require("tiged"));
const rimraf = __importStar(require("rimraf"));
const logger_1 = require("./logger");
const utils_1 = require("./utils");
async function clone(source, destination) {
    const d = (0, tiged_1.default)(source, { mode: 'tar', disableCache: true });
    try {
        await d.clone(destination);
    }
    catch (e) {
        if (e.code === 'DEST_NOT_EMPTY') {
            // In this case, we know that tiged will suggest users
            // provide a 'force' flag - this is a flag for tiged though
            // and not CCA. So we swallow the details of this error
            // to avoid confusing people.
            throw new Error('Destination directory is not empty.');
        }
        throw e;
    }
}
function validate(destination) {
    const packageJSONLocation = `${destination}/package.json`;
    if (!(0, fs_1.existsSync)(packageJSONLocation)) {
        throw new Error(`Invalid template: missing "${packageJSONLocation}".`);
    }
    try {
        JSON.parse((0, fs_1.readFileSync)(packageJSONLocation, 'utf-8'));
    }
    catch (e) {
        throw new Error(`Invalid template: invalid ${packageJSONLocation}.`);
    }
}
function cleanUp(destination) {
    (0, utils_1.rmIfExists)((0, path_1.resolve)(destination, 'package-lock.json'));
    (0, utils_1.rmIfExists)((0, path_1.resolve)(destination, 'yarn.lock'));
}
async function cloneTemplateIn(destination, source) {
    await clone(source, destination);
    try {
        validate(destination);
    }
    catch (e) {
        // cleanup in case of invalid example
        rimraf.sync(destination);
        throw e;
    }
    cleanUp(destination);
    console.log((0, logger_1.success)('Done!'));
}
exports.cloneTemplateIn = cloneTemplateIn;
