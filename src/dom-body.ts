import { Body, Composite, Bodies } from 'matter-js';
import { mat2d, vec2 } from 'gl-matrix';
import transform from 'dom-css-transform';




const cumulativeOffset = function(element) {
  let y = 0, x = 0;
  do {
      y += element.offsetTop  || 0;
      x += element.offsetLeft || 0;
      element = element.offsetParent;
  } while(element);

  return {x, y};
};


export class DomBody {
  _size = {width: 0, height:0};
  _realPosition = {x: 0, y: 0};

  constructor(
    private _element: HTMLElement,
    private _body: Body
  ) {
    const { position } = this.body;
    this._realPosition = Object.assign({}, position);
    this._element.classList.add('is-physical');
  }

  get realPosition() {
    return {...this._realPosition}
  }

  setSize(width, height){
    this._size = {
      width, height
    }
  }

  setStatic(value: boolean) {
    Body.setStatic(this.body, value);
  }

  setCollisionGroup(value) {
    this.body.collisionFilter.group = value;
  }

  step() {
    const matrix = mat2d.create();
    const { position } = this.body;
    const dX = position.x - this._realPosition.x;
    const dY = position.y - this._realPosition.y;

    const posVector = vec2.fromValues(dX, dY);

    mat2d.translate(matrix, matrix, posVector);
    mat2d.rotate(matrix, matrix, this.body.angle);

    transform(this.element, matrix);
  }

  get element() {
    return this._element;
  }

  get body() {
    return this._body;
  }

  get width() {
    return this._size.width;
  }

  get height() {
    return this._size.height;
  }
}