class ASTNode {
    constructor(type) {
        this.type = type;
    }
}

class LiteralNode extends ASTNode {
    constructor(value) {
        super('literal');
        this.value = value;
    }
}

class VariableNode extends ASTNode {
    constructor(name) {
        super('variable');
        this.name = name;
    }
}

class BinaryExpressionNode extends ASTNode {
    constructor(operator, left, right) {
        super('binary');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class UnaryExpressionNode extends ASTNode {
    constructor(operator, argument) {
        super('unary');
        this.operator = operator;
        this.argument = argument;
    }
}

class FunctionCallNode extends ASTNode {
    constructor(name, args) {
        super('function');
        this.name = name;
        this.arguments = args;
    }
}

class PropertyAccessNode extends ASTNode {
    constructor(object, property) {
        super('property');
        this.object = object;
        this.property = property;
    }
}

class AssignmentNode extends ASTNode {
    constructor(target, value) {
        super('assignment');
        this.target = target;
        this.value = value;
    }
}

class VariableDeclarationNode extends ASTNode {
    constructor(name, value, isAsync, toAsync) {
        super('declaration');
        this.name = name;
        this.value = value;
        this.isAsync = isAsync;
        this.toAsync = toAsync;
    }
}

class SequenceNode extends ASTNode {
    constructor(expressions) {
        super('sequence');
        this.expressions = expressions;
    }
}

class IfNode extends ASTNode {
    constructor(condition, thenBranch, elseBranch) {
        super('if');
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

class ForLoopNode extends ASTNode {
    constructor(initialization, condition, update, body) {
        super('for');
        this.initialization = initialization;
        this.condition = condition;
        this.update = update;
        this.body = body;
    }
}

class WhileLoopNode extends ASTNode {
    constructor(condition, body) {
        super('while');
        this.condition = condition;
        this.body = body;
    }
}

class FunctionDeclarationNode extends ASTNode {
    constructor(name, parameters, body, isAsync) {
        super('function_declaration');
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.isAsync = isAsync;
    }
}

class FunctionExpressionNode {
    constructor(parameters, body, isAsync) {
        this.type = 'function_expression';
        this.parameters = parameters;
        this.body = body;
        this.isAsync = isAsync;
    }
}

class ReturnNode extends ASTNode {
    constructor(value) {
        super('return');
        this.value = value;
    }
}

class BlockNode extends ASTNode {
    constructor(statements) {
        super('block');
        this.statements = statements;
    }
}

class ObjectExpressionNode extends ASTNode {
    constructor(properties) {
        super('object_expression');
        this.properties = properties;
    }
}

class ArrowFunctionNode extends ASTNode {
    constructor(params, body, isAsync) {
        super('arrow_function');
        this.params = params;
        this.body = body;
        this.isAsync = isAsync;
    }
}

class RegexNode extends ASTNode {
    constructor(pattern, flags, value) {
        super('regex'); 
        this.pattern = pattern;
        this.body = flags;
        this.value = value;
    }
}

class TernaryNode extends ASTNode {
    constructor(condition, consequent, alternate) {
        super('ternary'); 
        this.condition = condition;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class NewExpressionNode extends ASTNode {
    constructor(name, args) {
        super('new_expression'); 
        this.name = name;
        this.args = args;
    }
}   

class ForOfLoopNode extends ASTNode {
    constructor(variable, iterable, body) {
        super('forOfLoop');
        this.variable = variable;
        this.iterable = iterable;
        this.body = body;
    }
}

class BreakNode extends ASTNode {
    constructor() {
        super('break');
    }
}

class ContinueNode extends ASTNode {
    constructor() {
        super('continue');
    }
}

class ArrayNode extends ASTNode {
    constructor(elements) {
        super('array');
        this.elements = elements;
    }
}

class ArrayAccessNode extends ASTNode {
    constructor(array, index) {
        super('array_access');
        this.array = array;
        this.index = index;
    }
}

class AwaitNode extends ASTNode {
    constructor(expression) {
        super('await');
        this.expression = expression;
    }
}