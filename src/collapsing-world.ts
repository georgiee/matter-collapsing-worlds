import { fromEvent } from 'rxjs';
import { tap, map, filter, mergeMap } from 'rxjs/operators';
import { mouseToElement$, resizeWindow$ } from './util';
import { SimpleDrawer } from './simple-drawer';
import { Engine, World, Bodies, Constraint } from 'matter-js';
import { DOMBody } from './dom-body';
import { Offset } from './core/helper';

export type Size = {
  width, height
}

export class CollapsingWorld {
  private _render: SimpleDrawer;
  private _engine: Engine;
  private _walls = [];
  private _worldSize = {width: 100, height: 100};
  private _viewportSize = {width: 100, height: 100};
  private _domBodies: DOMBody[] = [];

  constructor(
    private _rootElement: HTMLElement
  ) {
    this.init();
  }

  init() {
    this._engine = Engine.create();
    this._engine.world.gravity.y = 1;

    this._render = new SimpleDrawer(this._engine);
    document.body.appendChild(this._render.element);

    resizeWindow$.subscribe(size => {
      this.setViewportSize(size.width, size.height);
      this.setWorldSize(this._rootElement.clientWidth, this._rootElement.clientHeight);

      this._resize();
    })
  }

  run() {
    const loop = () => {
      this._step();
      requestAnimationFrame(loop);
    }

    Engine.run(this._engine);
    loop();
    this._resize();
  }

  add(domBody: DOMBody) {
    this._domBodies.push(domBody);
    this._addToWorld(domBody.body);
  }

  setWorldSize(width, height) {
    this._worldSize.width = width;
    this._worldSize.height = height;
  }

  setViewportSize(width, height) {
    this._viewportSize.width = width;
    this._viewportSize.height = height;
  }

  /**
   *
   * @param domBody Body to be pinned
   * @param offset The body is pinned to the location in the world. Use the offset
   * to change the position where the pin is attached to the body itself.
   */
  pinToWorld(domBody: DOMBody, offset: Offset = null) {
    const worldPosition = domBody.realPosition;

    if(!offset) {
      offset = {
        x: 0,
        y: 0,
      }
    }

    const constraint = Constraint.create(<any>{
      pointA: worldPosition,
      pointB: offset,
      bodyB: domBody.body,
      stiffness: 0.1,
      // length: 100,
      render: {
          strokeStyle: '#90EE90',
          lineWidth: 3
      }
    });
    World.addConstraint(this.world, constraint);
  }

  _resize() {
    this._clear();

    this._render.resize(this._worldSize, this._viewportSize);
    this._updateWalls();
  }

  _step() {
    this._render.draw();
    this._domBodies.forEach(body => body.step());
  }

  _clear() {
    World.clear(this.world, false);
    this._domBodies.forEach(body => body.destroy());
    this._domBodies.length = 0;
  }

  _updateWalls() {
    if(this._walls){
      World.remove(this.world, this._walls as any);
    }

    const padding = 50;
    const wallSize = 20;
    const width = this._worldSize.width
    const height = this._worldSize.height;

    const rect = {
      x: -wallSize/2 - padding,
      y: -wallSize/2 - padding,
      width: width + wallSize + padding*2,
      height: height + wallSize + padding*2,
      thickness: wallSize
    }

    this._walls = [
      Bodies.rectangle(rect.x, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (left)' }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y + rect.height, rect.width, rect.thickness, { isStatic: true, label: 'Wall (bottom)'  }),
      Bodies.rectangle(rect.x + rect.width, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (right)'  }),
    ];

    this._addToWorld(this._walls);
  }

  _addToWorld(object) {
    World.add(this._engine.world, object);
  }

  get world() {
    return this._engine.world;
  }
}