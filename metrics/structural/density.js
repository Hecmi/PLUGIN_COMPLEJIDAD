/**
 * Calcula la densidad de ocupación REAL de la página
 * @param {boolean} [viewportOnly=true] - Calcular solo el área visible o toda la pantalla
 * @returns {Object} - Métricas precisas de densidad
 */
function calculateTrueDensity(viewportOnly = true) {
    // Cálcular el área del viewport y de la página
    const viewportArea = window.innerWidth * window.innerHeight;
    const pageArea = document.documentElement.scrollWidth * document.documentElement.scrollHeight;

    // Área de referencia según el parámetro especificado
    const referenceArea = viewportOnly ? viewportArea : pageArea;
    
    // Algoritmo de mapa de bits
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar el tamaño del canvas según el tamaño de referencia
    canvas.width = viewportOnly ? window.innerWidth : document.documentElement.scrollWidth;
    canvas.height = viewportOnly ? window.innerHeight : document.documentElement.scrollHeight;
    
    // Inicar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0,0,0)';
    
    // Recorrer los elementos
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        try {
            const rect = el.getBoundingClientRect();
            if (viewportOnly && (rect.right < 0 || rect.bottom < 0 || 
                rect.left > canvas.width || rect.top > canvas.height)) return;
                
            ctx.fillRect(
                Math.max(0, rect.left), 
                Math.max(0, rect.top),
                Math.min(rect.width, canvas.width - rect.left),
                Math.min(rect.height, canvas.height - rect.top)
            );
        } catch(e) { 

         }
    });
    
    // Analizar píxeles ocupados
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelBuffer = new Uint32Array(imageData.data.buffer);
    let occupiedPixels = 0;
    
    // Recorrer el buffer para identificar los píxeles ocupados
    for (let i = 0; i < pixelBuffer.length; i++) {
        if (pixelBuffer[i] !== 0) occupiedPixels++;
    }
    
    // Calcular la densidad real
    const totalPixels = canvas.width * canvas.height;
    const trueDensity = (occupiedPixels / totalPixels) * 100;
    
    // Métricas
    return {
        density: trueDensity.toFixed(4) + '%',
        theoreticalMax: ((allElements.length * 100) / totalPixels).toFixed(2) + '%',
        coverageRatio: (occupiedPixels / totalPixels).toFixed(4),
        absolute: {
            occupiedPixels,
            totalPixels,
            elements: allElements.length
        },
        warning: occupiedPixels > totalPixels ? 
            'Superposición detectada' : null
    };
}


function calculateVisibleDensity(viewportOnly = true) {
    // Configuración de áreas
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;
    const referenceArea = viewportOnly ? viewportWidth * viewportHeight : pageWidth * pageHeight;

    // Almacenamiento de áreas no superpuestas
    const nonOverlappingRects = [];
    let totalVisibleArea = 0;

    // Verificar visibilidad
    function isVisible(el) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) 
            return false;

        const rect = el.getBoundingClientRect();
        return rect.width > 0 && 
               rect.height > 0 &&
               (!viewportOnly || (
                   rect.bottom > 0 &&
                   rect.right > 0 &&
                   rect.left < viewportWidth &&
                   rect.top < viewportHeight
               ));
    }

    // Función para calcular área no superpuesta
    function addVisibleArea(el) {
        const rect = el.getBoundingClientRect();
        const newRect = {
            left: Math.max(0, rect.left),
            top: Math.max(0, rect.top),
            right: Math.min(viewportOnly ? viewportWidth : pageWidth, rect.right),
            bottom: Math.min(viewportOnly ? viewportHeight : pageHeight, rect.bottom),
            area: 0
        };
        
        newRect.width = newRect.right - newRect.left;
        newRect.height = newRect.bottom - newRect.top;
        newRect.area = newRect.width * newRect.height;

        if (newRect.area <= 0) return 0;

        // Calcular superposición con áreas existentes
        let overlapArea = 0;
        for (const existing of nonOverlappingRects) {
            const xOverlap = Math.max(0, Math.min(newRect.right, existing.right) - Math.max(newRect.left, existing.left));
            const yOverlap = Math.max(0, Math.min(newRect.bottom, existing.bottom) - Math.max(newRect.top, existing.top));
            overlapArea += xOverlap * yOverlap;
        }

        const effectiveArea = newRect.area - overlapArea;
        if (effectiveArea > 0) {
            nonOverlappingRects.push(newRect);
            return effectiveArea;
        }
        return 0;
    }

    // Procesar elementos visibles
    const elements = Array.from(document.querySelectorAll('*'));
    let visibleCount = 0;

    elements.forEach(el => {
        if (isVisible(el)) {
            totalVisibleArea += addVisibleArea(el);
            visibleCount++;
        }
    });

    // Cálculo de densidad
    const density = referenceArea > 0 ? (totalVisibleArea / referenceArea) * 100 : 0;

    return {
        density: Math.min(100, density).toFixed(2) + '%',
        elementsTotal: elements.length,
        elementsVisible: visibleCount,
        visibleRatio: (visibleCount / elements.length * 100).toFixed(1) + '%',
        area: {
            visible: Math.round(totalVisibleArea),
            reference: Math.round(referenceArea),
            coverage: (totalVisibleArea / referenceArea).toFixed(4)
        }
    };
}