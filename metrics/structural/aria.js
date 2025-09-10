function getARIAUsageScore() {
  // Seleccionar los elementos  ARIA
  const ariaElements = document.querySelectorAll(`
    [aria-label], [aria-labelledby], [aria-hidden], [aria-live],
    [aria-busy], [aria-expanded], [aria-pressed], [aria-current],
    [role], [data-aria-label], [data-aria-labelledby], [data-role]
  `);

  // Detectar los elementos interactivos
  const interactiveElements = document.querySelectorAll(`
    a[href], button, input:not([type="hidden"]), select, textarea,
    [tabindex]:not([tabindex="-1"]),
    [role="button"], [role="link"], [role="checkbox"], [role="radio"],
    [role="tab"], [role="menuitem"], [role="option"],
    [class*="btn" i], [class*="button" i], [class*="interactive" i],
    [data-interactive], [data-click], [data-hover],
    [onclick], [onkeydown], [onkeypress], [onmouseover]
  `);

  // Analizar la calidad en términos de uso
  let missingLabels = 0;
  let redundantRoles = 0;
  let incorrectUsage = 0;
  let totalInteractive = interactiveElements.length;
  let totalARIA = ariaElements.length;

  ariaElements.forEach(el => {
    const role = el.getAttribute('role');
    const hasLabel = el.hasAttribute('aria-label') || 
                    el.hasAttribute('aria-labelledby') || 
                    el.hasAttribute('title') ||
                    el.textContent.trim().length > 0;

    // Verificar si tienen etiqueta los elementos que requieren
    if (role && ['button', 'link', 'checkbox', 'radio', 'img', 'heading'].includes(role) && !hasLabel) {
      missingLabels++;
    }

    // Verificar  roles redundantes
    const tagName = el.tagName.toLowerCase();
    if ((tagName === 'button' && role === 'button') ||
        (tagName === 'a' && role === 'link') ||
        (tagName === 'input' && role === 'text' && el.type === 'text')) {
      redundantRoles++;
    }

    // Verificar su uso incorrecto
    if ((role === 'presentation' || role === 'none') && el.tabIndex >= 0) {
      incorrectUsage++;
    }
  });

  // Calcular las métricas normalizando
  const safeTotalARIA = Math.max(1, totalARIA);
  const safeTotalInteractive = Math.max(1, totalInteractive);

  // Área de cobertura
  const coverageScore = Math.min(40, (totalARIA / safeTotalInteractive) * 40);
  
  // Valor de calidad promediado
  const qualityScore = Math.max(0, 60 - (
    (missingLabels / safeTotalARIA * 30) +
    (redundantRoles / safeTotalARIA * 15) +
    (incorrectUsage / safeTotalARIA * 15)
  ));

  const rawScore = coverageScore + qualityScore;
  const normalizedScore = Math.min(100, Math.round(rawScore));

  return {
    score: normalizedScore,
    metrics: {
      totalInteractive,
      totalARIA,
      missingLabels,
      redundantRoles,
      incorrectUsage,
      coverageRatio: (totalARIA / safeTotalInteractive).toFixed(2),
      qualityRatio: (qualityScore / 60).toFixed(2)
    },
    warnings: totalARIA === 0 ? ['No se encontraron atributos ARIA'] : []
  };
}