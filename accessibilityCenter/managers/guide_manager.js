class GuideManager {
  constructor() {
    this.guideLine = null;
    this.guideWindow = null;
    this.guideWindowOverlayTop = null;
    this.guideWindowOverlayBottom = null;
  }

  createGuideElements() {
    this.guideLine = document.createElement('div');
    this.guideLine.className = 'guide-line';
    document.body.appendChild(this.guideLine);

    this.guideWindow = document.createElement('div');
    this.guideWindow.className = 'guide-window';
    document.body.appendChild(this.guideWindow);

    this.guideWindowOverlayTop = document.createElement('div');
    this.guideWindowOverlayTop.className = 'guide-window-overlay-top';
    document.body.appendChild(this.guideWindowOverlayTop);

    this.guideWindowOverlayBottom = document.createElement('div');
    this.guideWindowOverlayBottom.className = 'guide-window-overlay-bottom';
    document.body.appendChild(this.guideWindowOverlayBottom);
  }

  toggleGuideLine(show) {
    if (show) {
      document.addEventListener('mousemove', this.handleGuideLineMove.bind(this));
      this.guideLine.classList.add('guide-line-active');
    } else {
      document.removeEventListener('mousemove', this.handleGuideLineMove.bind(this));
      this.guideLine.classList.remove('guide-line-active');
    }
  }

  handleGuideLineMove(event) {
    event.preventDefault();
    this.guideLine.style.top = `${event.clientY}px`;
  }

  toggleGuideWindow(show) {
    if (show) {
      this.guideWindow.classList.add('active');
      this.guideWindowOverlayTop.classList.add('active');
      this.guideWindowOverlayBottom.classList.add('active');
      document.addEventListener('mousemove', this.handleGuideWindowMove.bind(this));
    } else {
      this.guideWindow.classList.remove('active');
      this.guideWindowOverlayTop.classList.remove('active');
      this.guideWindowOverlayBottom.classList.remove('active');
      document.removeEventListener('mousemove', this.handleGuideWindowMove.bind(this));
    }
  }

  handleGuideWindowMove(event) {
    const guideWindowHeight = 50;
    const guideWindow = this.guideWindow;
    const guideWindowOverlayTop = this.guideWindowOverlayTop;
    const guideWindowOverlayBottom = this.guideWindowOverlayBottom;

    if (!guideWindow || !guideWindowOverlayTop || !guideWindowOverlayBottom) {
      console.warn('Elementos guía no encontrados');
      return;
    }

    const y = Math.max(guideWindowHeight / 2, Math.min(event.clientY, window.innerHeight - guideWindowHeight / 2));

    const topHeight = y - guideWindowHeight / 2;
    const bottomHeight = window.innerHeight - (y + guideWindowHeight / 2);

    guideWindow.style.setProperty('top', `${topHeight}px`, 'important');
    guideWindow.style.setProperty('height', `${guideWindowHeight}px`, 'important');

    guideWindowOverlayTop.style.setProperty('top', '0', 'important');
    guideWindowOverlayTop.style.setProperty('height', `${topHeight}px`, 'important');

    guideWindowOverlayBottom.style.setProperty('top', `${y + guideWindowHeight / 2}px`, 'important');
    guideWindowOverlayBottom.style.setProperty('height', `${bottomHeight}px`, 'important');
  }
}