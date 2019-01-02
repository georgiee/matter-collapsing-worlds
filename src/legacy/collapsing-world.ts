import { DOMBodyQuery } from './dom-body-query';
import { MouseConstraint, Mouse, Constraint, Common, Composites, Body, Composite, Bounds, Engine, Render, Bodies, World } from 'matter-js';
import { SimpleDrawer } from './simple-drawer';
import { PageWorld } from './page-world';
import {debounceTime, tap, auditTime, map, startWith} from 'rxjs/operators';
import {fromEvent, timer} from 'rxjs';
import { DomBody } from './dom-body';



const resize$ = fromEvent(window, 'resize')
.pipe(
  startWith(0),
  debounceTime(250),
  map(_ => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }))
)


const pageQuery = new DOMBodyQuery();

export class CollapsingWorld {
  private _engine;
  private _bodies: DomBody[] = [];
  private _debugRender: SimpleDrawer;
  private _walls = [];
  private _sizeWorld = {width: 100, height: 100};

  constructor() {
    this._engine = Engine.create();
    this._engine.world.gravity.y = 1;
    this._debugRender = new SimpleDrawer(this._engine);
  }

  create() {
    document.body.appendChild(this._debugRender.element);
    // this.findElements();
  }

  addBodies(domBodies: DomBody[]) {
    this._bodies.push(...domBodies);
  }

  run() {
    console.log('run CollapsingWorld');

    resize$.subscribe( _ => {
      this.clear();
      this.resize();
      this.rebuild();
      this.addMouse();

      // this.throwStuff();
    });

    Engine.run(this._engine);

    const loop = () => {
      this.step();

      requestAnimationFrame(loop);
    }

    loop();

  }

  step() {
    this._debugRender.draw();
    this._bodies.forEach(body => body.step());

  }

  clear() {
    this._bodies.length = 0;
    World.clear(this._engine.world);
  }

  throwStuff() {
    // add bodies
    var stack = Composites.stack(0, 0, 10, 5, 0, 0, function(x, y) {
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
                return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer });
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer });
            }
        case 1:
            return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer });
        }
    });

    this.add(stack);
  }

  resize() {
    this._sizeWorld.width = window.innerWidth;
    this._sizeWorld.height = document.body.clientHeight;

    this._debugRender.resize({
      viewWidth: window.innerWidth,
      viewHeight: window.innerHeight,
      worldWidth: this._sizeWorld.width,
      worldHeight: this._sizeWorld.height
    });

  }

  findElements() {
    const bodies = pageQuery.find();
    this.addBodies(bodies);
    bodies.forEach(domBody => {
      this.pinToWorld(domBody)
    });
  }

  pinToWorld(domBody) {
    const worldPosition = domBody.realPosition;
    const localPosition = {
      x: -domBody.width/2,
      // x: -10,
      y: 0,
    }

    const constraint = Constraint.create({
      pointA: worldPosition,
      pointB: localPosition,
      bodyB: domBody.body,
      stiffness: 0.7,
      render: {
          strokeStyle: '#90EE90',
          lineWidth: 3
      }
    });
    World.addConstraint(this.world, constraint);

  }

  addMouse() {
    return;
    // add mouse control
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(this._engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    World.add(this.world, mouseConstraint);
  }

  rebuild() {
    console.log('rebuild')
    this.findElements();
    this.updateWalls();
    this.createElements();
  }

  createElements() {
    const bodies = this._bodies.map(body => body.body);
    World.add(this._engine.world, bodies);
  }

  add(object) {
    World.add(this._engine.world, object);
  }

  updateWalls() {
    if(this._walls){
      World.remove(this.world, this._walls);
    }

    const padding = 50;
    const wallSize = 50;
    const width = this._sizeWorld.width
    const height = this._sizeWorld.height;

    const rect = {
      x: -wallSize/2 - padding,
      y: -wallSize/2,
      width: width + wallSize + padding*2,
      height: height + wallSize,
      thickness: wallSize
    }
    this._walls = [
      Bodies.rectangle(rect.x, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (left)' }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y, rect.width, rect.thickness, { isStatic: true, label: 'Wall (right)'  }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y + rect.height, rect.width, rect.thickness, { isStatic: true, label: 'Wall (bottom)'  }),
      Bodies.rectangle(rect.x + rect.width, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (right)'  }),
    ];

    this.add(this._walls);
  }

  get world() {
    return this._engine.world;
  }

}