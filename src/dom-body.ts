import { Body, Composite, Bodies } from 'matter-js';
import { mat2d, vec2 } from 'gl-matrix';
import transform from 'dom-css-transform';
import { Rectangle } from './core/rectangle';
/**
 * Bridge from the actual DOM Element to a matter js physcis body
 */
export class DOMBody {
  _size = {width: 0, height:0};
  _realPosition = {x: 0, y: 0};
  _destroyed = false;

  constructor(
    private _element: HTMLElement,
    private _body: Body
  ) {
    const { position } = this.body;
    this._realPosition = Object.assign({}, position);
    this._element.classList.add('is-physical');
    this._element.dataset.hasDOMBody = "true";
    const { min, max } = this._body.bounds as any;

    this.setSize(max.x - min.x , max.y - min.y)
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

  destroy() {
    this._destroyed = true;
    this._element.style.transform = '';
    this._element.classList.remove('is-physical');
    delete this._element.dataset.hasDOMBody;
  }

  static fromElement(element, root = null){
    const displayStyle = window.getComputedStyle(element).getPropertyValue('display');

    if(displayStyle === 'inline') {
      element.style.display = 'inline-block';
      // return null;
    }

    if(element.dataset.hasDOMBody) {
      throw new Error(`Element ${element} is already part of a collapsing world`);
    }
    let dx = 0;
    let dy= 0;

    if(root) {
      dx = root.offsetLeft;
      dy = root.offsetTop;
    }

    const body = getBodyFromElement(element);
    return new DOMBody(element, body);
  }
}


function getBodyFromElement(element: HTMLElement) {
  const rect = Rectangle.from(element.getBoundingClientRect());
  rect.translate(0, window.pageYOffset);
  rect.translate(rect.width/2, rect.height/2);

  const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height);

  return body;
}