import { fromEvent, Observable } from 'rxjs';
import { tap, map, filter, mergeMap, auditTime, mapTo, startWith, debounceTime } from 'rxjs/operators';
import { Size } from './collapsing-world';

export const scrollOffset$ = fromEvent<MouseEvent>(document, 'mousewheel')
  .pipe(
    startWith(window.pageYOffset),
    auditTime(50),
    map(_ => window.pageYOffset)
)

export const mouseToElement$ = rootElement =>
  fromEvent<MouseEvent>(document, 'click').pipe(
    map(event => {
      const {clientX, clientY} = event;
      const element = document.elementFromPoint(clientX, clientY) as HTMLElement
      return {event, element}
    }),
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
