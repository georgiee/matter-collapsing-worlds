import { Bounds, Engine, Render, Bodies, World } from 'matter-js';
import { SimpleDrawer } from './simple-drawer';
import { PageWorld } from './page-world';
import {debounceTime, tap, auditTime, map, startWith} from 'rxjs/operators';
import {fromEvent, timer} from 'rxjs';

const engine = Engine.create();
engine.world.gravity.y = 0;

Engine.run(engine);


const resize$ = fromEvent(window, 'resize')
.pipe(
  startWith(0),
  auditTime(250),
  map(_ => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }))
)

const world = new PageWorld(engine);

window.addEventListener('DOMContentLoaded', () => {
  function resize() {
    const width = 500;
    const height = 500;
    world.clear();

    world.resize({
      viewWidth: width,
      viewHeight: height,
      worldWidth: window.innerWidth,
      worldHeight: document.body.clientHeight
    })

    drawer.resize({
      viewWidth: width,
      viewHeight: height,
      worldWidth: window.innerWidth,
      worldHeight: document.body.clientHeight
    });
  }

  // add the drawer
  const drawer = new SimpleDrawer(engine);
  document.body.appendChild(drawer.element);
  drawer.run();

  resize()
  resize$.subscribe( _ => {
    resize()
  })


  // create two boxes and a ground
  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(200, 200, 80, 80);

  // add all of the bodies to the world
  World.add(engine.world, [boxA, boxB]);
})