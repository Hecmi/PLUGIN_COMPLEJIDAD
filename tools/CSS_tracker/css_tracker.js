class CSSTracker {
  constructor(styleElement) {
    if (!(styleElement instanceof HTMLStyleElement)) {
      throw new Error('Se debe proporcionar un elemento HTMLStyleElement válido');
    }

    this.styleElement = styleElement;
    this.standardStyles = new Map();    // Para selectores normales (.clase, #id)
    this.specialStyles = new Map();     // Para @rules (@font-face, @media)
    this.counter = new Map();           // Contador para @rules duplicados
    
    if (!this.styleElement.sheet) {
      this.styleElement.textContent = ' ';
    }
  }

  /**
   * Añade o actualiza reglas CSS
   * @param {string} selector - Selector CSS o @rule
   * @param {Object|string} rules - Objeto con propiedades o string completo para @rules
   */
  set(selector, rules) {
    if (!selector) return false;
    // Manejo de @rules especiales
    if (selector.startsWith('@')) {
      return this.handleSpecialRule(selector, rules);
    }

    // Selectores normales
    if (typeof rules !== 'object') {
      console.error('Para selectores normales se requiere un objeto de reglas');
      return false;
    }

    const normalizedRules = this.normalizeRules(rules);
    this.standardStyles.set(selector, normalizedRules);
    this.updateStylesheet();
    return true;
  }

  /**
   * Maneja reglas especiales como @font-face
   */
  handleSpecialRule(selector, content) {
    const key = this.generateSpecialKey(selector);
    
    if (typeof content === 'string') {
      // Para @rules complejas que vienen como string completo
      this.specialStyles.set(key, { selector, content });
    } else {
      // Para @rules con estructura de objeto
      const normalized = this.normalizeRules(content);
      const ruleContent = Object.entries(normalized)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
      this.specialStyles.set(key, { 
        selector, 
        content: `${selector} {\n${ruleContent}\n}` 
      });
    }

    this.updateStylesheet();
    return true;
  }

  /**
   * Genera una clave única para @rules duplicadas
   */
  generateSpecialKey(baseSelector) {
    const count = this.counter.get(baseSelector) || 0;
    this.counter.set(baseSelector, count + 1);
    return `${baseSelector}_${count}`;
  }

  /**
   * Normaliza las reglas (camelCase a kebab-case)
   */
  normalizeRules(rules) {
    const result = {};
    for (const [prop, value] of Object.entries(rules)) {
      const normalizedProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      result[normalizedProp] = value;
    }
    return result;
  }

  /**
   * Elimina un selector (normal o especial)
   */
  remove(identifier) {
    let removed = false;

    // Intentar eliminar de estándar
    if (this.standardStyles.delete(identifier)) {
      removed = true;
    }

    // Buscar en especiales (puede ser la key generada o el @rule base)
    for (const [key, rule] of this.specialStyles) {
      if (key === identifier || rule.selector === identifier) {
        this.specialStyles.delete(key);
        removed = true;
        break;
      }
    }

    if (removed) this.updateStylesheet();
    return removed;
  }

  /**
   * Elimina propiedades específicas de un selector
   * @param {string} selector
   * @param {string|Array<string>} properties - Propiedad(es) a eliminar
   * @returns {boolean} True si se realizaron cambios
   */
  removeProperties(selector, properties) {
    if (!this.standardStyles.has(selector)) return false;

    const propsToRemove = Array.isArray(properties) ? properties : [properties];
    const currentRules = this.standardStyles.get(selector);
    let changed = false;

    propsToRemove.forEach(prop => {
      if (prop in currentRules) {
        delete currentRules[prop];
        changed = true;
      }
    });

    if (Object.keys(currentRules).length === 0) {
      this.standardStyles.delete(selector);
    }

    if (changed) {
      this.updateStylesheet();
    }

    return changed;
  }

  /**
   * Actualiza la hoja de estilos
   */
  updateStylesheet() {
    let cssText = '';

    // Añadir @rules primero
    this.specialStyles.forEach(rule => {
      cssText += `${rule.content}\n\n`;
    });

    // Añadir reglas estándar
    this.standardStyles.forEach((rules, selector) => {
      const ruleEntries = Object.entries(rules)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      cssText += `${selector} {\n${ruleEntries}\n}\n\n`;
    });

    this.styleElement.textContent = cssText;
  }
}