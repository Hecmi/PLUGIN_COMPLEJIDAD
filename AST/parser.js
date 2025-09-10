class Parser {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.currentToken = null;
        this.nextToken = null;
        this.tokens = [];
        this.position = 0;
    }

    parse(input) {
        this.tokens = this.tokenizer.tokenize(input);
        this.position = 0;
        this.currentToken = this.tokens[0] || null;
        this.nextToken = this.tokens[1] || null;
        return this.parseSequence();
    }

    parseSequence() {
        const expressions = [];
        
        while (this.currentToken && this.currentToken.value !== '}') {
            const expr = this.parseExpression();
            expressions.push(expr);
            
            
            // Solo requerir punto y coma si no es una estructura que no lo necesita
            if (!this.isNoSemicolonNeeded(expr)) {
                if (this.match('separator', ';')) {
                    this.advance();
                } else if (this.currentToken && this.currentToken.value !== '}') {
                    throw new Error(`Expected ';' after expression`);
                }
            }
            
            // Saltar punto y coma si existe (pero no es requerido para ciertas estructuras)
            if (this.match('separator', ';')) {
                this.advance();
            }
        }
        
        return expressions.length === 1 ? expressions[0] : new SequenceNode(expressions);
    }

    isNoSemicolonNeeded(node) {
        return node instanceof BlockNode || 
               node instanceof IfNode || 
               node instanceof ForLoopNode || 
               node instanceof ForOfLoopNode || 
               node instanceof WhileLoopNode || 
               node instanceof FunctionDeclarationNode ||
               node instanceof ArrowFunctionNode;
    }

    advance() {
        this.position++;
        this.currentToken = this.nextToken;
        this.nextToken = this.tokens[this.position + 1] || null;
    }

    expect(type, value = null) {
        if (!this.currentToken || this.currentToken.type !== type) {
            throw new Error(`Expected token type ${type}, but found '${this.currentToken?.type}' '${this.currentToken?.value}'`);
        }
        
        if (value !== null && this.currentToken.value !== value) {
            throw new Error(`Expected value '${value}' but found '${this.currentToken.value}'`);
        }
        
        const token = this.currentToken;
        this.advance();
        return token;
    }

    match(type, value = null) {
        if (!this.currentToken) return false;
        if (this.currentToken.type !== type) return false;
        if (value !== null && this.currentToken.value !== value) return false;
        return true;
    }

    parseExpression() {
        let expr = this.parseAssignment();
        
        if (this.match('operator', '=>')) {
            const params = [];
            
            if (expr.type === 'variable') {
                params.push(expr);
            }
            else if (expr.type === 'sequence') {
                expr.expressions.forEach(e => {
                    if (e.type !== 'variable') {
                        throw new Error('Arrow function parameters must be identifiers');
                    }
                    params.push(e);
                });
            } else {
                throw new Error('Invalid arrow function parameters');
            }
            
            this.expect('operator', '=>');
            return this.parseArrowFunction(params);
        }

        if (this.match('operator', '?')) {
            return this.parseTernary(expr);
        }
        
        return expr;
    }

    parseTernary(condition) {
        this.advance();
        const consequent = this.parseExpression();
        this.expect('colon', ':');
        const alternate = this.parseExpression();
        return new TernaryNode(condition, consequent, alternate);
    }

    parseArrowFunction(params, isAsync = false) {
        let body;
        
        if (this.match('paren', '{')) {
            body = this.parseBlock();
        } else {
            const expr = this.parseExpression();
            body = new BlockNode([new ReturnNode(expr)]);
        }
        
        const paramNames = params.map(param => param.name);
        return new ArrowFunctionNode(paramNames, body, isAsync);
    }
    
    parseAssignment() {
        let left = this.parseLogicalOr();

        while (this.currentToken && this.currentToken.type === 'dot') {
            this.advance();
            const property = this.expect('identifier').value;
            left = new PropertyAccessNode(left, property);
        }
        
        if (this.currentToken && this.currentToken.type === 'operator' && 
            (this.currentToken.value === LANGUAGE_CONFIG.operators.INC || 
             this.currentToken.value === LANGUAGE_CONFIG.operators.DEC)) {
            const operator = this.currentToken.value;
            this.advance();
            
            if (left.type === 'variable' || left.type === 'property' || left.type === 'array_access') {
                return new AssignmentNode(
                    left,
                    new BinaryExpressionNode(
                        operator === LANGUAGE_CONFIG.operators.INC ? '+' : '-',
                        left,
                        new LiteralNode(1)
                    )
                );
            }
            throw new Error(`Invalid increment/decrement target. Expected variable or property but got ${left.type}`);
        }
        
        if (this.currentToken && this.currentToken.type === 'operator') {
            const operator = this.currentToken.value;

            if ([
                LANGUAGE_CONFIG.operators.ASSIGN,
                LANGUAGE_CONFIG.operators.PLUS_EQ,
                LANGUAGE_CONFIG.operators.MINUS_EQ,
                LANGUAGE_CONFIG.operators.MULT_EQ,
                LANGUAGE_CONFIG.operators.DIV_EQ
            ].includes(operator)) {
                this.advance();
                const right = this.parseAssignment();
                
                if (left.type === 'variable' || left.type === 'property' || left.type === 'array_access') {
                    if (operator === LANGUAGE_CONFIG.operators.ASSIGN) {
                        return new AssignmentNode(left, right);
                    } else {
                        const baseOperator = operator.slice(0, -1);
                        return new AssignmentNode(
                            left,
                            new BinaryExpressionNode(baseOperator, left, right)
                        );
                    }
                }
                
                throw new Error(`Invalid assignment target. Expected variable or property but got ${left.type}`);
            }
        }
        
        return left;
    }

    parseLogicalOr() {
        let left = this.parseCoalesce();
        
        while (this.currentToken && this.currentToken.type === 'operator' && 
              this.currentToken.value === LANGUAGE_CONFIG.operators.OR) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseCoalesce();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseComparison();
        
        while (this.currentToken && this.currentToken.type === 'operator' && 
              this.currentToken.value === LANGUAGE_CONFIG.operators.AND) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseComparison();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseCoalesce() {
        let left = this.parseLogicalAnd();
        
        while (this.match('operator', '??')) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseLogicalAnd();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseComparison() {
        let left = this.parseAdditive();
        
        const comparisonOps = new Set([
            '>', '<', LANGUAGE_CONFIG.operators.GTE,
            LANGUAGE_CONFIG.operators.LTE, LANGUAGE_CONFIG.operators.EQ,
            LANGUAGE_CONFIG.operators.NEQ, LANGUAGE_CONFIG.operators.NEQ_ALT
        ]);

        while (this.currentToken && this.currentToken.type === 'operator' &&
            comparisonOps.has(this.currentToken.value)) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseAdditive();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        
        while (this.currentToken && this.currentToken.type === 'operator' && 
              (this.currentToken.value === '+' || this.currentToken.value === '-')) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseMultiplicative();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseMultiplicative() {
        let left = this.parseExponentiation();
        
        while (this.currentToken && this.currentToken.type === 'operator' && 
              (this.currentToken.value === '*' || this.currentToken.value === '/' || this.currentToken.value === '%')) {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseExponentiation();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseExponentiation() {
        let left = this.parseUnary();
        
        while (this.currentToken && this.currentToken.type === 'operator' && this.currentToken.value === '^') {
            const operator = this.currentToken.value;
            this.advance();
            const right = this.parseUnary();
            left = new BinaryExpressionNode(operator, left, right);
        }
        
        return left;
    }

    parseUnary() {
        if (this.currentToken && this.currentToken.type === 'operator' && 
            (this.currentToken.value === '+' || this.currentToken.value === '-' || 
             this.currentToken.value === '!' || this.currentToken.value === LANGUAGE_CONFIG.operators.NOT ||
             this.currentToken.value === LANGUAGE_CONFIG.operators.INC || this.currentToken.value === LANGUAGE_CONFIG.operators.DEC)) {
            const operator = this.currentToken.value;
            this.advance();
            const argument = this.parseUnary();
            return new UnaryExpressionNode(operator, argument);
        }
        
        return this.parsePrimary();
    }

    parsePrimary() {
        if (!this.currentToken) {   
            throw new Error('Expected an expression');
        }
        
        if (this.match('keyword', 'await')) {
            this.advance();
            const expression = this.parseExpression();
            return new AwaitNode(expression);
        }

        if (this.currentToken.type === 'regex') {
            const token = this.currentToken;
            this.advance();
            return new RegexNode(token.pattern, token.flags, token.value);
        }

        if (this.match('keyword', 'new')) {
            return this.parseNewExpression();
        }

        if ((this.match('paren', '(') || this.match('identifier'))
            && this.nextToken && this.nextToken.value === '=>') {
            const params = this.parseArrowFunctionParameters();
            this.expect('operator', '=>');
            return this.parseArrowFunction(params);
        }
        
        if (this.currentToken.type === 'number' || this.currentToken.type === 'string' || this.currentToken.type === 'literal') {
            const token = this.currentToken;
            this.advance();
            return new LiteralNode(token.value);
        }
        
        if (this.currentToken.type === 'paren') {
            if (this.currentToken.value === '(') {
                this.advance();
                const expr = this.parseExpression();
                
                // Si la siguiente expresión es una coma se trata de un arrow function
                if (this.match('comma')) {
                    const params = [];
                    params.push(expr);
                    while (this.currentToken.type === 'comma') {
                        this.advance();
    
                        const paramAF = this.parseExpression();
                        params.push(paramAF);
                        
                        if (paramAF.type !== 'variable') {
                            throw new Error("Error se esperaba una variable para la arrow function, pero se obuvo", paramAF);
                        }

                    }
                    
                    const isArrowFunction = this.match('paren', ')') && this.nextToken && this.nextToken.value == '=>';
                    if (!isArrowFunction) {
                        throw new Error("Mala estructura de parámetros en arrow function");
                    }

                    // Omitir el cierre de paréntesis y el operador
                    this.advance();
                    this.advance();
                    
                    this.parseArrowFunction(params);
                }

                this.expect('paren', ')');
                return expr;
            } else if (this.currentToken.value === '{') {
                return this.parseObject();
            } else if (this.currentToken.value === '[') {
                return this.parseArray();
            }
        }
        
        if (this.currentToken.type === 'identifier') {
            const identifier = this.currentToken.value;
            this.advance();
            
            let left;
            if (this.currentToken && this.currentToken.type === 'paren' && this.currentToken.value === '(') {
                left = this.parseFunctionCall(new VariableNode(identifier));
            } else {
                left = new VariableNode(identifier);
            }
            
            while (this.currentToken) {
                if (this.currentToken.type === 'dot') {
                    this.advance();
                    const property = this.expect('identifier').value;
                    left = new PropertyAccessNode(left, property);
                } else if (this.currentToken.type === 'paren' && this.currentToken.value === '[') {
                    this.advance();
                    const index = this.parseExpression();
                    this.expect('paren', ']');
                    left = new ArrayAccessNode(left, index);
                } else if (this.currentToken.type === 'paren' && this.currentToken.value === '(') {
                    this.advance();
                    const args = [];
                    
                    if (!this.match('paren', ')')) {
                        while (true) {
                            args.push(this.parseExpression());
                            if (!this.match('comma')) break;
                            this.advance();
                        }
                    }
                    
                    this.expect('paren', ')');
                    left = new FunctionCallNode(left, args);
                } else {
                    break;
                }
            }
            
            return left;
        }
        
        if (this.currentToken.type === 'keyword') {
            return this.parseKeywordExpression();
        }
        
        throw new Error(`Unexpected token: ${this.currentToken.type} (${this.currentToken.value})`);
    }

    parseNewExpression() {
        this.expect('keyword', 'new');
        
        if (!this.match('identifier')) {
            throw new Error(`Expected identifier after 'new' but found ${this.currentToken ? this.currentToken.type : 'end of input'}`);
        }

        const constructorName = this.currentToken.value;
        this.advance();
        
        let args = [];
        if (this.match('paren', '(')) {
            this.advance();
            if (!this.match('paren', ')')) {
                args = this.parseArguments();
            }
            this.expect('paren', ')');
        }
        
        let newNode = new NewExpressionNode(constructorName, args);
        
        while (this.currentToken) {
            if (this.currentToken.type === 'dot') {
                this.advance();
                const property = this.expect('identifier').value;
                newNode = new PropertyAccessNode(newNode, property);
            } else if (this.currentToken.type === 'paren' && this.currentToken.value === '[') {
                this.advance();
                const index = this.parseExpression();
                this.expect('paren', ']');
                newNode = new ArrayAccessNode(newNode, index);
            } else if (this.currentToken.type === 'paren' && this.currentToken.value === '(') {
                this.advance();
                const args = [];
                
                if (!this.match('paren', ')')) {
                    while (true) {
                        args.push(this.parseExpression());
                        if (!this.match('comma')) break;
                        this.advance();
                    }
                }
                
                this.expect('paren', ')');
                newNode = new FunctionCallNode(newNode, args);
            } else {
                break;
            }
        }
        
        return newNode;
    }

    parseArguments() {
        const args = [];
        while (true) {
            args.push(this.parseExpression());
            if (!this.match('comma')) break;
            this.advance();
        }
        return args;
    }

    parseArrowFunctionParameters() {
        const params = [];
        
        if (this.match('paren', '(')) {
            this.advance();
            
            if (!this.match('paren', ')')) {
                while (true) {
                    if (this.match('identifier')) {
                        params.push(new VariableNode(this.currentToken.value));
                        this.advance();
                    } else {
                        throw new Error('Expected parameter name');
                    }
                    
                    if (!this.match('comma')) break;
                    this.advance();
                }
            }
            
            this.expect('paren', ')');
        } else if (this.match('identifier')) {
            params.push(new VariableNode(this.currentToken.value));
            this.advance();
        } else {
            throw new Error('Expected arrow function parameters');
        }
        
        return params;
    }

    parseObject() {
        this.expect('paren', '{');
        const properties = [];
        
        if (!this.match('paren', '}')) {
            while (true) {
                const key = this.parseObjectKey();
                this.advance();
                this.expect('colon', ':');
                
                const value = this.parseExpression();
                properties.push({ key, value });
                
                if (!this.match('comma')) break;
                this.advance();
            }
        }
        
        this.expect('paren', '}');
        return new ObjectExpressionNode(properties);
    }

    parseObjectKey() {
        if (this.currentToken.type === 'string') {
            return this.currentToken.value;
        } else if (this.currentToken.type === 'identifier') {
            return this.currentToken.value;
        }
        throw new Error('Object key must be a string or identifier');
    }

    parseArray() {
        this.expect('paren', '[');
        const elements = [];
        
        if (!this.match('paren', ']')) {
            while (true) {
                if (this.match('paren', '[')) {
                    elements.push(this.parseArray());
                } else {
                    elements.push(this.parseExpression());
                }
                
                if (!this.match('comma')) break;
                this.advance();
            }
        }
        
        this.expect('paren', ']');
        return new ArrayNode(elements);
    }

    parseFunctionCall(left) {
        this.expect('paren', '(');
        const args = [];
        
        if (!this.match('paren', ')')) {
            while (true) {
                args.push(this.parseExpression());
                if (!this.match('comma')) break;
                this.advance();
            }
        }
        
        this.expect('paren', ')');
        
        if (typeof left === 'string' || left.type === 'variable') {
            const name = typeof left === 'string' ? left : left.name;
            return new FunctionCallNode(name, args);
        }
        return new FunctionCallNode(left, args);
    }

    parseKeywordExpression() {
        const keyword = this.currentToken.value;
        
        if (keyword === LANGUAGE_CONFIG.keywords.LET) {
            this.advance();
            const nameToken = this.expect('identifier');
            this.expect('operator', LANGUAGE_CONFIG.operators.ASSIGN);
            const value = this.parseExpression();
            return new VariableDeclarationNode(nameToken.value, value);
        }

        if (keyword === LANGUAGE_CONFIG.keywords.AWAIT) {
            this.advance();
            
            const expression = this.parseExpression();
            return new AwaitNode(expression);
        }

        if (keyword === LANGUAGE_CONFIG.keywords.ASYNC) {
            return this.parseAsyncFunction();
        }   
        
        if (keyword === LANGUAGE_CONFIG.keywords.IF) {
            return this.parseIfStatement();
        }
        
        if (keyword === LANGUAGE_CONFIG.keywords.FOR) {
            return this.parseForLoop();
        }
        
        if (keyword === LANGUAGE_CONFIG.keywords.WHILE) {
            return this.parseWhileLoop();
        }
        
        if (keyword === LANGUAGE_CONFIG.keywords.FUNCTION) {
            return this.parseFunctionDeclaration();
        }
        
        if (keyword === LANGUAGE_CONFIG.keywords.RETURN) {
            return this.parseReturn();
        }

        if (keyword === LANGUAGE_CONFIG.keywords.BREAK) {
            this.advance();
            return new BreakNode();
        }

        if (keyword === LANGUAGE_CONFIG.keywords.CONTINUE) {
            this.advance();
            return new ContinueNode();
        }
        
        throw new Error(`Unsupported keyword: ${keyword}`);
    }

    parseAsyncFunction() {
        this.expect('keyword', 'async');
        
        // Puede ser una función con nombre o arrow function
        if (this.match('keyword', 'function')) {
            return this.parseFunctionDeclaration(true);
        }
        
        // Arrow function async
        if ((this.match('paren', '(') || this.match('identifier'))
            && this.nextToken && this.nextToken.value === '=>') {
            const params = this.parseArrowFunctionParameters();
            this.expect('operator', '=>');
            return this.parseArrowFunction(params);
        }
        
        throw new Error('Invalid async function syntax');
    }

    parseIfStatement() {
        this.expect('keyword', LANGUAGE_CONFIG.keywords.IF);
        this.expect('paren', '(');
        
        const condition = this.parseExpression();
        this.expect('paren', ')');
        
        const thenBranch = this.match('paren', '{') ? this.parseBlock() : this.parseExpression();
        
        let elseBranch = null;
        if (this.match('keyword', LANGUAGE_CONFIG.keywords.ELSE)) {
            this.advance();
            elseBranch = this.match('paren', '{') ? this.parseBlock() : this.parseExpression();
        }
        
        return new IfNode(condition, thenBranch, elseBranch);
    }

    parseForLoop() {
        this.expect('keyword', LANGUAGE_CONFIG.keywords.FOR);
        this.expect('paren', '(');
        
        if (this.match('keyword', 'let') && 
            this.nextToken && this.nextToken.type === 'identifier' &&
            this.tokens[this.position + 2] && this.tokens[this.position + 2].value === 'of') {
            return this.parseForOfLoop();
        }

        const initialization = this.parseExpression();
        this.expect('separator', ';');
        
        const condition = this.parseExpression();
        this.expect('separator', ';');
        
        const update = this.parseExpression();
        this.expect('paren', ')');
        
        const body = this.match('paren', '{') ? this.parseBlock() : this.parseExpression();
        
        return new ForLoopNode(initialization, condition, update, body);
    }

    parseForOfLoop() {
        this.expect('keyword', 'let');
        const variable = this.expect('identifier').value;
        this.expect('keyword', 'of');
        
        const iterable = this.parseExpression();
        this.expect('paren', ')'); 
        
        const body = this.match('paren', '{') ? this.parseBlock() : this.parseExpression();
        
        return new ForOfLoopNode(variable, iterable, body);
    }

    parseWhileLoop() {
        this.expect('keyword', LANGUAGE_CONFIG.keywords.WHILE);
        this.expect('paren', '(');
        
        const condition = this.parseExpression();
        this.expect('paren', ')');
        
        const body = this.match('paren', '{') ? this.parseBlock() : this.parseExpression();
        
        return new WhileLoopNode(condition, body);
    }

    parseFunctionDeclaration(isAsync = false) {
        this.expect('keyword', LANGUAGE_CONFIG.keywords.FUNCTION);
        
        let name = null;
        
        if (this.match('identifier')) {
            name = this.currentToken.value;
            this.advance();
        }
        
        this.expect('paren', '(');
        
        const parameters = [];
        if (!this.match('paren', ')')) {
            while (true) {
                const param = this.expect('identifier');
                parameters.push(param.value);
                
                if (!this.match('comma')) break;
                this.advance();
            }
        }
        
        this.expect('paren', ')');
        const body = this.parseBlock();
        
        return name 
            ? new FunctionDeclarationNode(name, parameters, body, isAsync)
            : new FunctionExpressionNode(parameters, body, isAsync);
    }


    parseReturn() {
        this.expect('keyword', LANGUAGE_CONFIG.keywords.RETURN);
        const value = this.currentToken && this.currentToken.value !== ';' && this.currentToken.value !== '}' ? this.parseExpression() : null;
        return new ReturnNode(value);
    }

    parseBlock() {
        this.expect('paren', '{');
        const statements = [];
        
        while (this.currentToken && this.currentToken.value !== '}') {
            statements.push(this.parseExpression());
            if (this.currentToken && this.currentToken.type === 'separator') {
                this.advance();
            }
        }
        
        this.expect('paren', '}');
        return new BlockNode(statements);
    }
}