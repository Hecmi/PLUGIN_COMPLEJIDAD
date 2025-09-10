class ECARulesEngine {
    constructor(rules = []) {
        this.engine = new ExpressionEngine();
        this.rules = new Map();
        this.addRules(rules);
    }

    registerFunctions(functions) {
        this.engine.registerFunctions(functions);
    }

    registerStructuredFunction(fn) {
        this.engine.registerStructuredFunction(fn);
    }

    addRule(ruleConfig) {
        const rule = new ECARule(ruleConfig);
        rule.compile(this.engine.parser);
        this.rules.set(rule.name, rule);
    }

    addRules(rules) {
        for (const rule of rules) {
            this.addRule(rule);
        }
    }

    clearRules() {
        this.rules.clear();
    }

    getSortedRules() {
        return [...this.rules.values()].sort((a, b) => b.priority - a.priority);
    }

    evaluate(context = {}) {
        const results = [];
        const sortedRules = this.getSortedRules();
        for (const rule of sortedRules) {
            const result = rule.evaluate(this.engine.evaluator, context);
            if (result) {
                results.push(result);
                Object.assign(context, result.context);
            }
        }
        return results;
    }

    evaluateRuleCondition(ruleName, context = {}) {
        const rule = this.rules.get(ruleName);
        return rule ? rule.evaluateCondition(this.engine.evaluator, context) : false;
    }

    evaluateRule(ruleName, context = {}) {
        const results = [];
        const rule = this.rules.get(ruleName);
        if (rule) {
            const result = rule.evaluate(this.engine.evaluator, context);
            if (result) {
                results.push(result);
                Object.assign(context, result.context);
            }
        }
        return results;
    }

    clearContext() {
        this.engine.clearContext();
    }
}
