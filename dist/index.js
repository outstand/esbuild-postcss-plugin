"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const postcss_1 = require("./postcss");
const transformCache_1 = require("./transformCache");
const dependencies_1 = require("./dependencies");
const virtualModuleExt = "postcss-module";
const virtualModuleFilter = new RegExp(`\.${virtualModuleExt}$`);
const postCSSPlugin = ({ filter = /\.css$/, modulesOptions = {}, modulesFilter = /\.module.css$/, plugins = [], processOptions = {}, disableCache, } = {}) => {
    return {
        name: "postcss-loader",
        setup(build) {
            const cssMap = new Map();
            const cache = disableCache ? new transformCache_1.FakeCache() : new transformCache_1.TransformCache();
            const processCSS = (0, postcss_1.makeProcessCSS)(plugins, processOptions);
            const processModuleCss = (0, postcss_1.makeProcessModuleCss)(plugins, modulesOptions);
            build.onResolve({ filter: modulesFilter }, async (args) => {
                if (args.kind !== "import-rule")
                    return;
                if (args.namespace === "postcss-resolve")
                    return;
                const result = await build.resolve(args.path, {
                    resolveDir: args.resolveDir,
                    namespace: "postcss-resolve",
                });
                if (result.errors.length > 0)
                    return { errors: result.errors };
                return {
                    path: result.path,
                    pluginData: { noModule: true },
                };
            });
            build.onLoad({ filter: modulesFilter }, async ({ path: filePath, pluginData }) => {
                if (pluginData?.noModule)
                    return;
                const [result, classes] = await cache.getOrTransform(filePath, (input) => processModuleCss(input, filePath));
                const deps = new dependencies_1.Dependencies();
                deps.processMessages(result.messages);
                deps.addFile(filePath);
                const modulePath = `${filePath}.${virtualModuleExt}`;
                cssMap.set(modulePath, result.css);
                return {
                    contents: makeCssModuleJs(modulePath, classes),
                    loader: "js",
                    resolveDir: path_1.default.dirname(filePath),
                    watchFiles: deps.getFiles(),
                    watchDirs: deps.getDirs(),
                };
            });
            build.onLoad({ filter }, async ({ path: filePath }) => {
                const [result] = await cache.getOrTransform(filePath, (input) => processCSS(input, filePath));
                const deps = new dependencies_1.Dependencies();
                deps.processMessages(result.messages);
                return {
                    contents: result.css,
                    loader: "css",
                    resolveDir: path_1.default.dirname(filePath),
                    watchFiles: deps.getFiles(),
                    watchDirs: deps.getDirs(),
                };
            });
            build.onResolve({ filter: virtualModuleFilter }, (args) => {
                return {
                    path: args.path,
                    namespace: virtualModuleExt,
                    pluginData: { resolveDir: args.resolveDir },
                };
            });
            build.onLoad({ filter: virtualModuleFilter, namespace: virtualModuleExt }, (args) => {
                return {
                    contents: cssMap.get(args.path),
                    loader: "css",
                    resolveDir: args.pluginData.resolveDir,
                };
            });
        },
    };
};
const makeCssModuleJs = (modulePath, cssModulesJSON) => `import '${modulePath}';
export default ${JSON.stringify(cssModulesJSON)};`;
module.exports = postCSSPlugin;
