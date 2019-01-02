import { Body } from 'matter-js';
/**
 * Bridge from the actual DOM Element to a matter js physcis body
 */
export declare class DOMBody {
    private _element;
    private _body;
    _id: number;
    _size: {
        width: number;
        height: number;
    };
    _realPosition: {
        x: number;
        y: number;
    };
    _destroyed: boolean;
    _paused: boolean;
    _localCenter: {
        x: number;
        y: number;
    };
    constructor(_element: HTMLElement, _body: Body);
    pause(): void;
    resume(): void;
    readonly id: number;
    readonly realPosition: {
        x: number;
        y: number;
    };
    setSize(width: any, height: any): void;
    setStatic(value: boolean): void;
    setCollisionGroup(value: any): void;
    setTransformCenter(x: any, y: any): void;
    step(): void;
    readonly element: HTMLElement;
    readonly body: any;
    readonly width: number;
    readonly height: number;
    destroy(): void;
    /**
     *
     * @param element
     * @param overrideElementBase provide a source to create the physics from,
     * this can be different than the element self to easily create clones
     * @param group
     */
    static fromElement({ element, overrideElementBase }: {
        element: any;
        overrideElementBase?: any;
    }): DOMBody;
    static isDOMBody(element: any): boolean;
    static anyChildEnabled(element: any): boolean;
}
