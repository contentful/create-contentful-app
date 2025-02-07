"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = void 0;
const logger_1 = require("./logger");
const types_1 = require("./types");
const MUTUALLY_EXCLUSIVE_OPTIONS = ['typescript', 'javascript'];
function normalizeOptions(options) {
    const normalizedOptions = { ...options };
    const currentMutuallyExclusiveOptions = MUTUALLY_EXCLUSIVE_OPTIONS.filter((option) => normalizedOptions[option]);
    if (normalizedOptions.typescript) {
        delete normalizedOptions.javascript;
    }
    else if (normalizedOptions.javascript) {
        delete normalizedOptions.typescript;
    }
    if (currentMutuallyExclusiveOptions.length > 1) {
        const paramsString = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(currentMutuallyExclusiveOptions.map((option) => (0, logger_1.highlight)(`--${option}`)));
        (0, logger_1.error)(`Options ${paramsString} are mutually exclusive. Use --help.`, types_1.InvalidCLIOptionsError);
    }
    return normalizedOptions;
}
exports.normalizeOptions = normalizeOptions;
