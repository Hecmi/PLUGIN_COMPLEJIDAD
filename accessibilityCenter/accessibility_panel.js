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
    this.initializeManagers();
    
    // Inicializar elementos adicionales
    this.modal = new ExtensionModal();
    this.loader = null;
  }

  initializeManagers() {
    this.styleManager = new StyleManager();
    this.optionManager = new OptionManager(this);
    this.speechManager = new SpeechManager(this);
    this.zoomManager = new ZoomManager();
    this.guideManager = new GuideManager();
    this.textAltManager = new AltTextManager(this);
    this.eventManager = new EventManager(this);
    this.loginManager = new LoginManager();
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

    // Aplicar estado minimizado si es necesario
    if (minimized === false) {
      panel.classList.toggle('minimized');
    } else if (minimized !== true) {
      panel.classList.toggle('minimized'); 
    }
  }

  async init(optionPanelConfiguration = null) {
    // Evitar ejecución múltiple del script
    if (document.getElementById('accessibility-panel')) {
      return;
    }

    // Verificar que chrome.runtime.getURL está disponible
    if (!chrome.runtime?.getURL) {
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
    const selector = isUserLogged ? '.logged' : '.unlogged';
    const elements = this.shadowRoot.querySelectorAll(selector);
    
    elements.forEach(el => el.classList.remove('hide'));
  }

  async loadResources() {
    // Cargar recursos en paralelo
    const [faCSS, panelHTML] = await Promise.all([
      this.fetchResource('libs/fontawesome-free-6.7.2-web/css/all.min.css'),
      this.fetchResource('ui/panel/panel.html')
    ]);

    this.faCSS = faCSS;
    this.doc = new DOMParser().parseFromString(panelHTML, 'text/html');
    
    // Añadir Font Awesome al documento principal
    this.addFontAwesomeStyles();
  }

  async fetchResource(path) {
    const url = chrome.runtime.getURL(path);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al cargar: ${url} - ${response.status} ${response.statusText}`);
    }
    
    return response.text();
  }

  addFontAwesomeStyles() {
    const linkFA = document.createElement('link');
    linkFA.rel = 'stylesheet';
    linkFA.id = 'font-awesome-style-ext';
    linkFA.href = chrome.runtime.getURL('libs/fontawesome-free-6.7.2-web/css/all.min.css');
    document.head.appendChild(linkFA);
  }

  createPanel(optionPanelConfiguration) {
    const wrapper = document.createElement('div');
    wrapper.id = 'accessibility-panel';
    document.body.appendChild(wrapper);

    this.shadowRoot = wrapper.attachShadow({ mode: 'open' });
    this.renderPanelContent();
    
    // Inicializar componentes del panel
    this.initializePanelComponents(optionPanelConfiguration);
  }

  renderPanelContent() {
    const styles = this.getPanelStyles();
    this.shadowRoot.innerHTML = `
      <style>${this.faCSS}</style>
      <style>${styles}</style>
      ${this.doc.querySelector('body').innerHTML}
    `;
  }

  getPanelStyles() {
    const styleIds = [
      'style-container-ext',
      'style-panel-ext', 
      'style-notification-ext',
      'style-login-ext'
    ];
    
    return styleIds
      .map(id => this.doc.querySelector(`style#${id}`)?.textContent || '')
      .join('');
  }

  initializePanelComponents(optionPanelConfiguration) {
    // Crear elementos en el DOM principal para las guías
    this.guideManager.createGuideElements();
    
    // Inicializar el tracker CSS
    this.tracker = Constants.STYLES[Constants.APP.panelTracker];
    
    // Cargar estilos iniciales
    this.styleManager.initialize(this.tracker);
    this.styleManager.loadInitialStyles();
    
    // Cargar funcionalidades del panel
    this.eventManager.loadTabPanelChange();
    this.eventManager.loadPanelLocation();

    // Aplicar configuración del panel si existe
    if (optionPanelConfiguration) {
      this.initializeDefaultOptions(optionPanelConfiguration);
    }

    // Cargar funcionalidades adicionales
    this.eventManager.loadJs();
    this.eventManager.loadPanelLanguageChange();

    // Inicializar eventos de login
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
    const [vertical, horizontal] = position.split('-');
    
    // Verificar que la posición sea válida
    if (!vertical || !horizontal) return;
    
    // Remover todas las clases de posición primero
    panel.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');
    
    // Añadir la clase correspondiente a la posición seleccionada
    panel.classList.add(position);
    
    // Guardar la posición preferida
    chrome.runtime.sendMessage({
      type: 'SET_PANEL_CONFIGURATION',
      location: {
        position: position,
        vertical: vertical,
        horizontal: horizontal
      }
    }, (response) => {
      if (!response) return;
      
      // Disparar evento de cambio de posición
      this.dispatchPanelPositionChangedEvent(horizontal);
    });
  }

  dispatchPanelPositionChangedEvent(horizontal) {
    const inversedPanelPosition = horizontal === 'right' ? 'left' : 'right';
    const event = new CustomEvent('panelPositionChanged', {
      detail: {
        panelPosition: position,
        inversedHorizontalPosition: inversedPanelPosition
      }
    });
    
    document.dispatchEvent(event);
  }

  updateActiveOverlay(column) {
    const panel = this.shadowRoot.querySelector('.accessibility-panel');
    if (panel.classList.contains('minimized')) return;
    
    // Limpiar overlay existente
    this.removeActiveOverlay();
    
    // Crear nuevo overlay
    this.createActiveOverlay(column);
  }

  removeActiveOverlay() {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }

  createActiveOverlay(column) {
    const optionsBox = column.closest('.options-box');
    this.activeOverlay = document.createElement('div');
    
    this.activeOverlay.classList.add('active-overlay');
    this.activeOverlay.setAttribute('aria-hidden', 'true');
    
    optionsBox.appendChild(this.activeOverlay);
    this.positionActiveOverlay(column, optionsBox);
  }

  positionActiveOverlay(column, optionsBox) {
    const columnRect = column.getBoundingClientRect();
    const optionsBoxRect = optionsBox.getBoundingClientRect();
    
    const borderWidth = parseFloat(getComputedStyle(optionsBox).borderWidth) || 2;
    const overflow = parseFloat(
      getComputedStyle(this.shadowRoot.host)
        .getPropertyValue('--active-overlay-overflow')
    ) || 2;
    
    // Calcular posición y dimensiones
    const top = columnRect.top - optionsBoxRect.top - borderWidth - overflow;
    const left = columnRect.left - optionsBoxRect.left - borderWidth - overflow;
    const width = columnRect.width + 2 * overflow;
    const height = columnRect.height + 2 * overflow;
    
    // Aplicar estilos
    Object.assign(this.activeOverlay.style, {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`
    });
  }
}
