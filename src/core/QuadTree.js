/**
 * 四叉树 - 用于空间索引和快速点击检测
 * 优化点击检测从O(n)降低到O(log n)
 */

class QuadTree {
  constructor(bounds, maxCapacity = 4) {
    this.bounds = bounds;
    this.maxCapacity = maxCapacity;
    this.items = [];
    this.subdivided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  /**
   * 插入项目
   */
  insert(item) {
    if (!this._contains(item)) {
      return false;
    }

    if (this.items.length < this.maxCapacity) {
      this.items.push(item);
      return true;
    }

    if (!this.subdivided) {
      this._subdivide();
    }

    return (
      this.northeast.insert(item) ||
      this.northwest.insert(item) ||
      this.southeast.insert(item) ||
      this.southwest.insert(item)
    );
  }

  /**
   * 查询范围内的项目
   */
  query(range, found = []) {
    if (!this._intersects(range)) {
      return found;
    }

    for (let item of this.items) {
      if (this._intersects(range, item)) {
        found.push(item);
      }
    }

    if (this.subdivided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  /**
   * 查询点击的项目
   */
  queryPoint(x, y) {
    const point = { x, y, width: 0, height: 0 };
    return this.query(point);
  }

  /**
   * 私有方法：判断项目是否在范围内
   */
  _contains(item) {
    return (
      item.x >= this.bounds.x &&
      item.x + item.width <= this.bounds.x + this.bounds.width &&
      item.y >= this.bounds.y &&
      item.y + item.height <= this.bounds.y + this.bounds.height
    );
  }

  /**
   * 私有方法：判断两个矩形是否相交
   */
  _intersects(a, b = null) {
    const rect = b || this.bounds;
    return !(
      a.x + a.width <= rect.x ||
      a.x >= rect.x + rect.width ||
      a.y + a.height <= rect.y ||
      a.y >= rect.y + rect.height
    );
  }

  /**
   * 私有方法：分割四叉树
   */
  _subdivide() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;

    this.northeast = new QuadTree({ x: x + w, y: y, width: w, height: h }, this.maxCapacity);
    this.northwest = new QuadTree({ x: x, y: y, width: w, height: h }, this.maxCapacity);
    this.southeast = new QuadTree({ x: x + w, y: y + h, width: w, height: h }, this.maxCapacity);
    this.southwest = new QuadTree({ x: x, y: y + h, width: w, height: h }, this.maxCapacity);

    this.subdivided = true;
  }
}

export default QuadTree;
