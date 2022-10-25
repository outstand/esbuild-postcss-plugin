import postcss, { AcceptedPlugin, Result } from "postcss";
import cssModules from "postcss-modules";
import { PostCSSProcessOptions } from "./types";

interface Processor {
  (input: string, filePath: string): Promise<
    [result: Result, classes?: Record<string, string>]
  >;
}

export const makeProcessCSS = (plugins: AcceptedPlugin[], processOptions: PostCSSProcessOptions): Processor => {
  const process = makeProcess(plugins, processOptions);
  return async (input: string, filePath: string) => {
    const result = await process(input, filePath);
    return [result];
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
    return [result, classes];
  };
};

function makeProcess(plugins: AcceptedPlugin[], processOptions?: PostCSSProcessOptions) {
  const processor = postcss(plugins);
  return (input: string, filePath: string) => {
    return processor.process(input, { ...processOptions, from: filePath, map: { inline: true } });
  }
}
