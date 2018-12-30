import { fromEvent } from 'rxjs';
import { auditTime, map, startWith } from 'rxjs/operators';
import { CollapsingWorld } from './collapsing-world';

window.addEventListener('load', () => {
  const world = new CollapsingWorld();
  world.create();
  world.run();
});
