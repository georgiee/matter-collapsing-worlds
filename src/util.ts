import { fromEvent, Observable, interval } from 'rxjs';
import { auditTime, debounceTime, filter, map, startWith, switchMap, takeUntil, tap, throttleTime, combineLatest } from 'rxjs/operators';
import { Size } from './collapsing-world';

export const scrollOffset$ = fromEvent<MouseEvent>(document, 'mousewheel')
  .pipe(
    startWith(window.pageYOffset),
    auditTime(50),
    map(_ => window.pageYOffset)
)

const mouseDown = fromEvent<MouseEvent>(document, 'mousedown');
const mouseMove = fromEvent<MouseEvent>(document, 'mousemove');
const mouseUp = fromEvent<MouseEvent>(document, 'mouseup');

/**
 * Create random stuff at he mouse cursor
 * while pressing the mouse together with the alt key.
 * If not moved create objects every <delay> milliseconds
 * until the mouse is released
 */
export const createRandomElement$ = (delay = 200) => mouseDown.pipe(
  filter(event => event.altKey),
  switchMap(_ =>
    mouseMove.pipe(
      combineLatest(interval(delay)),
      map(([event, _timer])=> event),
      takeUntil(
        mouseUp.pipe(
          tap(event => event.preventDefault())
        )
      ),
      tap(event => event.preventDefault()),
      throttleTime(150),
      map(({clientX, clientY}) => ({x: clientX, y: clientY + window.pageYOffset}))
    ))
);

/**
 * Get any element at the current mouse position.
 * exclude html, body and also the container given with root
 * The idea with the container is to create a world inside any div
 * - but this is tbd.
 */
export const mouseToElement$ = rootElement =>
  fromEvent<MouseEvent>(document, 'mouseup').pipe(
    filter(event => event.defaultPrevented === false),
    map(event => {
      const {clientX, clientY} = event;
      const element = document.elementFromPoint(clientX, clientY) as HTMLElement
      return {event, element}
    }),
    // ignore svg
    filter(({element}) => {
      return element.namespaceURI.indexOf('svg') === -1
    }),
    // ignore html elements like html, body and a given root element
    filter(({element}) => {
      const partOfRoot = rootElement.contains(element) && rootElement !== element

      const notExcludedByGlobalElements = [
        document.documentElement,
        document.body
      ].indexOf(element as HTMLElement)  == -1

      return partOfRoot && notExcludedByGlobalElements
    }),
    map(({element, event}) => ({
        element, event,
        options:{
          shift: event.shiftKey
        }
      }))
  );

export const resizeWindow$: Observable<Size> = fromEvent(window, 'resize')
  .pipe(
    startWith({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    }),
    debounceTime(250),
    map(_ => ({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    }))
  )
