class MetricExecuter {
    constructor(metrics, engine, context) {
        this.metrics = metrics;
        this.engine = engine;
        this.context = context;
    }

    evaluateMetric(metricName) {

    }

    async evaluateMetricsSimultaneously() {
        const metricsResult = {};
        const context = this.context;

        // Ejecutar todas las métricas simultáneamente
        const promises = this.metrics.map(async metric => {
            let value = 0;
            try {
                value = await this.engine.evaluate(metric.action, context);
            } catch (err) {
                console.error(`Error while the metric ${metric.code} was evaluated:`, err);
                value = 0;
            }
            return {
                code: metric.code,
                value: value,
                weight: metric.weight,
                valueWeighted: value * metric.weight
            };
        });

        const results = await Promise.all(promises);

        // Unificar los resultados de cada métrica
        results.forEach(r => {
            metricsResult[r.code] = {
                value: r.value,
                weight: r.weight,
                valueWeighted: r.valueWeighted
            };
        });

        return metricsResult;
    }

    async evaluateMetrics() {
        let metricsResult = {};
        const metrics = this.metrics;
        const context = this.context;

        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];

            const action = metric.action;
            const weight = metric.weight;
            const code = metric.code;

            const metricResult = await this.engine.evaluate(action, context);
            metricsResult[code] = {
                'value': metricResult,
                'weight': weight,
                'valueWeighted': metricResult * weight,
            }
        }

        return metricsResult;
    }
}