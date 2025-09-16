class SpeechManager {
  constructor(panel) {
    this.panel = panel;
  }

  populateVoiceSelect(container, selectedVoiceName = null) {
    try {
      if (!container) return;

      const loadVoices = () => {
        return new Promise((resolve) => {
          const voices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith(this.panel.language));
          if (voices.length) {
            resolve(voices);
          } else {
            const onVoicesChanged = () => {
              const loadedVoices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith(this.panel.language));
              speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
              resolve(loadedVoices);
            };
            speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
          }
        });
      };

      loadVoices().then((voices) => {
        if (!this.panel.selectedVoice && voices.length > 0) {
          this.panel.selectedVoice = voices[0];
        }

        // En lugar de crear un nuevo selector, actualizamos el existente
        this.updateExistingVoiceSelector(container, voices, selectedVoiceName);

        // Recargar el active overlay puesto que la traducción
        // podría ocupar más o menos espacio
        const activeButton = this.panel.lastClickedButton;
        if (activeButton) {
          const column = activeButton.closest('.option-column');
          if (column) {
              //this.panel.updateActiveOverlay(column);
          }
        }
      });
    } catch (err) {
      console.error('Error al cargar voces:', err);
    }
  }

  updateExistingVoiceSelector(container, voices, selectedVoiceName = null) {
    // Buscar los elementos existentes dentro del container
    const button = container.querySelector('.option-button');
    const valueSpan = container.querySelector('.option-value');
    const dotsDiv = container.querySelector('.dots');
    
    if (!button || !valueSpan || !dotsDiv) {
      console.error('Elementos del selector de voz no encontrados');
      return;
    }

    // Limpiar dots existentes
    dotsDiv.innerHTML = '';

    if (!voices || voices.length === 0) {
      valueSpan.textContent = Translator.t(this.panel.language, 'aP.nonAvailable');
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');
      dotsDiv.appendChild(dot);
      button.disabled = true;
      return;
    }

    button.disabled = false;

    // Encontrar el índice de la voz seleccionada
    let currentIndex = -1;
    if (selectedVoiceName) {
      currentIndex = voices.findIndex(v => v.name === selectedVoiceName);
    }
    if (currentIndex === -1 && voices.length > 0) {
      currentIndex = 0;
      this.panel.selectedVoice = voices[0];
    }

    // Crear nuevos dots
    voices.forEach((voice, index) => {
      const dot = document.createElement('span');
      dot.className = `dot ${index === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-hidden', 'true');
      dot.setAttribute('data-voice', voice.name);
      dot.setAttribute('data-index', index);
      dotsDiv.appendChild(dot);
    });

    // Actualizar el texto mostrado
    if (currentIndex >= 0 && currentIndex < voices.length) {
      valueSpan.textContent = voices[currentIndex].name;
    }

    // Mantener los event listeners existentes o agregarlos si no existen
    this.setupVoiceSelectorEvents(button, dotsDiv, voices);
  }

  setupVoiceSelectorEvents(button, dotsDiv, voices) {
    // Remover event listeners existentes para evitar duplicados
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    const newDotsDiv = dotsDiv.cloneNode(true);
    dotsDiv.parentNode.replaceChild(newDotsDiv, dotsDiv);

    let currentIndex = Array.from(newDotsDiv.children).findIndex(dot => 
      dot.classList.contains('active')
    );
    if (currentIndex === -1) currentIndex = 0;

    const valueSpan = newButton.querySelector('.option-value');

    const updateDisplay = () => {
      if (currentIndex >= 0 && currentIndex < voices.length) {
        valueSpan.textContent = voices[currentIndex].name;
        
        Array.from(newDotsDiv.children).forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
        
        this.panel.selectedVoice = voices[currentIndex];
      }
    };

    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (voices.length === 0) return;

      currentIndex = (currentIndex + 1) % voices.length;
      updateDisplay();
      
      const column = newButton.closest('.option-column');
      newButton.classList.add('modified');
      //this.panel.updateActiveOverlay(column);
    });

    newDotsDiv.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;

      const index = parseInt(dot.getAttribute('data-index'));
      if (isNaN(index)) return;

      currentIndex = index;
      updateDisplay();
      
      const column = newButton.closest('.option-column');
      newButton.classList.add('modified');
      //this.panel.updateActiveOverlay(column);
    });
  }

  // El resto de los métodos se mantienen igual...
  readFullPage() {
    this.stopAudio();
    
    const textBlocks = this.collectTextBlocks(document.body);
    if (textBlocks.length === 0) {
      console.warn('No se encontró texto para leer en la página');
      return;
    }

    this.panel.stopRequested = false;
    this.readNodesSequentially(textBlocks, 0);
  }

  readSelectedText() {
    this.stopAudio();
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      console.warn('No hay texto seleccionado para leer');
      return;
    }

    const selectedRange = selection.getRangeAt(0);
    const textBlocks = this.collectTextBlocks(selectedRange.commonAncestorContainer, true, selectedRange);

    if (textBlocks.length === 0) {
      console.warn('No se encontró texto válido en la selección');
      return;
    }

    this.panel.stopRequested = false;
    this.readNodesSequentially(textBlocks, 0);
  }

  stopAudio() {
    this.panel.stopRequested = true;
    if (this.panel.currentUtterance) {
      window.speechSynthesis.cancel();
      this.panel.currentUtterance = null;
    }
    document.querySelectorAll('.highlight-reading').forEach(el => {
      el.classList.remove('highlight-reading');
    });
  }

  collectTextBlocks(root, isSelection = false, range = null) {
    const textBlocks = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (
              getComputedStyle(parent).display === 'none' ||
              getComputedStyle(parent).visibility === 'hidden' ||
              node.textContent.trim() === ''
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            if (isSelection && range && !range.intersectsNode(node)) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              getComputedStyle(node).display === 'none' ||
              getComputedStyle(node).visibility === 'hidden'
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let currentBlock = null;
    let lastBlockElement = null;

    while (walker.nextNode()) {
      const node = walker.currentNode;

      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        const isInline = this.panel.inlineTags.includes(parent.tagName) || getComputedStyle(parent).display === 'inline';

        if (currentBlock && (isInline || parent === lastBlockElement)) {
          currentBlock.text += node.textContent;
          currentBlock.nodes.push(node);
          currentBlock.elements.add(parent);
        } else {
          currentBlock = {
            text: node.textContent,
            nodes: [node],
            elements: new Set([parent]),
          };
          textBlocks.push(currentBlock);
          lastBlockElement = isInline ? parent.parentElement : parent;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (!this.panel.inlineTags.includes(node.tagName) && getComputedStyle(node).display !== 'inline') {
          currentBlock = null;
          lastBlockElement = null;
        }
      }
    }

    return textBlocks
      .filter(block => block.text.trim() !== '')
      .map(block => ({
        text: block.text.trim(),
        elements: Array.from(block.elements),
      }));
  }

  readNodesSequentially(textBlocks, index) {
    if (this.panel.stopRequested || index >= textBlocks.length) {
      this.stopAudio();
      return;
    }

    const block = textBlocks[index];
    const text = block.text;

    if (!text) {
      this.readNodesSequentially(textBlocks, index + 1);
      return;
    }

    block.elements.forEach(el => el.classList.add('highlight-reading'));

    const utterance = new SpeechSynthesisUtterance(text);
    this.panel.currentUtterance = utterance;

    if (this.panel.selectedVoice) {
      const voice = this.panel.selectedVoice;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        console.warn('Voz seleccionada no disponible, usando voz por defecto');
      }
    }

    utterance.onend = () => {
      block.elements.forEach(el => el.classList.remove('highlight-reading'));
      this.readNodesSequentially(textBlocks, index + 1);
    };

    utterance.onerror = (err) => {
      console.error('Error al leer bloque:', err);
      block.elements.forEach(el => el.classList.remove('highlight-reading'));
      this.readNodesSequentially(textBlocks, index + 1);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}