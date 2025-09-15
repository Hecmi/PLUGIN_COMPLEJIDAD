const OPTION_CONFIG = [
  {
    id: 'fontSize',
    values: ['none', '14', '16', '18', '24'],
    texts: ['aP.none', 'aP.small', 'aP.normal', 'aP.big', 'aP.extraBig'],
    i18n: ['any', 'small', 'medium', 'big', 'extraBig'],
    saveable: true,
    defaultIndex: 0,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(.accessibility-panel):not(.accessibility-panel *)', {
          'font-size': `${value}px !important`
        });
      } else {
        panel.tracker.removeProperties('*:not(.accessibility-panel):not(.accessibility-panel *)', 'font-size');
      }
      
      requestAnimationFrame(() => {
        const column = panel.shadowRoot.getElementById('fontSize').closest('.option-column');
        panel.updateActiveOverlay(column);
      });
    }
  },
  {
    id: 'fontFamily',
    values: [
      'none', 
      'Arial, sans-serif', 
      '"OpenDyslexic", sans-serif',
      'Verdana, sans-serif',
      'Times New Roman'
    ],
    texts: ['aP.any', 'Arial', 'OpenDyslexic', 'Verdana', 'Times New Roman'],
    i18n: ['any', 'arial', 'openDyslexic', 'verdana', 'timesNewRoman'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(i):not(span):not(.fa):not(.fas)', {
            'font-family': `${value} !important`
        });
      } else {
        panel.tracker.removeProperties('*:not(i):not(span):not(.fa):not(.fas)', 'font-family');
      }
    }
  },
  {
    id: 'colorblind',
    values: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
    texts: ['aP.none', 'aP.protanopia', 'aP.deuteranopia', 'aP.tritanopia'],
    i18n: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');

      if (value != 'none') {
        document.documentElement.classList.add(value);
      }
    }
  },
  {
    id: 'contrast',
    values: ['none', 'high-contrast', 'inverted'],
    texts: ['aP.normal', 'aP.highContrast', 'aP.inverted'],
    i18n: ['normal', 'highContrast', 'inverted'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('high-contrast', 'inverted');

      if (value != 'none') {
        document.documentElement.classList.add(value);
      }
    }
  },
  {
    id: 'colorShift',
    values: ['none', 'gray-scale', 'sepia'],
    texts: ['aP.normal', 'aP.gray', 'aP.sepia'],
    i18n: ['normal', 'gray', 'sepia'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('gray-scale', 'sepia');

      if (value != 'none') {
        document.documentElement.classList.add(value);
      }
    }
  },
  {
    id: 'highlight',
    values: ['none', 'highlight-element-buttons', 'highlight-element-a', 'highlight-element-title', 'all'],
    texts: ['aP.any', 'aP.buttons', 'aP.links', 'aP.titles', 'aP.all'],
    i18n: ['any', 'buttons', 'links', 'titles', 'all'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('highlight-element-buttons', 'highlight-element-a', 'highlight-element-title', 'all');

      if (value !== 'none') {
        document.documentElement.classList.add(value);
      } 
      if (value == 'all') {
        document.documentElement.classList.add('highlight-element-a');
        document.documentElement.classList.add('highlight-element-title');
        document.documentElement.classList.add('highlight-element-buttons');
      }
    }
  },
  {
    id: 'toggleMedia',
    values: ['mostrar', 'ocultar'],
    texts: ['aP.hide', 'aP.show'],
    i18n: ['hide', 'show'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('hide-media');

      if (value == 'ocultar') {
        document.documentElement.classList.add('hide-media');
      }
    }
  },
  {
    id: 'lineHeight',
    values: ['none', '1', '1.5', '2'],
    texts: ['aP.any', 'aP.normal', 'aP.medium', 'aP.wide'],
    i18n: ['any', 'normal', 'medium', 'wide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(.accessibility-panel, .accessibility-panel *)', {
            'line-height': `${value}em !important`
          });
      } else {
        panel.tracker.removeProperties('*:not(.accessibility-panel, .accessibility-panel *)', 'line-height');
      }
    }
  },
  {
    id: 'letterSpacing',
    values: ['none', '1', '2'],
    texts: ['aP.normal', 'aP.medium', 'aP.wide'],
    i18n: ['normal', 'medium', 'wide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(.accessibility-panel, .accessibility-panel *)', {
            'letter-spacing': `${value}px !important`
          });
      } else {
        panel.tracker.removeProperties('*:not(.accessibility-panel, .accessibility-panel *)', 'letter-spacing');
      }
    }
  },
  {
    id: 'wordSpacing',
    values: ['none', '2', '4'],
    texts: ['aP.normal', 'aP.medium', 'aP.wide'],
    i18n: ['normal', 'medium', 'wide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(.accessibility-panel, .accessibility-panel *)', {
            'word-spacing': `${value}px !important`
          });
      } else {
        panel.tracker.removeProperties('*:not(.accessibility-panel, .accessibility-panel *)', 'word-spacing');
      }
    }
  },
  {
    id: 'textAlign',
    values: ['none', 'left', 'center', 'right', 'justify'],
    texts: ['aP.none', 'aP.left', 'aP.center', 'aP.right', 'aP.justify'],
    i18n: ['none', 'left', 'center', 'right', 'justify'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value != 'none') {
        panel.tracker.set('*:not(.accessibility-panel, .accessibility-panel *)', {
          'text-align': `${value} !important`
        });
      } else {
        panel.tracker.removeProperties('*:not(.accessibility-panel, .accessibility-panel *)', 'text-align');
      }
    }
  },
  {
    id: 'paragraphSpacing',
    values: ['none', '8', '16', '24'],
    texts: ['aP.none', 'aP.small', 'aP.medium', 'aP.wide'],
    i18n: ['none', 'small', 'medium', 'wide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      const selector = '*:not(.accessibility-panel, .accessibility-panel *) p, ' +
                      '*:not(.accessibility-panel, .accessibility-panel *) li, ' +
                      '*:not(.accessibility-panel, .accessibility-panel *) blockquote';

      if (value != 'none') {
        panel.tracker.set(selector, {
          'margin-bottom': `${value}px !important`
        });
      } else {
        panel.tracker.removeProperties(selector, 'margin-bottom');
      }
    }
  },
  {
    id: 'cursorSize',
    values: ['none', 'cursor-large', 'cursor-extra-large'],
    texts: ['aP.normal', 'aP.big', 'aP.extraBig'],
    i18n: ['normal', 'big', 'extraBig'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('cursor-large', 'cursor-extra-large');

      if (value != 'none') {
        document.documentElement.classList.add(value);
      }
    }
  },
  {
    id: 'toggleAnimations',
    values: ['reanudar', 'parar'],
    texts: ['aP.continue', 'aP.stop'],
    i18n: ['continue', 'stop'],
    defaultIndex: 1,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('hide-animations');
      if (value == 'reanudar') {
        document.documentElement.classList.add('hide-animations');  
      }
    }
  },
  {
    id: 'toggleGuideLine',
    values: ['ocultar', 'mostrar'],
    texts: ['aP.show', 'aP.hide'],
    i18n: ['show', 'hide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      const guideLine = document.querySelector('.guide-line');
      if (value == 'mostrar') {
        document.addEventListener('mousemove', (event) => { 
          event.preventDefault(); 
          guideLine.style.top = `${event.clientY}px`;
        });

        guideLine.classList.add('guide-line-active');
      } else {
        document.removeEventListener('mousemove', (event) => { 
          event.preventDefault(); 
          guideLine.style.top = `${event.clientY}px`;
        });

        guideLine.classList.remove('guide-line-active');
      }
    }
  },
  {
    id: 'toggleGuideWindow',
    values: ['ocultar', 'mostrar'],
    texts: ['aP.show', 'aP.hide'],
    i18n: ['show', 'hide'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      if (value == 'mostrar') {
        document.querySelector('.guide-window').classList.add('active');
        document.querySelector('.guide-window-overlay-top').classList.add('active');
        document.querySelector('.guide-window-overlay-bottom').classList.add('active');
       
        document.addEventListener('mousemove', (event) => {
          const guideWindowHeight = 50;
          const guideWindow = document.querySelector('.guide-window');
          const guideWindowOverlayTop = document.querySelector('.guide-window-overlay-top');
          const guideWindowOverlayBottom = document.querySelector('.guide-window-overlay-bottom');

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
        });
      } else {
        document.querySelector('.guide-window').classList.remove('active');
        document.querySelector('.guide-window-overlay-top').classList.remove('active');
        document.querySelector('.guide-window-overlay-bottom').classList.remove('active');
       
        document.removeEventListener('mousemove', (event) => {
          const guideWindowHeight = 50;

          const guideWindow = document.querySelector('.guide-window');
          const guideWindowOverlayTop = document.querySelector('.guide-window-overlay-top');
          const guideWindowOverlayBottom = document.querySelector('.guide-window-overlay-bottom');

          if (!guideWindow || !guideWindowOverlayTop || !guideWindowOverlayBottom) {
            console.warn('Elementos guía no encontrados');
            return;
          }

          const y = Math.max(guideWindowHeight / 2, Math.min(event.clientY, window.innerHeight - guideWindowHeight / 2));

          const topHeight = y - guideWindowHeight / 2;
          const bottomHeight = window.innerHeight - (y + guideWindowHeight / 2);

          guideWindow.style.top = `${topHeight}px`;
          guideWindow.style.height = `${guideWindowHeight}px`;

          guideWindowOverlayTop.style.top = '0';
          guideWindowOverlayTop.style.height = `${topHeight}px`;

          guideWindowOverlayBottom.style.top = `${y + guideWindowHeight / 2}px`;
          guideWindowOverlayBottom.style.height = `${bottomHeight}px`;
        });
      }
    }
  },
  {
    id: 'toggleElementHighlight',
    values: ['desactivar', 'activar'],
    texts: ['aP.active', 'aP.deactive'],
    i18n: ['enable', 'deactive'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      const isActive = value === 'activar';
      const button = panel.shadowRoot.querySelector('#toggleElementHighlight');
      button.dataset.active = isActive;

      if (isActive) {
        document.addEventListener('mouseover', panel.highlightMouseOver);
        document.addEventListener('mouseout', panel.highlightMouseOut);
      } else {
        document.removeEventListener('mouseover', panel.highlightMouseOver);
        document.removeEventListener('mouseout', panel.highlightMouseOut);
        
        document.querySelectorAll('.highlight-hovered-element').forEach(el => {
          el.classList.remove('highlight-hovered-element');
        });
      }
    }
  },
  {
    id: 'toggleZoom',
    values: ['desactivar', 'activar'],
    texts: ['aP.active', 'aP.deactive'],
    i18n: ['enable', 'deactive'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      const isActive = value === 'activar';
      panel.zoomManager.applyZoom(isActive);
    }
  },
  {
    id: 'toggleIncrementSizeElementHover',
    values: ['desactivar', 'activar'],
    texts: ['aP.active', 'aP.deactive'],
    i18n: ['enable', 'deactive'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      document.documentElement.classList.remove('increase-interactive-elements-hover');
      if (value == 'activar') {
        document.documentElement.classList.add('increase-interactive-elements-hover');  
      }
    }
  },
  {
    id: 'toggleReadSelected',
    values: ['leer', 'parar'],
    texts: ['aP.read', 'aP.stop'],
    i18n: ['read', 'stop'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      if (value == 'parar') {
        panel.speechManager.readSelectedText();
      } else {
        panel.speechManager.stopAudio();
      }
    }
  },
  {
    id: 'toggleReadFullPage',
    values: ['leer', 'parar'],
    texts: ['aP.read', 'aP.stop'],
    i18n: ['read', 'stop'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      if (value == 'parar') {
        panel.speechManager.readFullPage();
      } else {
        panel.speechManager.stopAudio();
      }
    }
  },
  {
    id: 'extractiveSummary',
    values: ['summarize'],
    texts: ['aP.extractiveSummary'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      // Clonar el documento para no alterar el original
      const clonedDocument = window.document.cloneNode(true);
      const options = {
          debug: false,         // No mostrar comentarios en consola
          maxElemsToParse: 0,   // Para mostrar todos los elementos (0)
          nbTopCandidates: 10,  // Mostrar los top candidatos a texto significativo
      };

      // Parsear el documento para obtener lo principal
      const reader = new Readability(clonedDocument, options);
      const articleParsed = reader.parse();

      // Obtener el contenido del documento parseado
      let articleTextContent = articleParsed.textContent;
      if (articleTextContent) {
        articleTextContent = articleTextContent.split('\n').map(line => line.trim()).join('\n');
        articleTextContent = articleTextContent.replace(/\n{2,}/g, '\n\n');
      } else {
        return;
      }

      const language = panel.language ?? "es";

      let prompt = `Read and process the following content from a web page.
        Your task is to generate an extractive summary. Therefore, draw on everything defined in the content and summarize the main ideas clearly, concisely, and coherently.
        Specific instructions:
        1. Maintain a neutral tone.
        2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
        3. Write a maximum of 3 to 5 paragraphs, depending on the length of the content.
        4. Emphasize key ideas, not minor details.
        5. Correctly display line breaks to separate paragraphs.
        Input text: ${articleTextContent}`;

      ChromeApiService.getUserSession()
      .then((data) => {
        // Sí hay datos en el perfil de usuario incluirlos en la generación del contenido
        if (data && data.attributes) {
          const profileForPrompt = Object.fromEntries(
            Object.entries(data.attributes)
              .filter(([key, attr]) => attr.isSummaryField)
              .map(([key, attr]) => [key, attr.value])
          );
  
          const profileDescriptions = Object.entries(profileForPrompt)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`)
            .join('; ');

          // Construcción del prompt
          prompt = `Read and process the following content from a web page.
            Your task is to generate an extractive summary. Therefore, draw on everything defined in the content and summarize the main ideas clearly, concisely, and coherently.
            Specific instructions:
            1. Maintain a neutral tone and meet the characteristics of the following user profile: ${profileDescriptions}.
            2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
            3. Write a maximum of 3 to 5 paragraphs, depending on the length of the content.
            4. Emphasize key ideas, not minor details.
            5. Correctly display line breaks to separate paragraphs.
            Input text: ${articleTextContent}`;          
        }
      })
      .finally(() => {
        if (!panel.loader) return;
        if (!panel.modal) return;

        panel.loader.setProcessDescription(Translator.t(panel.language, "m.generatingExtractiveSummary"));
        panel.loader.show();

        ChromeApiService.getIACallResponse(prompt)
        .then((response) => {
          if (!response) return;
          panel.modal.setTextualContent(response);
          panel.modal.show();
        })
        .catch((error) => {
          console.error("Error en la llamada IA:", error);
          panel.modal.close();
        })
        .finally(() => {
          panel.loader.hide();
        });   
      })
    }
  },
  {
    id: 'simplifyPage',
    values: ['summarize'],
    texts: ['aP.simplifyPage'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      // Clonar el documento para no alterar el original
      const clonedDocument = window.document.cloneNode(true);
      const options = {
          debug: false,         // No mostrar comentarios en consola
          maxElemsToParse: 0,   // Para mostrar todos los elementos (0)
          nbTopCandidates: 10,  // Mostrar los top candidatos a texto significativo
      };

      // Parsear el documento para obtener lo principal
      const reader = new Readability(clonedDocument, options);
      const articleParsed = reader.parse();

      // Obtener el contenido del documento parseado
      let articleTextContent = articleParsed.textContent;
      if (articleTextContent) {
        articleTextContent = articleTextContent.split('\n').map(line => line.trim()).join('\n');
        articleTextContent = articleTextContent.replace(/\n{2,}/g, '\n\n');
      } else {
        return;
      }
      
      // Cargar el contenido textual en el modal
      // accessibilityManager.accessibilityPanel.modal.setContentHTML(articleContent);
      // panel.modal.setTextualContent(articleTextContent);

      // Extraer las imágenes
      let imagenes = Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt || ""
      }));

      // Extraer los enlaces (opcional)
      let enlaces = Array.from(document.links).map(a => ({
        href: a.href,
        text: a.innerText.trim()
      }));

      const language = panel.language ?? "es";

      let prompt = `Restructure this content and generate complete HTML code. Strictly follow these instructions:
        1. The output must begin only with <body> and end only with </body>. Do not add additional text before or after.
        2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
        3. The background of the entire page must be completely white.
        4. All text must be black.
        5. Titles must be bold.
        6. The design must comply with W3C WCAG standards and use appropriate semantic tags.
        7. The content structure must be as follows:
          - A centrally located title representing the main page.
          - An introductory paragraph briefly presenting the content (also centered).
          - The content must be restructured into clear and orderly sections.
        8. Include images only if they are relevant and related to the text. Do not modify the source (URL) or the original alt attribute of the images.
        9. Do not include content related to advertising or that could be harmful to the user.
        10. Do not include bullet points or icons other than those specifically indicated in the content.
        11. Do not write anything outside of the HTML code, including no comments or explanations.
        12. Do not add any styles in the elements (CSS).
        13. You can include tables if its neccesary.
        14. Do not include bullet points, special characters and images.

        Content to use:
        ${articleTextContent.slice(0, 100000)}
      `;

      ChromeApiService.getUserSession()
        .then((data) => {
          // Sí hay datos en el perfil de usuario, utilizarlos para la generación del contenido
          if (data && data.attributes) {
            const profileForPrompt = Object.fromEntries(
              Object.entries(data.attributes)
                .filter(([key, attr]) => attr.isSummaryField)
                .map(([key, attr]) => [key, attr.value])
            );

            const profileDescriptions = Object.entries(profileForPrompt)
              .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`)
              .join('; ');
    
            prompt = `Restructure this content and generate complete HTML code for an older adult user profile with this aspects: and meet the characteristics of the following user profile: ${profileDescriptions}.
              Strictly follow these instructions:
              1. The output must begin only with <body> and end only with </body>. Do not add additional text before or after.
              2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
              3. The background of the entire page must be completely white.
              4. All text must be black.
              5. Titles must be bold.
              6. The design must comply with W3C WCAG standards and use appropriate semantic tags.
              7. The content structure must be as follows:
                - A centrally located title representing the main page.
                - An introductory paragraph briefly presenting the content (also centered).
                - The content must be restructured into clear and orderly sections.
                - A final section (footer) titled "Related Links" that includes relevant links in a list (with line breaks).
              8. Include images only if they are relevant and related to the text. Do not modify the source (URL) or the original alt attribute of the images.
              9. Do not include content related to advertising or that could be harmful to the user.
              10. Do not include bullet points or icons other than those specifically indicated in the content.
              11. Do not write anything outside of the HTML code, including no comments or explanations.
              12. Do not add any styles in the elements (CSS).
              13. You can include tables if its neccesary.
              14. Do not include bullet points, images or special characters on titles or paragraphs.
    
              Content to use:
              ${articleTextContent}
              `;
          }
        }
      ).finally(() => {
        if (!panel.loader) return;
        if (!panel.modal) return;
        
        panel.loader.setProcessDescription(Translator.t(panel.language, "m.generatingSimplifiedPage"));
        panel.loader.show();

        console.log(prompt)
        ChromeApiService.getIACallResponse(prompt)
        .then((response) => {
          if (!response) return;
          panel.modal.setTextualContent(response);
          panel.modal.show();
        })
        .catch((error) => {
          console.error("Error en la llamada IA:", error);
          panel.modal.close();
        })
        .finally(() => {
          panel.loader.hide();
        });   
      })
    }
  },
  {
    id: 'abstractiveSummary',
    values: ['summarize'],
    texts: ['aP.abstractiveSummary'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      // Clonar el documento para no alterar el original
      const clonedDocument = window.document.cloneNode(true);
      const options = {
          debug: false,         // No mostrar comentarios en consola
          maxElemsToParse: 0,   // Para mostrar todos los elementos (0)
          nbTopCandidates: 10,  // Mostrar los top candidatos a texto significativo
      };

      // Parsear el documento para obtener lo principal
      const reader = new Readability(clonedDocument, options);
      const articleParsed = reader.parse();

      // Obtener el contenido del documento parseado
      let articleTextContent = articleParsed.textContent;
      if (articleTextContent) {
        articleTextContent = articleTextContent.split('\n').map(line => line.trim()).join('\n');
        articleTextContent = articleTextContent.replace(/\n{2,}/g, '\n\n');
      } else {
        return;
      }
      
      const language = panel.language ?? "es";
      // Prompt por defecto
      let prompt = `Read and process the following content from a web page.
        Your task is to generate an abstract summary. Therefore, you are not copying verbatim sentences, but rather synthesizing the main ideas in a clear, concise, and coherent manner.
        Specific instructions:
        1. Maintain a neutral and professional tone.
        2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
        3. Write a maximum of 3 to 5 paragraphs, depending on the length of the content.
        4. Emphasize key ideas, not minor details.
        5. Correctly use line breaks to separate paragraphs.
        Input text: ${articleTextContent}`;
      ChromeApiService.getUserSession()
      .then((data) => {
        // Sí hay datos en el perfil de usuario, incluirlos en la generación de contenido
        if (data && data.attributes) {
          const profileForPrompt = Object.fromEntries(
            Object.entries(data.attributes)
              .filter(([key, attr]) => attr.isSummaryField)
              .map(([key, attr]) => [key, attr.value])
          );

          const profileDescriptions = Object.entries(profileForPrompt)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${value}`)
            .join('; ');
  
          prompt = `Read and process the following content from a web page.
            Your task is to generate an abstract summary. Therefore, you are not copying verbatim sentences, but rather synthesizing the main ideas in a clear, concise, and coherent manner.
            Specific instructions:
            1. Maintain a neutral and professional tone and meet the characteristics of the following user profile: ${profileDescriptions}.
            2. All content must be written in the language (expressed in ISO 639-1 format): ${language}.
            3. Write a maximum of 3 to 5 paragraphs, depending on the length of the content.
            4. Emphasize key ideas, not minor details.
            5. Correctly use line breaks to separate paragraphs.
            Input text: ${articleTextContent}
            `;          
        }
      }
    ).finally(() => {
        if (!panel.loader) return;
        if (!panel.modal) return;
        
        panel.loader.setProcessDescription(Translator.t(panel.language, "m.generatingAbstracticSummary"));
        panel.loader.show();

        ChromeApiService.getIACallResponse(prompt)
        .then((response) => {
          if (!response) return;
          panel.modal.setTextualContent(response);
          panel.modal.show();
        })
        .catch((error) => {
          console.error("Error en la llamada IA:", error);
          panel.modal.close();
        })
        .finally(() => {
          panel.loader.hide();
        });   
      })
    }
  },
  {
    id: 'altText',
    values: ['none', 'overlay', 'follow'],
    texts: ['aP.none', 'aP.overImage', 'aP.followCursor'],
    i18n: ['none', 'overImage', 'followCursor'],
    defaultIndex: 0,
    saveable: true,
    action: (value, panel) => {
      panel.textAltManager.setMode(value);
    }
  },
  {
    id: 'btn-show-notifications',
    values: ['apply'],
    texts: ['aP.apply'],
    i18n: ['apply'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {
      
    }
  },
  {
    id: 'btn-not-show-accept-notifications',
    values: ['apply'],
    texts: ['aP.apply'],
    i18n: ['apply'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {

    }
  },
  {
    id: 'btn-not-show-reject-notifications',
    values: ['apply'],
    texts: ['aP.apply'],
    i18n: ['apply'],
    defaultIndex: 0,
    saveable: false,
    action: (value, panel) => {

    }
  }
];
