let width = Math.max(
    document.documentElement.scrollWidth, 
    document.body.scrollWidth,
    document.documentElement.clientWidth
);

let height = Math.max(
    document.documentElement.scrollHeight, 
    document.body.scrollHeight,
    document.documentElement.clientHeight
);

// Definir los ratios "estéticos", como 
// Square, Golden Ratio (invertido), sqrt(2), sqrt(3), 1
const aesthetic_ratios = [0.5, 0.618, 0.707, 0.577, 1];  

function calculate_proportion(w, h) {
    return Math.min(w, h) / Math.max(w, h);
}

function calculate_diff(proportion) {
    let minDiff = Infinity;

    // Calcular y encontrar el ratio con el que presenta menor diferencia
    for (let ratio of aesthetic_ratios) {
        const diff = Math.abs(proportion - ratio);
        if (diff < minDiff) {
            minDiff = diff;
        }
    }

    // CCalcular la diferencia entre la proporción
    // Normalizando el valor entre -1 y 1
    return (1 - 2 * minDiff);
    //return (1 - minDiff);
}

function compute_avarage_proportion() {
    const elements = document.querySelectorAll('*');
    let total_object_diff = 0;
    let total_elements = 0;

    for (let element of elements) {
        const rect = element.getBoundingClientRect();

        if (rect.top < 0 || rect.left < 0 || rect.bottom > height || rect.right > width || rect.width <= 0 || rect.height <= 0) {
            continue;
        }

        // Calcular la proporcion y diferencia de los elementos
        const object_proportion = calculate_proportion(rect.width, rect.height);
        const object_diff = calculate_diff(object_proportion);
        total_object_diff += object_diff;

        total_elements++;
    };

    // Si no hay elementos visibles, retornar para evitar la división entre cero
    if (total_elements === 0) {
        return 0;
    }

    // Calcular la proporción general de la página web
    const layout_proportion = calculate_proportion(width, height);
    const layout_diff = calculate_diff(layout_proportion);

    // Calcular la proporción promedio de la página
    const avarage_diff = total_object_diff / total_elements;
    //const total_proportion = (object_proportion * 0.9 + layout_diff * 0.1);
    
    const total_proportion = (avarage_diff + layout_diff) / 2;
    console.log(avarage_diff, layout_diff);

    return total_proportion;
}


const mean_proportion = compute_avarage_proportion();
console.log("Proportion = ", mean_proportion);
if (mean_proportion > 0.8) {
    console.log("El diseño de la página puede considerarse altamente placentero");
} else if (mean_proportion > 0.6) {
    console.log("La página esta balanceada estéticamente");
} else {
    console.log("La página tiene una alineación estéticamente baja");
}
