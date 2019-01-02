import { Engine, Render, Bounds } from 'matter-js';
import { Size } from './collapsing-world';
import { fromEvent } from 'rxjs';
import { map, mapTo, auditTime } from 'rxjs/operators';
import { scrollOffset$ } from './util';

export class SimpleDrawer {
  private _canvas: HTMLCanvasElement;
  private _renderer: Render;
  private _viewportSize: Size;
  private _worldSize: Size;
  private _viewTranslation = {x:0, y:0};

  constructor(
    private _engine: Engine
  ) {
    this._createCanvas();
    this._createRenderer();

    scrollOffset$.subscribe(pageYOffset => this._handlePageScroll(pageYOffset));
  }

  resize(worldSize, viewportSize) {
    this._worldSize = {...worldSize};
    this._viewportSize = {...viewportSize};

    this._updateCanvas();
    this._updateRenderer();
  }

  draw() {
    Render.world(this._renderer);
  }

  _handlePageScroll(pageYOffset) {
    this._translateView(pageYOffset);
  }

  _updateCanvas() {
    // resize the canvas we draw in
    this._canvas.width = this._viewportSize.width;
    this._canvas.height = this._viewportSize.height;
    this._canvas.style.width = this._viewportSize.width + 'px';
    this._canvas.style.height = this._viewportSize.height + 'px';
  }

  _updateRenderer() {
    this._renderer.options.width = this._viewportSize.width;
    this._renderer.options.height = this._viewportSize.height;
    this._translateView(this._viewTranslation.y);
  }

  _translateView(pageYOffset) {
    this._viewTranslation.y = pageYOffset;
    const bounds = this._renderer.bounds as any;

    bounds.min.x = 0;
    bounds.min.y = 0;
    bounds.max.x = bounds.min.x + this._viewportSize.width;
    bounds.max.y = bounds.min.y + this._viewportSize.height;
    Bounds.shift(this._renderer.bounds, this._viewTranslation);
  }

  _createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
    `;
    this._canvas = canvas;
  }

  _createRenderer() {
    this._renderer = Render.create(<any>{
      canvas: this._canvas,
      engine: this._engine,
      options: {
        wireframeBackground: 'transparent',
        background: 'transparent',
        width: 100,
        height: 100,
        hasBounds: true,
        showAngleIndicator: true
      }
    });
  }

  get element() {
    return this._canvas;
  }
}