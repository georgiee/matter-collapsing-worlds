import { Mouse, World, Render, MouseConstraint, Engine, Bodies } from 'matter-js';
import { Observable } from 'rxjs';

export class PageWorld {
  worldHeight: number = 400;
  worldWidth: number = 400;
  viewportWidth: number = 400;
  viewportHeight: number = 400;
  worldBoundsPadding: number = 200;
  wallBodies:any[];

  constructor(
    private engine: Engine
  ){
  }

  clear() {
    console.log('clear');
  }

  setWorldSize(w, h){
    this.worldWidth = w;
    this.worldHeight = h;
  }

  setViewportSize(w, h){
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  update(){
    this.updateBounds();
    this.updateWalls();
  }

  resize({viewWidth, viewHeight, worldWidth, worldHeight}) {
    this.setViewportSize(viewWidth, viewHeight);
    this.setWorldSize(worldWidth, worldHeight);

    this.update();
  }

  updateBounds () {
    const padding = this.worldBoundsPadding;
    const { world } = this.engine;

    world.bounds.min.x = -padding
    world.bounds.min.y = -padding
    world.bounds.max.x = this.worldWidth + padding;
    world.bounds.max.y = this.worldHeight + padding;
  }

  updateWalls() {
    if(this.wallBodies){
      World.remove(this.engine.world, this.wallBodies);
    }

    const paddingX = 50;
    const paddingY = 50;
    const wallSize = 50;
    const width = this.worldWidth
    const height = this.worldHeight;

    const rect = {
      x: -wallSize/2 - paddingX,
      y: -wallSize/2,
      width: width + wallSize + paddingX*2,
      height: height + wallSize,
      thickness: wallSize
    }
    this.wallBodies = [
      Bodies.rectangle(rect.x, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (left)' }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y, rect.width, rect.thickness, { isStatic: true, label: 'Wall (right)'  }),
      Bodies.rectangle(rect.x + rect.width/2, rect.y + rect.height, rect.width, rect.thickness, { isStatic: true, label: 'Wall (bottom)'  }),
      Bodies.rectangle(rect.x + rect.width, rect.y + rect.height/2, rect.thickness, rect.height, { isStatic: true, label: 'Wall (right)'  }),
    ];

    World.add(this.engine.world, this.wallBodies);
  }
}
