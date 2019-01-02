import { DOMBody } from './dom-body';
import { Offset } from './core/helper';
export declare type Size = {
    width: any;
    height: any;
};
export declare class CollapsingWorld {
    private _rootElement;
    private _render;
    private _engine;
    private _walls;
    private _worldSize;
    private _viewportSize;
    private _domBodies;
    constructor(_rootElement: HTMLElement);
    setGravity(value: any): void;
    init(): void;
    run(): void;
    add(...domBodies: DOMBody[]): void;
    setWorldSize(width: any, height: any): void;
    setViewportSize(width: any, height: any): void;
    /**
     *
     * @param domBody Body to be pinned
     * @param offset The body is pinned to the location in the world. Use the offset
     * to change the position where the pin is attached to the body itself.
     */
    pinToWorld(domBody: DOMBody, offset?: Offset): void;
    addJunk(x: any, y: any): void;
    _resize(): void;
    _step(): void;
    _clear(): void;
    _updateWalls(): void;
    addToWorld(object: any): void;
    readonly world: any;
}
