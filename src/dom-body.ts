import { Body, Composite, Bodies } from 'matter-js';
import { mat2d, vec2 } from 'gl-matrix';
import transform from 'dom-css-transform';
import { Rectangle } from './core/rectangle';

let globalId = 0;
const ignoreAllCollisionsGroup = Body.nextGroup(true);

const globalList = new Map();

function register(body) {
  globalList.set(body.id, body);
}

function unregister(body) {
  globalList.delete(body.id);
}

window['gb'] = element => {
  const bodies = Array.from(globalList.values());
  return bodies.find(body => body.element === element);
}
/**
 * Bridge from the actual DOM Element to a matter js physcis body
 */
export class DOMBody {
  _id = globalId++;
  _size = {width: 0, height:0};
  _realPosition = {x: 0, y: 0};
  _destroyed = false;
  _paused = false;
  _localCenter = { x: 0, y: 0 };

  constructor(
    private _element: HTMLElement,
    private _body: Body
  ) {
    const { position } = this.body;
    this._realPosition = Object.assign({}, position);
    this._element.classList.add('is-physical');
    this._element.dataset.hasDOMBody = "true";

    register(this);
    const { min, max } = this._body.bounds as any;
    this.setSize(max.x - min.x , max.y - min.y)
  }

  pause() {
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  get id() {
    return this._id;
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

  setTransformCenter(x, y){
    this._localCenter = {
      x, y
    }
  }

  step() {
    if(this._paused) {
      return;
    }

    const matrix = mat2d.create();
    const { position } = this.body;

    const dX = position.x - this._realPosition.x;
    const dY = position.y - this._realPosition.y;

    const posVector = vec2.fromValues(dX, dY);
    const newCenter = vec2.fromValues( -this._localCenter.x, -this._localCenter.y);
    const newCenterNeg = vec2.create();
    vec2.negate(newCenterNeg, newCenter)


    mat2d.translate(matrix, matrix, posVector);

    // translate - rotate - translate back
    // to rotate around our chose center point
    mat2d.translate(matrix, matrix, newCenter);
    mat2d.rotate(matrix, matrix, this.body.angle);
    mat2d.translate(matrix, matrix, newCenterNeg);

    // transform(this.element, {
    //   rotate: [0, 0, this.body.angle],
    //   translate: [dX, dY]
    //   // scale: [0.15, 0.5]
    //  })

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

    unregister(this);
  }
  /**
   *
   * @param element
   * @param overrideElementBase provide a source to create the physics from,
   * this can be different than the element self to easily create clones
   * @param group
   */
  static fromElement({
    element,
    overrideElementBase = null
    }){
    console.log('overrideElementBase', overrideElementBase);

    if(DOMBody.anyChildEnabled(element)) {
      console.error(`Can't convert element ${element} it has children already converted to dom body`);
      return null;
    }

    const displayStyle = window.getComputedStyle(element).getPropertyValue('display');

    if(displayStyle === 'inline') {
      element.style.display = 'inline-block';
      // return null;
    }


    let dx = 0;
    let dy= 0;

    const domElement = new DOMBodyCandidate(overrideElementBase || element);
    const domBody = domElement.createBody();

    // domBody.setTransformCenter(145.875/2, 1/2);

    return domBody
  }

  static isDOMBody(element) {
    return 'hasDOMBody' in  element.dataset;
  }

  static anyChildEnabled(element) {
    const childEnabled = walkTheDOM(element, node => {
      const result = DOMBody.isDOMBody(node);
      return result
    });

    return childEnabled;
  }
}


class DOMBodyCandidate {
  private _nodes: Node[];
  private _isPartial = false;
  private _partialOffset: Rectangle;

  constructor(
    private _element: HTMLElement
  ) {
    this._nodes = Array.from(this._element.childNodes);
  }

  isOnlyText() {
    if(this._nodes.length === 0) {
      return false;
    }

    return this._nodes.every(node => {
      return node.nodeType === Node.TEXT_NODE;
    });
  }

  rectToBody(rect: Rectangle) {
    rect.translate(0, window.pageYOffset);
    rect.translate(rect.width/2, rect.height/2);

    const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
      // collisionFilter: { group: ignoreAllCollisionsGroup}
    });
    return body;
  }

  isButton() {
    return this._element.tagName.toLowerCase() === 'button';
  }

  isShallow() {
    return this.isButton();
  }

  createBody() {
    const shallow = this.isShallow();
    const body = this._createMatterBody(shallow);
    const domBody = new DOMBody(this._element, body);

    if(this._isPartial) {
      domBody.setTransformCenter(this._partialOffset.width/2, this._partialOffset.height/2);
    }

    return domBody;
  }

  _createMatterBody(shallow = false) {
    if(this.isOnlyText() && shallow === false) {
      const group = Body.nextGroup(true);

      const range = document.createRange();
      range.selectNode(this._nodes[0]);

      const subrect = Rectangle.from(range.getBoundingClientRect());
      const subBody = this.rectToBody(subrect);
      subBody.label = 'subBody'

      const rect = Rectangle.from(this._element.getBoundingClientRect());
      const body = this.rectToBody(rect);
      body.label = 'main'

      // Body.setParts(body, [subBody]);
      // Body.setStatic(body, true);
      this._isPartial= true;
      this._partialOffset = Rectangle.subtract(rect, subrect);
      console.log(this._partialOffset)
      return subBody;

    }else {
      const rect = Rectangle.from(this._element.getBoundingClientRect());
      const body = this.rectToBody(rect);
      // Body.setStatic(body, true);
      return body
    }
  }
}


function walkTheDOM(node, fn) {
  node = node.firstElementChild;
  let result = false;

  while (node) {
    if(node.nodeType !== Node.TEXT_NODE ) {
      const result = fn(node);
      console.log('result', result, node)
      if(!result) {
        walkTheDOM(node, fn);
      }else{
        return true;
      }
    }

    node = node.nextSibling;
  }

  return result;
}