(function VIPS(config) {
    // Logging configurable para depurar y verificar errores
    const logger = {
        debug: (...args) => { if (config.logLevel === 'debug') console.log('[Debug]', ...args); },
        info: (...args) => { if (['debug', 'info'].includes(config.logLevel)) console.info('[Info]', ...args); },
        warn: (...args) => { if (['debug', 'info', 'warn'].includes(config.logLevel)) console.warn('[Warn]', ...args); },
        error: (...args) => console.error('[Error]', ...args)
    };

    // Validar parámetros de entrada
    if (typeof config.pdoc !== 'number' || config.pdoc < 1 || config.pdoc > 10) {
        logger.warn(`pdoc inválido (${config.pdoc}), usando 6`);
        config.pdoc = 6;
    }
    if (typeof config.maxRecursion !== 'number' || config.maxRecursion < 1 || config.maxRecursion > 100) {
        logger.warn(`maxRecursion inválido (${config.maxRecursion}), usando 30`);
        config.maxRecursion = 30;
    }
    if (typeof config.executionTimeout !== 'number' || config.executionTimeout <= 0) {
        logger.warn(`executionTimeout inválido (${config.executionTimeout}), usando 10 segundos`);
        config.executionTimeout = 10000;
    }
    if (typeof config.percentile !== 'number' || config.percentile < 0 || config.percentile > 1) {
        logger.warn(`Percentil inválido (${config.percentile}), usando 0.25`);
        config.percentile = 0.25;
    }

    // Constantes y variables globales
    const MAX_LEVEL = config.maxRecursion;
    const startTime = performance.now();
    const blockPool = [];
    const blocks = [];
    let blockId = 0;
    const repetitionSignatures = new Map(); // signature = { el: html element, count: number }

    // Guardar en caché los elementos del DOM para reducir consultas
    const styleCache = new Map();
    const rectCache = new Map();

    // Obtener el estilo computado de un elemento, usando caché
    function getCachedStyle(el) {
        if (!styleCache.has(el)) styleCache.set(el, window.getComputedStyle(el));
        return styleCache.get(el);
    }

    // Obtener el rectángulo de un elemento, usando caché
    function getCachedRect(el) {
        if (!rectCache.has(el)) rectCache.set(el, el.getBoundingClientRect());
        return rectCache.get(el);
    }

    // Obtener clases de forma segura
    function getSafeClassName(className) {
        if (typeof className === 'string') {
            return className.split(/\s+/).filter(c => c).sort().join('.');
        } else if (className && typeof className === 'object' && 'baseVal' in className) {
            return className.baseVal.split(/\s+/).filter(c => c).sort().join('.');
        } else if (className) {
            logger.warn(`className inesperado: ${JSON.stringify(className)}`);
        }
        return '';
    }

    // Generación de la firma para un elemento:
    // Utilizada para verificar si se trata de un elemento repetitivo en la interfaz
    function generateSignature2(el, includeSize, includeDisplay, includeChildren = true) {
        if (!(el instanceof Element)) return '';

        // Obtener todas las clases del elemento
        const classes = getSafeClassName(el.className);

        // Obtener todos los hijos con su cantidad de apariciones respectiva
        const childrenArray = Array.from(el.children).map(c => c.tagName);
        const tagCounts = {};
        for (const tag of childrenArray) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
        const children = Object.entries(tagCounts)
            .map(([tag, count]) => `(${count})${tag}`)
            .sort()
            .join(',');

        const style = getCachedStyle(el);
        const rect = getCachedRect(el);
        let signature = `${el.tagName}.${classes}`;
        // Crear la firma con los elementos configurados
        if (includeChildren) {
            signature += `|children:${children}`;
        }
        if (includeSize) {
            signature += `|size:${Math.round(rect.width)}x${Math.round(rect.height)}`;
        }
        if (includeDisplay) {
            signature += `|display:${style.display}`;
        }

        return signature;
    }

    // Verificar si dos bloques son repetitivos comparando estilos y estructura
   function isRepetitiveMatch(el1, el2, tolerance = 0.1, response = []) {
        if (!(el1 instanceof Element) || !(el2 instanceof Element)) return false;

        // 1. Comparar tag y clases
        if (el1.tagName !== el2.tagName || getSafeClassName(el1.className) !== getSafeClassName(el2.className)) {
            response.push(false);
            return false;
        }

        // 2. Filtrar hijos relevantes (ignorar envolturas de texto)
        const isTextWrapper = (tag) => config.textWrapper.includes(tag.toUpperCase());
        const c1 = Array.from(el1.children).filter(c => !isTextWrapper(c.tagName));
        const c2 = Array.from(el2.children).filter(c => !isTextWrapper(c.tagName));

        // 3. Permitir diferencias en el número de hijos hasta un 30%
        const lengthDiff = Math.abs(c1.length - c2.length) / Math.max(c1.length, c2.length, 1);
        if (lengthDiff > 0.3) {
            response.push(false);
            logger.debug(`Diferencia en número de hijos: ${c1.length} vs ${c2.length}`);
            return false;
        }

        const max = c1.length > c2.length ? c1.length : c2.length;

        for (let i = 0; i < max; i++) {
            if (!isRepetitiveMatch(c1[i], c2[i], tolerance)) {
                return false;
            }
        }


        return true;
        
        // if (el1.tagName !== el2.tagName) return false;

        // if (el1.className !== el2.className) return false;

        const style1 = getCachedStyle(el1);
        const style2 = getCachedStyle(el2);
        const keysToCompare = ['display', 'fontSize', 'fontFamily', 'color'];

        // for (const key of keysToCompare) {
        //     if (style1[key] !== style2[key]) return false;
        // }

        // const rect1 = getCachedRect(el1);
        // const rect2 = getCachedRect(el2);
        // const widthDiff = Math.abs(rect1.width - rect2.width) / Math.max(rect1.width, rect2.width);
        // const heightDiff = Math.abs(rect1.height - rect2.height) / Math.max(rect1.height, rect2.height);
        // if (widthDiff > tolerance || heightDiff > tolerance) return false;

        
        const children1 = el1.children;
        const children2 = el2.children;

        // if (generateSignature2(el1, false, false) != generateSignature(el2, false, false)) {
        //     response.push(false);
        //     console.log(generateSignature2(el1, false, false), "\n!=\n", generateSignature2(el2, false, false), generateSignature2(el1, false, false) != generateSignature(el2, false, false))
        //     return false;
        // }

        const maxLength = children1.length > children2.length ? children1.length : children2.length;
        if (children1.length != children2.length) {
            return false;
        }
        

        const a = generateSignature2(el1, false, false) != generateSignature2(el2, false, false)
        if (!a) return false;
        
        for (let i = 0; i < maxLength; i++) {
            if (!isRepetitiveMatch(children1[i], children2[i], tolerance)) {
                //console.log("ERROR", children1[i].children, children2[i].children)
                return false;
            }
        }
        return true;
        
        if (children1.length != children2.length) {
            console.log(children1, children2)
            return false;
        }
      
        // for (let i = 0; i < maxLength; i++) {
        //     if (!isRepetitiveMatch(children1[i], children2[i], tolerance)) {
        //         //console.log("ERROR", children1[i].children, children2[i].children)
        //         return false;
        //     }
        // }

        // if (children1.length === 0) {
        //     const text1 = (el1.textContent || '').trim();
        //     const text2 = (el2.textContent || '').trim();
        //     if (text1 !== text2) return false;
        // }

        return true;
    }

    // Calcular el percentil de un conjunto de áreas
    function calculatePercentile(areas, percentile) {
        if (areas.length === 0) return 0.001;
        const sortedAreas = areas.sort((a, b) => a - b);
        const index = Math.floor(percentile * sortedAreas.length);
        return sortedAreas[index] || 0.001;
    }

    // Recolectar áreas relativas de elementos visibles
    function collectVisibleElementAreas(pageArea) {
        const areas = [];
        const allElements = Array.from(document.querySelectorAll(':where(*:not(script,style,meta,link))'));
        for (const el of allElements) {
            if (!(el instanceof Element)) continue;
            const style = getCachedStyle(el);
            const rect = getCachedRect(el);
            if (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                style.opacity !== "0" &&
                rect.width > 0 &&
                rect.height > 0
            ) {
                areas.push((rect.width * rect.height) / pageArea);
            }
        }
        return calculatePercentile(areas, config.percentile);
    }

    // Verifica si un elemento es visible según estilo y tamaño
    function isElementVisible(el, pageArea, minArea) {
        if (!(el instanceof Element)) return false;
        const style = getCachedStyle(el);
        const rect = getCachedRect(el);
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width >= 2 &&
            rect.height >= 2 &&
            (rect.width * rect.height) / pageArea >= minArea
        );
    }

    // Verifica recursivamente si un elemento o sus descendientes son visibles
    function hasVisibleDescendant(el, pageArea, minArea) {
        if (!(el instanceof Element)) return false;
        const style = getCachedStyle(el);
        if (
            style.display === "none" ||
            style.visibility !== "visible" ||
            style.opacity === "0"
        ) return false;
        if (isElementVisible(el, pageArea, minArea)) return true;
        return Array.from(el.children).some(child => hasVisibleDescendant(child, pageArea, minArea));
    }

    // Determinar si un elemento es visible 
    function isVisible(el, pageArea, minArea) {
        if (!(el instanceof Element)) return false;
        return config.semanticTags.includes(el.tagName.toUpperCase()) || hasVisibleDescendant(el, pageArea, minArea);
    }

    // Verificar si un elemento es una etiqueta en línea
    function isInlineNode(el) {
        return config.inlineTags.includes(el.tagName.toUpperCase());
    }

    // Verificar si un nodo es de texto con contenido válido
    function isTextNode(el) {
        return el.nodeType === Node.TEXT_NODE && el.textContent.trim().length > 0;
    }

    // Verificar si un elemento es un nodo de texto virtual
    function isVirtualTextNode(el) {
        if (!(el instanceof Element)) return false;
        if (isInlineNode(el)) {
            return Array.from(el.childNodes).every(child => isTextNode(child) || isVirtualTextNode(child));
        }
        return false;
    }

    // Calcula la luminancia de un color RGB
    function getLuminance(color) {
        if (!color || color === 'transparent') return 1;
        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = color;
        document.body.appendChild(tempDiv);
        const computedColor = getCachedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);
        const rgb = computedColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
        const [r, g, b] = rgb.map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Calcular la relación de contraste entre dos colores
    function getContrastRatio(color1, color2) {
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    }

    // Calcular la prominencia visual de un elemento
    function calculateProminence(el, level, doc, pageArea) {
        if (!(el instanceof Element)) return 0;
        const rect = getCachedRect(el);
        const style = getCachedStyle(el);
        const parentStyle = el.parentElement ? getCachedStyle(el.parentElement) : { backgroundColor: 'rgba(0,0,0,0)' };
        let score = 0;
        score += doc / 10;
        score += (rect.width * rect.height) / pageArea;
        if (rect.top < window.innerHeight / 3) score += 0.3;
        if (style.backgroundColor && parentStyle.backgroundColor) {
            score += Math.min(getContrastRatio(style.backgroundColor, parentStyle.backgroundColor) / 21, 0.3);
        }
        if (style.fontSize && parseInt(style.fontSize) > 16) score += 0.2;
        if (config.semanticTags.includes(el.tagName.toUpperCase())) score += 0.2;
        score += (10 - level) / 20;
        return Math.min(score, 1);
    }

    // Calcula el grado de coherencia de un elemento
    function getDoC(el, level, ruleApplied, pageArea) {
        if (!(el instanceof Element)) return 1;
        const children = Array.from(el.children).filter(child => isVisible(child, pageArea, 0));
        const style = getCachedStyle(el);
        const parentStyle = el.parentElement ? getCachedStyle(el.parentElement) : {};
        const rect = getCachedRect(el);
        const relativeSize = (rect.width * rect.height) / pageArea;
        let doc = 1;

        if (ruleApplied === 4) {
            const allTextOrVirtual = children.every(child => isTextNode(child) || isVirtualTextNode(child));
            if (allTextOrVirtual) {
                const sameFont = children.every(child => {
                    const childStyle = getCachedStyle(child);
                    return childStyle.fontSize === style.fontSize && childStyle.fontWeight === style.fontWeight;
                });
                return sameFont ? 10 : 9;
            }
        }

        if (ruleApplied === 8) {
            if (config.semanticTags.includes(el.tagName.toUpperCase()) && relativeSize > 0.05) return 8;
            if (['P', 'TR', 'BUTTON', 'INPUT'].includes(el.tagName.toUpperCase()) || relativeSize > 0.03) return 7;
            return 6;
        }

        if (ruleApplied === 9 || ruleApplied === 10) {
            if (config.semanticTags.includes(el.tagName.toUpperCase())) return 8;
            if (['P', 'TD', 'TR', 'BUTTON', 'INPUT'].includes(el.tagName.toUpperCase())) return 7;
            return relativeSize > 0.05 ? 6 : 5;
        }

        if (ruleApplied === 13) {
            return relativeSize > 0.05 ? 5 : 4;
        }

        if (style.backgroundColor !== parentStyle.backgroundColor) doc += 2;
        if (relativeSize < 0.05) doc += 2;
        const maxChildSize = Math.max(...children.map(child => {
            const childRect = getCachedRect(child);
            return childRect.width * childRect.height;
        }, 0));
        if (maxChildSize / pageArea < 0.03) doc += 1;
        if (['P', 'TD', 'TR', 'H1', 'H2', 'H3', 'NAV', 'ARTICLE', 'SECTION'].includes(el.tagName.toUpperCase())) doc += 2;
        if (['TABLE', 'DIV', 'HR'].includes(el.tagName.toUpperCase())) doc += 1;
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        if (marginTop > 10 || marginBottom > 10) doc += 1;
        const textLength = (el.textContent || '').trim().length;
        if (textLength > 100) doc += 1;
        return Math.min(doc, 10);
    }

    // Determinar si un elemento debe dividirse
    function shouldDivide(el, level, pageArea, minArea) {
        if (!(el instanceof Element) || level >= MAX_LEVEL) return false;
        const children = Array.from(el.children).filter(child => isVisible(child, pageArea, minArea));
        const style = getCachedStyle(el);
        const parentStyle = el.parentElement ? getCachedStyle(el.parentElement) : {};
        const rect = getCachedRect(el);
        const tag = el.tagName.toUpperCase();
        const ruleSet = isInlineNode(el) ? config.rulesByTag.INLINE : config.rulesByTag[tag] || config.rulesByTag.DEFAULT;

        for (const rule of ruleSet) {
            switch (rule) {
                case 1:
                    if (!children.length && !isTextNode(el)) return false;
                    break;
                case 2:
                    if (children.length === 1 && !isTextNode(children[0])) return true;
                    break;
                case 3:
                    if (level === 1 && children.length === 1) return true;
                    break;
                case 4:
                    if (children.every(child => isTextNode(child) || isVirtualTextNode(child))) return false;
                    break;
                case 5:
                    if (children.some(child => !isInlineNode(child))) return true;
                    break;
                case 6:
                    if (el.querySelector('HR')) return true;
                    break;
                case 7:
                    const childrenArea = children.reduce((sum, child) => {
                        const childRect = getCachedRect(child);
                        return sum + childRect.width * childRect.height;
                    }, 0);
                    if (childrenArea > rect.width * rect.height) return true;
                    break;
                case 8:
                    for (const child of children) {
                        const childStyle = getCachedStyle(child);
                        if (childStyle.backgroundColor !== style.backgroundColor) {
                            child.dataset.noDivideThisRound = 'true';
                            return true;
                        }
                    }
                    break;
                case 9:
                    const isSemantic = config.semanticTags.includes(tag);
                    const sizeThreshold = isSemantic ? minArea / 2 : minArea;
                    if ((rect.width * rect.height) / pageArea < sizeThreshold) return false;
                    break;
                case 10:
                    const maxChildSize = Math.max(...children.map(child => {
                        const childRect = getCachedRect(child);
                        return childRect.width * childRect.height;
                    }, 0));
                    if (maxChildSize / pageArea < 0.03) return false;
                    break;
                case 11:
                    const prevSibling = el.previousElementSibling;
                    if (prevSibling && isVisible(prevSibling, pageArea, minArea) && prevSibling.dataset.divided !== 'true') return false;
                    break;
                case 12:
                    return true;
            }
        }
        return false;
    }

    // Detectar separadores visuales basados en elementos
    function detectImageSeparators(pageArea, minArea) {
        const imageSeparators = { horizontal: [], vertical: [] };
        const potentialSeparators = Array.from(document.querySelectorAll('img, picture, hr, div, section, article, nav, aside'));
        for (const el of potentialSeparators) {
            if (!isVisible(el, pageArea, minArea)) continue;
            const rect = getCachedRect(el);
            const style = getCachedStyle(el);
            const isHorizontal = el.tagName.toLowerCase() === 'hr' ||
                                (rect.height <= 5 && rect.width >= rect.height * 10) ||
                                parseFloat(style.borderBottomWidth) > 2 ||
                                parseFloat(style.borderTopWidth) > 2 ||
                                style.boxShadow !== 'none';
            const isVertical = rect.width <= 5 && rect.height >= rect.width * 10 ||
                              parseFloat(style.borderLeftWidth) > 2 ||
                              parseFloat(style.borderRightWidth) > 2;
            if (isHorizontal) {
                imageSeparators.horizontal.push({
                    start: rect.top,
                    end: rect.bottom,
                    weight: el.tagName.toLowerCase() === 'hr' ? 3 : 0,
                    type: 'horizontal',
                    element: el
                });
            } else if (isVertical) {
                imageSeparators.vertical.push({
                    start: rect.left,
                    end: rect.right,
                    weight: 0,
                    type: 'vertical',
                    element: el
                });
            }
        }
        return imageSeparators;
    }

    // Detectar y refinar los separadores visuales entre bloques
    function detectSeparators(blockPool, pageArea, minArea) {
        const horizontalSeparators = [{ start: 0, end: window.innerHeight, weight: 0, type: 'horizontal' }];
        const verticalSeparators = [{ start: 0, end: window.innerWidth, weight: 0, type: 'vertical' }];

        for (const block of blockPool) {
            if (!block.element || !(block.element instanceof Element)) continue;
            const rect = getCachedRect(block.element);
            for (let i = horizontalSeparators.length - 1; i >= 0; i--) {
                const sep = horizontalSeparators[i];
                if (rect.top > sep.start && rect.bottom < sep.end) {
                    horizontalSeparators.splice(i, 1,
                        { start: sep.start, end: rect.top, weight: 0, type: 'horizontal' },
                        { start: rect.bottom, end: sep.end, weight: 0, type: 'horizontal' }
                    );
                } else if (rect.top < sep.end && rect.bottom > sep.start) {
                    if (rect.top > sep.start) sep.end = rect.top;
                    if (rect.bottom < sep.end) sep.start = rect.bottom;
                    if (sep.start >= sep.end) horizontalSeparators.splice(i, 1);
                }
            }
            for (let i = verticalSeparators.length - 1; i >= 0; i--) {
                const sep = verticalSeparators[i];
                if (rect.left > sep.start && rect.right < sep.end) {
                    verticalSeparators.splice(i, 1,
                        { start: sep.start, end: rect.left, weight: 0, type: 'vertical' },
                        { start: rect.right, end: sep.end, weight: 0, type: 'vertical' }
                    );
                } else if (rect.left < sep.end && rect.right > sep.start) {
                    if (rect.left > sep.start) sep.end = rect.left;
                    if (rect.right < sep.end) sep.start = rect.right;
                    if (sep.start >= sep.end) verticalSeparators.splice(i, 1);
                }
            }
        }

        const imageSeparators = detectImageSeparators(pageArea, minArea);
        horizontalSeparators.push(...imageSeparators.horizontal);
        verticalSeparators.push(...imageSeparators.vertical);

        const filteredHorizontal = horizontalSeparators.filter(sep => sep.start !== 0 && sep.end !== window.innerHeight);
        const filteredVertical = verticalSeparators.filter(sep => sep.start !== 0 && sep.end !== window.innerWidth);

        filteredHorizontal.forEach(sep => {
            sep.weight = calculateSeparatorWeight(sep, blockPool, 'horizontal', pageArea);
        });
        filteredVertical.forEach(sep => {
            sep.weight = calculateSeparatorWeight(sep, blockPool, 'vertical', pageArea);
        });

        return { horizontal: filteredHorizontal, vertical: filteredVertical };
    }

    // Calcular el peso de un separador basado en bloques adyacentes
    function calculateSeparatorWeight(sep, blockPool, type, pageArea) {
        let weight = sep.weight || 0;
        const adjacentBlocks = blockPool.filter(block => {
            if (!block.element || !(block.element instanceof Element)) return false;
            const rect = getCachedRect(block.element);
            if (type === 'horizontal') {
                return Math.abs(rect.bottom - sep.start) < 1 || Math.abs(rect.top - sep.end) < 1;
            } else {
                return Math.abs(rect.right - sep.start) < 1 || Math.abs(rect.left - sep.end) < 1;
            }
        });

        if (adjacentBlocks.length < 2) {
            if (sep.element) {
                weight += 2;
                const rect = getCachedRect(sep.element);
                weight += (type === 'horizontal' ? rect.width : rect.height) / window.innerWidth;
            }
            return weight;
        }

        const [block1, block2] = adjacentBlocks;
        const style1 = getCachedStyle(block1.element);
        const style2 = getCachedStyle(block2.element);
        const rect1 = getCachedRect(block1.element);
        const rect2 = getCachedRect(block2.element);
        const distance = type === 'horizontal' ? Math.abs(rect2.top - rect1.bottom) : Math.abs(rect2.left - rect1.right);
        weight += distance / 100;
        if (block1.element.querySelector('HR') || block2.element.querySelector('HR')) weight += 3;
        if (style1.backgroundColor !== style2.backgroundColor) weight += 2;
        if (type === 'horizontal') {
            if (style1.fontSize !== style2.fontSize || style1.fontWeight !== style2.fontWeight) weight += 1;
            if (parseInt(style1.fontSize) < parseInt(style2.fontSize)) weight += 1;
        }
        if (block1.tag === block2.tag && style1.fontSize === style2.fontSize) weight -= 1;
        return Math.max(weight, 0);
    }

    // Función para dibujar un bloque
    function drawOverlay(el, level, doc, separatorWeight, prominence, blockId, blocks, pageArea, isRepetitive, repetitionGroup) {        
        if (!(el instanceof Element)) return;

        const overlay = document.createElement("div");
        const rect = getCachedRect(el);

        overlay.className = "vips-overlay";
        overlay.style.position = "absolute";
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.border = isRepetitive ? `3px solid blue` : (doc >= config.pdoc || prominence > 0.75)
            ? `3px solid #ff0000`
            : `2px dashed hsla(${level * 40}, 100%, 50%, 0.7)`;
        overlay.style.zIndex = 9999;
        overlay.style.pointerEvents = "auto";
        overlay.style.fontSize = "10px";
        overlay.style.color = (doc >= config.pdoc || prominence > 0.75) ? "#ff0000" : "#000";
        overlay.style.background = (doc >= config.pdoc || prominence > 0.75)
            ? "rgba(255, 0, 0, 0.2)"
            : "rgba(255, 255, 255, 0.15)";
        overlay.style.cursor = "pointer";
        const relativeArea = ((rect.width * rect.height) / pageArea * 100).toFixed(2);
        overlay.textContent = `B${blockId} (L${level}) DoC:${doc} Sep:${separatorWeight.toFixed(2)} Prom:${prominence.toFixed(2)} Area:${relativeArea}% Rep:${repetitionGroup || 'none'}`;
        overlay.style.display = "flex";
        overlay.style.alignItems = "start";
        overlay.style.justifyContent = "start";
        overlay.style.padding = "2px";
        overlay.title = `Block: B${blockId}\nTag: ${el.tagName}\nLevel: ${level}\nDoC: ${doc}\nSeparator Weight: ${separatorWeight.toFixed(2)}\nProminence: ${prominence.toFixed(2)}\nArea: ${relativeArea}%\nRepetitive: ${isRepetitive}\nGroup: ${repetitionGroup || 'none'}\nText: ${(el.innerText || '').trim().slice(0, 60)}`;

        overlay.addEventListener("mouseenter", () => {
            overlay.style.background = (doc >= config.pdoc || prominence > 0.75)
                ? "rgba(255, 0, 0, 0.3)"
                : "rgba(255, 255, 0, 0.3)";
        });
        overlay.addEventListener("mouseleave", () => {
            overlay.style.background = (doc >= config.pdoc || prominence > 0.75)
                ? "rgba(255, 0, 0, 0.2)"
                : "rgba(255, 255, 255, 0.15)";
        });

        document.body.appendChild(overlay);

        blocks.push({
            id: `B${blockId}`,
            element: el,
            tag: el.tagName,
            level,
            DoC: doc,
            separatorWeight: separatorWeight.toFixed(2),
            prominence: prominence.toFixed(2),
            text: (el.innerText || '').trim().slice(0, 60),
            area: rect.width * rect.height,
            relativeArea: relativeArea,
            position: { top: rect.top, left: rect.left },
            isRepetitive,
            repetitionGroup
        });
    }

    // Segmentación de un elemento en bloques visuales recursivamente
    
// Segmentación de un elemento en bloques visuales recursivamente
function segment(el, level, blockPool, pageArea, minArea, timeRemaining) {
    logger.debug(`Segmentando (id/class = ${el.id ?? ''}/${el.className ?? ''}, tiempo restante=${timeRemaining}ms)`);

    // Cancelar si se excede el tiempo global
    if (performance.now() - startTime > config.executionTimeout) {
        logger.warn(`Ejecución detenida: Tiempo máximo alcanzado para elemento (tag=${el.tagName}, id/class=${el.id ?? ''}/${el.className ?? ''})`);
        return false;
    }

    // Verificar si el elemento es válido y el nivel es menor al máximo
    if (!(el instanceof Element) || level > MAX_LEVEL) return true;
    if (['SCRIPT', 'STYLE', 'META', 'LINK'].includes(el.tagName.toUpperCase())) return true;

    const visibleChildren = Array.from(el.children).filter(child => isVisible(child, pageArea, minArea));
    if (!isVisible(el, pageArea, minArea) && visibleChildren.length === 0) return true;

    const isNoDivideThisRound = el.dataset.noDivideThisRound === 'true';
    const ruleApplied = isNoDivideThisRound ? 8 :
                        (shouldDivide(el, level, pageArea, minArea) ? 12 :
                        (visibleChildren.every(child => isTextNode(child) || isVirtualTextNode(child)) ? 4 :
                        (getCachedStyle(el).backgroundColor !== (el.parentElement ? getCachedStyle(el.parentElement).backgroundColor : '') ? 8 :
                        ((getCachedRect(el).width * getCachedRect(el).height) / pageArea < (config.semanticTags.includes(el.tagName.toUpperCase()) ? minArea / 2 : minArea) ? 9 :
                        (Math.max(...visibleChildren.map(child => getCachedRect(child).width * getCachedRect(child).height), 0) / pageArea < 0.03 ? 10 : 13)))));

    // Obtener el DoC del elemento
    const doc = getDoC(el, level, ruleApplied, pageArea);
    if (isNoDivideThisRound) delete el.dataset.noDivideThisRound;

    if (el.tagName.toLowerCase() === "body" || (!isNoDivideThisRound 
            && shouldDivide(el, level, pageArea, minArea) 
            && visibleChildren.length > 0 && doc < config.pdoc)
        ) {
        const childPool = el.tagName.toLowerCase() === "body" ? blockPool : [];

        // Calcular el tiempo global restante
        const globalTimeRemaining = config.executionTimeout - (performance.now() - startTime);

        // Obtener el presupuesto para cada hijo basado en el tiempo global restante
        const numChildren = Math.max(visibleChildren.length, 1);
        const childBudget = globalTimeRemaining / numChildren;

        // Iterar cada hijo
        for (const child of visibleChildren) {
            // Verificar tiempo global
            if (performance.now() - startTime > config.executionTimeout) {
                logger.warn(`Tiempo global agotado antes de procesar hijo (tag=${child.tagName}, id/class=${child.id ?? ''}/${child.className ?? ''})`);
                return false;
            }

            // Usar el presupuesto calculado para este hijo
            const startChildTime = performance.now();
            logger.debug(`Procesando hijo (tag=${child.tagName}, id/class=${child.id ?? ''}/${child.className ?? ''}, presupuesto=${childBudget.toFixed(2)}ms)`);

            // Verificar si es repetitivo
            const childSignature = generateSignature2(child, false, false);
            let existingGroup = repetitionSignatures.get(childSignature);

            if (existingGroup) {
                let match = isRepetitiveMatch(existingGroup.el, child);
                if (match) {
                    existingGroup.count += 1;
                    logger.debug(`Hijo repetido detectado: ${childSignature}, count=${existingGroup.count}`);
                    // Marcar como repetitivo y continuar sin segmentar más
                    drawOverlay(child, level + 1, doc, 0, calculateProminence(child, level + 1, doc, pageArea), blockId++, blocks, pageArea, true, childSignature);
                    continue;
                }
            } else {
                logger.debug(`Agregando nueva firma: ${childSignature}`);
                repetitionSignatures.set(childSignature, {
                    el: child,
                    count: 1
                });
            }

            // Segmentar el hijo
            const continueProcessing = segment(
                child,
                level + 1,
                el.tagName.toLowerCase() === "body" ? blockPool : childPool,
                pageArea,
                minArea,
                childBudget
            );

            // Registrar tiempo usado
            const childTimeUsed = performance.now() - startChildTime;
            logger.debug(`Hijo procesado (tag=${child.tagName}, tiempo usado=${childTimeUsed.toFixed(2)}ms)`);

            if (!continueProcessing) {
                logger.warn(`Hijo agotó su presupuesto (tag=${child.tagName}, id/class=${child.id ?? ''}/${child.className ?? ''}), continuando con los siguientes`);
            }
        }

        // Construir las estructuras de bloques
        if (el.tagName.toLowerCase() === "body") {
            const separators = null; // detectSeparators(blockPool, pageArea, minArea);
            constructContentStructure(blockPool, separators, level, pageArea);
        } else if (childPool.length > 0) {
            el.dataset.divided = 'true';
            const separators = null; // detectSeparators(childPool, pageArea, minArea);
            constructContentStructure(childPool, separators, level + 1, pageArea);
        }
        return true;
    } else {
        // Si no puede dividirse, agregar al pool
        const block = { element: el, tag: el.tagName, level, DoC: doc, isRepetitive: false, repetitionGroup: null };
        blockPool.push(block);
        return true;
    }
}

    // Construir estructura de contenido final, unificando los bloques
    function constructContentStructure(blockPool, separators, level, pageArea) {
        if (blockPool.length === 0) return;
        let currentBlocks = [...blockPool];

        currentBlocks.forEach(block => {
            if (!block.element || !(block.element instanceof Element)) return;
            const maxSeparatorWeight = 0; // Separadores desactivados
            const prominence = calculateProminence(block.element, block.level, block.DoC, pageArea);
            drawOverlay(block.element, block.level, block.DoC, maxSeparatorWeight, prominence, blockId++, blocks, pageArea, block.isRepetitive, block.repetitionGroup);
        });

        currentBlocks.forEach(block => {
            if (!block.element || !(block.element instanceof Element)) return;
            if (block.DoC < config.pdoc) {
                const newPool = [];
                segment(block.element, block.level + 1, newPool, pageArea, minArea, config.executionTimeout - (performance.now() - startTime));
            }
        });
    }

    // Función para calcular el número de columnas basado en la disposición de bloques
    function calculateColumnCount(blocks, pageWidth, minColumnWidth = 100) {
        // Filtrar bloques relevantes (DoC alto o prominencia significativa)
        const relevantBlocks = blocks.filter(block => 
            block.DoC >= config.pdoc 
        );

        if (relevantBlocks.length === 0) {
            logger.warn("No se encontraron bloques relevantes para determinar columnas.");
            return 1; // Asumir una sola columna si no hay bloques relevantes
        }

        // Obtener rangos horizontales de los bloques (left, right)
        const horizontalRanges = relevantBlocks.map(block => ({
            left: block.position.left,
            right: block.position.left + Math.sqrt(block.area), // Aproximar ancho usando la raíz del área
            top: block.position.top,
            height: Math.sqrt(block.area) // Aproximar altura
        }));

        // Ordenar por posición izquierda
        horizontalRanges.sort((a, b) => a.left - b.left);

        // Agrupar bloques en columnas basadas en solapamiento horizontal
        const columns = [];
        let currentColumn = null;

        for (const range of horizontalRanges) {
            // Ignorar bloques demasiado estrechos
            if (range.right - range.left < minColumnWidth) continue;

            if (!currentColumn || range.left > currentColumn.right) {
                // Nueva columna
                currentColumn = {   
                    left: range.left,
                    right: range.right,
                    blocks: [range]
                };
                columns.push(currentColumn);
            } else {
                // Agregar a la columna existente si hay solapamiento
                currentColumn.right = Math.max(currentColumn.right, range.right);
                currentColumn.blocks.push(range);
            }
        }

        // Filtrar columnas no significativas (por ejemplo, con pocos bloques o demasiado estrechas)
        const validColumns = columns.filter(column => 
            column.blocks.length > 1 && // Al menos 2 bloques para considerar una columna
            (column.right - column.left) >= minColumnWidth
        );
        
        // Verificar si las columnas cubren el ancho de la página
        const pageCoverage = validColumns.reduce((sum, col) => sum + (col.right - col.left), 0) / pageWidth;
        if (pageCoverage < 0.5) {
            logger.warn("Las columnas detectadas no cubren suficiente ancho de página, asumiendo 1 columna.");
            return 1; // Si las columnas no son representativas, asumir una sola
        }

        logger.debug(`Columnas detectadas: ${validColumns.length}`);
        validColumns.forEach((col, i) => {
            logger.debug(`Columna ${i + 1}: left=${col.left.toFixed(2)}, right=${col.right.toFixed(2)}, bloques=${col.blocks.length}`);
        });

        console.log(validColumns);

        return validColumns.length;
    }

    // Monitorear cambios en el DOM y actualizar repeticiones
function monitorDOMChanges(pageArea, minArea) {
    const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        const affectedSignatures = new Set();

        // Analizar mutaciones
        mutations.forEach(mutation => {
            // Elementos añadidos
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                if (!isVisible(node, pageArea, minArea)) return;

                const signature = generateSignature2(node, false, false);

                if (signature == '') return;

                if (repetitionSignatures.has(signature)) {
                    affectedSignatures.add(signature);
                    needsUpdate = true;
                    logger.debug(`Elemento añadido detectado: ${signature}`);
                }

                // Verificar descendientes
                node.querySelectorAll('*').forEach(descendant => {
                    if (!(descendant instanceof Element)) return;
                    if (!isVisible(descendant, pageArea, minArea)) return;
                    const descendantSignature = generateSignature2(descendant, false, false);
                    if (repetitionSignatures.has(descendantSignature)) {
                        affectedSignatures.add(descendantSignature);
                        needsUpdate = true;
                        logger.debug(`Descendiente añadido detectado: ${descendantSignature}`);
                    }
                });
            });

            // Elementos eliminados
            mutation.removedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                const signature = generateSignature2(node, false, false);
                if (repetitionSignatures.has(signature)) {
                    affectedSignatures.add(signature);
                    needsUpdate = true;
                    logger.debug(`Elemento eliminado detectado: ${signature}`);
                }
            });

            // Cambios en atributos o contenido
            if (mutation.type === 'attributes' || mutation.type === 'childList') {
                if (!(mutation.target instanceof Element)) return;
                const signature = generateSignature2(mutation.target, false, false);
                if (repetitionSignatures.has(signature)) {
                    affectedSignatures.add(signature);
                    needsUpdate = true;
                    logger.debug(`Cambio detectado en elemento: ${signature}`);
                }
            }
        });

        // Actualizar repeticiones si es necesario
        if (needsUpdate) {
            logger.info(`Actualizando repeticiones para firmas: ${[...affectedSignatures]}`);
            updateRepetitions(affectedSignatures, pageArea, minArea);
        }
    });

    // Configurar observador para monitorear cambios en el DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    return observer;
}

// Actualizar repeticiones para firmas afectadas
function updateRepetitions(affectedSignatures, pageArea, minArea) {
    // Limpiar overlays existentes
    document.querySelectorAll('.vips-overlay').forEach(e => e.remove());
    blocks.length = 0; // Limpiar bloques
    blockId = 0; // Reiniciar ID de bloques

    // Reprocesar cada firma afectada
    affectedSignatures.forEach(signature => {
        const group = repetitionSignatures.get(signature);
        if (!group) return;

        // Encontrar todos los elementos actuales con esta firma
        const selector = `${group.el.tagName}.${getSafeClassName(group.el.className).replace(/\./g, ' ')}`;
        console.log(selector, signature)
        const currentElements = Array.from(document.querySelectorAll(selector)).filter(el => isVisible(el, pageArea, minArea));

        // Reiniciar conteo y lista de elementos
        group.count = 0;
        group.elements = [];

        // Verificar cada elemento
        currentElements.forEach(el => {
            const elSignature = generateSignature2(el, false, false);
            if (elSignature === signature && isRepetitiveMatch(group.el, el)) {
                group.count += 1;
                group.elements.push(el);
            }
        });

        // Eliminar firma si no hay repeticiones
        if (group.count < 2) {
            repetitionSignatures.delete(signature);
            logger.debug(`Firma eliminada (sin repeticiones): ${signature}`);
        } else {
            logger.debug(`Firma actualizada: ${signature}, count=${group.count}`);
        }
    });

    // Redibujar bloques
    const blockPool = [];
    segment(document.body, 1, blockPool, pageArea, minArea, config.executionTimeout, true);
    blocks.sort((a, b) => b.DoC - a.DoC);
    console.log(`Repeticiones actualizadas:`, repetitionSignatures);
}

    // Iniciar el algoritmo
    const pageArea = window.innerWidth * window.innerHeight;
    const percentile = collectVisibleElementAreas(pageArea);
    let minArea = Math.max(0.0005, Math.min(0.005, Math.max(0.001, percentile)));
    const minAreaAbsolute = minArea * pageArea;
    if (minAreaAbsolute < config.minAreaBounds.min) minArea = config.minAreaBounds.min / pageArea;
    if (minAreaAbsolute > config.minAreaBounds.max) minArea = config.minAreaBounds.max / pageArea;

    document.querySelectorAll(".vips-overlay").forEach(e => e.remove());
    styleCache.clear();
    rectCache.clear();

    segment(document.body, 1, blockPool, pageArea, minArea, config.executionTimeout);
    blocks.sort((a, b) => b.DoC - a.DoC);
    console.table(blocks);

    const executionTime = performance.now() - startTime;
    logger.info(`Completado en ${executionTime.toFixed(2)} ms, ${blocks.length} bloques encontrados`);
    console.log(`Completado en ${executionTime.toFixed(2)} ms, ${blocks.length} bloques encontrados`);
    for (const clave of repetitionSignatures.keys()) {
        let rep = repetitionSignatures.get(clave);
        if (rep.count <= 1)
            repetitionSignatures.delete(clave);
    }
    console.log(repetitionSignatures)

    // monitorDOMChanges(pageArea, minArea)
})(
    config = {
        pdoc: 7,
        maxRecursion: 220,
        executionTimeout: 10 * 1000,
        inlineTags: ['B', 'BIG', 'EM', 'FONT', 'I', 'STRONG', 'U'],
        semanticTags: ['H1', 'H2', 'H3', 'NAV', 'ARTICLE', 'SECTION', 'BUTTON', 'INPUT'],
        textWrapper: ['SPAN', 'B', 'I', 'EM', 'STRONG'],
        minAreaBounds: { min: 400, max: 10000 },
        percentile: 0.25,
        rulesByTag: {
            'INLINE': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            'TABLE': [1, 2, 3],
            'TR': [1, 2, 3, 8, 9],
            'TD': [1, 2, 3, 4],
            'P': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            'NAV': [1, 2, 3, 4, 8, 9, 10, 12],
            'ARTICLE': [1, 2, 3, 4, 8, 9, 10, 12],
            'SECTION': [1, 2, 3, 4, 8, 9, 10, 12],
            'BUTTON': [1, 2, 3, 4, 8, 9, 10],
            'INPUT': [1, 2, 3, 4, 8, 9, 10],
            'DEFAULT': [1, 2, 3, 4, 6, 7, 9, 10, 12]
        },
        logLevel: ''
    }
);