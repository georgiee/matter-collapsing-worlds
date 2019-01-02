import { Observable } from 'rxjs';
import { Size } from './collapsing-world';
export declare const scrollOffset$: Observable<number>;
/**
 * Create random stuff at he mouse cursor
 * while pressing the mouse together with the alt key.
 * If not moved create objects every <delay> milliseconds
 * until the mouse is released
 */
export declare const createRandomElement$: (delay?: number) => Observable<{
    x: number;
    y: number;
}>;
/**
 * Get any element at the current mouse position.
 * exclude html, body and also the container given with root
 * The idea with the container is to create a world inside any div
 * - but this is tbd.
 */
export declare const mouseToElement$: (rootElement: any) => Observable<{
    element: HTMLElement;
    event: MouseEvent;
    options: {
        shift: boolean;
    };
}>;
export declare const resizeWindow$: Observable<Size>;
