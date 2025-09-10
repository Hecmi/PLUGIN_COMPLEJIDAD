class ECARule {
    constructor({ name, event, condition, actions, priority = 0 }) {
        this.name = name;
        this.event = event;
        this.condition = condition;
        this.actions = Array.isArray(actions) ? actions : [actions];
        this.priority = priority;
        this.compiled = false;
        this.eventAST = null;
        this.conditionAST = null;
        this.actionsAST = [];
    }

    compile(parser) {
        try {
            this.eventAST = parser.parse(this.event);
            this.conditionAST = parser.parse(this.condition);
            
            this.actionsAST = this.actions.map(action => {
                if (typeof action === 'string') {
                    return parser.parse(action);
                }
                return action;
            });
            
            this.compiled = true;
        } catch (error) {
            throw new Error(`Error compiling rule ${this.name}: ${error.message}`);
        }
    }

    evaluateCondition(evaluator, context = {}) {
        if (!this.compiled) {
            throw new Error(`Rule ${this.name} has not been compiled`);
        }

        const originalScope = evaluator.currentScope;

        try{
            // Crear un nuevo scope para esta evaluación
            evaluator.currentScope = evaluator.currentScope.createChild();
            
            // Añadir variables del contexto
            for (const [key, value] of Object.entries(context)) {
                evaluator.currentScope.declare(key, value);
            }

            console.log("CURRENT SCOPE =", evaluator.currentScope);
            
            // Evaluar la condición
            const conditionResult = evaluator.evaluate(this.conditionAST);
            return conditionResult;

        } catch (error) {
            return false;
        } finally {
            evaluator.currentScope = originalScope;
        }
    }

    evaluate(evaluator, context = {}, condition) {
        if (!this.compiled) {
            throw new Error(`Rule ${this.name} has not been compiled`);
        }
        
        // Guardar el scope actual para restaurarlo después
        const originalScope = evaluator.currentScope;
        
        try {
            // Crear un nuevo scope para esta evaluación
            evaluator.currentScope = evaluator.currentScope.createChild();
            
            // Añadir variables del contexto
            for (const [key, value] of Object.entries(context)) {
                evaluator.currentScope.declare(key, value);
            }
            
            let conditionResult = condition;
            if (!conditionResult) {
                // Evaluar la condición
                conditionResult = evaluator.evaluate(this.conditionAST);
                if (!conditionResult) {
                    return null;
                }
            }


            // Ejecutar acciones
            const actionResults = [];
            for (const actionAST of this.actionsAST) {
                // Crear un nuevo scope para cada acción
                const actionScope = evaluator.currentScope.createChild();
                const previousScope = evaluator.currentScope;
                
                try {
                    evaluator.currentScope = actionScope;
                    actionResults.push(evaluator.evaluate(actionAST));
                } finally {
                    // Restaurar el scope de la regla
                    evaluator.currentScope = previousScope;
                }
            }
            
            return {
                name: this.name,
                results: actionResults,
                context: this.getRelevantContext(evaluator.currentScope)
            };
        } catch (error) {
            console.error(`Error executing rule ${this.name}:`, error);
            return null;
        } finally {
            evaluator.currentScope = originalScope;
        }
    }

    getRelevantContext(scope) {
        const relevantContext = {};
        let currentScope = scope;
        
        // Recorremos hasta el scope global (excluyéndolo)
        while (currentScope && currentScope.parent) {
            for (const [key, value] of Object.entries(currentScope.variables)) {
                if (!Object.prototype.hasOwnProperty.call(relevantContext, key)) {
                    relevantContext[key] = value;
                }
            }
            currentScope = currentScope.parent;
        }
        
        return relevantContext;
    }
}