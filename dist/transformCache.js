"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeCache = exports.TransformCache = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class TransformCache {
    constructor() {
        this.map = new Map();
    }
    async getOrTransform(filePath, transform) {
        const input = await promises_1.default.readFile(filePath, "utf8");
        let value = this.map.get(filePath);
        if (!value || value.input !== input) {
            const contents = await transform(input);
            value = { input, contents };
            this.map.set(filePath, value);
        }
        return value.contents;
    }
}
exports.TransformCache = TransformCache;
class FakeCache {
    async getOrTransform(filePath, transform) {
        const input = await promises_1.default.readFile(filePath, "utf8");
        return transform(input);
    }
}
exports.FakeCache = FakeCache;
