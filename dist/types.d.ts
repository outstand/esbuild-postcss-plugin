import { Plugin } from "esbuild";
import { AcceptedPlugin, ProcessOptions } from "postcss";
declare type PostCSSPluginOptions = {
    baseUrl?: string;
    filter?: RegExp;
    modulesFilter?: RegExp;
    modulesOptions?: ModulesOptions;
    plugins?: AcceptedPlugin[];
    processOptions?: PostCSSProcessOptions;
    disableCache?: true;
};
export declare type PostCSSPlugin = (options?: PostCSSPluginOptions) => Plugin;
export declare type PostCSSProcessOptions = Omit<ProcessOptions, "from" | "to">;
declare type GenerateScopedNameFunction = (name: string, filename: string, css: string) => string;
declare type LocalsConventionFunction = (originalClassName: string, generatedClassName: string, inputFile: string) => string;
export interface ModulesOptions {
    getJSON?(cssFilename: string, json: {
        [name: string]: string;
    }, outputFilename?: string): void;
    localsConvention?: "camelCase" | "camelCaseOnly" | "dashes" | "dashesOnly" | LocalsConventionFunction;
    scopeBehaviour?: "global" | "local";
    globalModulePaths?: RegExp[];
    generateScopedName?: string | GenerateScopedNameFunction;
    hashPrefix?: string;
    exportGlobals?: boolean;
}
export {};
