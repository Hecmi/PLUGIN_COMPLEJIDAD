class AccessibilityPanel {
  constructor(language = 'es') {
    this.language = language;
    this.activeOverlay = null;
    this.lastClickedButton = null;
    this.modifiedOptions = new Set();
    this.selectedVoice = null;
    this.stopRequested = false;
    this.currentUtterance = null;
    this.inlineTags = ['A', 'B', 'I', 'SPAN', 'STRONG', 'EM', 'SUB', 'SUP', 'SMALL', 'MARK', 'DIV'];
    this.resizeObserver = null;
    this.tracker = null;
    this.shadowRoot = null;
    
    // Inicializar managers
    this.styleManager = new StyleManager();
    this.optionManager = new OptionManager(this);
    this.speechManager = new SpeechManager(this);
    this.zoomManager = new ZoomManager();
    this.guideManager = new GuideManager();
    this.textAltManager = new AltTextManager(this);
    this.eventManager = new EventManager(this);
    this.loginManager = new LoginManager();

    // Inicializar elementos adicionales
    this.modal = new ExtensionModal();
    this.loader = null;
  }

  
  setTracker(tracker) {
    this.tracker = tracker;
  }

  initializeDefaultOptions(optionsJson) {
    this.optionManager.initializeDefaultOptions(optionsJson);
  }

  setPanelConfiguration(location, minimized) {
    const panel = this.shadowRoot.querySelector('.accessibility-panel');
    
    // Cargar la posición del panel definida por el usuario
    this.setPanelPosition(location);

    // Sí las preferencias contienen el panel minimizado, activarlo
    if (minimized) {
      if (minimized == false) {
        panel.classList.toggle('minimized');
      }
    } else {
      panel.classList.toggle('minimized'); 
    }
  }

  async init(optionPanelConfiguration = null) {
    // Evitar ejecución múltiple del script
    if (document.getElementById('accessibility-panel')) {
      return;
    }

    // Verificar que chrome.runtime.getURL está disponible
    if (!chrome.runtime || !chrome.runtime.getURL) {
      console.error('chrome.runtime.getURL no está disponible');
      return;
    }

    try {
      await this.loadResources();
      await this.modal.init();
      this.modal.t(this.language);
      this.createPanel(optionPanelConfiguration);
    } catch (err) {
      console.error(`Error al intentar cargar el panel: ${err}`);
    }
  }

  loadRecomendationsStatus(isUserLogged) {
    if (isUserLogged) {
      const loggedElements = this.shadowRoot.querySelectorAll('.logged');
      loggedElements.forEach(el => el.classList.remove('hide'));

    } else {
      const unloggedElements = this.shadowRoot.querySelectorAll('.unlogged');
      unloggedElements.forEach(el => el.classList.remove('hide'));
    }
  }

  async loadResources() {
    // URL del archivo HTML
    const panelUrl = chrome.runtime.getURL("ui/panel/panel.html");

    const linkFA = document.createElement('link');
    linkFA.rel = 'stylesheet';
    linkFA.id = "font-awesome-style-ext";
    linkFA.href = chrome.runtime.getURL('libs/fontawesome-free-6.7.2-web/css/all.min.css');
    document.head.appendChild(linkFA);

    // const linkPageStyle = document.createElement('style');
    // linkPageStyle.id = "page-dynamic-styles-ext";
    // document.head.appendChild(linkPageStyle);

    const response = await fetch(panelUrl);
    if (!response.ok) {
      console.error(`Error al cargar: ${panelUrl} - ${response.status} ${response.statusText}`);
      return;
    }
    
    const [faResponse, panelResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('libs/fontawesome-free-6.7.2-web/css/all.min.css')),
      fetch(chrome.runtime.getURL("ui/panel/panel.html")),
    ]);

    const [faCSS, panelHTML] = await Promise.all([
      faResponse.text(),
      panelResponse.text()
    ]);

    this.doc = new DOMParser().parseFromString(panelHTML, 'text/html');
    this.faCSS = faCSS;
  }

  createPanel(optionPanelConfiguration) {
    const wrapper = document.createElement('div');
    wrapper.id = 'accessibility-panel';
    document.body.appendChild(wrapper);

    this.shadowRoot = wrapper.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>${this.faCSS}</style>
      <style>${this.doc.querySelector('style#style-container-ext').textContent}</style>
      <style>${this.doc.querySelector('style#style-panel-ext').textContent}</style>
      <style>${this.doc.querySelector('style#style-notification-ext').textContent}</style>
      <style>${this.doc.querySelector('style#style-login-ext').textContent}</style>
      ${this.doc.querySelector('body').innerHTML}
    `;

    // Crear elementos en el DOM principal para las guías
    this.guideManager.createGuideElements();
    
    // Inicializar el tracker CSS
    // this.tracker = new CSSTracker(document.head.querySelector('#page-dynamic-styles-ext'));
    this.tracker = Constants.STYLES[Constants.APP.panelTracker];
    
    // Cargar estilos iniciales
    this.styleManager.initialize(this.tracker);
    this.styleManager.loadInitialStyles();
    
    // Cargar funcionalidades del panel
    this.eventManager.loadTabPanelChange();
    this.eventManager.loadPanelLocation();

    // Sí hay una configuraciópara el panel, colocarla
    if (optionPanelConfiguration) {
      this.initializeDefaultOptions(optionPanelConfiguration);
    }


    this.eventManager.loadJs();
    // this.eventManager.setupEventListeners();
    this.eventManager.loadPanelLanguageChange();


    this.loginManager.initializeElementEvents(this.shadowRoot);
  }

  setComplexityLevel(complexityLevel) {
    this.eventManager.setComplexityLevel(complexityLevel);
  }

  translatePanel(language) {
    this.eventManager.translatePanel(language);
  }

  addOptionToAdaptationTab(adaptation) {
    this.eventManager.addOptionToAdaptationTab(adaptation);
  }

  handleClickShowNotificationsEvent(action) {
    this.eventManager.handleClickShowNotificationsEvent(action);
  }

  handleClickDontShowAcceptNotificationsEvent(action) {
    this.eventManager.handleClickDontShowAcceptNotificationsEvent(action);
  }

  handleClickDontShowRejectNotificationsEvent(action) {
    this.eventManager.handleClickDontShowRejectNotificationsEvent(action);
  }

  setPanelPosition(position) {
    if (!position) return;

    const panel = this.shadowRoot.querySelector('.accessibility-panel');

    // Remover todas las clases de posición primero
    panel.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');
    const location = position.split('-');
    
    // Verificar que se obtengan exactamente la posición vertical y horizontal
    if (location.length != 2) return;
    const vertical = location[0];
    const horizontal = location[1];

    // Añadir la clase correspondiente a la posición seleccionada
    panel.classList.add(position);
    
    // Guardar la posición preferida
    chrome.runtime.sendMessage({
      type: "SET_PANEL_CONFIGURATION",
      location: {
        position: position,
        vertical: location[0],
        horizontal: location[1]
      }
    }, (response) => {
      if (!response){
          return;
      }

      // Disparar un evento para consumir en alguna otra sección del código
      const inversedPanelPosition = horizontal == 'right' ? 'left' : 'right';
      const event = new CustomEvent('panelPositionChanged', {
        detail: {
            panelPosition: position,
            inversedHorizontalPosition: `${inversedPanelPosition}`
        }
      });
      document.dispatchEvent(event);
    });
  }

  updateActiveOverlay(column) {
    const panel = this.shadowRoot.querySelector('.accessibility-panel');
    if (panel.classList.contains('minimized')) return;
    
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
    
    this.activeOverlay = document.createElement('div');
    this.activeOverlay.classList.add('active-overlay');
    this.activeOverlay.setAttribute('aria-hidden', 'true');
    
    const optionsBox = column.closest('.options-box');
    optionsBox.appendChild(this.activeOverlay);

    // Obtener el contenedor de acordeón que tiene scroll
    const accordionContent = column.closest('.accordion-content');

    const columnRect = column.getBoundingClientRect();
    const optionsBoxRect = optionsBox.getBoundingClientRect();
    const borderWidth = parseFloat(getComputedStyle(optionsBox).borderWidth) || 2;
    const overflow = parseFloat(getComputedStyle(this.shadowRoot.host).getPropertyValue('--active-overlay-overflow')) || 2;
    
    // Ajustar la posición considerando el scroll del acordeón
    const top = columnRect.top - optionsBoxRect.top - borderWidth - overflow;
    const left = columnRect.left - optionsBoxRect.left - borderWidth - overflow;
    const width = columnRect.width + 2 * overflow;
    const height = columnRect.height + 2 * overflow;
    
    this.activeOverlay.style.top = `${top}px`;
    this.activeOverlay.style.left = `${left}px`;
    this.activeOverlay.style.width = `${width}px`;
    this.activeOverlay.style.height = `${height}px`;
  }
}