class Form {
    constructor(formElement, config = {}) {
        this.form = formElement;
        this.validator = new Validators(config);
    }

    validate() {
        return this.validator.validateForm(this.form);
    }

    validateCode(code) {
        return this.validator.validateForm(this.form);
    }

    /**
     * Obtiene todos los elementos del formulario con sus nodos,
     * filtrando radios/checkboxes no seleccionados
     * @return {Array<HTMLElement>} - Array de nodos DOM
     */
    getSelectedNodes() {
        const nodes = [];
        const processedRadios = new Set();

        Array.from(this.form.elements).forEach(element => {
            if (!element.name || element.disabled) return;

            if (element.type === 'radio') {
                if (processedRadios.has(element.name)) return;
                
                processedRadios.add(element.name);
                const selectedRadio = this.form.querySelector(
                    `input[type="radio"][name="${element.name}"]:checked`
                );
                
                if (selectedRadio) {
                    nodes.push(selectedRadio);
                }
                return;
            }

            if (element.type === 'checkbox') {
                if (element.checked) {
                    nodes.push(element);
                }
                return;
            }

            // Otros campos (text, select, inputs, etc)
            nodes.push(element);
        });

        return nodes;
    }

    getValidData() {
        const formData = {};
        const elements = this.form.elements;
        const processedRadios = new Set();

        Array.from(elements).forEach(element => {
            if (!element.name || element.disabled) return;

            // Manejo de radio buttons (solo tomar el seleccionado)
            if (element.type === 'radio') {
                if (processedRadios.has(element.name)) return;
                
                processedRadios.add(element.name);
                const selectedRadio = this.form.querySelector(
                    `input[type="radio"][name="${element.name}"]:checked`
                );
                if (selectedRadio && this.validator.validateInput(selectedRadio)) {
                    formData[element.name] = selectedRadio.value;
                }
                return;
            }

            // Control de checkboxes (booleano o array para múltiples)
            if (element.type === 'checkbox') {
                // Si es checkbox único
                if (!element.name.endsWith('[]')) {
                    formData[element.name] = element.checked;
                } 
                // Si es grupo de checkboxes ("opciones[]")
                else {
                    if (!formData[element.name]) {
                        formData[element.name] = [];
                    }
                    if (element.checked && this.validator.validateInput(element)) {
                        formData[element.name].push(element.value);
                    }
                }
                return;
            }

            formData[element.name] = element.value;
        });

        return formData;
    }

  getInvalidFields() {
    return Array.from(this.form.elements).filter(
      element => element.name && !this.validator.validateInput(element)
    );
  }

  reset() {
    this.form.reset();
    this.validator.clearAllErrors(this.form);
  }

  /**
     * Filtra elementos del formulario con múltiples criterios
     * @param {Object} options - Opciones de filtrado
     * @param {string} [options.type] - Tipo de input (text, checkbox, etc.)
     * @param {string|RegExp} [options.name] - Nombre del campo o patrón Regex
     * @param {boolean} [options.valid] - true: solo válidos, false: solo inválidos
     * @param {boolean} [options.checked] - Estado checked (radios/checkboxes)
     * @param {string} [options.selector] - Selector CSS adicional
     * @param {string} [options.attribute] - Nombre de atributo personalizado
     * @param {string} [options.attrValue] - Valor específico del atributo
     * @param {Function} [options.test] - Función de filtrado personalizada
     * @param {boolean} [options.includeDisabled] - Incluir elementos deshabilitados
     * @return {HTMLElement[]} - Array de elementos que cumplen los criterios
     */
    filter(options = {}) {
        let elements = Array.from(this.form.elements);

        elements = elements.filter(el => {
            if (!options.includeDisabled && el.disabled) return false;
            return el.name || el.tagName === 'FIELDSET';
        });

        if (options.type) {
            elements = elements.filter(el => el.type === options.type);
        }

        if (options.name) {
            elements = typeof options.name === 'string'
                ? elements.filter(el => el.name === options.name)
                : elements.filter(el => options.name.test(el.name));
        }

        if (options.selector) {
            elements = elements.filter(el => el.matches(options.selector));
        }

        if (options.attribute) {
            const attrVal = options.attrValue;
            elements = elements.filter(el => 
                attrVal !== undefined
                    ? el.getAttribute(options.attribute) === attrVal
                    : el.hasAttribute(options.attribute)
            );
        }

        if (options.valid !== undefined) {
            elements = elements.filter(el => 
                this.validator.validateInput(el) === options.valid
            );
        }

        if (options.checked !== undefined) {
            elements = elements.filter(el => el.checked === options.checked);
        }

        if (options.test) {
            elements = elements.filter(options.test);
        }

        // Paso 4: Manejo especial para grupos
        if (options.groupBehavior) {
            elements = this._handleGroupBehavior(elements, options.groupBehavior);
        }

        return elements;
    }

    /**
     * Manejo avanzado de grupos de elementos
     * @private
     */
    _handleGroupBehavior(elements, behavior) {
        const groups = new Map();

        elements.forEach(el => {
            const groupKey = behavior === 'radio' ? el.name : el.id;
            
            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    elements: [],
                    selected: null
                });
            }

            const group = groups.get(groupKey);
            group.elements.push(el);
            
            if (el.checked) {
                group.selected = el;
            }
        });

        return Array.from(groups.values()).map(group => {
            switch (behavior) {
                case 'radio':
                    return group.selected || group.elements[0];
                case 'checkbox-group':
                    return group.elements;
                default:
                    return group.elements[0];
            }
        }).flat();
    }
}