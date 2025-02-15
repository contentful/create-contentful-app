"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPResponseError = exports.InvalidTemplateError = exports.InvalidCLIOptionsError = void 0;
class InvalidCLIOptionsError extends Error {
}
exports.InvalidCLIOptionsError = InvalidCLIOptionsError;
class InvalidTemplateError extends Error {
}
exports.InvalidTemplateError = InvalidTemplateError;
class HTTPResponseError extends Error {
}
exports.HTTPResponseError = HTTPResponseError;
