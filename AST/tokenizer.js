const linkPageStylePanel = document.createElement('style');
linkPageStylePanel.id = "page-panel-styles-ext";
document.head.appendChild(linkPageStylePanel);

const tracker_panel = new CSSTracker(linkPageStylePanel);
Constants.addStyleTracker(Constants.APP.panelTracker, tracker_panel);

const linkPageStyle = document.createElement('style');
linkPageStyle.id = "page-dynamic-styles-ext";
document.head.appendChild(linkPageStyle);

const tracker = new CSSTracker(linkPageStyle);

const LANGUAGE_CONFIG = {
    keywords: {
        LET: 'let',
        IF: 'if',
        ELSE: 'else',
        WHILE: 'while',
        FOR: 'for',
        TRUE: 'true',
        FALSE: 'false',
        NULL: 'null',
        UNDEFINED: 'undefined',
        FUNCTION: 'function',
        RETURN: 'return',
        NEW: 'new',
        OF: 'of',
        CONTINUE: 'continue',
        BREAK: 'break',
        AWAIT: 'await',
        ASYNC: 'async'
    },
    operators: {
        NOT: 'NOT',
        AND: '&&',
        OR: '||',
        EQ: '==',
        NEQ: '!=',
        NEQ_ALT: '<>',
        GTE: '>=',
        LTE: '<=',
        ASSIGN: '=',
        ARROW: '=>',
        COALESCE: '??',
        TERNARY_QUESTION: '?',
        PLUS_EQ: '+=',
        MINUS_EQ: '-=',
        MULT_EQ: '*=',
        DIV_EQ: '/=',
        INC: '++',
        DEC: '--',
    }
};

const OPERATOR_CONFIG = {
    '!': { precedence: 7, associativity: 'right', type: 'logical', unary: true },
    '+': { precedence: 7, associativity: 'right', type: 'math', unary: true },
    '-': { precedence: 7, associativity: 'right', type: 'math', unary: true },
    '^': { precedence: 6, associativity: 'right', type: 'math' },
    '*': { precedence: 5, associativity: 'left', type: 'math' },
    '/': { precedence: 5, associativity: 'left', type: 'math' },
    '%': { precedence: 5, associativity: 'left', type: 'math' },
    '+': { precedence: 4, associativity: 'left', type: 'math' },
    '-': { precedence: 4, associativity: 'left', type: 'math' },
    '>': { precedence: 3, associativity: 'left', type: 'comparison' },
    '<': { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.NOT]: { precedence: 7, associativity: 'right', type: 'logical', unary: true },
    [LANGUAGE_CONFIG.operators.GTE]: { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.LTE]: { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.EQ]: { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.NEQ]: { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.NEQ_ALT]: { precedence: 3, associativity: 'left', type: 'comparison' },
    [LANGUAGE_CONFIG.operators.TERNARY_QUESTION]: { precedence: 3, associativity: 'right', type: 'ternary' },
    [LANGUAGE_CONFIG.operators.TERNARY_OPERATOR]: { precedence: 3, associativity: 'right', type: 'ternary' },
    [LANGUAGE_CONFIG.operators.AND]: { precedence: 2, associativity: 'left', type: 'logical' },
    [LANGUAGE_CONFIG.operators.OR]: { precedence: 1, associativity: 'left', type: 'logical' },
    [LANGUAGE_CONFIG.operators.COALESCE]: { precedence: 3, associativity: 'right', type: 'logical' },
    [LANGUAGE_CONFIG.operators.ASSIGN]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.PLUS_EQ]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.MINUS_EQ]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.MULT_EQ]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.DIV_EQ]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.ARROW]: { precedence: 0, associativity: 'right', type: 'assignment' },
    [LANGUAGE_CONFIG.operators.INC]: { precedence: 7, associativity: 'left', type: 'update', unary: true },
    [LANGUAGE_CONFIG.operators.DEC]: { precedence: 7, associativity: 'left', type: 'update', unary: true },
};

const KEYWORDS = new Set(Object.values(LANGUAGE_CONFIG.keywords));

const DOM_FUNCTIONS = {
  $: (selector) => {
    const element = document.querySelectorAll(selector);
    if (!element) return null;
    return element;
  },

  createElement: (tagName) => {
    return document.createElement(tagName);
  },

  setAttr: (element, name, value) => {
    if (name in element) {
      element[name] = value;
    } else {
      element.setAttribute(name, value);
    }
    return element;
  },

  setAttrs: (element, attributes) => {
    Object.entries(attributes).forEach(([name, value]) => {
      DOM_FUNCTIONS.setAttr(element, name, value);
    });
    return element;
  },

  setId: (element, id) => {
    return DOM_FUNCTIONS.setAttr(element, 'id', id);
  },

  setStyle: (element, property, value, isMandatory = true) => {
    let important = isMandatory ? 'important' : '';
    element.style.setProperty(property, value, important);
  },

  setStyles: (element, styles) => {
    Object.assign(element.style, styles);
  },

  addClass: (element, className) => {
    element.classList.add(className);
    return element;
  },

  setClasses: (element, classNames) => {
    element.className = classNames.join(' ');
    return element;
  },

  setText: (element, text) => {
    element.textContent = text;
    return element;
  },

  setHtml: (element, html) => {
    element.innerHTML = html;
    return element;
  },

  addChild: (parent, child) => {
    if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    }
    return parent;
  },

  addChildren: (parent, children) => {
    children.forEach(child => DOM_FUNCTIONS.addChild(parent, child));
    return parent;
  },

  makeInput: (element, type = 'text') => {
    element.tagName = 'input';
    DOM_FUNCTIONS.setAttr(element, 'type', type);
    return element;
  },

  makeLabel: (element, forId, text) => {
    element.tagName = 'label';
    DOM_FUNCTIONS.setAttr(element, 'for', forId);
    DOM_FUNCTIONS.setText(element, text || '');
    return element;
  },

  makeSelect: (element, options = []) => {
    element.tagName = 'select';
    options.forEach(opt => {
      const option = document.createElement('option');
      DOM_FUNCTIONS.setAttr(option, 'value', opt.value || opt);
      DOM_FUNCTIONS.setText(option, opt.text || opt);
      DOM_FUNCTIONS.addChild(element, option);
    });
    return element;
  },

  makeTable: (element, headers = [], rows = []) => {
    element.tagName = 'table';
    
    if (headers.length) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      
      headers.forEach(header => {
        const th = document.createElement('th');
        DOM_FUNCTIONS.setText(th, header);
        DOM_FUNCTIONS.addChild(tr, th);
      });
      
      DOM_FUNCTIONS.addChild(thead, tr);
      DOM_FUNCTIONS.addChild(element, thead);
    }
    
    if (rows.length) {
      const tbody = document.createElement('tbody');
      
      rows.forEach(row => {
        const tr = document.createElement('tr');
        
        row.forEach(cell => {
          const td = document.createElement('td');
          DOM_FUNCTIONS.setText(td, cell);
          DOM_FUNCTIONS.addChild(tr, td);
        });
        
        DOM_FUNCTIONS.addChild(tbody, tr);
      });
      
      DOM_FUNCTIONS.addChild(element, tbody);
    }
    
    return element;
  },

  on: (element, event, handler) => {
    if (typeof handler === 'string') {
      const engine = new ExpressionEngine();
      try {
        const parsedHandler = function(e) {
          const eventContext = {
            event: e,
            target: e.target
          };
          return engine.evaluate(handler, eventContext);
        };
        element.addEventListener(event, parsedHandler);
        return element;
      } catch (error) {
        console.error(`Error parsing handler for event ${event}:`, error);
        return element;
      }
    } else if (typeof handler === 'function') {
      element.addEventListener(event, handler);
      return element;
    } else {
      console.error(`Handler for event ${event} must be a function or string`);
      return element;
    }
  },

  appendTo: (element, parent) => {
    const target = typeof parent === 'string' 
      ? document.querySelector(parent) 
      : parent;
    
    if (target) {
      target.appendChild(element);
    }
    
    return element;
  }
};

const CSS_FUNCTIONS = {
    set: (selector, rules) => { tracker.set(selector, rules); },
    remove: (identifier) => tracker.remove(identifier),
    removeProperties: (selector, properties) => tracker.removeProperties(selector, properties),
    updateStyles: () => tracker.updateStylesheet(),
    getStandardStyles: () => tracker.standardStyles,
    getSpecialStyles: () => tracker.specialStyles,
}


const BUILTIN_FUNCTIONS = {
    tracker: tracker,
    sqrt: Math.sqrt,
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    min: Math.min,
    max: Math.max,
    log: Math.log,
    exp: Math.exp,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    pow: Math.pow,
    random: Math.random,
    double: x => x * 2,
    triple: x => x * 3,
    sum: (...args) => args.reduce((a, b) => a + b, 0),
    avg: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
    len: arr => arr.length,
    print: (...args) => {
        console.log(...args);
        return args.length === 1 ? args[0] : args;
    },
    log: (...args) => {
        console.log('[LOG]', ...args);
        return args.length === 1 ? args[0] : args;
    },

    $: DOM_FUNCTIONS.$,
    createEl: DOM_FUNCTIONS.createElement,
    setAttr: DOM_FUNCTIONS.setAttr,
    attrs: DOM_FUNCTIONS.setAttrs,
    text: DOM_FUNCTIONS.setText,
    html: DOM_FUNCTIONS.setHtml,
    onEvent: DOM_FUNCTIONS.on,
    appendTo: DOM_FUNCTIONS.appendTo,

    setStyle: CSS_FUNCTIONS.set,
    removeStyle: CSS_FUNCTIONS.remove,
    removeStyleProperty: CSS_FUNCTIONS.removeProperties,
    updateStyles: CSS_FUNCTIONS.updateStyles,
    getStandardStyles: CSS_FUNCTIONS.getStandardStyles,
    getSpecialStyles: CSS_FUNCTIONS.getSpecialStyles,


    getBlobSize: (element) => {
        return new Blob([element]).size;
    },
    normalizeMatrix: (matrix) => {
        let max = Math.max(...matrix.flat(), 1);
        return matrix.map(row => row.map(value => value / max));
    },
    capturePageImage: () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                const screenshot = response?.screenshot; 
                if (screenshot) resolve(screenshot);
                else reject(response?.error || "Bad response")
            });
        });
    },
    createImg: (src, callback) => {
        const img = new Image();
        img.onload = () => {
            if (callback && typeof callback == 'function') callback(img);
        }
        img.src = src;        
    },

    sum: (array) => {
        return array.reduce((sum, value) => sum + value, 0);
    },
    mean: (array, length) => {
        return array.reduce((sum, value) => sum + value, 0) / length;
    },
    variance: (array, mean, length) => {
        return array.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / length;
    },

    rgbToArray: (rgbString) => {
        const result = rgbString.match(/\d+/g);
        return result ? result.map(Number) : [0, 0, 0];
    },
    precalculateCanvasColors: (canvas, cellSize = 50) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const colors = [];
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 0; y < height; y += cellSize) {
            const row = [];
            for (let x = 0; x < width; x += cellSize) {
                const w = Math.min(cellSize, width - x);
                const h = Math.min(cellSize, height - y);
                const imgData = ctx.getImageData(x, y, w, h).data;

                let r = 0, g = 0, b = 0;
                let count = 0;
                for (let i = 0; i < imgData.length; i += 4) {
                    r += imgData[i];
                    g += imgData[i + 1];
                    b += imgData[i + 2];
                    count++;
                }
                row.push([r / count, g / count, b / count]);
            }
            colors.push(row);
        }
        return { colors, cellSize };
    },
    getPrecalculatedColor: (precalcColors, rect) => {
        const { colors, cellSize } = precalcColors;
        const xIndex = Math.floor(rect.left / cellSize);
        const yIndex = Math.floor(rect.top / cellSize);

        return colors[yIndex] && colors[yIndex][xIndex] ? colors[yIndex][xIndex] : [255, 255, 255];
    }
};

class Tokenizer {
    constructor() {
        this.symbolOperators = new Set(
            Object.keys(OPERATOR_CONFIG).filter(op => op.length === 1 && !/[a-zA-Z]/.test(op))
        );
        this.keywords = KEYWORDS;
        this.tokenTypes = {
            NUMBER: 'number',
            STRING: 'string',
            IDENTIFIER: 'identifier',
            OPERATOR: 'operator',
            PAREN: 'paren',
            COMMA: 'comma',
            DOT: 'dot',
            COLON: 'colon',
            KEYWORD: 'keyword',
            LITERAL: 'literal',
            SEPARATOR: 'separator'
        };
    }

    isDigit(char) {
        return /[0-9]/.test(char);
    }

    isAlpha(char) {
        return /[a-zA-Z_]/.test(char);
    }

    isSpecialChar(char) {
        return /[@$]/.test(char);
    }

    isWhitespace(char) {
        return /\s/.test(char);
    }

    tokenize(input) {
        const tokens = [];
        let cursor = 0;
        
        while (cursor < input.length) {
            const char = input[cursor];
            
            if (this.isWhitespace(char)) {
                cursor++;
                continue;
            }

            if (char === '/' && this.isRegexContext(tokens)) {
                const { token, newCursor } = this.parseRegex(input, cursor);
                tokens.push(token);
                cursor = newCursor;
                continue;
            }
            
            if (this.isDigit(char) || (char === '-' && this.isDigit(input[cursor + 1]) && this.isUnaryContext(tokens))) {
                const { token, newCursor } = this.parseNumber(input, cursor);
                tokens.push(token);
                cursor = newCursor;
                continue;
            }
            
            if (char === '"' || char === "'") {
                const { token, newCursor } = this.parseString(input, cursor);
                tokens.push(token);
                cursor = newCursor;
                continue;
            }
            
            if (char === '(' || char === ')' || char === '{' || char === '}' || char === '[' || char === ']') {
                tokens.push({ type: this.tokenTypes.PAREN, value: char });
                cursor++;
                continue;
            }
            
            if (char === ',') {
                tokens.push({ type: this.tokenTypes.COMMA, value: char });
                cursor++;
                continue;
            }
            
            if (char === '.') {
                tokens.push({ type: this.tokenTypes.DOT, value: char });
                cursor++;
                continue;
            }
            
            if (char === ';') {
                tokens.push({ type: this.tokenTypes.SEPARATOR, value: char });
                cursor++;
                continue;
            }
            
            if (char === ':') {
                tokens.push({ type: this.tokenTypes.COLON, value: char });
                cursor++;
                continue;
            }
            
            const operator = this.parseOperator(input, cursor);
            if (operator) {
                tokens.push({ type: this.tokenTypes.OPERATOR, value: operator });
                cursor += operator.length;
                continue;
            }
            
            if (this.isAlpha(char) || this.isSpecialChar(char)) {
                const { token, newCursor } = this.parseIdentifier(input, cursor);
                tokens.push(token);
                cursor = newCursor;
                continue;
            }
            
            throw new Error(`Unexpected character: '${char}' at position ${cursor}`);
        }
        
        return tokens;
    }

    isRegexContext(tokens) {
        if (tokens.length === 0) return false;
        const lastToken = tokens[tokens.length - 1];
        return (
            lastToken.type === this.tokenTypes.OPERATOR ||
            lastToken.value === '(' ||
            lastToken.type === this.tokenTypes.COMMA ||
            lastToken.type === this.tokenTypes.KEYWORD && 
                (lastToken.value === LANGUAGE_CONFIG.keywords.LET ||
                 lastToken.value === LANGUAGE_CONFIG.keywords.RETURN)
        );
    }

    isUnaryContext(tokens) {
        if (tokens.length === 0) return true;
        const lastToken = tokens[tokens.length - 1];
        return (
            lastToken.type === this.tokenTypes.OPERATOR ||
            lastToken.value === '(' ||
            lastToken.type === this.tokenTypes.COMMA
        );
    }

    parseRegex(input, start) {
        // Saltar la "/"
        let cursor = start + 1;
        let pattern = '';
        let flags = '';
        let escaped = false;
        
        // Parsear el patrón
        while (cursor < input.length) {
            const char = input[cursor];
            
            if (escaped) {
                pattern += '\\' + char;
                escaped = false;
                cursor++;
                continue;
            }
            
            if (char === '\\') {
                escaped = true;
                cursor++;
                continue;
            }
            
            if (char === '/') {
                cursor++;
                break;
            }
            
            pattern += char;
            cursor++;
        }
        
        while (cursor < input.length) {
            const char = input[cursor];
            if (/[gimyus]/.test(char)) {
                flags += char;
                cursor++;
            } else {
                break;
            }
        }
        
        return {
            token: {
                type: 'regex',
                pattern,
                flags,
                value: new RegExp(pattern, flags)
            },
            newCursor: cursor
        };
    }

    parseNumber(input, start) {
        let cursor = start;
        let value = '';
        let isDecimal = false;
        
        if (input[cursor] === '-') {
            value += '-';
            cursor++;
        }
        
        while (cursor < input.length) {
            const char = input[cursor];
            
            if (this.isDigit(char)) {
                value += char;
                cursor++;
            } else if (char === '.' && !isDecimal) {
                value += '.';
                isDecimal = true;
                cursor++;
            } else {
                break;
            }
        }
    
        return {
            token: { 
                type: this.tokenTypes.NUMBER, 
                value: parseFloat(value),
                raw: value
            },
            newCursor: cursor
        };
    }

    parseString(input, start) {
        const quoteChar = input[start];
        let cursor = start + 1;
        let value = '';
        let escaped = false;
        
        while (cursor < input.length) {
            const char = input[cursor];
            
            if (escaped) {
                value += char;
                escaped = false;
                cursor++;
                continue;
            }
            
            if (char === '\\') {
                escaped = true;
                cursor++;
                continue;
            }
            
            if (char === quoteChar) {
                cursor++;
                return {
                    token: { type: this.tokenTypes.STRING, value },
                    newCursor: cursor
                };
            }
            value += char;
            cursor++;
        }
    
        throw new Error(`Unclosed string starting at position ${start}`);
    }

    parseOperator(input, start) {
        const operators = Object.keys(OPERATOR_CONFIG).sort((a, b) => b.length - a.length);
        for (const op of operators) {
            if (input.substring(start, start + op.length) === op) {
                return op;
            }
        }
        return null;
    }

    parseIdentifier(input, start) {
        let cursor = start;
        let value = '';
        
        while (cursor < input.length) {
            const char = input[cursor];
            
            if (this.isAlpha(char) || this.isDigit(char) || this.isSpecialChar(char)) {
                value += char;
                cursor++;
            } else {
                break;
            }
        }

        if (value === LANGUAGE_CONFIG.keywords.NEW) {
            return {
                token: { 
                    type: this.tokenTypes.KEYWORD, 
                    value: LANGUAGE_CONFIG.keywords.NEW
                },
                newCursor: cursor
            };
        }
        
        if (value === LANGUAGE_CONFIG.keywords.TRUE || value === LANGUAGE_CONFIG.keywords.FALSE) {
            return {
                token: { 
                    type: this.tokenTypes.LITERAL, 
                    value: value === LANGUAGE_CONFIG.keywords.TRUE 
                },
                newCursor: cursor
            };
        }
        
        if (value === LANGUAGE_CONFIG.keywords.NULL) {
            return {
                token: { 
                    type: this.tokenTypes.LITERAL, 
                    value: null 
                },
                newCursor: cursor
            };
        }
        
        if (value === LANGUAGE_CONFIG.keywords.UNDEFINED) {
            return {
                token: { 
                    type: this.tokenTypes.LITERAL, 
                    value: undefined 
                },
                newCursor: cursor
            };
        }
        
        // console.log("tokenizando ", value)
        if (this.keywords.has(value)) {
            return {
                token: { 
                    type: this.tokenTypes.KEYWORD, 
                    value 
                },
                newCursor: cursor
            };
        }
        
        const upperValue = value.toUpperCase();
        if (OPERATOR_CONFIG[upperValue]) {
            return {
                token: { 
                    type: this.tokenTypes.OPERATOR, 
                    value: upperValue 
                },
                newCursor: cursor
            };
        }
        
        return {
            token: { 
                type: this.tokenTypes.IDENTIFIER, 
                value 
            },
            newCursor: cursor
        };
    }
}