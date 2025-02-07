"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.code = exports.success = exports.choice = exports.highlight = exports.wrapInBlanks = exports.error = void 0;
const chalk_1 = __importDefault(require("chalk"));
const types_1 = require("./types");
function error(message, error) {
    console.log(`${chalk_1.default.red('Error:')} ${message}`);
    if (error === undefined) {
        return;
    }
    else if (error instanceof types_1.InvalidTemplateError || error instanceof types_1.HTTPResponseError) {
        // for known errors, we just want to show the message
        console.log();
        console.log(error.message);
    }
    else if (error instanceof Error) {
        console.log();
        console.log(error);
    }
    else {
        const strigifiedError = String(error);
        console.log();
        console.log(`${strigifiedError.startsWith('Error: ') ? strigifiedError.substring(7) : strigifiedError}`);
    }
}
exports.error = error;
function wrapInBlanks(message) {
    console.log(' ');
    console.log(message);
    console.log(' ');
}
exports.wrapInBlanks = wrapInBlanks;
function highlight(str) {
    return chalk_1.default.bold(str);
}
exports.highlight = highlight;
function choice(str) {
    return chalk_1.default.cyan(str);
}
exports.choice = choice;
function success(str) {
    return chalk_1.default.greenBright(str);
}
exports.success = success;
function code(str) {
    return chalk_1.default.bold(str);
}
exports.code = code;
