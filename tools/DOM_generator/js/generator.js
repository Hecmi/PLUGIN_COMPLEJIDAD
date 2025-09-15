class Generator {
  /**
   * Constructor que inicializa el idioma y el creador de elementos.
   * @param {string} [language='es'] - Idioma para los textos (por defecto 'es').
   */
  constructor(language = 'es') {
    this.language = language;
    this.elementCreator = new ElementCreator();
  }

  /**
   * Ejecuta el proceso de generación de pestañas y campos dinámicos.
   * @param {Array} data - Arreglo de objetos con datos de los campos.
   */
  execute(data) {
    const formContainer = document.getElementById('form-container');
    if (!formContainer) {
      console.error('Contenedor de formulario no encontrado');
      return;
    }

    this.generateTabs(data, formContainer);
    this.generateDynamicForm(data);
    this.translatePage(this.language);
  }

  translatePage(lan) {
    Translator.tPage(document, lan);
  }

  /**
   * Genera pestañas basadas en atributos de clase únicos y las añade al contenedor.
   * @param {Array} data - Arreglo de objetos con datos de los campos.
   * @param {HTMLElement} container - Elemento DOM donde se añaden las pestañas.
   */
  generateTabs(data, container) {
    const uniqueClassIds = [...new Set(data.map(field => field[Constants.ATTRIBUTES.classAttributeId]))];
    const tabList = document.querySelector('.tab-list') || ElementCreator.create('ul')
      .addClass('tab-list')
      .getElement();

    uniqueClassIds.forEach((classId, index) => {
      const field = data.find(f => f[Constants.ATTRIBUTES.classAttributeId] === classId);
      const isActive = index === 0 ? 'active' : 'inactive';

      const tabItem = ElementCreator.create('li')
        .addClass('tab-item')
        .addClass(isActive)
        .setText(field[Constants.ATTRIBUTES.classAttribute_ts][this.language])
        .setAttr('data-tab', `tab${classId}`)
        .on('click', () => this.handleTabClick(classId))
        .getElement();

      const tabContent = ElementCreator.create('div')
        .setId(`tab${classId}`)
        .addClass('tab-content')
        .addClass(isActive)
        .getElement();

      tabList.appendChild(tabItem);
      container.appendChild(tabContent);
    });

    if (!document.querySelector('.tab-list')) {
      container.prepend(tabList);
    }

    const firstTab = document.querySelector('.tab-item.active');
    if (firstTab) firstTab.click();
  }

  /**
   * Maneja el evento de clic en una pestaña para alternar estados activos.
   * @param {string} classId - ID del atributo de clase.
   */
  handleTabClick(classId) {
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const tab = document.querySelector(`[data-tab="tab${classId}"]`);
    const content = document.getElementById(`tab${classId}`);
    if (tab && content) {
      tab.classList.add('active');
      content.classList.add('active');
    }
  }

  /**
   * Genera campos de formulario dinámicos para cada pestaña según los datos.
   * @param {Array} data - Arreglo de objetos con datos de los campos.
   */
  generateDynamicForm(data) {
    data.forEach(field => {
      const {
        [Constants.ATTRIBUTES.dataType]: dataType,
        [Constants.ATTRIBUTES.attributeId]: attributeId,
        [Constants.ATTRIBUTES.attributeTranslations]: translations,
        [Constants.ATTRIBUTES.attributeCode]: code,
        [Constants.ATTRIBUTES.attributeType]: type,
        [Constants.ATTRIBUTES.classAttributeId]: classId,
        [Constants.ATTRIBUTES.isDefault]: isDefault,
        [Constants.ATTRIBUTES.options]: options,
        [Constants.ATTRIBUTES.textValue]: textValue
      } = field;

      const tab = document.getElementById(`tab${classId}`);
      if (!tab) return;

      const value = textValue || "";

      if (dataType === 'Basic') {
        this.createBasicField(attributeId, translations[this.language], value, code, type, isDefault, tab);
      } else if (dataType === 'Listed') {
        this.createListedField(type, attributeId, translations[this.language], value, code, options, isDefault, tab);
      }
    });
  }

  /**
   * Crea un campo de entrada básico según el tipo de atributo.
   * @param {string} id - ID del campo.
   * @param {string} name - Nombre del campo en el idioma actual.
   * @param {string} code - Código del campo.
   * @param {string} type - Tipo de atributo (e.g., int, string).
   * @param {string} isDefault - Indicador de valor por defecto.
   * @param {HTMLElement} container - Contenedor de la pestaña para añadir el campo.
   */
  createBasicField(id, data, value, code, type, isDefault, container) {
    let inputType;
    switch (type) {
      case 'int':
      case 'float':
        inputType = 'number';
        break;
      case 'string':
        inputType = 'text';
        break;
      case 'date':
        inputType = 'date';
        break;
      case 'password':
        inputType = 'password';
        break;
      case 'email':
        inputType = 'email';
        break;
      default:
        return;
    }

    console.log("DATA EN BASIC FIELD ", data)
   const fieldGroup = ElementCreator.create('div')
    .addClass('field-group')
    .buildChild('label', label => 
      label.setAttr('for', id)
        .setText(data.name)
        .addClass('input-label')
        .addClass('required')
        .buildChild('span', span => 
          span.setAttr('textContent', '?')
            .addClass('help-icon')
            .on('click', () => showDescriptionModal(
              data.name, 
              data.description, 
              Translator.t(this.language, "uP.close")
            ))
        )
        .buildChild('span', span => 
          span.setAttr('textContent', '*')
          .addClass('required-icon')
          .setAttr('data-tooltip', this.t("uP.required", this.language))
        )
    )
    .buildChild('div', wrapper => { 
      wrapper.addClass('input-wrapper');

      wrapper.buildChild('input', input =>
        input.makeInput(inputType)
          .setId(id)
          .setAttr('name', code)
          .setAttr('value', value)
          .setAttr('required', 'true')
          .setAttr('isDefault', isDefault)
          .setAttr('data-tab-id', container.id)
      );
    })
    .buildChild('div', checkboxWrapper => {
      if (type === 'password') {
        checkboxWrapper.addClass('show-password-wrapper')
          .buildChild('label', label =>
            label
              .buildChild('input', checkbox =>
                checkbox.makeInput('checkbox')
                  .on('change', e => {
                    const inputEl = fieldGroup.querySelector('.input-wrapper input');
                    inputEl.type = e.target.checked ? 'text' : 'password';
                  })
              )
              .buildChild('span', span =>
                span.setText('Mostrar contraseña')
              )
          );
      }
    })
    .getElement();

    container.appendChild(fieldGroup);
  }




  /**
   * Crea un campo listado (radio o select) según el tipo de atributo.
   * @param {string} type - Tipo de atributo (e.g., liker3, radio).
   * @param {string} id - ID del campo.
   * @param {string} name - Nombre del campo en el idioma actual.
   * @param {string} code - Código del campo.
   * @param {Array} options - Arreglo de objetos de opciones.
   * @param {string} isDefault - Indicador de valor por defecto.
   * @param {HTMLElement} container - Contenedor de la pestaña para añadir el campo.
   */
  createListedField(type, id, data, value, code, options, isDefault, container) {
    if (type.startsWith('liker')) {
        this.createHorizontalRadioField(id, data, value, code, options, isDefault, container);
    } else if (type === 'radio') {
        this.createVerticalRadioField(id, data, value, code, options, isDefault, container);
    } else {
        this.createSelectField(id, data, value, code, options, isDefault, container);
    }
  }

  /**
   * Crea un campo de selección (select) con opciones.
   * @param {string} id - ID del campo.
   * @param {string} name - Nombre del campo en el idioma actual.
   * @param {string} code - Código del campo.
   * @param {Array} options - Arreglo de objetos de opciones.
   * @param {string} isDefault - Indicador de valor por defecto.
   * @param {HTMLElement} container - Contenedor de la pestaña para añadir el campo.
   */
  createSelectField(id, data, value, code, options, isDefault, container) {
    const cleanedOptions = options?.map(option => ({
      value: option[Constants.OPTIONS.value],
      textContent: option[Constants.OPTIONS.dataListed_ts][this.language]
    })) || [];

    console.log("SELECT FIELD", id, code, value, cleanedOptions)
    const fieldGroup = ElementCreator.create('div')
      .addClass('field-group')
      .buildChild('label', label => 
        label.setAttr('for', id)
          .setText(data.name)
          .addClass('input-label')
          .addClass('required')
          .buildChild('span', span => 
            span.setAttr('textContent', '?')
              .addClass('help-icon')
              .on('click', () => showDescriptionModal(data.name, data.description, this.t("uP.close")))
          )
          .buildChild('span', span => 
            span.setAttr('textContent', '*')
            .addClass('required-icon')
            .setAttr('data-tooltip', this.t("uP.required", this.language))
          )
      )
      .buildChild('select', select => {
        select.setId(id)
          .setAttr('name', code)
          .setAttr('required', 'true')
          .setAttr('isDefault', isDefault)
          .setAttr('data-tab-id', container.id)

        cleanedOptions.forEach(option => {
          select.buildChild('option', opt =>  {
            opt.setAttr('value', option.value)
              .setText(option.textContent)
            
            // Marcar la opción seleccionada
            if (option.value == value){
              opt.setAttr('selected', true);
            }
          })
        });
      })
      .getElement();

    container.appendChild(fieldGroup);
  }

  /**
   * Crea un campo de radio horizontal.
   * @param {string} id - ID del campo.
   * @param {string} name - Nombre del campo en el idioma actual.
   * @param {string} code - Código del campo.
   * @param {Array} options - Arreglo de objetos de opciones.
   * @param {string} isDefault - Indicador de valor por defecto.
   * @param {HTMLElement} container - Contenedor de la pestaña para añadir el campo.
   */
  createHorizontalRadioField(id, data, value, code, options, isDefault, container) {
    const cleanedOptions = options?.map(option => ({
      value: option[Constants.OPTIONS.value],
      textContent: option[Constants.OPTIONS.dataListed_ts][this.language]
    })) || [];

    const radioGroup = ElementCreator.create('div')
      .addClass('field-group')
      .addClass('radio-group')
      .buildChild('label', label => 
        label.setAttr('for', id)
          .setText(data.name)
          .addClass('input-label')
          .addClass('required')
          .buildChild('span', span => 
            span.setText('?')
              .addClass('help-icon')
              .on('click', () => showDescriptionModal(data.name, data.description, this.t("uP.close")))
          )
          .buildChild('span', span => 
            span.setAttr('textContent', '*')
            .addClass('required-icon')
            .setAttr('data-tooltip', this.t("uP.required", this.language))
          )
      )
      .buildChild('div', radioContainer => {
        radioContainer
          .addClass('radio-options-container')
          .setAttr('data-tab-id', container.id)
        cleanedOptions.forEach((option, index) => {
          const radioId = `${id}_${index}`;
          const isChecked = option.value == value;

          radioContainer.buildChild('div', optionWrapper => 
            optionWrapper.addClass('radio-option')
              .buildChild('input', radio => 
                radio.setAttr('type', 'radio')
                  .setAttr('id', radioId)
                  .setAttr('data-id', id)
                  .setAttr('name', code)
                  .setAttr('value', option.value)
                  .setAttr('data-validator-group-type', 'radio')
                  .setAttr('data-validator-group-quantity', '1')
                  .setAttr('data-validator-group-target', '.radio-options-container')
                  .setAttr('isDefault', isDefault)
                  .setAttr('checked', isChecked ? 'true' : null)
                  .on('click', function() {
                    const group = this.dataset.validatorGroupTarget;
                    this.closest(group).setAttribute('data-value', this.value);
                    this.closest(group).setAttribute('data-id', this.dataset.id);
                  })
              )
              .buildChild('label', radioLabel => 
                radioLabel.setAttr('for', radioId)
                  .setText(option.textContent)
                  .addClass('radio-label')
              )
          );
        });
      })
      .getElement();

    container.appendChild(radioGroup);
  }

  /**
   * Crea un campo de radio vertical.
   * @param {string} id - ID del campo.
   * @param {string} name - Nombre del campo en el idioma actual.
   * @param {string} code - Código del campo.
   * @param {Array} options - Arreglo de objetos de opciones.
   * @param {string} isDefault - Indicador de valor por defecto.
   * @param {HTMLElement} container - Contenedor de la pestaña para añadir el campo.
   */
  createVerticalRadioField(id, data, value, code, options, isDefault, container) {
    const cleanedOptions = options?.map(option => ({
      value: option[Constants.OPTIONS.value],
      textContent: option[Constants.OPTIONS.dataListed_ts][this.language]
    })) || [];

    const radioGroup = ElementCreator.create('div')
      .addClass('field-group')
      .buildChild('label', label => 
        label.setAttr('for', id)
          .setText(data.name)
          .addClass('input-label')
          .addClass('required')
          .buildChild('span', span => 
            span.setText('?')
              .addClass('help-icon')
              .on('click', () => showDescriptionModal(data.name, data.description, this.t("uP.close")))
          )
          .buildChild('span', span => 
            span.setAttr('textContent', '*')
            .addClass('required-icon')
            .setAttr('data-tooltip', this.t("uP.required", this.language))
          )
      )
      .buildChild('div', radioContainer => {
        radioContainer.
          addClass('radio-options-vertical')
          .setAttr('data-tab-id', container.id)
          .setAttr('required', 'true');
        cleanedOptions.forEach((option, index) => {
          const radioId = `${id}_${index}`;
          const isChecked = option.value == value;

          radioContainer.buildChild('div', optionWrapper => 
            optionWrapper.addClass('radio-option-vertical')
              .buildChild('input', radio => 
                radio.setAttr('type', 'radio')
                  .setAttr('id', radioId)
                  .setAttr('data-id', id)
                  .setAttr('name', code)
                  .setAttr('value', option.value)
                  .setAttr('isDefault', isDefault)
                  .setAttr('checked', isChecked ? 'true' : null)
              )
              .buildChild('label', radioLabel => 
                radioLabel.setAttr('for', radioId)
                  .setText(option.textContent)
                  .addClass('radio-label-right')
              )
          );
        });
      })
      .getElement();

    container.appendChild(radioGroup);
  }

  t(key) {
    return Translator.t(this.language, key);
  }
}

/**
 * Muestra un modal con título y contenido descriptivo.
 * @param {string} title - Título del modal.
 * @param {string} content - Contenido del modal.
 */
function showDescriptionModal(title, content, closeText) {
  const { element, close } = createDynamicModal({
    title,
    content,
    footerButtons: [{
      text: closeText,
      className: 'modal-button',
      onClick: () => close()
    }]
  });
}

/**
 * Muestra un modal con título y contenido descriptivo.
 * @param {string} title - Título del modal.
 * @param {string} content - Contenido del modal.
 */
function showBiModal(title, content, acceptText, closeText, onAccept, onReject) {
  const { element, close } = createDynamicModal({
    title,
    content,
    footerButtons: [{
      text: acceptText,
      className: 'modal-button',
      onClick: () => {
        if (onReject && typeof onReject === 'function') {
          onAccept(close);
        }
      }
    },
    {
      text: closeText,
      className: 'modal-button',
      onClick: () => {
        if (onReject && typeof onReject === 'function') {
          onReject(close);
        }
      }
    }]
  });
}