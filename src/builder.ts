import { CollapsingWorld } from './collapsing-world';
import { mouseToElement$, createRandomElement$ } from './util';
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
    this._collapsingWorld = new CollapsingWorld(document.body);
    this._collapsingWorld.setGravity(1);

    // create junk to play with (alt + mouse down and moving)
    createRandomElement$(250).subscribe(({x, y}) => {
      this._collapsingWorld.addJunk(x, y);
    })

    // wait for elements being selected by the user (click)
    // click + shift to pin the element with a rope
    mouseToElement$(this._root)
      .subscribe(({element, options, event}) => {
        event.preventDefault();

        const body = DOMBody.fromElement({
          element
        });

        if(body === null) {
          return;
        }

        this._collapsingWorld.add(body);

        // press shift to disable pinning
        if(options.shift) {
          this.pin(body, event.offsetX, event.offsetY)
        }



    });
  }

  test() {
    const body1 = DOMBody.fromElement({
      element: document.querySelector('.probe-c1')
    });

    this._collapsingWorld.add(body1);
    this.pin(body1)

    const body2 = DOMBody.fromElement({
      element: document.querySelector('.probe-c2')
    });
    this._collapsingWorld.add(body2);
    this.pin(body2);
  };

  pin(body, dx=0, dy=0) {
    let offset: Offset = {
      x: dx - body.width/2,
      y: dy - body.height/2
    };
    // offset.x = -body.width/2;
    // offset.y = 0
    // this._collapsingWorld.pinToWorld(body, offset);
    this._collapsingWorld.pinToWorld(body, offset);
  }

  start() {
    this._collapsingWorld.run();
  }
}