class StyleManager {
  constructor() {
    this.tracker = null;
  }

  initialize(tracker) {
    this.tracker = tracker;
  }

  loadInitialStyles() {
    this.loadHighlightReading();
    this.loadHighlightHover();
    this.loadGuideWindow();
    this.loadGuideLine();
    this.loadHideAnimations();
    this.loadCursorSizes();
    this.loadHideMedia();
    this.loadHighlightElements();
    this.loadColorShift();
    this.loadColors();
    this.loadVisionFilters();
    this.loadFonts();
    this.loadIncreaseInteractiveElementsHover();

    this.loadAltText();
  }

  loadHighlightReading() {
    this.tracker.set('.highlight-reading', {
      'background-color': '#1E88E5 !important',
      'color': 'white !important',
      'border-radius': '4px',
      'padding': '2px 4px',
      'animation': 'reading-pulse 1s infinite',
      'transition': 'transform 0.2s ease, background-color 0.2s ease',
      'box-shadow': '0 0 5px 2px rgba(21, 98, 166, 0.7)'
    });
  }

  loadHighlightHover() {
    this.tracker.set('.highlight-hovered-element:not(.accessibility-panel, .accessibility-panel *)', {
      'outline': '3px solid #1E88E5 !important',
      'background-color': 'rgba(30, 136, 229, 0.2) !important',
      'transition': 'all 0.2s ease !important'
    });
  }

  loadGuideWindow() {
    this.tracker.set('.guide-window', {
      'width': '100% !important',
      'position': 'fixed !important',
      'background': 'transparent !important',
      'border-top': '3px solid #1E88E5 !important',
      'border-bottom': '3px solid #1E88E5 !important',
      'pointer-events': 'none !important',
      'display': 'none'
    });

    this.tracker.set('.guide-window-overlay-top', {
      'position': 'fixed !important',
      'top': '0 !important',
      'left': '0 !important',
      'width': '100% !important',
      'background': 'rgba(0, 0, 0, 0.3) !important',
      'z-index': '2147483645 !important',
      'pointer-events': 'none !important',
      'display': 'none'
    });

    this.tracker.set('.guide-window-overlay-bottom', {
      'position': 'fixed !important',
      'bottom': '0 !important',
      'left': '0 !important',
      'width': '100% !important',
      'background': 'rgba(0, 0, 0, 0.3) !important',
      'z-index': '2147483645 !important',
      'pointer-events': 'none !important',
      'display': 'none'
    });

    this.tracker.set('.guide-window-overlay-bottom.active', {
      'display': 'block',
    });
    this.tracker.set('.guide-window-overlay-top.active', {
      'display': 'block',
    });
    this.tracker.set('.guide-window.active', {
      'display': 'block',
    });
  }

  loadAltText() {   
    this.tracker.set('.alt-tooltip', {
      'position': 'fixed',
      'display': 'none',
      'background': 'rgba(0, 0, 0, 0.9)',
      'color': '#fff',
      'padding': '8px 12px',
      'border-radius': '6px',
      'font-size': '14px',
      'line-height': '1.4',
      'z-index': '10000',
      'pointer-events': 'none',
      'max-width': '300px',
      'word-wrap': 'break-word',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
    });

    this.tracker.set('.alt-overlay', {
      'position': 'absolute',
      'background': 'rgba(0, 0, 0, 0.85)',
      'color': 'white',
      'padding': '6px 10px',
      'font-size': '14px',
      'border-radius': '6px',
      'z-index': '9999',
      'pointer-events': 'none',
      'box-sizing': 'border-box',
      'overflow': 'hidden',
      'text-overflow': 'ellipsis',
      'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.2)',
      'backdrop-filter': 'blur(4px)',
      'display': 'none'
    });
  }

  loadGuideLine() {
    this.tracker.set('.guide-line', {
      'pointer-events': 'none',
      'position': 'fixed !important',
      'height': '4px !important',
      'background': '#1E88E5 !important',
      'width': '100% !important',
      'z-index': '2147483646 !important',
      'display': 'none'
    });

    this.tracker.set('.guide-line.guide-line-active', {
      'display': 'block'
    });
  }

  loadCursorSizes() {
    this.tracker.set(`*.cursor-large, *.cursor-large *`, {
      'cursor': `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M1,1 L10,30 L17,23 L25,31 L30,26 L22,18 L29,11 Z'/></svg>") 2 2, auto !important`});

    this.tracker.set(`*.cursor-extra-large, *.cursor-extra-large *`, {
      'cursor': `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><path fill='white' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' d='M1,1 L15,45 L26,34 L38,47 L45,39 L33,27 L43,17 Z'/></svg>") 3 3, auto !important`});
  }

  loadHideAnimations() {
    this.tracker.set('.hide-animations, .hide-animations *', {
      // Animaciones
      'animation': 'none !important',
      'animation-play-state': 'paused !important',

      '-webkit-animation': 'none !important',
      '-webkit-animation-play-state': 'paused !important',

      // Transiciones
      'transition': 'none !important',
      '-webkit-transition': 'none !important',

      // Scroll 
      'scroll-behavior': 'auto !important',

      // //  Transforms y efectos 3D 
      // 'transform': 'none !important',
      // '-webkit-transform': 'none !important',
    });
  }

  loadHideMedia() {
    this.tracker.set(`*.hide-media img:not(.accessibility-panel img),
       *.hide-media video:not(.accessibility-panel video),
       *.hide-media svg:not(.accessibility-panel svg),
       *.hide-media figure:not(.accessibility-panel figure),
       *.hide-media picture:not(.accessibility-panel picture),
       *.hide-media i:not(.accessibility-panel i)`, {
      'display': 'none',
      'visibility': 'hidden'
    });

    this.tracker.set(`*.hide-media *:not(.accessibility-panel *)`, {
      'background-image': 'none !important'
    });
  }

  loadIncreaseInteractiveElementsHover() {
    this.tracker.set(`html.increase-interactive-elements-hover a, 
      html.increase-interactive-elements-hover button, 
      html.increase-interactive-elements-hover input[type="button"]`, {
      'transition': 'transform 0.2s ease, background 0.2s ease'
    });

    this.tracker.set(`html.increase-interactive-elements-hover a:hover,
      html.increase-interactive-elements-hover button:hover,
      html.increase-interactive-elements-hover input[type="button"]:hover`, {
      'transform': 'scale(1.2)'
    });
  }

  loadHighlightElements() {
    this.tracker.set('html.highlight-element-a a:not(.accessibility-panel a)', {
      'outline': '2px dashed #2756D6 !important',
      'background-color': 'rgba(39, 86, 214, 0.15) !important',
      'border-radius': '4px'
    });

    this.tracker.set(`html.highlight-element-title h1:not(.accessibility-panel h1),
      html.highlight-element-title h2:not(.accessibility-panel h2),
      html.highlight-element-title h3:not(.accessibility-panel h3),
      html.highlight-element-title h4:not(.accessibility-panel h4)`, {
      'outline': '2px dashed #2ecc1aff !important',
      'background-color': 'rgba(21, 247, 21, 0.15) !important',
      'border-radius': '4px'
    });
    
    this.tracker.set('html.highlight-element-buttons button:not(.accessibility-panel button)', {
      'outline': '2px dashed #E65100 !important',
      'background-color': 'rgba(230, 81, 0, 0.15) !important',
      'border-radius': '4px'
    });
  }

  loadColorShift() {
    this.tracker.set('*.gray-scale', {
      'filter': 'grayscale(1);'
    });
    this.tracker.set('*.sepia', {
      'filter': 'sepia(1);'
    });
  }

  loadColors() {
    this.tracker.set('*.high-contrast', {
      'filter': 'contrast(1.2);'
    });
    this.tracker.set('*.inverted', {
      'filter': 'invert(100%) !important;'
    });
  }

  loadVisionFilters() {
    // Protanopia (deficiencia para rojos)
    this.tracker.set('*.protanopia', {
        'filter': 'sepia(30%) saturate(450%) hue-rotate(-50deg) brightness(95%) contrast(90%)'
    });

    // Deuteranopia (deficiencia para verdes)
    this.tracker.set('*.deuteranopia', {
        'filter': 'sepia(25%) saturate(400%) hue-rotate(60deg) brightness(95%) contrast(90%)'
    });

    // Tritanopia (deficiencia para azules)
    this.tracker.set('*.tritanopia', {
        'filter': 'sepia(20%) saturate(350%) hue-rotate(160deg) brightness(95%) contrast(90%)'
    });
  }

  loadFonts() {  
    const regular = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff");
    const bold = chrome.runtime.getURL("fonts/OpenDyslexic-Bold.woff");
    const italic = chrome.runtime.getURL("fonts/OpenDyslexic.woff");
    const boldItalic = chrome.runtime.getURL("fonts/OpenDyslexic-BoldItalic.woff");

    this.tracker.set('@font-face', {
      'font-family': 'OpenDyslexic',
      'src': `url('${regular}') format('woff')`,
      'font-weight': 'normal',
      'font-style': 'normal'
    });
    this.tracker.set('@font-face', {
      'font-family': 'OpenDyslexic',
      'src': `url('${bold}') format('woff')`,
      'font-weight': 'bold',
      'font-style': 'normal'
    });
    this.tracker.set('@font-face', {
      'font-family': 'OpenDyslexic',
      'src': `url('${italic}') format('woff')`,
      'font-weight': 'normal',
      'font-style': 'italic'
    });
    this.tracker.set('@font-face', {
      'font-family': 'OpenDyslexic',
      'src': `url('${boldItalic}') format('woff')`,
      'font-weight': 'bold',
      'font-style': 'italic'
    });
  }
}