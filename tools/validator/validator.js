class Validators {
  // Configuración centralizada con valores por defecto
  #config = {
    ERROR_CLASS: 'invalid',
    ERROR_MESSAGE_CLASS: 'error-message',
    DEFAULT_MAX_LENGTH: 100,
    REGEX: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{2,4}[-\s.]?[0-9]{2,4}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\S]{8,}$/,
    },
    DEFAULT_MESSAGES: {
      // required: 'Este campo es obligatorio',
      // email: 'Ingresa un correo electrónico válido',
      // phone: 'Ingresa un número de teléfono válido',
      // password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
      // number: 'Ingresa un número válido',
      // minLength: (minLength) => `El texto debe tener al menos ${minLength} caracteres`,
      // maxLength: (maxLength) => `El texto no debe exceder ${maxLength} caracteres`,
      // min: (min) => `El número debe ser mayor o igual a ${min}`,
      // max: (max) => `El número debe ser menor o igual a ${max}`,
      // pattern: 'El formato no es válido',
      // radioRequired: 'Selecciona una opción',
      // checkboxRequired: 'Debes aceptar este campo',
      // duplicateEmail: 'El email ingresado ya ha sido registrado'
    },
    INPUT_TYPES: {
      TEXT: 'text',
      EMAIL: 'email',
      NUMBER: 'number',
      PASSWORD: 'password',
      TEL: 'tel',
      RADIO: 'radio',
      CHECKBOX: 'checkbox',
      TEXTAREA: 'textarea',
      SELECT: 'select-one',
    },
  };

  // Registro de validadores disponibles
  #validators = {
    required: this.#validateRequired.bind(this),
    email: this.#validateEmail.bind(this),
    phone: this.#validatePhone.bind(this),
    password: this.#validatePassword.bind(this),
    number: this.#validateNumber.bind(this),
    minLength: this.#validateMinLength.bind(this),
    maxLength: this.#validateMaxLength.bind(this),
    min: this.#validateMin.bind(this),
    max: this.#validateMax.bind(this),
    pattern: this.#validatePattern.bind(this),
    radioRequired: this.#validateRadioRequired.bind(this),
    checkboxRequired: this.#validateCheckboxRequired.bind(this),
    groupSelection: this.#validateGroupSelection.bind(this),
    duplicatedEmail: function() {

    }
  };

  constructor(config = {}) {
    // Combinar configuración personalizada con la predeterminada
    this.#config = { ...this.#config, ...config };
    
    // Agregar los estilos traducidos
    this.lang = this.#config.DEFAULT_LANG || 'es';

    // Agregar estilos CSS
    this.#addErrorStyles();
    this.#setupMessages();


    this.queryElements = 'input, textarea, select';
  }

  #setupMessages() {
    const lang = this.lang;
    this.#config.DEFAULT_MESSAGES = {
      required: () => Translator.translate(lang, "v.required"),
      email: () => Translator.translate(lang, "v.email"),
      phone: () => Translator.translate(lang, "v.phone"),
      password: () => Translator.translate(lang, "v.password"),
      number: () => Translator.translate(lang, "v.number"),
      minLength: (minLength) => Translator.translate(lang, "v.minLength", minLength),
      maxLength: (maxLength) => Translator.translate(lang, "v.maxLength", maxLength),
      min: (min) => Translator.translate(lang, "v.min", min),
      max: (max) => Translator.translate(lang, "v.max", max),
      pattern: () => Translator.translate(lang, "v.pattern"),
      radioRequired: () => Translator.translate(lang, "v.radioRequired"),
      checkboxRequired: () => Translator.translate(lang, "v.checkboxRequired"),
      duplicateEmail: () => Translator.translate(lang, "v.duplicateEmail"),
    };
  }

  #addErrorStyles() {
    if (document.getElementById('validator-styles')) return;

    const style = document.createElement('style');
    style.id = 'validator-styles';
    style.innerHTML = `
      .${this.#config.ERROR_CLASS} {
        border: 2px solid red !important;
        background-color: #fff5f5;
      }
      .${this.#config.ERROR_MESSAGE_CLASS} {
        color: red;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      }
      .radio-group-error {
        color: red;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  triggerValidation(element, rule){
    if (rule === "DUPLICATE_EMAIL") {      
      if (!element) return;
      this.#validateDuplicateEmail(element);
    }
  }

  #validateDuplicateEmail(input) {
    this.showError(
      input,
      this.#config.DEFAULT_MESSAGES.duplicateEmail()
    )
  }

  #validateRequired(value, rules, input) {
    if (!rules.required) return true;
    
    const type = input.type || input.tagName.toLowerCase();
    let isValid = true;

    if (type === this.#config.INPUT_TYPES.CHECKBOX) {
      isValid = input.checked;
    } else if (type === this.#config.INPUT_TYPES.RADIO) {
      return true;
    } else {
      isValid = value.trim() !== '';
    }

    if (!isValid) {
      this.showError(input, rules.customMessages?.required || this.#config.DEFAULT_MESSAGES.required());
    }

    return isValid;
  }

  #validateEmail(value, rules, input) {
    if (!rules.email || !value) return true;
    
    const isValid = this.#config.REGEX.email.test(value);
    if (!isValid) {
      this.showError(input, rules.customMessages?.email || this.#config.DEFAULT_MESSAGES.email());
    }
    return isValid;
  }

  #validatePhone(value, rules, input) {
    if (!rules.phone || !value) return true;
    
    const isValid = this.#config.REGEX.phone.test(value);
    if (!isValid) {
      this.showError(input, rules.customMessages?.phone || this.#config.DEFAULT_MESSAGES.phone());
    }
    return isValid;
  }

  #validatePassword(value, rules, input) {
    if (!rules.password || !value) return true;
    
    const isValid = this.#config.REGEX.password.test(value);
    if (!isValid) {
      this.showError(input, rules.customMessages?.password || this.#config.DEFAULT_MESSAGES.password());
    }
    return isValid;
  }

  #validateNumber(value, rules, input) {
    if (!rules.number) return true;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      this.showError(input, rules.customMessages?.number || this.#config.DEFAULT_MESSAGES.number());
      return false;
    }
    return true;
  }

  #validateMinLength(value, rules, input) {
    if (!rules.minLength || !value) return true;
    
    const isValid = value.length >= rules.minLength;
    if (!isValid) {
      this.showError(
        input, 
        rules.customMessages?.minLength?.(rules.minLength) || 
        this.#config.DEFAULT_MESSAGES.minLength(rules.minLength)
      );
    }
    return isValid;
  }

  #validateMaxLength(value, rules, input) {
    if (!rules.maxLength || !value) return true;
    
    const isValid = value.length <= rules.maxLength;
    if (!isValid) {
      this.showError(
        input, 
        rules.customMessages?.maxLength?.(rules.maxLength) || 
        this.#config.DEFAULT_MESSAGES.maxLength(rules.maxLength)
      );
    }
    return isValid;
  }

  #validateMin(value, rules, input) {
    if (rules.min === undefined || !value) return true;
    
    const numValue = parseFloat(value);
    const isValid = numValue >= rules.min;
    if (!isValid) {
      this.showError(
        input, 
        rules.customMessages?.min?.(rules.min) || 
        this.#config.DEFAULT_MESSAGES.min(rules.min())
      );
    }
    return isValid;
  }

  #validateMax(value, rules, input) {
    if (rules.max === undefined || !value) return true;
    
    const numValue = parseFloat(value);
    const isValid = numValue <= rules.max;
    if (!isValid) {
      this.showError(
        input, 
        rules.customMessages?.max?.(rules.max) || 
        this.#config.DEFAULT_MESSAGES.max(rules.max())
      );
    }
    return isValid;
  }

    #validatePattern(value, rules, input) {
        if (!rules.pattern || !value) return true;
        
        const regex = new RegExp(rules.pattern);
        const isValid = regex.test(value);
        if (!isValid) {
        this.showError(input, rules.customMessages?.pattern || this.#config.DEFAULT_MESSAGES.pattern());
        }
        return isValid;
    }

    #validateGroupSelection(value, rules, input) {
        if (!rules.groupSelection) return true;

        const groupType = input.dataset.validatorGroupType;
        const requiredQuantity = parseInt(input.dataset.validatorGroupQuantity) || 1;
        const errorTargetClass = input.dataset.validatorGroupTarget;
        
        if (!groupType) return true;
        
        const groupName = input.name;
        const groupElements = document.querySelectorAll(
            `input[type="${groupType}"][name="${groupName}"]`
        );
        
        let selectedCount = 0;
        groupElements.forEach(el => {
            if (el.checked) selectedCount++;
        });
        
        const isValid = selectedCount >= requiredQuantity;
        const target = errorTargetClass ? input.closest(errorTargetClass) : input
        
        if (!isValid) {
            const errorMessage = rules.customMessages?.groupSelection || 
                `Se requieren al menos ${requiredQuantity} selección(es)`;
            
            // Mostrar error en el primer elemento del grupo
            this.showError(
                target, 
                errorMessage,
                true
            );
        } else {
            // Limpiar errores de todos los elementos del grupo
            this.clearError(target);
        }
        
        return isValid;
    }

  #validateRadioRequired(value, rules, input) {
    if (!rules.radioRequired) return true;
    
    console.log("validando radios")
    const groupName = input.name;
    const radioGroup = document.querySelectorAll(`input[type="radio"][name="${groupName}"]`);
    let isChecked = false;

    radioGroup.forEach(radio => {
      if (radio.checked) isChecked = true;
    });

    console.log(isChecked, groupName);
    if (!isChecked) {
      // Mostrar error en el contenedor de los radio buttons
      this.showError(
        radioGroup[0].parentElement.parentElement, 
        rules.customMessages?.radioRequired || this.#config.DEFAULT_MESSAGES.radioRequired(),
        true
      );
    } else {
      // Limpiar errores de todos los radios del grupo si es válido
      //radioGroup.forEach(radio => this.clearError(radio));
      this.clearError(radioGroup[0].parentElement.parentElement);
    }

    return isChecked;
  }

  #validateCheckboxRequired(value, rules, input) {
    if (!rules.checkboxRequired) return true;
    
    const isValid = input.checked;
    if (!isValid) {
      this.showError(
        input, 
        rules.customMessages?.checkboxRequired || this.#config.DEFAULT_MESSAGES.checkboxRequired()
      );
    }
    return isValid;
  }


  clearError(input) {
    // Comportamiento normal para otros inputs
    input.classList.remove(this.#config.ERROR_CLASS);
    const existingError = input.nextElementSibling;
    if (existingError && existingError.classList.contains(this.#config.ERROR_MESSAGE_CLASS)) {
    existingError.remove();
    }

  }

  showError(input, message, isRadioGroup = false) {
    this.clearError(input);
    
    input.classList.add(this.#config.ERROR_CLASS);
    const errorSpan = document.createElement('span');
    errorSpan.classList.add(this.#config.ERROR_MESSAGE_CLASS);
    errorSpan.textContent = message;
    input.parentNode.insertBefore(errorSpan, input.nextSibling);

  }

  getRules(input) {
    const type = input.type || input.tagName.toLowerCase();
    const rules = {
      required: input.hasAttribute('required'),
      customMessages: this.#getCustomMessages(input),
    };

    // Validaciones específicas por tipo
    switch (type) {
        case this.#config.INPUT_TYPES.EMAIL:
            rules.email = true;
            break;
        case this.#config.INPUT_TYPES.TEL:
            rules.phone = true;
            break;
        case this.#config.INPUT_TYPES.PASSWORD:
            rules.password = true;
            break;
        case this.#config.INPUT_TYPES.RADIO:
             if (input.hasAttribute('data-validator-group-type')) {
                rules.groupSelection = true;
            } else {
                rules.radioRequired = true;
                rules.groupSelection = false;
            }
            break;
        case this.#config.INPUT_TYPES.NUMBER:
            rules.number = true;
            if (input.hasAttribute('min')) rules.min = parseFloat(input.getAttribute('min'));
            if (input.hasAttribute('max')) rules.max = parseFloat(input.getAttribute('max'));
            break;
    }


    // Atributos comunes
    if (input.hasAttribute('minlength')) {
      rules.minLength = parseInt(input.getAttribute('minlength'), 10);
    }
    
    rules.maxLength = input.hasAttribute('maxlength')
      ? parseInt(input.getAttribute('maxlength'), 10)
      : this.#config.DEFAULT_MAX_LENGTH;

    if (input.hasAttribute('pattern')) {
      rules.pattern = input.getAttribute('pattern');
    }

    return rules;
  }

  #getCustomMessages(input) {
    const messages = {};
    const messageKeys = Object.keys(this.#config.DEFAULT_MESSAGES);
    
    messageKeys.forEach(key => {
      const attrName = `data-${key}-message`;
      if (input.hasAttribute(attrName)) {
        messages[key] = input.getAttribute(attrName);
      }
    });
    
    return messages;
  }

  validateInput(input) {
    this.clearError(input);
    const rules = this.getRules(input);
    let value = input.value;

    // Ejecutar validadores según las reglas
    for (const [ruleName, validator] of Object.entries(this.#validators)) {
      if (rules[ruleName] && !validator(value, rules, input)) {
        return false;
      }
    }

    return true;
  }

  setElements(queryElements) {
    this.queryElements = queryElements;
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll(this.queryElements);
    
    inputs.forEach(input => {
        if (input.hasAttribute("ispassword")) {
            const passwordValid = this.#validatePassword(input.value, { password: true }, input);
            if (!passwordValid) {
                isValid = false;
                return;
            }
        }
        
        // Validación normal para todos los campos
        if (!this.validateInput(input)) {
            isValid = false;
        }
    });    
    
    return isValid;
  }

  addValidator(ruleName, validatorFn) {
    if (typeof validatorFn !== 'function') {
      throw new Error('El validador debe ser una función');
    }
    this.#validators[ruleName] = validatorFn.bind(this);
  }

  setConfig(newConfig) {
    this.#config = { ...this.#config, ...newConfig };
    // Volver a agregar estilos si cambian las clases de error
    this.#addErrorStyles();
  }
}