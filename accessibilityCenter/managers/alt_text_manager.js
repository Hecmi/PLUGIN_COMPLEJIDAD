class AltTextManager {
  constructor(panel) {
    this.panel = panel;
    this.mode = 'off';
    this.tooltip = null;
    this.overlays = new Map();
    this.intersectionObserver = null;
    this.mutationObserver = null;
    this.handleMouseMove = this.handleMouseMove.bind(this);
    
    this.createElements();
    this.setupObservers();
  }

  createElements() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'alt-tooltip';
    this.tooltip.setAttribute('aria-live', 'polite');
    this.tooltip.setAttribute('role', 'tooltip');
    
    
    document.body.appendChild(this.tooltip);
  }

  setupObservers() {
    // Observer para detectar cambios en la visibilidad y posición
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const img = entry.target;
          const overlay = this.overlays.get(img);
          if (overlay) {
            if (entry.isIntersecting) {
              this.positionOverlay(img, overlay);
              overlay.style.display = 'block';
            } else {
              overlay.style.display = 'none';
            }
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' 
      }
    );

    // Observer para detectar cambios en la pgina
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.mode === 'overlay') {
        this.checkForNewImages();
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.clearOverlays();

    console.log("MODO EN ALT TEXT", mode);
    
    if (mode === 'overlay') {
      this.createOverlays();
    }

    if (mode === 'follow') {
      document.addEventListener('mousemove', this.handleMouseMove);
    } else {
      document.removeEventListener('mousemove', this.handleMouseMove);
      this.tooltip.style.display = 'none';
    }
  }

  clearOverlays() {
    this.overlays.forEach((overlay, img) => {
      this.intersectionObserver.unobserve(img);
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    this.overlays.clear();
  }

  createOverlays() {
    document.querySelectorAll('img[alt]').forEach(img => {
      if (!img.alt.trim()) return;
      
      this.createOverlayForImage(img);
    });
  }

  createOverlayForImage(img) {
    if (this.overlays.has(img)) return;

    const overlay = document.createElement('div');
    overlay.className = 'alt-overlay';
    overlay.textContent = img.alt;
    overlay.style.cssText = `
      max-width: ${img.offsetWidth}px;
    `;

    document.body.appendChild(overlay);
    this.overlays.set(img, overlay);
    this.intersectionObserver.observe(img);
    
    // Posicionar inicialmente
    this.positionOverlay(img, overlay);
  }

  positionOverlay(img, overlay) {
    const rect = img.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    overlay.style.left = `${rect.left + scrollX}px`;
    overlay.style.top = `${rect.top + scrollY}px`;
    overlay.style.width = `${rect.width}px`;
  }

  checkForNewImages() {
    document.querySelectorAll('img[alt]').forEach(img => {
      if (!this.overlays.has(img) && img.alt.trim()) {
        this.createOverlayForImage(img);
      }
    });
  }

  handleMouseMove(event) {
    if (this.mode !== 'follow') return;
    
    const img = event.target.closest('img[alt]');
    if (img && img.alt.trim()) {
      this.showTooltip(img.alt, event.clientX, event.clientY);
    } else {
      this.tooltip.style.display = 'none';
    }
  }

  showTooltip(text, x, y) {
    this.tooltip.textContent = text;
    this.tooltip.style.display = 'block';
    
    const rect = this.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = 15;

    // Ajustar posición para no salirse el tamño total
    let left = x + offset;
    let top = y + offset;

    if (left + rect.width > viewportWidth) {
      left = x - rect.width - offset;
    }

    if (top + rect.height > viewportHeight) {
      top = y - rect.height - offset;
    }

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  updateFontSize(value) {
    const size = value !== 'none' ? `${value}px` : '';
    
    this.overlays.forEach(overlay => {
      overlay.style.fontSize = size;
    });
    
    this.tooltip.style.fontSize = size;
  }

  destroy() {
    this.clearOverlays();
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
  }
}