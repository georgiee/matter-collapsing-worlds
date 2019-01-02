import { Engine } from 'matter-js';
export declare class SimpleDrawer {
    private _engine;
    private _canvas;
    private _renderer;
    private _viewportSize;
    private _worldSize;
    private _viewTranslation;
    constructor(_engine: Engine);
    resize(worldSize: any, viewportSize: any): void;
    draw(): void;
    _handlePageScroll(pageYOffset: any): void;
    _updateCanvas(): void;
    _updateRenderer(): void;
    _translateView(pageYOffset: any): void;
    _createCanvas(): void;
    _createRenderer(): void;
    readonly element: HTMLCanvasElement;
}
