import { Message } from "postcss";
export declare class Dependencies {
    files: Set<string>;
    dirs: Set<string>;
    addFile(file: string): void;
    addDir(dir: string): void;
    getFiles(): string[];
    getDirs(): string[];
    processMessages(messages: Message[]): void;
}
