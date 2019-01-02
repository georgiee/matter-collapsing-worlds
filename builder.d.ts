export declare class WorldBuilder {
    private _root;
    private _collapsingWorld;
    constructor(_root: HTMLElement);
    init(): void;
    pin(body: any, dx?: number, dy?: number): void;
    start(): void;
    isolateCharacters(element: HTMLElement): void;
}
