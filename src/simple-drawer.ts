import { Render, Engine, Bounds } from 'matter-js';

export class SimpleDrawer {
  private _canvas: HTMLCanvasElement;
  private _renderer: Render;
  private viewTranslation = {x:0, y:0};
  private _background;
  private _viewHeight = 100;
  private _viewWidth = 100;
  private _worldHeight = 100;
  private _worldWidth = 100;
  private _showAll = false;

  constructor(
    private engine: Engine,
    options: any = {}
  ) {
    this._background = options.background || 'transparent'
    this._showAll  = options.showAll
    this.init();

  }

  init() {
    this._canvas = this._createCanvas();
    this._createMatterRenderer();
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

    this._worldWidth = worldWidth;
    this._worldHeight = worldHeight;
    this._viewWidth = viewWidth;
    this._viewHeight = viewHeight;

    this.updateBounds();
  }

  updateBounds() {
    const { bounds } = this._renderer;
    if(this._showAll) {
      const padding = 200;
      bounds.min.x = -padding;
      bounds.min.y = -padding;
      bounds.max.x = bounds.min.x + this._worldWidth + padding * 2;
      bounds.max.y = bounds.min.y + this._worldHeight + padding * 2;
    }else {

      bounds.min.x = 0;
      bounds.min.y = 0;
      bounds.max.x = bounds.min.x + this._viewWidth;
      bounds.max.y = bounds.min.y + this._viewHeight;

      Bounds.shift(this._renderer.bounds, this.viewTranslation);
    }
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
      bottom: 0;
      right: 0;
      pointer-events: none;
    `;


    return canvas;
  }

  _createMatterRenderer() {
    this._renderer = Render.create(<any>{
      canvas: this._canvas,
      options: {
        wireframeBackground: this._background,
        background: 'transparent',
        width: window.innerWidth,
        height: window.innerHeight,
        hasBounds: true,
        showAngleIndicator: true
      }
    });

    this._renderer.engine = this.engine;
  }
}
