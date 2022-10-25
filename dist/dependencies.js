"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependencies = void 0;
class Dependencies {
    constructor() {
        this.files = new Set();
        this.dirs = new Set();
    }
    addFile(file) {
        this.files.add(file);
    }
    addDir(dir) {
        this.dirs.add(dir);
    }
    getFiles() {
        return Array.from(this.files);
    }
    getDirs() {
        return Array.from(this.dirs);
    }
    processMessages(messages) {
        for (const message of messages) {
            switch (message.type) {
                case "dependency":
                    this.addFile(message.file);
                    break;
                case "dir-dependency":
                    this.addDir(message.dir);
                    break;
            }
        }
    }
}
exports.Dependencies = Dependencies;
