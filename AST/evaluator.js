class Evaluator {
  constructor(parser) {
    this.parser = parser;
    this.functions = { ...BUILTIN_FUNCTIONS };
    this.globalScope = this.createGlobalScope();
    this.currentScope = this.globalScope;
  }

  createGlobalScope() {
    const globalScope = new Scope();
    
    const globals = {
      Math: Math,
      Array: Array,
      Object: Object,
      JSON: JSON,
      console: console,
      Date: Date,
      RegExp: RegExp,
      Error: Error,
      TypeError: TypeError,
      RangeError: RangeError,
      Date: Date,
      Blob, Blob,
      
      parseInt: parseInt,
      parseFloat: parseFloat,
      isNaN: isNaN,
      isFinite: isFinite,
      encodeURI: encodeURI,
      decodeURI: decodeURI,
      encodeURIComponent: encodeURIComponent,
      decodeURIComponent: decodeURIComponent,
      
      [LANGUAGE_CONFIG.keywords.TRUE]: true,
      [LANGUAGE_CONFIG.keywords.FALSE]: false,
      [LANGUAGE_CONFIG.keywords.NULL]: null,
      [LANGUAGE_CONFIG.keywords.UNDEFINED]: undefined,
      PI: Math.PI,
      E: Math.E,
      
      Array: Array,
      Object: Object,
      Map: Map,
      Set: Set,

      Promise: Promise,
      
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      
      window: typeof window !== 'undefined' ? window : null,
      document: typeof document !== 'undefined' ? document : null,
      localStorage: typeof localStorage !== 'undefined' ? localStorage : null,
      sessionStorage: typeof sessionStorage !== 'undefined' ? sessionStorage : null,
      
      ...BUILTIN_FUNCTIONS
    };

    
    for (const [name, value] of Object.entries(globals)) {
      globalScope.variables[name] = value;
    }

    return globalScope;
  }

  registerFunctions(functions) {
    for (const [name, fn] of Object.entries(functions)) {
      if (typeof fn === 'string') {
        const ast = this.parser.parse(fn);
        if (ast.type === 'function_declaration') {
          this.evaluateFunctionDeclaration(ast);
        } else {
          throw new Error(`Invalid function declaration for ${name}: Must be a function declaration`);
        }
      } else if (typeof fn === 'function') {
        this.functions[name] = fn;
      } else {
        throw new Error(`Invalid function type for ${name}: Must be a string or function`);
      }
    }
  }

    registerStructuredFunction(fn) {
        const {name, args, body, isAsync} = fn;
        
        if (typeof body === 'string') {
            const async = (isAsync && isAsync == true) ? 'async' : '';
            const params = Array.isArray(args) ? args.join(', ') : args;
            const functionStr = `${async} function ${name}(${params}) {${body}}`;
            const ast = this.parser.parse(functionStr);
            
            if (ast.type === 'function_declaration') {
                this.evaluateFunctionDeclaration(ast);
            } else {
                throw new Error(`Invalid function declaration for ${name}: Must be a function declaration`);
            }
        } else if (typeof fn === 'function') {
        this.functions[name] = fn;
        } else {
        throw new Error(`Invalid function definition for ${name}`);
        }
    }

    async evaluateAsync(expression, scope = this.currentScope) {
      const result = await this.evaluate(expression, scope);
      
      if (result instanceof Promise) {
        try {
            const resolved = await result;
            return resolved;
        } catch (error) {
            console.error("Async evaluation failed:", error);
            throw error;
        }
      }

      return result;
    }

    evaluate(node, scope = this.currentScope) {
        const previousScope = this.currentScope;
        this.currentScope = scope;

        try {
          switch (node.type) {
              case 'literal': return node.value;
              case 'variable': return this.resolveVariable(node.name);
              case 'await': return this.evaluateAwait(node);
              case 'binary': return this.evaluateBinary(node);
              case 'prefix_update': return this.evaluatePrefixUpdate(node);
              case 'postfix_update': return this.evaluatePostfixUpdate(node);
              case 'unary': return this.evaluateUnary(node);
              case 'function': return this.evaluateFunction(node);
              case 'function_expression': return this.evaluateFunctionExpression(node);
              case 'property': return this.evaluateProperty(node);
              case 'assignment': return this.evaluateAssignment(node);
              case 'declaration': return this.evaluateDeclaration(node);
              case 'sequence': return this.evaluateSequence(node);
              case 'if': return this.evaluateIf(node);
              case 'for': return this.evaluateForLoop(node);
              case 'forOfLoop': return this.evaluateForOfLoop(node);
              case 'break': throw new BreakException();
              case 'continue': throw new ContinueException();
              case 'while': return this.evaluateWhileLoop(node);
              case 'function_declaration': return this.evaluateFunctionDeclaration(node);
              case 'return': return this.evaluateReturn(node);
              case 'block': return this.evaluateBlock(node);
              case 'regex': return node.value;
              case 'object_expression': {
              const result = {};
                for (const prop of node.properties) {
                    result[prop.key] = this.evaluate(prop.value);
                }
                return result;
              }
              case 'array': return this.evaluateArray(node);
              case 'array_access': return this.evaluateArrayAccess(node);
              case 'arrow_function': {
                return this.evaluateArrowFunction(node);
              }
              case 'regex': {
              return new RegExp(node.pattern, node.flags);
              }
              case 'new_expression': {
                  return this.evaluateNewExpression(node);
              }
              case 'ternary':
                  return this.evaluateTernary(node);
              default:
                throw new Error(`Unknown node type: ${node.type}`);
          }
        } catch (error) {
          if (error instanceof ContinueException) { throw error; }
          if (error instanceof BreakException) { throw error; }
          if (error instanceof ReturnException) { throw error; }
          throw new Error(`Evaluation error: ${error.message}`);
        } finally {
          this.currentScope = previousScope;
        }
    }

    async evaluateAwait(node) {
      const promise = this.evaluate(node.expression);
      
      if (!(promise instanceof Promise)) {
        return promise; // Si no es promesa, devolver el valor directamente
      }

      return promise;
      // try {
      //   const result = await promise;
      //   return result;
      // } catch (error) {
      //   throw new Error(`Await failed: ${error.message}`);
      // }
    }

    evaluateArrayAccess(node) {
        const target = this.evaluate(node.array);
        const index = this.evaluate(node.index);

        if (target === null || typeof target !== 'object') {
          throw new Error(`Target must be an object, got ${typeof target}`);
        }
        // if (!Array.isArray(array)) {
        //     throw new Error(`Expected array in array access but got ${typeof array} (${array})}`);
        // }

        return target[index];
    }

    evaluateArray(node) {
        return node.elements.map(element => {
            if (element instanceof ArrayNode) {
                return this.evaluateArray(element);
            }
            return element !== null ? this.evaluate(element) : undefined;
        });
    }

    evaluateTernary(node) {
        const condition = this.evaluate(node.condition);
        return condition ? this.evaluate(node.consequent) : this.evaluate(node.alternate);
    }

    evaluateNewExpression(node) {
        const constructor = this.resolveVariable(node.name);
        const args = node.args.map(arg => this.evaluate(arg));
        
        // Verificar que el constructor sea válido
        if (typeof constructor !== 'function' && typeof constructor !== 'object') {
            throw new Error(`${node.name} is not a constructor`);
        }
        
        try {
            return new constructor(...args);
        } catch (error) {
            throw new Error(`Error creating instance of ${node.name}: ${error.message}`);
        }
    }
   
    evaluateArrowFunction(node) {
        const closureScope = this.currentScope;
        
        return (...args) => {
            const callScope = closureScope.createChild();
            
            node.params.forEach((param, index) => {
                callScope.declare(param, args[index]);
            });
            
            try {
                return this.evaluate(node.body, callScope);
            } catch (error) {
                if (error instanceof ReturnException) return error.value;
                throw error;
            }
        };
    }

  resolveVariable(name) {
    try {
      return this.currentScope.get(name);
    } catch (e) {
        if (Object.prototype.hasOwnProperty.call(this.functions, name)) {
            return this.functions[name];
        }
      
        const globalObj = window;
        if (globalObj && name in globalObj) {
            return globalObj[name];
        }
      
      throw new Error(`Undefined variable: ${name}`);
    }
  }

  evaluateBinary(node) {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    
    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/':
        if (right === 0) throw new Error('Division by zero');
        return left / right;
      case '%': return left % right;
      case '^': return Math.pow(left, right);
      case '>': return left > right;
      case '<': return left < right;
      case LANGUAGE_CONFIG.operators.GTE: return left >= right;
      case LANGUAGE_CONFIG.operators.LTE: return left <= right;
      case LANGUAGE_CONFIG.operators.EQ: return left == right;
      case LANGUAGE_CONFIG.operators.NEQ: 
      case LANGUAGE_CONFIG.operators.NEQ_ALT: return left != right;
      case LANGUAGE_CONFIG.operators.AND: return left && right;
      case LANGUAGE_CONFIG.operators.OR: return left || right;
      case LANGUAGE_CONFIG.operators.COALESCE: return left !== null && left !== undefined ? left : right;
      case 'instanceof': 
        if (typeof right !== 'function') {
          throw new Error('Right-hand side of instanceof must be a constructor');
        }
        return left instanceof right;
      case 'in': 
        if (typeof right !== 'object' || right === null) {
          throw new Error('Right-hand side of in must be an object');
        }
        return left in right;
      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
  }

  evaluateUnary(node) {
    const arg = this.evaluate(node.argument);
    
    switch (node.operator) {
      case '+': return +arg;
      case '-': return -arg;
      case '++': return arg = arg + 1;
      case '--': return arg = arg - 1;
      case '!': 
      case LANGUAGE_CONFIG.operators.NOT: return !arg;
      case 'typeof': return typeof arg;
      case 'void': return void arg;
      case 'delete': 
        if (node.argument.type !== 'property') {
          throw new Error('Delete operator can only be used on object properties');
        }
        const obj = this.evaluate(node.argument.object);
        return delete obj[node.argument.property];
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  evaluateFunction(node) {
    let fn;
    let thisArg;
    
    if (typeof node.name === 'string') {
      fn = this.resolveVariable(node.name);
      
      if (typeof fn !== 'function') {
        throw new Error(`'${node.name}' is not a function`);
      }
      thisArg = null;
    } else {
      thisArg = this.evaluate(node.name);
      
      if (thisArg == null) {
        throw new Error(`Cannot call method on ${thisArg}`);
      }
      
      if (node.name.type === 'property') {
        fn = typeof thisArg === 'function' ? thisArg : thisArg[node.name.property];
        
        if (fn && typeof fn.bind === 'function') {
          fn = fn.bind(thisArg);
        }
      } else {
        fn = thisArg;
      }
      
      if (typeof fn !== 'function') {
        throw new Error(`Property '${node.name.property}' is not a function`);
      }
    }
    
    const args = node.arguments.map(arg => {
      const evaluated = this.evaluate(arg);
      return arg.type === 'regex' ? new RegExp(arg.pattern, arg.flags) : evaluated;
    });
    
    try {
      return fn.apply(thisArg, args);
    } catch (error) {
      throw new Error(`Function call error: ${error.message}`);
    }
  }

  evaluateFunctionExpression(node) {
    const closureScope = this.currentScope;
    
    const func = (...args) => {
      const functionScope = closureScope.createChild();
      
      node.parameters.forEach((param, index) => {
        functionScope.declare(param, args[index] !== undefined ? args[index] : null);
      });
      
      try {
        return this.evaluate(node.body, functionScope);
      } catch (error) {
        if (error instanceof ReturnException) return error.value;
        throw error;
      }
    };
    
    return func;
  }

  evaluateProperty(node) {
    const object = this.evaluate(node.object);
    
    if (object == null) {
      throw new Error(`Cannot read property '${node.property}' of null or undefined`);
    }
    
    if (node.property === '__proto__') {
      return Object.getPrototypeOf(object);
    }
    
    let value = object[node.property];
    
    if (value === undefined && object !== Object.prototype) {
      const proto = Object.getPrototypeOf(object);
      if (proto) {
        value = proto[node.property];
      }
    }
    
    if (typeof value === 'function') {
      return (...args) => {
        const processedArgs = args.map(arg => 
          arg && arg.type === 'regex' ? new RegExp(arg.pattern, arg.flags) : arg
        );
        
        try {
          return value.apply(object, processedArgs);
        } catch (error) {
          throw new Error(`Method call error: ${error.message}`);
        }
      };
    }
    
    return value;
  }

    evaluateAssignment(node) {
        if (node.target.type === 'property') {
            const object = this.evaluate(node.target.object);
            const property = node.target.property;
            const value = this.evaluate(node.value);
            
            if (object == null) {
                throw new Error(`Cannot set property '${property}' of null or undefined`);
            }
            
            object[property] = value;
            return value;
        }
        else if (node.target.type === 'array_access') {
            const target = this.evaluate(node.target.array);
            const index = this.evaluate(node.target.index);
            const value = this.evaluate(node.value);
            
            if (target === null || typeof target !== 'object') {
              throw new Error(`Target must be an object, got ${typeof target}`);
            }
            // if (!Array.isArray(target)) {
            //     throw new Error(`Cannot set index of non-array type (${typeof target})`);
            // }
            
            // if (typeof index !== 'number') {
            //     throw new Error(`Array index must be a number, got ${typeof target}`);
            // }
            
            target[index] = value;
            return value;
        }
        else if (node.target.type === 'variable') {
            const value = this.evaluate(node.value);
            this.currentScope.set(node.target.name, value);
            return value;
        }
        
        throw new Error(`Invalid assignment target (${node.target.type}) expected variable or property`);
    }

    evaluateDeclaration(node) {
        const value = this.evaluate(node.value);
        this.currentScope.declare(node.name, value);
        return value;
    }

    evaluateSequence(node) {
        let result;
        for (const expr of node.expressions) {
            result = this.evaluate(expr);
        }
        return result;
    }

  evaluateIf(node) {
    const condition = this.evaluate(node.condition);
    if (condition) {
      return this.evaluate(node.thenBranch);
    } else if (node.elseBranch) {
      return this.evaluate(node.elseBranch);
    }
    return null;
  }

    evaluateForLoop(node) {
        const loopScope = this.currentScope.createChild();
        this.evaluate(node.initialization, loopScope);
        
        let result;
        try {
        while (this.evaluate(node.condition, loopScope)) {
            try {
            result = this.evaluate(node.body, loopScope);
            } catch (error) {
                if (error instanceof BreakException) break;
                if (error instanceof ContinueException) continue;
                if (error instanceof ReturnException) return error.value;
            throw error;
            }
            this.evaluate(node.update, loopScope);
        }
        } finally {

        }
        
        return result;
    }

    evaluateForOfLoop(node) {
        const iterable = this.evaluate(node.iterable);
        const loopScope = this.currentScope.createChild();
        let result;
        
        if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
            throw new Error(`Object is not iterable: ${node.iterable}`);
        }
        
        try {
            loopScope.declare(node.variable, undefined);
            
            for (const value of iterable) {
                loopScope.set(node.variable, value);
                
                try {
                    result = this.evaluate(node.body, loopScope);
                } catch (error) {
                    if (error instanceof BreakException) break;
                    if (error instanceof ContinueException) continue;
                    if (error instanceof ReturnException) return error.value;
                    throw error;
                }
            }
        } finally {

        }
        
        return result;
    }

  evaluateWhileLoop(node) {
    const loopScope = this.currentScope.createChild();
    let result;
    
    try {
      while (this.evaluate(node.condition, loopScope)) {
        try {
          result = this.evaluate(node.body, loopScope);
        } catch (error) {
            if (error instanceof BreakException) break;
            if (error instanceof ContinueException) continue;
            if (error instanceof ReturnException) return error.value;
            throw error;
        }
      }
    } finally {

    }
    
    return result;
  }

  evaluateFunctionDeclaration(node) {
    const closureScope = this.currentScope;
    
    const func = (...args) => {
      const functionScope = closureScope.createChild();
      
      node.parameters.forEach((param, index) => {
        functionScope.declare(param, args[index] !== undefined ? args[index] : null);
      });
      
      try {
        const fnBody = this.evaluate(node.body, functionScope);
        return fnBody;
      } catch (error) {
        if (error instanceof ReturnException) return error.value;
        throw error;
      }
    };
    
    this.currentScope.declare(node.name, func);
    return null;
  }

  evaluateReturn(node) {
    const value = node.value ? this.evaluate(node.value) : null;
    throw new ReturnException(value);
  }

  evaluateBlock(node) {
    const blockScope = this.currentScope.createChild();
    let result;
    
    try {
      for (const statement of node.statements) {
        result = this.evaluate(statement, blockScope);
        if (statement.type === 'return') {
          throw new ReturnException(result);
        }
      }
    } finally {
      // El garbage collection se encargará de limpiar blockScope
    }
    
    return result;
  }

  clearContext() {
    this.currentScope = this.globalScope.createChild();
  }

  getContext() {
    const collectVariables = (scope, result = {}) => {
      for (const key in scope.variables) {
        if (Object.prototype.hasOwnProperty.call(scope.variables, key)) {
          result[key] = scope.variables[key];
        }
      }
      
      if (scope.parent) {
        collectVariables(scope.parent, result);
      }
      
      return result;
    };
    
    return collectVariables(this.currentScope);
  }

  getGlobalContext() {
    return {...this.globalScope.variables};
  }
}