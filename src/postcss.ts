import postcss, { AcceptedPlugin } from "postcss";
import cssModules from "postcss-modules";
import { PostCSSProcessOptions } from "./types";

interface Processor {
  (input: string, filePath: string): Promise<
    [css: string, classes?: Record<string, string>]
  >;
}

export const makeProcessCSS = (plugins: AcceptedPlugin[], processOptions: PostCSSProcessOptions): Processor => {
  if (plugins.length === 0) return (input: string) => Promise.resolve([input]);

  const process = makeProcess(plugins, processOptions);
  return async (input: string, filePath: string) => {
    const result = await process(input, filePath);
    return [result.css];
  };
};

export const makeProcessModuleCss = (
  plugins: AcceptedPlugin[],
  modulesConfig = {}
): Processor => {
  let classes = {};
  const process = makeProcess([
    ...plugins,
    cssModules({
      ...modulesConfig,
      getJSON(cssSourceFile, json) {
        Object.assign(classes, json);
      },
    }),
  ]);

  return async (input: string, filePath: string) => {
    classes = {};
    const result = await process(input, filePath);
    return [result.css, classes];
  };
};

function makeProcess(plugins: AcceptedPlugin[], processOptions?: PostCSSProcessOptions) {
  const processor = postcss(plugins);
  return (input: string, filePath: string) =>
    processor.process(input, { ...processOptions, from: filePath, map: false });
}
