class ZoomManager {
  constructor() {
    this.state = {
      magnifier: null,
      screenshotImage: null,
      captureScrollY: 0,
      lastScrollY: 0,
      lastUpdateTime: 0,
      isMoving: false,
      lastX: 0,
      lastY: 0,
      debounceTimeout: null,
      observer: null
    };
    
    this.CONFIG = {
      ZOOM_LEVEL: 2,
      MAGNIFIER_SIZE: 250,
      DEBOUNCE_DELAY: 200,
      UPDATE_INTERVAL: 1000,
      DIFF_THRESHOLD: 20,
      BORDER_COLOR: '#aaa',
      SHADOW: '0 0 10px rgba(0,0,0,0.5)',
      MAGNIFIER_ID: 'accessibility-magnifier',
      MAGNIFIER_ZINDEX: '2147483646'
    };
  }

  applyZoom(isActive) {
    if (isActive) {
      this.updateCapture(this.activateMagnifier.bind(this));
    } else {
      this.cleanupMagnifier();
    }
  }

  updateCapture(callback) {
    clearTimeout(this.state.debounceTimeout);
    
    this.state.debounceTimeout = setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error al capturar:', chrome.runtime.lastError);
          callback?.();
          return;
        }

        if (response?.screenshot) {
          this.compareImages(response.screenshot, (hasChanged) => {
            if (hasChanged) {
              this.state.screenshotImage = response.screenshot;
              this.state.captureScrollY = window.scrollY || 0;
            }
            callback?.();
          });
        } else {
          console.warn('No se pudo obtener captura:', response?.error || 'Sin respuesta');
          callback?.();
        }
      });
    }, this.CONFIG.DEBOUNCE_DELAY);
  }

  compareImages(newImage, callback) {
    if (!this.state.screenshotImage) {
      callback(true);
      return;
    }

    const img1 = new Image();
    const img2 = new Image();
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let loadedCount = 0;

    const checkImages = () => {
      if (++loadedCount < 2) return;

      ctx.drawImage(img1, 0, 0, size, size);
      const data1 = ctx.getImageData(0, 0, size, size).data;
      
      ctx.drawImage(img2, 0, 0, size, size);
      const data2 = ctx.getImageData(0, 0, size, size).data;

      let diff = 0;
      for (let i = 0; i < data1.length; i += 4) {
        diff += Math.abs(data1[i] - data2[i]) +
                Math.abs(data1[i + 1] - data2[i + 1]) +
                Math.abs(data1[i + 2] - data2[i + 2]);
      }

      callback(diff / (size * size) > this.CONFIG.DIFF_THRESHOLD);
    };

    img1.onload = img2.onload = checkImages;
    img1.src = this.state.screenshotImage;
    img2.src = newImage;
  }

  throttledUpdate(callback) {
    const now = Date.now();
    if (now - this.state.lastUpdateTime < this.CONFIG.UPDATE_INTERVAL) return;
    this.state.lastUpdateTime = now;
    this.updateCapture(callback);
  }

  updateMagnifier() {
    if (!this.state.screenshotImage || !this.state.magnifier) return;

    const dpr = window.devicePixelRatio || 1;
    const currentScrollY = window.scrollY || 0;
    const adjustedX = this.state.lastX * dpr;
    const adjustedY = (this.state.lastY + (currentScrollY - this.state.captureScrollY)) * dpr;
    const docWidth = document.documentElement.clientWidth;
    const docHeight = document.documentElement.clientHeight;

    Object.assign(this.state.magnifier.style, {
      display: 'block',
      left: `${this.state.lastX - this.CONFIG.MAGNIFIER_SIZE / 2}px`,
      top: `${this.state.lastY + currentScrollY - this.CONFIG.MAGNIFIER_SIZE / 2}px`,
      backgroundImage: `url(${this.state.screenshotImage})`,
      backgroundSize: `${docWidth * this.CONFIG.ZOOM_LEVEL * dpr}px ${docHeight * this.CONFIG.ZOOM_LEVEL * dpr}px`,
      backgroundPosition: `${
        -(adjustedX * this.CONFIG.ZOOM_LEVEL - (this.CONFIG.MAGNIFIER_SIZE * dpr) / 2)
      }px ${
        -(adjustedY * this.CONFIG.ZOOM_LEVEL - (this.CONFIG.MAGNIFIER_SIZE * dpr) / 2)
      }px`,
    });

    this.state.isMoving = false;
  }

  handleMouseMove(e) {
    this.state.lastX = e.clientX;
    this.state.lastY = e.clientY;
    if (!this.state.isMoving) {
      this.state.isMoving = true;
      requestAnimationFrame(this.updateMagnifier.bind(this));
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY || 0;
    if (Math.abs(currentScrollY - this.state.lastScrollY) > 100) {
      this.state.lastScrollY = currentScrollY;
      this.throttledUpdate(() => {
        if (!this.state.isMoving) {
          this.state.isMoving = true;
          requestAnimationFrame(this.updateMagnifier.bind(this));
        }
      });
    } else if (!this.state.isMoving) {
      this.state.isMoving = true;
      requestAnimationFrame(this.updateMagnifier.bind(this));
    }
  }

  handleMouseLeave() {
    if (this.state.magnifier) this.state.magnifier.style.display = 'none';
  }

  activateMagnifier() {
    if (this.state.magnifier) return;

    const dpr = window.devicePixelRatio || 1;
    this.state.magnifier = document.createElement('div');
    this.state.magnifier.id = this.CONFIG.MAGNIFIER_ID;

    Object.assign(this.state.magnifier.style, {
      position: 'absolute',
      border: `2px solid ${this.CONFIG.BORDER_COLOR}`,
      borderRadius: '50%',
      width: `${this.CONFIG.MAGNIFIER_SIZE}px`,
      height: `${this.CONFIG.MAGNIFIER_SIZE}px`,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: this.CONFIG.MAGNIFIER_ZINDEX,
      boxShadow: this.CONFIG.SHADOW,
      display: 'none',
      backgroundColor: 'white',
    });

    document.body.appendChild(this.state.magnifier);

    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.scrollHandler = this.handleScroll.bind(this);
    this.mouseLeaveHandler = this.handleMouseLeave.bind(this);

    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('scroll', this.scrollHandler);
    document.addEventListener('mouseleave', this.mouseLeaveHandler);

    this.state.observer = new MutationObserver((mutations) => {
      const significantChange = mutations.some(mutation =>
        (mutation.type === 'childList' && mutation.addedNodes.length > 0) ||
        (mutation.type === 'attributes' &&
          ['style', 'class', 'src'].includes(mutation.attributeName) &&
          mutation.target.tagName !== 'STYLE')
      );

      if (significantChange) {
        this.throttledUpdate(() => {
          if (!this.state.isMoving) {
            this.state.isMoving = true;
            requestAnimationFrame(this.updateMagnifier.bind(this));
          }
        });
      }
    });

    this.state.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'src'],
    });
  }

  cleanupMagnifier() {
    const existingMagnifier = document.getElementById(this.CONFIG.MAGNIFIER_ID);
    if (existingMagnifier?.parentNode) {
      existingMagnifier.remove();
    }
    this.state.magnifier = null;

    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }

    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.scrollHandler) {
      document.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.mouseLeaveHandler) {
      document.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }

    clearTimeout(this.state.debounceTimeout);
    this.state.debounceTimeout = null;
    this.state.screenshotImage = null;
    this.state.captureScrollY = 0;
    this.state.lastScrollY = 0;
    this.state.lastUpdateTime = 0;
    this.state.isMoving = false;
    this.state.lastX = 0;
    this.state.lastY = 0;
  }
}