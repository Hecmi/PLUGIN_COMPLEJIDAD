class ElementCreator {
  constructor(tagName = 'div') {
    this._element = document.createElement(tagName);
    this._children = [];
  }

    static $(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    const wrapper = new ElementCreator();
    wrapper._element = element;
    // Recoger los hijos existentes
    wrapper._children = Array.from(element.childNodes);
    return wrapper;
  }
  
  // Métodos básicos de construcción
  static create(tagName = 'div') {
    return new ElementCreator(tagName);
  }

  setTag(tagName) {
    this._element = document.createElement(tagName);
    this._children.forEach(child => this._element.appendChild(child));
    return this;
  }

  // Métodos de atributos
  setAttr(name, value) {
    if (name in this._element) {
      this._element[name] = value;
    } else {
      this._element.setAttribute(name, value);
    }
    return this;
  }

  setAttrs(attributes) {
    Object.entries(attributes).forEach(([name, value]) => this.setAttr(name, value));
    return this;
  }

  setId(id) {
    return this.setAttr('id', id);
  }

  addClass(className) {
    this._element.classList.add(className);
    return this;
  }

  setClasses(classNames) {
    this._element.className = classNames.join(' ');
    return this;
  }

  setText(text) {
    this._element.textContent = text;
    return this;
  }

  setHtml(html) {
    this._element.innerHTML = html;
    return this;
  }

  // Métodos de estructura
  addChild(child) {
    if (child instanceof ElementCreator) {
      this._children.push(child.getElement());
    } else if (child instanceof HTMLElement) {
      this._children.push(child);
    } else if (typeof child === 'string') {
      this._children.push(document.createTextNode(child));
    }
    return this;
  }

  addChildren(children) {
    children.forEach(child => this.addChild(child));
    return this;
  }

  buildChild(tagName, builder) {
    const child = new ElementCreator(tagName);
    builder(child);
    this.addChild(child);
    return this;
  }

  // Métodos especializados
  makeInput(type = 'text') {
    this.setTag('input').setAttr('type', type);
    return this;
  }

  makeLabel(forId, text) {
    return this.setTag('label')
      .setAttr('for', forId)
      .setText(text || '');
  }

  makeSelect(options = []) {
    this.setTag('select');
    options.forEach(opt => {
      this.addChild(
        ElementCreator.create('option')
          .setAttr('value', opt.value || opt)
          .setText(opt.text || opt)
      );
    });
    return this;
  }

  makeTable(headers = [], rows = []) {
    this.setTag('table');
    
    if (headers.length) {
      this.buildChild('thead', thead => 
        thead.buildChild('tr', tr => 
          headers.forEach(header => 
            tr.buildChild('th', th => th.setText(header))
        )
      ));
    }
    
    if (rows.length) {
      this.buildChild('tbody', tbody => 
        rows.forEach(row => 
          tbody.buildChild('tr', tr => 
            row.forEach(cell => 
              tr.buildChild('td', td => td.setText(cell))
            )
          )
        )
      );
    }
    
    return this;
  }

  // Métodos de interacción
  on(event, handler) {
    this._element.addEventListener(event, handler);
    return this;
  }

  appendTo(parent) {
    const target = typeof parent === 'string' 
      ? document.querySelector(parent) 
      : parent;
    
    if (target) {
      this._children.forEach(child => this._element.appendChild(child));
      target.appendChild(this._element);
    }
    
    return this;
  }

  // Acceso al elemento
  getElement() {
    this._children.forEach(child => this._element.appendChild(child));
    return this._element;
  }
}

window.ElementCreator = ElementCreator;
window.$ = ElementCreator.$;
console.log(ElementCreator)

// // Ejemplo de uso
// const form = ElementCreator.create('form')
//   .setAttrs({
//     id: 'user-form',
//     class: 'form-container',
//     style: 'max-width: 600px; margin: 0 auto'
//   })
//   .buildChild('h2', heading => 
//     heading.setText('Formulario de Registro')
//   )
//   .buildChild('div', field => 
//     field.addClass('form-field')
//       .buildChild('label', label => 
//         label.makeLabel('username', 'Nombre de usuario:')
//       )
//       .buildChild('input', input => 
//         input.makeInput('text')
//           .setId('username')
//           .setAttr('placeholder', 'Ingrese su usuario')
//       )
//   )
//   .buildChild('div', field => 
//     field.addClass('form-field')
//       .buildChild('label', label => 
//         label.makeLabel('email', 'Correo electrónico:')
//       )
//       .buildChild('input', input => 
//         input.makeInput('email')
//           .setId('email')
//           .setAttr('required', true)
//       )
//   )
//   .buildChild('div', field => 
//     field.addClass('form-field')
//       .buildChild('label', label => 
//         label.makeLabel('country', 'País:')
//       )
//       .buildChild('select', select => 
//         select.makeSelect([
//           { value: 'ar', text: 'Argentina' },
//           { value: 'es', text: 'España' },
//           { value: 'mx', text: 'México' }
//         ])
//           .setId('country')
//       )
//   )
//   .buildChild('button', button => 
//     button.setAttr('type', 'submit')
//       .setText('Enviar')
//       .addClass('submit-btn')
//   )
//   .on('submit', e => {
//     e.preventDefault();
//     console.log('Formulario enviado');
//   });

// document.body.appendChild(form.getElement());

// // Ejemplo de tabla
// const dataTable = ElementCreator.create()
//   .makeTable(
//     ['Nombre', 'Edad', 'Ciudad'],
//     [
//       ['Juan Pérez', '32', 'Madrid'],
//       ['María García', '28', 'Barcelona'],
//       ['Carlos López', '41', 'Valencia']
//     ]
//   )
//   .addClass('data-table')
//   .appendTo(document.body);