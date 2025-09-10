function getFontSizeCount() {
    // Seleccionar solo elementos visibles que contienen texto
    const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' &&
               el.textContent.trim() !== '' &&
               parseFloat(style.fontSize) > 0;
    });

    // Agrupar tamaños de fuente considerando valores cercanos como iguales
    const fontSizes = new Set();
    const SIZE_TOLERANCE = 0.5;

    textElements.forEach(el => {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
        let foundSimilar = false;
        
        // Verificar si ya existe un tamaño similar
        fontSizes.forEach(existingSize => {
            if (Math.abs(existingSize - fontSize) <= SIZE_TOLERANCE) {
                foundSimilar = true;
            }
        });
        
        if (!foundSimilar) {
            fontSizes.add(fontSize);
        }
    });

    return fontSizes.size;
}

function getFontFamilyCount() {
    // Obtener todos los elementos con texto visible
    const textElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' &&
               el.textContent.trim() !== '';
    });

    // Normalizar nombres de fuentes (eliminar comillas, estilos, etc.)
    const fontFamilies = new Set();
    const FONT_STACK_SEPARATOR = /,\s*/;

    textElements.forEach(el => {
        const fontFamily = window.getComputedStyle(el).fontFamily;
        
        // Separar fuentes alternativas (font stacks)
        const fonts = fontFamily.split(FONT_STACK_SEPARATOR)
            .map(f => f.replace(/['"]/g, '').trim())
            .filter(f => f && !f.match(/^(serif|sans-serif|monospace)$/i));
        
        if (fonts.length > 0) {
            fontFamilies.add(fonts[0]);
        }
    });

    return fontFamilies.size;
}