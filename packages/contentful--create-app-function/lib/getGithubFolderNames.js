"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubFolderNames = exports.CONTENTFUL_APPS_EXAMPLE_FOLDER = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const types_1 = require("./types");
const chalk_1 = __importDefault(require("chalk"));
exports.CONTENTFUL_APPS_EXAMPLE_FOLDER = 'https://api.github.com/repos/contentful/apps/contents/examples';
async function getGithubFolderNames() {
    try {
        const response = await (0, node_fetch_1.default)(exports.CONTENTFUL_APPS_EXAMPLE_FOLDER);
        if (!response.ok) {
            throw new types_1.HTTPResponseError(`${chalk_1.default.red('Error:')} Failed to fetch Contentful app templates: ${response.status} ${response.statusText}`);
        }
        const contents = await response.json();
        const filteredContents = contents.filter((content) => content.type === 'dir');
        return filteredContents.map((content) => content.name);
    }
    catch (err) {
        if (err instanceof types_1.HTTPResponseError) {
            throw err;
        }
        else {
            throw new Error(`Failed to fetch Contentful app templates: ${err}`);
        }
    }
}
exports.getGithubFolderNames = getGithubFolderNames;
