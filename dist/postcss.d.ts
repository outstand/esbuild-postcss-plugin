import { AcceptedPlugin, Result } from "postcss";
import { PostCSSProcessOptions } from "./types";
interface Processor {
    (input: string, filePath: string): Promise<[
        result: Result,
        classes?: Record<string, string>
    ]>;
}
export declare const makeProcessCSS: (plugins: AcceptedPlugin[], processOptions: PostCSSProcessOptions) => Processor;
export declare const makeProcessModuleCss: (plugins: AcceptedPlugin[], modulesConfig?: {}) => Processor;
export {};
