import { CollapsingWorld } from './collapsing-world';
import { mouseToElement$ } from './util';
import { DOMBody } from './dom-body';
import { Constraint, World } from 'matter-js';
import { Offset } from './core/helper';


export class WorldBuilder {
  private _collapsingWorld: CollapsingWorld;

  constructor(
    private _root: HTMLElement
  ) {
    this.init();
  }

  init() {
    console.log('this._root', this._root);
    this._collapsingWorld = new CollapsingWorld(this._root);

    //wait for elements being selected by the user
    mouseToElement$(this._root)
      .subscribe(({element, options, event}) => {
        event.preventDefault();
        console.log('element.childNodes', element.childNodes)
        const body = DOMBody.fromElement(element);

        if(body === null) {
          return;
        }
        this._collapsingWorld.add(body);

        if(options.shift) {
          const offset: Offset = {
            x: event.offsetX - body.width/2,
            y: event.offsetY - body.height/2
          };
          this._collapsingWorld.pinToWorld(body, offset);
        }

    });
  }

  start() {
    this._collapsingWorld.run();
  }
}