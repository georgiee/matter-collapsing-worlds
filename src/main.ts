import { Body, Composite, Bounds, Engine, Render, Bodies, World } from 'matter-js';
import { SimpleDrawer } from './simple-drawer';
import { PageWorld } from './page-world';
import {debounceTime, tap, auditTime, map, startWith} from 'rxjs/operators';
import {fromEvent, timer} from 'rxjs';

const engine = Engine.create();
engine.world.gravity.y = 0;

Engine.run(engine);


const resize$ = fromEvent(window, 'resize')
.pipe(
  startWith(0),
  auditTime(250),
  map(_ => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }))
)

const world = new PageWorld(engine);

window.addEventListener('DOMContentLoaded', () => {
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    world.resize({
      viewWidth: width,
      viewHeight: height,
      worldWidth: window.innerWidth,
      worldHeight: document.body.clientHeight
    })

    minimap.resize({
      viewWidth: 300,
      viewHeight: 300,
      worldWidth: window.innerWidth,
      worldHeight: document.body.clientHeight
    });

    pageView.resize({
      viewWidth: width,
      viewHeight: height,
      worldWidth: window.innerWidth,
      worldHeight: document.body.clientHeight
    });
  }

  // add the drawer as a minimap showing everything
  const minimap = new SimpleDrawer(engine, {background: 'yellow', showAll: true});
  document.body.appendChild(minimap.element);
  minimap.run();


  // add a full page render
  const pageView = new SimpleDrawer(engine);
  document.body.appendChild(pageView.element);
  pageView.run();

  resize()
  resize$.subscribe( _ => {
    resize()
  })


  // create two boxes and a ground
  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(200, 200, 80, 80);

  // add all of the bodies to the world
  // World.add(engine.world, [boxA, boxB]);


  // parseBodies(document.querySelector('.probe'));
  createBody(document.querySelector('.container'));
})

function getInlineRect(element) {
  var text = element.childNodes[0];

  var range = document.createRange();
  range.selectNode(text);
  var rect = range.getBoundingClientRect() as any;
  rect.y = rect.y + window.pageYOffset;

  range.detach(); // frees up memory in older browsers

  return rect;
}

function getBlockRect(element) {
  const rect: any = element.getBoundingClientRect();
  // neutralize scroll offset in the viewport coordinates we get
  rect.y = rect.y + window.pageYOffset;
  return rect;
}

function parseBodies(element) {
  let domGraph = walkTheDOM(element);

  console.log('walkTheDOM ->', domGraph)
}

window['parseBodies'] = parseBodies;
window['createBody'] = createBody;

function getBlockBody(node, group = null) {
  const rect = getBlockRect(node);

  const x = rect.width/2 + rect.x;
  const y =  rect.y + rect.height/2;

  const body = Bodies.rectangle(x,y, rect.width, rect.height,
    {collisionFilter: { group: group}}
  );
  return body;
}

function getInlineBody(node, group = null) {
  const rect = getInlineRect(node);

  const x = rect.width/2 + rect.x;
  const y =  rect.y + rect.height/2;

  const body = Bodies.rectangle(x,y, rect.width, rect.height,
    {collisionFilter: { group: group}}
  );
  return body;
}

function createCompositBody(element) {
  let nodes:any = Array.from(element.childNodes);

  const group = Body.nextGroup(true);
  const composite = Composite.create();
  const body = getBlockBody(element, group);

  Composite.addBody(composite, body);

  nodes.forEach(node => {
    if(node.nodeType === Node.ELEMENT_NODE) {
      const childBody = getBody(node, group);
      Composite.addBody(composite, childBody);
    }
  });

  return composite;
}

function getBody(element, group = null) {
  const children = Array.from(element.childNodes);
  const textNodes = children.filter((node: any) => node.nodeType === Node.TEXT_NODE)
  let body;
  if(textNodes.length === 1) { //only a single text node? extarct the position instead of using the block
    body = getInlineBody(element, group);
  }else{
    body = getBlockBody(element, group);
  }

  return body;
}

function createBody(element) {
  console.log(element)
  const children = Array.from(element.childNodes);
  const elements = children.filter((node: any) => node.nodeType === Node.ELEMENT_NODE)
  const textNodes = children.filter((node: any) => node.nodeType === Node.TEXT_NODE)

  // all good only text nodes or entirely empty
  if(elements.length === 0) {
    let body = getBody(element);

    World.add(engine.world, [body]);
  } else if(element.nodeName === 'P'){
    console.log(textNodes)
    const composite = createCompositBody(element);
    World.add(engine.world, [composite]);
  } else {
    elements.forEach(child => {
      createBody(child);
    })
  }
}

function walkTheDOM(node) {
  let result:any= {
    host: node,
    items: []
  };

  node = node.firstElementChild;
  while (node) {
    if(node.nodeType !== Node.TEXT_NODE ) {
      const items = walkTheDOM(node);
      result.items.push(items)
    }

    node = node.nextSibling;
  }

  if(result.items.length === 0) {
    return result.host;
  }

  return result;
}
