/**
 * 手势处理
 * 处理拖拽、缩放等触摸操作
 */

class GestureHandler {
  constructor(canvasRenderer) {
    this.renderer = canvasRenderer;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartOffsetX = 0;
    this.dragStartOffsetY = 0;

    this.isZooming = false;
    this.lastDistance = 0;
    this.zoomCenter = { x: 0, y: 0 };

    this.lastTapTime = 0;
    this.lastTapX = 0;
    this.lastTapY = 0;
  }

  /**
   * 处理触摸开始
   */
  onTouchStart(e) {
    const touches = e.touches;

    if (touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = touches[0].clientX;
      this.dragStartY = touches[0].clientY;
      this.dragStartOffsetX = this.renderer.offsetX;
      this.dragStartOffsetY = this.renderer.offsetY;

      this.lastTapX = touches[0].clientX;
      this.lastTapY = touches[0].clientY;
    } else if (touches.length === 2) {
      this.isZooming = true;
      this.isDragging = false;
      this.zoomCenter = {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
      this.lastDistance = this._getTouchDistance(touches[0], touches[1]);
    }
  }

  /**
   * 处理触摸移动
   */
  onTouchMove(e) {
    const touches = e.touches;

    if (touches.length === 1 && this.isDragging) {
      const deltaX = touches[0].clientX - this.dragStartX;
      const deltaY = touches[0].clientY - this.dragStartY;

      this.renderer.offsetX = this.dragStartOffsetX + deltaX;
      this.renderer.offsetY = this.dragStartOffsetY + deltaY;

      return 'drag';
    } else if (touches.length === 2 && this.isZooming) {
      const distance = this._getTouchDistance(touches[0], touches[1]);
      const zoomDelta = (distance - this.lastDistance) * 0.001;

      this.renderer.handleZoom(
        zoomDelta,
        this.zoomCenter.x,
        this.zoomCenter.y
      );

      this.lastDistance = distance;
      return 'zoom';
    }

    return null;
  }

  /**
   * 处理触摸结束
   */
  onTouchEnd(e) {
    const touches = e.touches;

    if (touches.length === 0) {
      const now = Date.now();
      const isDoubleTap =
        now - this.lastTapTime < 300 &&
        Math.abs(e.changedTouches[0].clientX - this.lastTapX) < 10 &&
        Math.abs(e.changedTouches[0].clientY - this.lastTapY) < 10;

      this.isDragging = false;
      this.isZooming = false;

      if (isDoubleTap) {
        this.renderer.scale = 1;
        this.renderer.offsetX = 0;
        this.renderer.offsetY = 0;
        console.log('[GestureHandler] Double tap: reset zoom');
        return 'reset';
      }

      this.lastTapTime = now;
    } else if (touches.length === 1) {
      this.isZooming = false;
      this.isDragging = true;
      this.dragStartX = touches[0].clientX;
      this.dragStartY = touches[0].clientY;
      this.dragStartOffsetX = this.renderer.offsetX;
      this.dragStartOffsetY = this.renderer.offsetY;
    }

    return null;
  }

  /**
   * 处理点击
   */
  onTap(x, y) {
    const seatIndex = this.renderer.hitTest(x, y);
    return seatIndex;
  }

  /**
   * 计算两点距离
   */
  _getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export default GestureHandler;
