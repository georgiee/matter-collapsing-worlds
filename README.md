# Collapsing Worlds
Take [matter.js](http://brm.io/matter-js/) together with a thin layer to map the physics world to css transformations and you can have some fun on any website. [Show Demo](https://georgiee.github.io/matter-collapsing-worlds/).

---
That's an experiment how to convert any website into a physics world to destroy it afterwards with physical rules. State at the moment:

+ 1. Matter JS to CSS Transformations is solid
+ 2. World vs Viewport with Scrolling support is solid.
+ 2. Extract Inline Rects (to have the shape of text not the block) is in progress (via Range/Rects)
+ 3. Mouse Interaction: Only building not interacting with the created models (Todo: custom MouseConstrains)

Much to do and the code is in a rough and experimental state.

[Open Web Preview](https://georgiee.github.io/matter-collapsing-worlds/)

[![](docs/preview.gif)](https://georgiee.github.io/matter-collapsing-worlds/)
