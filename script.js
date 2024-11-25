let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    // Check if device supports touch events
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const startEvent = isTouchDevice ? 'touchstart' : 'mousedown';
    const moveEvent = isTouchDevice ? 'touchmove' : 'mousemove';
    const endEvent = isTouchDevice ? 'touchend' : 'mouseup';

    const getCoords = (e) => {
      return isTouchDevice
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
    };

    paper.addEventListener(moveEvent, (e) => {
      e.preventDefault();

      if (!this.holdingPaper) return;

      const coords = getCoords(e);

      if (!this.rotating) {
        this.touchMoveX = coords.x;
        this.touchMoveY = coords.y;

        this.velX = this.touchMoveX - this.prevTouchX;
        this.velY = this.touchMoveY - this.prevTouchY;
      }

      const dirX = coords.x - this.touchStartX;
      const dirY = coords.y - this.touchStartY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;

      if (this.rotating) {
        this.rotation = degrees;
      }

      if (!this.rotating) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
      }

      this.prevTouchX = this.touchMoveX;
      this.prevTouchY = this.touchMoveY;

      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    });

    paper.addEventListener(startEvent, (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      paper.style.zIndex = highestZ;
      highestZ += 1;

      const coords = getCoords(e);
      this.touchStartX = coords.x;
      this.touchStartY = coords.y;
      this.prevTouchX = coords.x;
      this.prevTouchY = coords.y;

      // For desktop, check right-click to rotate
      if (!isTouchDevice && e.button === 2) {
        this.rotating = true;
      }
    });

    // Use window event for end to capture release anywhere
    window.addEventListener(endEvent, () => {
      this.holdingPaper = false;
      this.rotating = false;
    });

    // Prevent context menu on right-click for desktop
    if (!isTouchDevice) {
      paper.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Touch-specific rotation for mobile
    if (isTouchDevice) {
      paper.addEventListener('gesturestart', (e) => {
        e.preventDefault();
        this.rotating = true;
      });
      paper.addEventListener('gestureend', () => {
        this.rotating = false;
      });
    }
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
