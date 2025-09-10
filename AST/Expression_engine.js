class ExpressionEngine {
    constructor() {
        this.parser = new Parser();
        this.evaluator = new Evaluator(this.parser);
    }

    registerFunctions(functions) {
        this.evaluator.registerFunctions(functions);
    }

    registerStructuredFunction(fn) {
        this.evaluator.registerStructuredFunction(fn);
    }


    async evaluate(expression, context = {}) {
        try {
            const ast = this.parser.parse(expression);
            
            // Crear un nuevo ambiente para el contexto actual de ejecución
            const evalScope = this.evaluator.currentScope.createChild();
            
            //Agregar las variables al ambiente de ejecución de la expresión 
            for (const [key, value] of Object.entries(context)) {
                evalScope.declare(key, value);
            }

            const result = await this.evaluator.evaluate(ast, evalScope);

            return result;
        } catch (error) {
            throw error;
        }
    }

    parse(expression) {
        return this.parser.parse(expression);
    }

    clearContext() {
        this.evaluator.clearContext();
    }

    getContext() {
        return this.evaluator.getContext();
    }

    getGlobalContext() {
        return this.evaluator.getGlobalContext();
    }

    setGlobalVariable(name, value) {
        this.evaluator.globalScope.declare(name, value);
    }
}