import { Constraint, Body, Composite, Bodies } from 'matter-js';
import { DomBody } from './dom-body';
import { Rect } from './rect';

const globalGroup = Body.nextGroup();

export class DOMBodyQuery {
  constructor() {
  }

  getNodes(){
    return document.querySelectorAll('.probe1234');
  }

  find() {
    console.log('find bodies');
    const nodes = Array.from(this.getNodes());

    let bodies = nodes.map(node => {
      return this.getBody(node as HTMLElement);
    });

    bodies = bodies.filter(body => body !== null);

    return bodies;
  }

  getBlockRect(element) {
    const rect = element.getBoundingClientRect();
    const parentRect = element.offsetParent.getBoundingClientRect();
    const x = parentRect.left + element.offsetLeft;
    const y = parentRect.top + element.offsetTop;

    return {
      x: x + rect.width/2,
      y: y + rect.height/2,
      width: rect.width,
      height: rect.height
    };
  }

  getInlineBlockRect(element) {
    // remove any transformation — but: layout thrashing :/
    element.style.transform = '';

    const range = document.createRange();
    range.selectNode(element);
    const rect = range.getClientRects()[0];

    let rect2 = new Rect(rect);
    // rect2.width = rect2.width/2;
    rect2 = rect2.center();
    return rect2
  }


  getMultiRect(element) {
    const range = document.createRange();
    let baseRect = Rect.from(element.getBoundingClientRect());
    range.selectNode(element);

    let rects = Array.from(range.getClientRects())
      .map(rect => Rect.from(rect))
      .filter(rect => !baseRect.equal(rect))
      .map(rect => rect.center());

    return rects;
  }

  rectToBody(rect) {
    const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
      isStatic: false
    });

    return body;
  }

  getBody(element) {
    const displayStyle = window.getComputedStyle(element).getPropertyValue('display');
    console.log({displayStyle, element, tag: element.tagName})

    if(displayStyle === 'inline' && element.tagName !== 'IMG') {
      return null;
    }

    if(displayStyle === 'block') {
      const allRects = this.getMultiRect(element);
      const rect = this.getInlineBlockRect(element)

      // const compoundBodies = allRects.map(r => this.rectToBody(r));

      // const body = Body.create({
      //   isStatic: false,
      //   parts: [...compoundBodies]
      // });

      // console.log(body.position)

      const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
        isStatic: false
      })


      //   // parts: [...compoundBodies]
      // });

      const domBody = new DomBody(element, body);
      domBody.setSize(560, 55);
      return domBody

    } else {
      let rect = this.getBlockRect(element)
      const body = this.rectToBody(rect);

      const domBody = new DomBody(element, body);
      domBody.setSize(rect.width, rect.height);
      return domBody
    }
  }

  _normalizeRect({x, y, width, height}) {
    let rect = {
      x, y, width, height
    }

    rect.x += rect.width/2;
    rect.y += rect.height/2;

    // global space
    rect.y += window.pageYOffset;
    return rect;
  }
  _getInlineRect(element) {
    var text = element.childNodes[0];

    var range = document.createRange();
    range.selectNode(text);
    var rect = range.getBoundingClientRect() as any;

    range.detach(); // frees up memory in older browsers

    return rect;
  }

  // getCompoundBody(element) {
  //   const range = document.createRange();
  //   const group = Body.nextGroup();
  //   range.selectNode(element);

  //   let rects = Array.from(range.getClientRects());

  //   const compoundBody = Body.create({
  //     parts: [partC, partD, partE, partF]
  //   });

  //     // .map(r => this._normalizeRect(r as any));
  //   console.log('rects', rects, element.getClientRects())
  //   const composite = this.getCompositeFromRects(rects, group);

  //   return compoundBody;
  // }

  // getCompositeFromRects(rects, group) {
  //   const composite = Composite.create();
  //   rects.forEach(rect => {
  //     const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
  //       isStatic: false,
  //       collisionFilter: { group: group}
  //     });
  //     Composite.add(composite, body);
  //   })

  //   return composite;
  // }


  // getBody(element: HTMLElement) {
  //   const range = document.createRange();
  //   range.selectNode(element);

  //   const rects = range.getClientRects();
  //   const rect = this._getBlockRect(element);
  //   const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height);
  //   body.collisionFilter.group = globalGroup;
  //   return body;
  // }

  // getComposite(element: HTMLElement) {
  //   const group = Body.nextGroup(true);

  //   const composite = Composite.create();
  //   const baseRect = this._getBlockRect(element);

  //   const range = document.createRange();
  //   range.selectNode(element);
  //   const rects = range.getClientRects();

  //   const body = Bodies.rectangle(baseRect.x, baseRect.y, baseRect.width,baseRect.height);
  //   const domBody = new DomBody(body);
  //   // domBody.setStatic(true);
  //   domBody.setCollisionGroup(group);

  //   Composite.add(composite, domBody.body);

  //   Array.from(rects).forEach(rect => {
  //     const rect2 = rect as any;
  //     rect2.x += rect2.width/2;
  //     rect2.y += rect2.height/2 + window.pageYOffset;

  //     const body = Bodies.rectangle(rect2.x, rect2.y, rect2.width, rect2.height);
  //     const domBody = new DomBody(body);
  //     domBody.setStatic(true);
  //     domBody.setCollisionGroup(group);

  //     Composite.add(composite, domBody.body);
  //   });

  //   return composite;
  // }

  // getCompositeBody(element) {
  //   const rects = element.getClientRects();
  //   const domBody = this.getBody(element);
  //   domBody.setStatic(true);
  //   return domBody;
  // }

  // getBodyRect(rect, group = null) {
  //   rect.x += rect.width/2;
  //   rect.y += rect.height/2;

  //    const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
  //      isStatic: false,
  //      collisionFilter: { group: group}
  //    });

  //    const domBody = new DomBody(body);
  //    domBody.width = rect.width;
  //    domBody.height = rect.height;
  //    return domBody;
  // }

  // getCompositeBody1(element) {
  //   const group = Body.nextGroup(true);
  //   const composite = Composite.create();

  //   // create the foundation (containing all )
  //   const foundation = this.getBody(element, group);
  //   foundation.setStatic(true);
  //   Composite.addBody(composite, foundation.body);

  //   // add all elements
  //   let node = element.firstElementChild;
  //   let domBody: DomBody;



  //   while (node) {
  //     if(node.nodeType !== Node.TEXT_NODE ) {
  //       domBody = this.getBody(node, group);

  //       const dx = (node.offsetLeft - element.offsetLeft) - foundation.width/2 + domBody.width/2;
  //       const dy = (node.offsetTop - element.offsetTop) - foundation.height/2 + domBody.height/2;
  //       const constraint = Constraint.create({
  //         bodyA: foundation.body,
  //         bodyB: domBody.body,
  //         pointA: {
  //           x: dx, y: dy
  //         },
  //         length: 1,
  //         stiffness: 0,
  //         render: {
  //             strokeStyle: '#90EE90',
  //             lineWidth: 3
  //         }
  //       });
  //       Composite.addBody(composite, domBody.body);
  //       Composite.addConstraint(composite, constraint);
  //     }

  //     node = node.nextSibling;
  //   }

  //   return composite;
  // }

  // compositeFromRects(rects) {
  //   const group = Body.nextGroup(true);
  //   const composite = Composite.create();
  //   const domBody = this.getBodyRect(rects[0], group);

  //   Composite.addBody(composite, domBody.body);
  //   console.log(composite)
  //   return new DomBody(composite);
  // }

  // getBody(element: HTMLElement, group = null): DomBody {
  //   const displayStyle = window.getComputedStyle(element).getPropertyValue('display');
  //   let rect;
  //   console.log({displayStyle}, element, element.childNodes, element.getClientRects())

  //   const onlyText = Array.from(element.childNodes)
  //     .every(node => node.nodeType === Node.TEXT_NODE);

  //   if(onlyText) {
  //     console.log('onlyText')
  //     const range = document.createRange();
  //     range.selectNode(element);
  //     const rects = range.getClientRects();

  //     return this.compositeFromRects(rects);
  //   }

  //   console.log({})
  //   if(displayStyle === 'block') {
  //     rect = this._getInlineRect(element);
  //   } else {
  //     rect = this._getInlineRect(element);
  //   }

  //   // transform from local to global coordinate space
  //   rect.y = rect.y + window.pageYOffset;

  //   const body = Bodies.rectangle(rect.x, rect.y, rect.width, rect.height, {
  //     isStatic: false,
  //     collisionFilter: { group: group}
  //   });

  //   const domBody = new DomBody(body);
  //   domBody.width = rect.width;
  //   domBody.height = rect.height;
  //   return domBody;
  // }
  // /**
  //  * Get the rectangle from the first text node so we can fit it to the actual text
  //  * instead of the bounding box which might be much larger then the actual content.
  //  */
  // _getInlineRect(element) {
  //   const text = element.childNodes[0];
  //   const range = document.createRange();

  //   range.selectNode(text);
  //   const rect = range.getBoundingClientRect() as any;
  //   rect.x += rect.width/2;
  //   rect.y += rect.height/2;

  //   range.detach(); // frees up memory in older browsers

  //   return rect;
  // }

  // _getBlockRect(element) {
  //   const rect: any = element.getBoundingClientRect();

  //   rect.x += rect.width/2;
  //   rect.y += rect.height/2;

  //   // to global coordinate space
  //   rect.y + window.pageYOffset;
  //   return rect;
  // }

  // getBody(node, mode) {
  //   let rect;

  //   if(mode === 'inline') {
  //     rect = this._getInlineRect(node);
  //   }else {
  //     rect = this._getBlockRect(node);

  //   }
  // }

  // getInlineBody(node, group = null) {

  //   const x = rect.width/2 + rect.x;
  //   const y =  rect.y + rect.height/2;

  //   const body = Bodies.rectangle(x,y, rect.width, rect.height,
  //     {collisionFilter: { group: group}}
  //   );
  //   return body;
  // }

  // getBlockBody(node, group = null) {

  //   const x = rect.width/2 + rect.x;
  //   const y =  rect.y + rect.height/2;

  //   const body = Bodies.rectangle(x,y, rect.width, rect.height,
  //     {collisionFilter: { group: group}}
  //   );
  //   return body;
  // }



  // _getBlockRect(element) {
  //   const rect: any = element.getBoundingClientRect();
  //   // neutralize scroll offset in the viewport coordinates we get
  //   rect.y = rect.y + window.pageYOffset;
  //   return rect;
  // }
}