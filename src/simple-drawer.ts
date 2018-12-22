import { Render, Engine, Bounds } from 'matter-js';

export class SimpleDrawer {
  private _canvas: HTMLCanvasElement;
  private _renderer: Render;
  private viewTranslation = {x:0, y:0};

  constructor(private engine: Engine) {
    this.init();
  }

  init() {
    this._canvas = this._createCanvas();
    this._createMatterRenderer();
    this.updateBounds();
    this.handlePageScroll = this.handlePageScroll.bind(this);
    window.addEventListener('mousewheel', this.handlePageScroll);
  }

  handlePageScroll() {
    this.viewTranslation.y = window.pageYOffset;
    this.updateBounds();
  }

  resize({ viewWidth, viewHeight, worldWidth, worldHeight}) {
    this._renderer.options.width = viewWidth;
    this._renderer.options.height = viewHeight;
    this._canvas.width = viewWidth;
    this._canvas.height = viewHeight;
    this._canvas.style.width = viewWidth + 'px';
    this._canvas.style.height = viewHeight + 'px';

    const { bounds } = this._renderer;

    const padding = 200;
    bounds.min.x = -padding;
    bounds.min.y = -padding;
    bounds.max.x = bounds.min.x + worldWidth + padding * 2;
    bounds.max.y = bounds.min.y + worldHeight + padding * 2;
  }

  updateBounds() {
    // Bounds.shift(this._renderer.bounds, this.viewTranslation);
  }

  run() {
    const loop = () => {
      Render.world(this._renderer);
      requestAnimationFrame(loop);
    }

    loop();
  }

  get element() {
    return this._canvas;
  }

  _createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
    `;


    return canvas;
  }

  _createMatterRenderer() {
    this._renderer = Render.create(<any>{
      canvas: this._canvas,
      options: {
        wireframeBackground: 'yellow',
        background: 'red',
        width: window.innerWidth,
        height: window.innerHeight,
        hasBounds: true,
        showAngleIndicator: true
      }
    });

    this._renderer.engine = this.engine;
  }
}
