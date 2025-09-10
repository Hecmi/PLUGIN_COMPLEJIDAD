function evaluateTextElements() {
    const textElements = [...document.body.querySelectorAll("*")].filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && 
               style.visibility !== "hidden" && 
               el.offsetWidth > 0 && 
               el.offsetHeight > 0 &&
               el.innerText && el.innerText.trim() !== "";
    });

    // Índice de Flesch-Kincaid mínimo para considerar el texto legible
    // https://es.wikipedia.org/wiki/Prueba_de_legibilidad_de_Flesch-Kincaid
    const VALID_INDEX = 80;
    let totalScore = 0;

    textElements.forEach(el => {
        const text = el.innerText.trim();

        // Calcular la legibilidad del texto
        const readabilityIndex = calculateReadability(text);
        console.log(readabilityIndex)

        if (readabilityIndex >= VALID_INDEX)
            totalScore ++;
    });


    //averageScore = Math.max(0, Math.min(totalScore / textElements.length, 1));
    averageScore = totalScore / textElements.length;
    console.log(`Puntaje promedio de legibilidad: ${averageScore.toFixed(2)}`);

    if (averageScore >= 0.8) {
        console.log("La legibilidad del texto es excelente.");
    } else if (averageScore >= 0.5) {
        console.log("La legibilidad del texto es aceptable.");
    } else {
        console.log("La legibilidad del texto es deficiente.");
    }

    return averageScore;
}

// Función para calcular el Índice de Legibilidad de Flesch-Kincaid
function calculateReadability(text) {
    const words = text.split(/\s+/).length;             // Número de palabras
    const sentences = text.split(/[.!?]+/).length;      // Número de oraciones
    const syllables = countSyllables(text);             // Número de sílabas

    // Fórmula del Índice de Flesch-Kincaid
    // const fleschIndex = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    const fleschIndex = 0.39 - ((words / sentences)) + (11.8 * (syllables / words)) - 15.59;
    //const fleschIndex = 206.84 - (1.02 * (words / sentences)) - (60 * (syllables / words));
    return fleschIndex;
}   

function countSyllables(text) { 
    const words = text.split(/\s+/);
    let syllableCount = 0;

    words.forEach(word => {
        // Contar las vocales como sílabas (TODO)
        const vowelMatches = word.match(/[aeiouáéíóúü]{1,2}/gi);
        syllableCount += vowelMatches ? vowelMatches.length : 1;
    });

    return syllableCount;
}

// Ejecutar la función
evaluateTextElements();