class EventManager {
  constructor(panel) {
    this.panel = panel;
    this.highlightMouseOver = null;
    this.highlightMouseOut = null;
  }

  setupEventListeners() {
    this.setupPanelControls();
    this.setupAccordionHeaders();
    this.setupOptionButtons();
    this.setupResizeObserver();
    this.setupHighlightHoverEvents();
  }

  setupHighlightHoverEvents() {
    this.highlightMouseOver = (event) => {
      if (event.target !== document && event.target !== document.documentElement) {
        event.target.classList.add('highlight-hovered-element');
      }
    };

    this.highlightMouseOut = (event) => {
      if (event.target !== document && event.target !== document.documentElement) {
        event.target.classList.remove('highlight-hovered-element');
      }
    };

    this.panel.highlightMouseOver = this.highlightMouseOver;
    this.panel.highlightMouseOut = this.highlightMouseOut;
  }

  setupResizeObserver() {
    this.panel.resizeObserver = new ResizeObserver(entries => {
      if (this.panel.activeOverlay) {
        const column = this.panel.shadowRoot.querySelector('.option-button.active');
        if (column) this.panel.updateActiveOverlay(column);
      }
    });
  }

  initializeDefaultOptions(optionsJson) {
    if (this.panel.optionManager) {
      this.panel.optionManager.initializeDefaultOptions(optionsJson);
    }
  }

  setupOptionButtons() {
    this.panel.optionManager.setupOptionButtons();
  }

  setupPanelControls() {
    const panel = this.panel.shadowRoot.querySelector('.accessibility-panel');
    const closeButton = this.panel.shadowRoot.querySelector('.close-button');
    const minimizeIcon = this.panel.shadowRoot.querySelector('.minimize-icon');

    const updateMinimizedState = () => {
      const isMinimized = panel.classList.contains('minimized');
      chrome.runtime.sendMessage({
        type: "SET_PANEL_CONFIGURATION",
        minimized: isMinimized
      });
    };

    // Remover event listeners existentes primero para evitar duplicación
    const newCloseButton = closeButton.cloneNode(true);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    
    const newMinimizeIcon = minimizeIcon.cloneNode(true);
    minimizeIcon.parentNode.replaceChild(newMinimizeIcon, minimizeIcon);

    // Agregar nuevos event listeners
    newCloseButton.addEventListener('click', () => {
      panel.classList.toggle('minimized');
      if (panel.classList.contains('minimized')) {
        if (this.panel.activeOverlay) {
          this.panel.activeOverlay.remove();
          this.panel.activeOverlay = null;
        }
        if (this.panel.lastClickedButton) {
          this.panel.lastClickedButton.classList.remove('active');
          this.panel.lastClickedButton.closest('.option-column').classList.remove('active');
          this.panel.lastClickedButton = null;
        }
      }
      updateMinimizedState();
    });

    newMinimizeIcon.addEventListener('click', () => {
      panel.classList.toggle('minimized');
      updateMinimizedState();
    });

    newCloseButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newCloseButton.click();
      }
    });

    newMinimizeIcon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        newMinimizeIcon.click();
      }
    });
  }

  setupAccordionHeaders() {
    const accordionHeaders = this.panel.shadowRoot.querySelectorAll('.accordion-header');
    
    // Remover event listeners existentes primero
    accordionHeaders.forEach(header => {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);
    });

    // Agregar nuevos event listeners
    this.panel.shadowRoot.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.classList.contains('open');
        
        this.panel.shadowRoot.querySelectorAll('.accordion-header').forEach(h => {
          const hContent = h.nextElementSibling;
          hContent.classList.remove('open');
          h.setAttribute('aria-expanded', 'false');
          const icon = h.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
          }
        });

        if (!isOpen) {
          content.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
          const icon = header.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
          }
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  loadTabPanelChange() {
    const tabs = this.panel.shadowRoot.querySelectorAll('.tab');
    
    // Remover event listeners existentes primero
    tabs.forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
    });

    // Agregar nuevos event listeners
    this.panel.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Desactivar todas las pestañas
        this.panel.shadowRoot.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.panel.shadowRoot.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Activar la pestaña clickeada
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        this.panel.shadowRoot.getElementById(`${tabId}-content`).classList.add('active');
      });
    });
  }

  loadPanelLocation() {
    const positionButtons = this.panel.shadowRoot.querySelectorAll('.position-button');
    let lastLocationButton = null;
    
    // Remover event listeners existentes primero
    positionButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

    // Agregar nuevos event listeners
    this.panel.shadowRoot.querySelectorAll('.position-button').forEach(button => {
      button.addEventListener('click', () => {
        // Reiniciar los botones para marcar el único (sobre el que se da clic)
        if (this.panel.lastClickedButton && this.panel.lastClickedButton != button) {
          console.log("reset butotns position")
          this.panel.shadowRoot.querySelectorAll('.option-column.active').forEach(el => el.classList.remove('active'));
          this.panel.shadowRoot.querySelectorAll('button.active').forEach(el => el.classList.remove('active'));
        }
        console.log("position", button)
        if (lastLocationButton && lastLocationButton != button) {
          lastLocationButton.classList.remove('modified')
        }
        
        this.panel.lastClickedButton = button;
        lastLocationButton = button;
        const position = button.getAttribute('data-position');

        const column = button.closest('.option-column');
        button.classList.add('active');
        column.classList.add('active');

        button.classList.add('modified');

        this.panel.updateActiveOverlay(column);
        this.panel.setPanelPosition(position);
      });
    });
  }

  loadPanelLanguageChange() {
    const languageSelect = this.panel.shadowRoot.getElementById('language-select');
    
    if (languageSelect) {
      const newSelect = languageSelect.cloneNode(true);
      languageSelect.parentNode.replaceChild(newSelect, languageSelect);

      newSelect.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        const languageChangeEvent = new CustomEvent('extLanguageChange', {
          detail: {
            language: selectedLanguage
          },
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(languageChangeEvent);

      });
    }
  }

  loadJs() {
    // Configurar todos los event listeners principales
    this.setupEventListeners();
    
    // Configurar los event listeners específicos de tabs, posición e idioma
    this.loadTabPanelChange();
    this.loadPanelLocation();
    this.loadPanelLanguageChange();
    
    // Configurar el selector de voz
    this.panel.speechManager.populateVoiceSelect(this.panel.shadowRoot.getElementById('voiceSelect-container'));  
  }

  translatePanel(language) {
    const languageSelect = this.panel.shadowRoot.getElementById('language-select');
    this.panel.language = language;
    if (languageSelect) {
      languageSelect.value = language;
    }
    
    Translator.tPage(this.panel.shadowRoot, language);

    // Recargar las opciones de voz para el nuevo idioma
    const voiceSelectContainer = this.panel.shadowRoot.getElementById('voiceSelect-container');
    if (voiceSelectContainer) {
      this.panel.speechManager.populateVoiceSelect(voiceSelectContainer);
    }

    // Recargar el active overlay puesto que la traducción
    // podría ocupar más o menos espacio
    const activeButton = this.panel.lastClickedButton;
    if (activeButton) {
      const column = activeButton.closest('.option-column');
      if (column) {
          this.panel.updateActiveOverlay(column);
      }
    }
  }

  setComplexityLevel(complexityLevel) {
    let complexitySpan = this.panel.shadowRoot.getElementById('span-complexity-level');
    if (complexitySpan) {
      complexitySpan.textContent = `${complexityLevel}%`;
    }
  }

  addOptionToAdaptationTab(element) {
    let adaptations = this.panel.shadowRoot.getElementById('adaptations-content');
    if (adaptations) {
      adaptations.appendChild(element);
    }
  }

  handleClickShowNotificationsEvent(action) {
    if (!action) return;
    if (action && typeof action !== 'function') return;

    let btnShowNotifications = this.panel.shadowRoot.getElementById('btn-show-notifications');
    btnShowNotifications.addEventListener('click', () => {
      action();
    });
  }

  handleClickDontShowAcceptNotificationsEvent(action) {
    if (!action) return;
    if (action && typeof action !== 'function') return;

    let btnDontShowButAccept = this.panel.shadowRoot.getElementById('btn-not-show-accept-notifications');
    btnDontShowButAccept.addEventListener('click', () => {
      action();
    });
  }

  handleClickDontShowRejectNotificationsEvent(action) {
    if (!action) return;
    if (action && typeof action !== 'function') return;

    let btnDontShowButReject = this.panel.shadowRoot.getElementById('btn-not-show-reject-notifications');
    btnDontShowButReject.addEventListener('click', () => {
      action();    
    });
  }

  handleAdaptationEvents() {
    let btnAcceptAll = this.panel.shadowRoot.getElementById('btn-accept-all-notifications');
    let btnRejectAll = this.panel.shadowRoot.getElementById('btn-reject-all-notifications');

    if (btnAcceptAll) {
      const newAcceptBtn = btnAcceptAll.cloneNode(true);
      btnAcceptAll.parentNode.replaceChild(newAcceptBtn, btnAcceptAll);

      newAcceptBtn.addEventListener('click', () => {
        const adaptationContainer = this.panel.shadowRoot.getElementById('adaptations-content');
        if (!adaptationContainer) return;

        const adaptations = adaptationContainer.querySelectorAll('.notification input[type="checkbox"]');
        if (!adaptations) return;

        for (let i = 0; i < adaptations.length; i++) {
          const adaptationInput = adaptations[i];
          adaptationInput.checked = true;
          adaptationInput.dispatchEvent(new Event('change'));
        }
      });
    }

    if (btnRejectAll) {
      const newRejectBtn = btnRejectAll.cloneNode(true);
      btnRejectAll.parentNode.replaceChild(newRejectBtn, btnRejectAll);

      newRejectBtn.addEventListener('click', () => {
        let adaptationContainer = this.panel.shadowRoot.getElementById('adaptations-content');
        if (!adaptationContainer) return;

        const adaptations = adaptationContainer.querySelectorAll('.notification input[type="checkbox"]');
        if (!adaptations) return;

        for (let i = 0; i < adaptations.length; i++) {
          const adaptationInput = adaptations[i];
          adaptationInput.checked = false;
          adaptationInput.dispatchEvent(new Event('change'));
        }
      });
    }
  }
}