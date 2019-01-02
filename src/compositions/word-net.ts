import { Constraint, World, Composite, Composites } from 'matter-js';
import { DOMBody } from '../dom-body';

export function buildWordNet(element, elements: HTMLElement[], world) {

    const domBodies = elements.slice(0, 60).map(node => {
      return DOMBody.fromElement({
        element: node
      });
    })

    const bodies = domBodies.map(domBody => domBody.body);
    const composite = Composite.create({
      bodies: bodies
    })
    Composites.mesh(composite, 5, 12, false, { stiffness: 0.1, length: 80, render: {
      strokeStyle: '#90EE90',
      lineWidth: 1,
      type: 'line'
    } });

    world.addToWorld(composite);
    world.add(...domBodies);

    const rect = element.getBoundingClientRect();
    const rightPageSide = document.body.clientWidth;

    pinWord(composite.bodies[0], 0, rect.top + window.pageYOffset)
    pinWord(composite.bodies[20], 0, rect.top + 500 + window.pageYOffset)
    pinWord(composite.bodies[24], rightPageSide)
    pinWord(composite.bodies[composite.bodies.length - 1], rightPageSide, rect.top + 500 + window.pageYOffset)

    function pinWord(body, x = null, y= null) {

      if(x === null) {
        x = body.position.x;
      };

      if(y === null) {
        y = body.position.y;
      };

      Composite.add(composite, Constraint.create({
        bodyB: body,
        pointB: { x: 0, y: 0 },
        pointA: { x, y },
        length: 20,
        stiffness: 0.1,
        render: {
          strokeStyle: '#ff0000',
        lineWidth: 1,
        }
      }));
    }
  }