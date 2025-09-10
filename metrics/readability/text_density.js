class TextDensity {
  evaluate() {
    // Obtener todo el HTML de la página
    const html = document.documentElement.outerHTML;
    
    // Calcular tamaño total del HTML (en bytes)
    const totalBlobSize = new Blob([html]).size;
    
    // Extraer el texto visible
    const visibleText = document.body.textContent
      .replace(/\s+/g, ' ')
      .trim();
    
    // Calcular tamaño del texto visible (en bytes)
    const textBlobSize = new Blob([visibleText]).size;
    
    // Calcular densidad (contenido relevante / total)
    const density = textBlobSize / totalBlobSize;
    
    return {
      ratio: density.toFixed(2)
    };
  }
}