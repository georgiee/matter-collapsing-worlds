export class Rectangle {
  public top: number;
  public bottom: number;
  public left: number;
  public right: number;

  constructor(left: number = 0, right: number = 0, top: number = 0, bottom: number = 0) {
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
  }

  translate(dx, dy) {
    this.left += dx;
    this.right += dx;
    this.top += dy;
    this.bottom += dy;
  }

  get x(): number {
    return this.left;
  }

  get y(): number {
    return this.top;
  }

  get width(): number {
    return this.right - this.left;
  }

  get height(): number {
    return this.bottom - this.top;
  }

  public equals(rect: Rectangle): boolean {
    return (
      parseFloat(this.top.toFixed(4)) === parseFloat(rect.top.toFixed(4)) &&
      parseFloat(this.bottom.toFixed(4)) === parseFloat(rect.bottom.toFixed(4)) &&
      parseFloat(this.left.toFixed(4)) === parseFloat(rect.left.toFixed(4)) &&
      parseFloat(this.right.toFixed(4)) === parseFloat(rect.right.toFixed(4))
    );
  }

  static from(rect: ClientRect|DOMRect) {
    const x = rect.left;
    const y = rect.top;
    const width = rect.width;
    const height = rect.height;

    return new Rectangle(
      x, x + width,
      y, y + height
    );
  }

  static subtract(rect: Rectangle, subrect: Rectangle): any {
    const newRect = new Rectangle(
      rect.left - subrect.left,
      rect.right - subrect.right,
      rect.top - subrect.top,
      rect.bottom - subrect.bottom
    )
    return newRect;
  }
}