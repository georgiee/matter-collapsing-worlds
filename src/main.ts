import { WorldBuilder } from './builder';

/**
 * Status:
 * Default: Transform into dom body, use client rect
 * Click + Shift: Transform & pin to world (use local node offset for the constrain offset)
 * Inline elements are connverted to inline-block (or ignore)
 * Next:
 * A) Query:
 * Find all children of an element with element.childNodes (when we create elemets from clicking)
 * 1.if there are only element nodes we can convert all of them to dom bodies.
 * 2. if there are only text nodes we can create a multi part body. Convert each lines
 * to a dom body and use all parts to create the overall body. This way we have a better shape
 * We can't create physical objects from text node. Converting them to spans (like we could do for single characaters) is another experiment.
 * if there are mixed elements only use the current node with its rectangle
 * B) Autosearch
 * Basically all leaves of the DOM tree are candidates to convert into a dom body.
 * This means we could find all leaves and start converting them as an idiomatic solution.
 * If a leave is a text node go one level up and try to build the parent. We must ensure that no other leave
 * is converted to dom body when the parent is converted — otherwise the transformations would add it up.
 * We could create our own display list to prevent this in the future
 * C)
 */
window.addEventListener('load', () => {
  const builder = new WorldBuilder(document.querySelector('.collapsing-container'));
  builder.start();
});
