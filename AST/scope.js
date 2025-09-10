class Scope {
  constructor(parent = null) {
    this.parent = parent;
    this.variables = Object.create(null);
  }

  has(name) {
    return Object.prototype.hasOwnProperty.call(this.variables, name) || 
           (this.parent && this.parent.has(name));
  }

  get(name) {
    if (Object.prototype.hasOwnProperty.call(this.variables, name)) {
      return this.variables[name];
    }
    
    if (this.parent) {
      return this.parent.get(name);
    }
    
    throw new Error(`Undefined variable: ${name}`);
  }

  set(name, value) {
    if (Object.prototype.hasOwnProperty.call(this.variables, name)) {
      this.variables[name] = value;
      return;
    }
    
    if (this.parent && this.parent.has(name)) {
      this.parent.set(name, value);
      return;
    }
    
    // Variable no existe en ningún scope, se crea en el actual
    this.variables[name] = value;
  }

  declare(name, value) {
    if (Object.prototype.hasOwnProperty.call(this.variables, name)) {
      throw new Error(`Variable ${name} is already declared in this scope`);
    }
    this.variables[name] = value;
  }

  createChild() {
    return new Scope(this);
  }
}