export declare class TransformCache {
    map: Map<any, any>;
    getOrTransform<T>(filePath: string, transform: (input: string) => Promise<T>): Promise<T>;
}
export declare class FakeCache {
    getOrTransform<T>(filePath: string, transform: (input: string) => Promise<T>): Promise<T>;
}
