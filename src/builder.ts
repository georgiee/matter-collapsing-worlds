import { CollapsingWorld } from './collapsing-world';
import { mouseToElement$, createRandomElement$ } from './util';
import { DOMBody } from './dom-body';
import { Constraint, World, Composite, Composites } from 'matter-js';
import { Offset } from './core/helper';
import { buildWordNet } from './compositions/word-net';


export class WorldBuilder {
  private _collapsingWorld: CollapsingWorld;

  constructor(
    private _root: HTMLElement
  ) {
    this.init();
  }

  init() {
    this._collapsingWorld = new CollapsingWorld(document.body);
    this._collapsingWorld.setGravity(1);

    // create junk to play with (alt + mouse down and moving)
    createRandomElement$(250).subscribe(({x, y}) => {
      this._collapsingWorld.addJunk(x, y);
    })

    // wait for elements being selected by the user (click)
    // click + shift to pin the element with a rope
    mouseToElement$(this._root)
      .subscribe(({element, options, event}) => {
        event.preventDefault();

        const body = DOMBody.fromElement({
          element
        });

        if(body === null) {
          return;
        }

        this._collapsingWorld.add(body);

        // press shift to disable pinning
        if(options.shift) {
          this.pin(body, event.offsetX, event.offsetY)
        }
    });
  }

  pin(body, dx=0, dy=0) {
    let offset: Offset = {
      x: dx - body.width/2,
      y: dy - body.height/2
    };
    // offset.x = -body.width/2;
    // offset.y = 0
    // this._collapsingWorld.pinToWorld(body, offset);
    this._collapsingWorld.pinToWorld(body, offset);
  }

  start() {
    this._collapsingWorld.run();
  }


  isolateCharacters(element: HTMLElement) {

    const textNode = element.innerText;
    // const words = wordsAndEmojis(textNode);
    // element.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');
    let newContent = textNode.replace(/(\w+)/g, "<span>$1</span>");

    // emojis
    // via https://stackoverflow.com/questions/43242440/javascript-unicode-emoji-regular-expressions
    newContent = newContent.replace(/([\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}])/ug
      , "<span>$1</span>");
    element.innerHTML = newContent;

    const spanElements = Array.from(element.querySelectorAll('span'));
    buildWordNet(element, spanElements, this._collapsingWorld);
  }
}

