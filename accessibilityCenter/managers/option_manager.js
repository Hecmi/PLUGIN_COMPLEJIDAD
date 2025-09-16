class OptionManager {
  constructor(panel) {
    this.panel = panel;
    this.optionsConfig = OPTION_CONFIG;
    this.buttonStates = new Map();
    
    this.inactivityTimeout = null;
    this.inactivityDelay = 5000;
    
    this.setupObservers();
  }

  setupObservers() {
    // Observador para cambios de tamaño
    this.panel.optionResizeObserver = new ResizeObserver(entries => {
      entries.forEach(({ target }) => {
        const column = target.closest('.option-column');
        if (column?.classList.contains('active')) {
          this.panel.updateActiveOverlay(column);
        }
      });
    });

    // Observador para cambios en los dots y contenido
    this.panel.optionMutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.attributeName === 'class') {
          const button = mutation.target.closest('button');
          const column = button?.closest('.option-column');
          
          if (button?.classList.contains('active') && column?.classList.contains('active')) {
            this.panel.updateActiveOverlay(column);
          }
        }
      });
    });
  }

  getCurrentConfigSaveable() {
    const currentConfig = {};
    
    this.optionsConfig
      .filter(option => option.saveable)
      .forEach(option => {
        currentConfig[option.id] = this.buttonStates.get(option.id) ?? option.defaultIndex;
      });
    
    return currentConfig;
  }

  initializeDefaultOptions(optionsJson) {
    this.optionsConfig
      .filter(option => option.saveable && optionsJson[option.id])
      .forEach(option => {
        const index = optionsJson[option.id];
        
        if (typeof index === 'number' && option.action) {
          option.action(option.values[index], this.panel);
          this.buttonStates.set(option.id, index);
        }
      });
  }

  setupOptionButtons() {
    const resetAll = this.panel.shadowRoot.querySelector("#resetAll");
    resetAll?.addEventListener('click', () => {
      this.resetAllOptions();
      this.resetInactivityTimer();
    });

    this.optionsConfig.forEach(option => {
      const button = this.panel.shadowRoot.getElementById(option.id);
      if (!button) return;
      
      this.initializeButtonState(button, option);
      this.setupButtonClickListener(button, option);
      this.observeOptionElement(button);
    });
  }

  initializeButtonState(button, option) {
    const column = button.closest('.option-column');
    const dots = button.querySelectorAll('.dot');
    const valueSpan = button.querySelector('.option-value');
    
    // Establecer estado inicial
    const initialIndex = this.buttonStates.has(option.id) 
      ? this.buttonStates.get(option.id) 
      : option.defaultIndex;
    
    this.buttonStates.set(option.id, initialIndex);
    
    // Actualizar UI
    this.updateDotsState(dots, initialIndex);
    this.updateButtonText(button, option, initialIndex);
    
    // Marcar como modificado si es necesario
    if (initialIndex !== option.defaultIndex) {
      button.classList.add('modified');
      column.classList.add('modified');
      this.panel.modifiedOptions.add(option.id);
    }
  }

  setupButtonClickListener(button, option) {
    button.addEventListener('click', () => {
      if (this.isPanelMinimized()) return;
      if (option.id === 'resetAll') return; // resetAll ya tiene su propio handler
      
      this.handleButtonClick(button, option);
      this.resetInactivityTimer();
    });
  }

  handleButtonClick(button, option) {
    const column = button.closest('.option-column');
    const dots = button.querySelectorAll('.dot');
    const valueSpan = button.querySelector('.option-value');
    
    // Desactivar botón previamente activo
    if (this.panel.lastClickedButton && this.panel.lastClickedButton !== button) {
      this.panel.lastClickedButton.classList.remove('active');
      this.panel.lastClickedButton.closest('.option-column').classList.remove('active');
    }
    
    // Calcular nuevo índice
    const currentIndex = this.buttonStates.get(option.id);
    const newIndex = (currentIndex + 1) % option.values.length;
    this.buttonStates.set(option.id, newIndex);
    
    // Actualizar UI
    this.updateDotsState(dots, newIndex);
    this.updateButtonText(button, option, newIndex);
    
    // Marcar como activo
    button.classList.add('active');
    column.classList.add('active');
    this.panel.lastClickedButton = button;
    
    // Actualizar overlay
    this.panel.updateActiveOverlay(column);
    
    // Gestionar estado modificado
    this.updateModifiedState(button, column, option, newIndex);
    
    // Ejecutar acción si existe
    if (option.action) {
      option.action(option.values[newIndex], this.panel);
    }
  }

  updateDotsState(dots, activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  updateModifiedState(button, column, option, currentIndex) {
    const isModified = currentIndex !== option.defaultIndex;
    
    button.classList.toggle('modified', isModified);
    column.classList.toggle('modified', isModified);
    
    if (isModified) {
      this.panel.modifiedOptions.add(option.id);
    } else {
      this.panel.modifiedOptions.delete(option.id);
    }
  }

  observeOptionElement(button) {
    // Observar cambios de tamaño
    if (this.panel.optionResizeObserver) {
      this.panel.optionResizeObserver.observe(button);
      
      const importantElements = [
        button.querySelector('.dots-container'),
        button.querySelector('.option-value'),
        button.querySelector('.option-label')
      ].filter(Boolean);
      
      importantElements.forEach(el => this.panel.optionResizeObserver.observe(el));
    }

    // Observar cambios en DOM y atributos
    if (this.panel.optionMutationObserver) {
      const observeElement = (element, options) => {
        if (element) this.panel.optionMutationObserver.observe(element, options);
      };
      
      observeElement(button.querySelector('.dots-container'), {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
      
      observeElement(button.querySelector('.option-value'), {
        characterData: true,
        subtree: true,
        childList: true
      });
      
      observeElement(button, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  updateButtonText(button, option, index) {
    const valueSpan = button.querySelector('.option-value');
    if (!valueSpan) return;
    
    const previousText = valueSpan.textContent;
    
    if (option.i18n && index < option.i18n.length) {
      Translator.setActiveState(valueSpan, option.i18n[index]);
    } else if (option.texts && index < option.texts.length) {
      valueSpan.textContent = Translator.t(this.panel.language, option.texts[index]);
    }
    
    Translator.tElState(valueSpan, this.panel.language);
    
    // Actualizar overlay si el texto cambió y el botón está activo
    if (valueSpan.textContent !== previousText && button.classList.contains('active')) {
      const column = button.closest('.option-column');
      if (column?.classList.contains('active')) {
        this.panel.updateActiveOverlay(column);
      }
    }
  }

  resetAllOptions() {
    this.optionsConfig
      .filter(config => config.saveable && !['resetAll', 'toggleReadSelected', 'toggleReadFullPage'].includes(config.id))
      .forEach(config => {
        const button = this.panel.shadowRoot.getElementById(config.id);
        if (!button) return;
        
        this.buttonStates.set(config.id, config.defaultIndex);
        const column = button.closest('.option-column');
        const dots = button.querySelectorAll('.dot');
        const valueEl = button.querySelector('.option-value');
        
        // Actualizar UI
        this.updateDotsState(dots, config.defaultIndex);
        
        if (config.i18n) {
          Translator.setActiveState(valueEl, config.i18n[config.defaultIndex]);
        }
        Translator.tElState(valueEl, this.panel.language);
        
        // Restablecer estados
        button.classList.remove('modified', 'active');
        column.classList.remove('modified', 'active');
        
        // Ejecutar acción por defecto
        if (config.action) {
          config.action(config.values[config.defaultIndex], this.panel);
        }
      });
    
    // Limpiar estados
    this.panel.modifiedOptions.clear();
    this.panel.lastClickedButton = null;
    
    // Remover overlay si existe
    if (this.panel.activeOverlay) {
      this.panel.activeOverlay.remove();
      this.panel.activeOverlay = null;
    }
  }

  isPanelMinimized() {
    return this.panel.shadowRoot.querySelector('.accessibility-panel').classList.contains('minimized');
  }

  resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => this.handleInactivity(), this.inactivityDelay);
  }

  handleInactivity() {
    const event = new CustomEvent('optionExtPanelInactivity', {
      detail: {
        site: PageLoadService.getPageInfo().urlFiltered,
        configuration: this.getCurrentConfigSaveable(),
      },
      bubbles: true,
      composed: true
    });
    
    this.panel.shadowRoot.dispatchEvent(event);
  }
}