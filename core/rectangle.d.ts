export declare class Rectangle {
    top: number;
    bottom: number;
    left: number;
    right: number;
    constructor(left?: number, right?: number, top?: number, bottom?: number);
    translate(dx: any, dy: any): void;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    equals(rect: Rectangle): boolean;
    static from(rect: ClientRect | DOMRect): Rectangle;
    static subtract(rect: Rectangle, subrect: Rectangle): any;
}
