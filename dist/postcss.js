"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProcessModuleCss = exports.makeProcessCSS = void 0;
const postcss_1 = __importDefault(require("postcss"));
const postcss_modules_1 = __importDefault(require("postcss-modules"));
const makeProcessCSS = (plugins, processOptions) => {
    const process = makeProcess(plugins, processOptions);
    return async (input, filePath) => {
        const result = await process(input, filePath);
        return [result];
    };
};
exports.makeProcessCSS = makeProcessCSS;
const makeProcessModuleCss = (plugins, modulesConfig = {}) => {
    let classes = {};
    const process = makeProcess([
        ...plugins,
        (0, postcss_modules_1.default)({
            ...modulesConfig,
            getJSON(cssSourceFile, json) {
                Object.assign(classes, json);
            },
        }),
    ]);
    return async (input, filePath) => {
        classes = {};
        const result = await process(input, filePath);
        return [result, classes];
    };
};
exports.makeProcessModuleCss = makeProcessModuleCss;
function makeProcess(plugins, processOptions) {
    const processor = (0, postcss_1.default)(plugins);
    return (input, filePath) => {
        return processor.process(input, { ...processOptions, from: filePath, map: { inline: true } });
    };
}
