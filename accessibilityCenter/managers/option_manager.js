class OptionManager {
  constructor(panel) {
    this.panel = panel;
    this.optionsConfig = OPTION_CONFIG;
    this.buttonStates = new Map();

    this.inactivityTimeout = null;
    this.inactivityDelay = 5000;
  }

  // Obtiene solo las opciones saveable
  getCurrentConfigSaveable() {
    const currentConfig = {};

    this.optionsConfig.forEach(option => {
      if (!option.saveable) return;
      
      const currentIndex = this.buttonStates.get(option.id) ?? option.defaultIndex;

      currentConfig[option.id] = currentIndex
    });

    return currentConfig;
  }

  // Inicializar con valores preconfigurados
  initializeDefaultOptions(optionsJson) {
    this.optionsConfig.forEach(fullOption => {
      if (!fullOption.saveable) return;
      if (!optionsJson[fullOption.id]) return;

      const index = optionsJson[fullOption.id];

      if (!index) return;
      if (typeof index !== 'number') return;

      if (fullOption && fullOption.action) {
        fullOption.action(fullOption.values[index], this.panel);
      }

      this.buttonStates.set(fullOption.id, index);
    });
  }

  setupOptionButtons() {
    const resetAll = this.panel.shadowRoot.querySelector("#resetAll");

    if (resetAll) {
      resetAll.addEventListener('click', () => {
        this.resetAllOptions();
        this.resetInactivityTimer();
      })
    }

    this.optionsConfig.forEach(option => {
      const button = this.panel.shadowRoot.getElementById(option.id);
      if (!button) return;

      const column = button.closest('.option-column');
      const dots = button.querySelectorAll('.dot');
      const valueSpan = button.querySelector('.option-value');
      
      if (!this.buttonStates.has(option.id)) {
        this.buttonStates.set(option.id, option.defaultIndex);
      }
      const initialIndex = this.buttonStates.get(option.id);

      if (dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
        if (initialIndex < dots.length) {
          dots[initialIndex].classList.add('active');
        }
      }

      this.updateButtonText(button, option, initialIndex);

      if (initialIndex !== option.defaultIndex) {
        button.classList.add('modified');
        column.classList.add('modified');
        this.panel.modifiedOptions.add(option.id);
      }

      button.addEventListener('click', () => {
        if (this.panel.shadowRoot.querySelector('.accessibility-panel').classList.contains('minimized')) return;

        if (option.id === 'resetAll') {
          this.resetAllOptions();
          return;
        }

        let currentIndex = this.buttonStates.get(option.id);
        
        if (this.panel.lastClickedButton && this.panel.lastClickedButton !== button) {
          this.panel.lastClickedButton.classList.remove('active');
          this.panel.lastClickedButton.closest('.option-column').classList.remove('active');
        }

        currentIndex = (currentIndex + 1) % option.values.length;
        this.buttonStates.set(option.id, currentIndex);

        if (dots.length > 0) {
          dots.forEach(dot => dot.classList.remove('active'));
          if (currentIndex < dots.length) {
            dots[currentIndex].classList.add('active');
          }
        }

        
        if (option.i18n) {
          const currentOption = option.i18n[currentIndex];
          Translator.setActiveState(valueSpan, currentOption);
        }
        Translator.tElState(valueSpan, this.panel.language);

        button.classList.add('active');
        column.classList.add('active');
        this.panel.lastClickedButton = button;

        this.panel.updateActiveOverlay(column);

        if (currentIndex !== option.defaultIndex) {
          button.classList.add('modified');
          column.classList.add('modified');
          this.panel.modifiedOptions.add(option.id);
        } else {
          button.classList.remove('modified');
          column.classList.remove('modified');
          this.panel.modifiedOptions.delete(option.id);
        }

        if (option.action) {
          option.action(option.values[currentIndex], this.panel);
          // console.log(this.getCurrentConfigSaveable());
        }

        // if (option.saveable) {
        //   const event = new CustomEvent('optionExtPanelChange', {
        //     detail: this.getCurrentConfigSaveable(),
        //     bubbles: true,
        //     composed: true
        //   });
        //   this.panel.dispatchEvent(event);
        // }

        // Reiniciar el tiempo al interactuar con algún botón
        this.resetInactivityTimer();
      });
    });
  }

  updateButtonText(button, option, index) {
    const valueSpan = button.querySelector('.option-value');
    if (!valueSpan) return;
    
    if (option.i18n && index < option.i18n.length) {
      const currentOption = option.i18n[index];
      Translator.setActiveState(valueSpan, currentOption);
    } else if (option.texts && index < option.texts.length) {
      valueSpan.textContent = Translator.t(this.panel.language, option.texts[index]);
    }
    
    Translator.tElState(valueSpan, this.panel.language);
  }

  resetAllOptions() {
    this.optionsConfig.forEach(config => {
      if (!config.saveable) return;
      if (config.id !== 'resetAll' && config.id != 'toggleReadSelected' && config.id != 'toggleReadFullPage') {
        const button = this.panel.shadowRoot.getElementById(config.id);
        if (!button) return;
        
        this.buttonStates.set(config.id, config.defaultIndex);
        
        const dots = button.querySelectorAll('.dot');
        if (dots.length > 0) {
          dots.forEach(dot => dot.classList.remove('active'));
          if (config.defaultIndex < dots.length) {
            dots[config.defaultIndex].classList.add('active');
          }
        }

        const valueEl = button.querySelector('.option-value');
        if (config.i18n) {
          const defaultTranslationState = config.i18n[config.defaultIndex];
          Translator.setActiveState(valueEl, defaultTranslationState);
        }
        Translator.tElState(valueEl, this.panel.language);

        button.classList.remove('modified', 'active');
        button.closest('.option-column').classList.remove('modified', 'active');

        if (config.action) {
          config.action(config.values[config.defaultIndex], this.panel);
        }

        this.panel.shadowRoot.querySelectorAll('.option-column.active').forEach(el => el.classList.remove('active'));
        this.panel.shadowRoot.querySelectorAll('button.active').forEach(el => el.classList.remove('active'));
        this.panel.shadowRoot.querySelectorAll('button.modified').forEach(el => el.classList.remove('modified'));
      }
    });
    
    this.panel.modifiedOptions.clear();
    this.panel.lastClickedButton = null;
    if (this.panel.activeOverlay) {
      this.panel.activeOverlay.remove();
      this.panel.activeOverlay = null;
    }
  }

  resetInactivityTimer() {
    if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
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
