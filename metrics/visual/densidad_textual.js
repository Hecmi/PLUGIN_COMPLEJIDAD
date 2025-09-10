function evaluateTextDensity() {
    // Obtener todos los elementos que contienen texto
    const textElements = [...document.body.querySelectorAll("*")].filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && 
               style.visibility !== "hidden" && 
               el.offsetWidth > 0 && 
               el.offsetHeight > 0 &&
               el.innerText && el.innerText.trim() !== "";
    });

    // Definir umbrales para la cantidad de palabras
    const MIN_WORD_LIMIT = 25;
    const MAX_WORD_LIMIT = 80;

    let validElements = 0;

    textElements.forEach(el => {
        const text = el.innerText.trim();
        const wordCount = text.split(/\s+/).length;

        // Verificar si el elemento está dentro del rango de palabras
        if (wordCount <= MAX_WORD_LIMIT) {
            validElements++;
        }
    });

    // Calcular la proporción de elementos válidos
    const densityScore = validElements / textElements.length;

    // Mostrar el resultado
    console.log(`Densidad textual: ${densityScore.toFixed(2)}`);

    // Evaluar el puntaje
    if (densityScore >= 0.8) {
        console.log("La densidad textual es excelente.");
    } else if (densityScore >= 0.5) {
        console.log("La densidad textual es aceptable.");
    } else {
        console.log("La densidad textual es deficiente.");
    }

    return densityScore;
}

// Ejecutar la función
evaluateTextDensity();