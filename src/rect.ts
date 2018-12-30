export class Rect {
  public x = Number.POSITIVE_INFINITY;
  public y = Number.POSITIVE_INFINITY;
  public width = Number.NEGATIVE_INFINITY;
  public height = Number.NEGATIVE_INFINITY;

  constructor(rectObj = null) {
    if(rectObj){
      this.x = rectObj.x;
      this.y = rectObj.y;
      this.width = rectObj.width;
      this.height = rectObj.height;
    }
  }

  equal(rect) {
    return this.x === rect.x &&
    this.y === rect.y &&
    this.width === rect.width &&
    this.height === rect.height
  }

  center() {
    return new Rect({
      x: this.x + this.width/2,
      y: this.y + this.height/2,
      width: this.width,
      height: this.height
    })
  }

  // nah wrong, this should nerge bounding boxes
  merge(other) {
    return new Rect({
      x: Math.min(this.x, other.x),
      y: Math.min(this.y, other.y),
      width: Math.max(this.width, other.width),
      height: Math.max(this.height, other.height)
    })
  }

  static from(other) {
    const rect = new Rect();
    rect.x = other.x;
    rect.y = other.y;
    rect.width = other.width;
    rect.height = other.height;

    return rect;
  }

  static merge(...rects) {
    let rect = new Rect();
    while(rects.length) {
      rect = rect.merge(rects.shift());
    }

    return rect;
 }
}
