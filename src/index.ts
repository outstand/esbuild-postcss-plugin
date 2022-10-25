import { Plugin, PluginBuild } from "esbuild";
import path from "path";
import { makeProcessCSS, makeProcessModuleCss } from "./postcss";
import { FakeCache, TransformCache } from "./transformCache";
import { PostCSSPlugin } from "./types";
import { Dependencies } from "./dependencies";

const virtualModuleExt = "postcss-module";
const virtualModuleFilter = new RegExp(`\.${virtualModuleExt}$`);

const postCSSPlugin: PostCSSPlugin = ({
  filter = /\.css$/,
  modulesOptions = {},
  modulesFilter = /\.module.css$/,
  plugins = [],
  processOptions = {},
  disableCache,
} = {}): Plugin => {
  return {
    name: "postcss-loader",
    setup(build: PluginBuild) {
      const cssMap = new Map();
      const cache = disableCache ? new FakeCache() : new TransformCache();
      const processCSS = makeProcessCSS(plugins, processOptions);
      const processModuleCss = makeProcessModuleCss(plugins, modulesOptions);

      build.onResolve({ filter: modulesFilter }, async (args) => {
        if (args.kind !== "import-rule") return;
        if (args.namespace === "postcss-resolve") return;

        const result = await build.resolve(args.path, {
          resolveDir: args.resolveDir,
          namespace: "postcss-resolve",
        });
        if (result.errors.length > 0) return { errors: result.errors };

        return {
          path: result.path,
          pluginData: { noModule: true },
        };
      });

      build.onLoad(
        { filter: modulesFilter },
        async ({ path: filePath, pluginData }) => {
          if (pluginData?.noModule) return;

          const [result, classes] = await cache.getOrTransform(filePath, (input) =>
            processModuleCss(input, filePath)
          );

          const deps = new Dependencies();
          deps.processMessages(result.messages);
          deps.addFile(filePath);

          const modulePath = `${filePath}.${virtualModuleExt}`;
          cssMap.set(modulePath, result.css);
          return {
            contents: makeCssModuleJs(modulePath, classes),
            loader: "js",
            resolveDir: path.dirname(filePath),
            watchFiles: deps.getFiles(),
            watchDirs: deps.getDirs(),
          };
        }
      );

      build.onLoad({ filter }, async ({ path: filePath }) => {
        const [result] = await cache.getOrTransform(filePath, (input) =>
          processCSS(input, filePath)
        );

        const deps = new Dependencies();
        deps.processMessages(result.messages);

        return {
          contents: result.css,
          loader: "css",
          resolveDir: path.dirname(filePath),
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

      build.onLoad(
        { filter: virtualModuleFilter, namespace: virtualModuleExt },
        (args) => {
          return {
            contents: cssMap.get(args.path),
            loader: "css",
            resolveDir: args.pluginData.resolveDir,
          };
        }
      );
    },
  };
};

export = postCSSPlugin;

const makeCssModuleJs = (
  modulePath: string,
  cssModulesJSON: unknown
) => `import '${modulePath}';
export default ${JSON.stringify(cssModulesJSON)};`;
