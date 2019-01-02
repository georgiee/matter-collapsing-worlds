import { fromEvent } from 'rxjs';
import { tap, map, filter, mergeMap } from 'rxjs/operators';
import { mouseToElement$, resizeWindow$ } from './util';
import { SimpleDrawer } from './simple-drawer';
import { Common, Engine, World, Bodies, Constraint, Composites } from 'matter-js';
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

  setGravity(value) {
    this._engine.world.gravity.y = value;
  }

  init() {
    this._engine = Engine.create();

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

  add(...domBodies: DOMBody[]) {
    this._domBodies.push(...domBodies);
    domBodies.forEach(b => this.addToWorld(b.body));

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

  addJunk(x, y) {
     // add bodies
     const size = 0.5;
     var stack = Composites.stack(x, y, 2, 2, 0, 0, function(x, y) {
     var sides = Math.round(Common.random(1, 8));

      // triangles can be a little unstable, so avoid until fixed
      sides = (sides === 3) ? 4 : sides;

      // round the edges of some bodies
      var chamfer = null;
      if (sides > 2 && Common.random() > 0.7) {
          chamfer = {
              radius: 10
          };
      }

      switch (Math.round(Common.random(0, 1))) {
        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(25, 50)*size, Common.random(25, 50)*size, { chamfer: chamfer });
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120)*size, Common.random(25, 30)*size, { chamfer: chamfer });
            }
        case 1:
            return Bodies.polygon(x, y, sides, Common.random(25, 50)*size, { chamfer: chamfer });
        }
    });

    this.addToWorld(stack);
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

    const wallSize = 100;
    const width = this._worldSize.width
    const height = this._worldSize.height;

    const rect = {
      x: -wallSize/2,
      y: -wallSize/2,
      width: width + wallSize,
      height: height + wallSize,
      thickness: wallSize
    }

    this._walls = [
      Bodies.rectangle(rect.x, rect.y + rect.height/2, rect.thickness, rect.height, {
        isStatic: true, label: 'Wall (left)'
      }),
      Bodies.rectangle(rect.x + rect.width, rect.y + rect.height/2, rect.thickness, rect.height, {
        isStatic: true, label: 'Wall (right)'
      }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y + rect.height, rect.width, rect.thickness, {
        isStatic: true, label: 'Wall (bottom)'
      })
    ];

    this.addToWorld(this._walls);
  }

  addToWorld(object) {
    World.add(this._engine.world, object);
  }

  get world() {
    return this._engine.world;
  }
}