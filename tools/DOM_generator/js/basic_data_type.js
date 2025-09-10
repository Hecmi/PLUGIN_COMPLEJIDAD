class ElementParser {

  constructor() {
    
  }

  /**
   * Crea un campo de entrada tipo número entero (input[type="number"] con step 1)
   * @param {Object} options - Opciones de configuración del campo
   * @param {string} [options.label] - Texto del <label>
   * @param {string} [options.id] - ID del input
   * @param {string} [options.name] - Nombre del input
   * @param {string} [options.class] - Clases CSS para el input
   * @param {string} [options.placeholder] - Texto placeholder
   * @param {string} [options.style] - Estilo en línea (inline CSS)
   * @param {boolean} [options.required] - Si el campo es obligatorio
   * @param {Object} [options.attributes] - Atributos adicionales (ej. min, max, readonly, etc.)
   * @returns {HTMLElement} Elemento <div> conteniendo el label y el input
   */
  createInputInt(options = {}) {
    const wrapper = document.createElement("div");
    const label = createLabel(options);
    const input = document.createElement("input");
    
    input.type = "number";
    input.step = "1";
  
    applyAttributes(input, options);
  
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }
  
  /**
   * Crea un campo de entrada tipo número decimal (input[type="number"] con step="any")
   * @param {Object} options - Opciones de configuración del campo
   * @param {string} [options.label] - Texto del <label>
   * @param {string} [options.id] - ID del input
   * @param {string} [options.name] - Nombre del input
   * @param {string} [options.class] - Clases CSS para el input
   * @param {string} [options.placeholder] - Texto placeholder
   * @param {string} [options.style] - Estilo en línea (inline CSS)
   * @param {boolean} [options.required] - Si el campo es obligatorio
   * @param {Object} [options.attributes] - Atributos adicionales (ej. min, max, readonly, etc.)
   * @returns {HTMLElement} Elemento <div> conteniendo el label y el input
   */
  createInputFloat(options = {}) {
    const wrapper = document.createElement("div");
  
    const label = createLabel(options);
  
    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
  
    applyAttributes(input, options);
  
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }
  
  /**
   * Crea un campo de entrada de texto (input[type="text"])
   * @param {Object} options - Opciones de configuración del campo
   * @param {string} [options.label] - Texto del <label>
   * @param {string} [options.id] - ID del input
   * @param {string} [options.name] - Nombre del input
   * @param {string} [options.class] - Clases CSS para el input
   * @param {string} [options.placeholder] - Texto placeholder
   * @param {string} [options.style] - Estilo en línea (inline CSS)
   * @param {boolean} [options.required] - Si el campo es obligatorio
   * @param {Object} [options.attributes] - Atributos adicionales (ej. maxlength, pattern, readonly, etc.)
   * @returns {HTMLElement} Elemento <div> conteniendo el label y el input
   */
  createInputString(options = {}) {
    const wrapper = document.createElement("div");
  
    const label = document.createElement("label");
    label.textContent = options.label || "Ingrese texto:";
  
    const input = document.createElement("input");
    input.type = "text";
  
    applyAttributes(input, options);
  
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }
  
  /**
   * Crea un campo de entrada de fecha y hora (input[type="datetime-local"])
   * @param {Object} options - Opciones de configuración del campo
   * @param {string} [options.label] - Texto del <label>
   * @param {string} [options.id] - ID del input
   * @param {string} [options.name] - Nombre del input
   * @param {string} [options.class] - Clases CSS para el input
   * @param {string} [options.placeholder] - Texto placeholder (no aplica en todos los navegadores)
   * @param {string} [options.style] - Estilo en línea (inline CSS)
   * @param {boolean} [options.required] - Si el campo es obligatorio
   * @param {Object} [options.attributes] - Atributos adicionales (ej. min, max, readonly, etc.)
   * @returns {HTMLElement} Elemento <div> conteniendo el label y el input
   */
  createInputDate(options = {}) {
    const wrapper = document.createElement("div");
  
    const label = document.createElement("label");
    label.textContent = options.label || "Seleccione fecha y hora:";
  
    const input = document.createElement("input");
    input.type = "datetime-local";
  
    applyAttributes(input, options);
  
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }
  
  /**
   * Aplica atributos personalizados a un input basado en las opciones proporcionadas.
   * @param {HTMLElement} input - El input HTML al que se aplicarán atributos
   * @param {Object} options - Opciones del campo
   */
  applyAttributes(input, options = {}) {
    if (options.id) input.id = options.id;
    if (options.class) input.className = options.class;
    if (options.name) input.name = options.name;
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.style) input.style.cssText = options.style;
    if (options.required) input.required = true;
  
    if (options.attributes && typeof options.attributes === "object") {
      for (let attr in options.attributes) {
        input.setAttribute(attr, options.attributes[attr]);
      }
    }
  }
  
  /**
   * Crea el label para el campo de entrada.
   * @param {Object} options - Opciones para el label
   * @returns {HTMLElement} El elemento label
   */
  createLabel(options) {
    const label = document.createElement('label');
    label.textContent = options.label;
    
    if (options.required) {
      label.classList.add('required');
    }
  
    return label;
  }
}