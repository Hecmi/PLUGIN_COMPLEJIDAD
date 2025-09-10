/**
 * Crea un elemento <select> con un conjunto de opciones predefinidas
 * @param {Object} options - Opciones de configuración del <select>
 * @param {string} [options.label] - Texto del <label>
 * @param {string} [options.id] - ID del select
 * @param {string} [options.name] - Nombre del select
 * @param {string} [options.class] - Clases CSS para el select
 * @param {string} [options.style] - Estilo inline (CSS en texto)
 * @param {boolean} [options.required] - Si el campo es obligatorio
 * @param {Object} [options.attributes] - Otros atributos HTML (ej. disabled, multiple, etc.)
 * @param {Object} [options.config] - Configuración de acceso a las opciones
 * @param {Object} [options.config.options] - Nombre de acceso al objeto que contiene las opciones
 * @param {Object} [options.config.show] - Nombre de acceso al objeto que contiene la opción a mostrar
 * @param {Object} [options.config.value] - Nombre de acceso al objeto del valor interno de la opción
 * @param {Array} options.values - Array de opciones para el <select>. Puede ser:
 *   - Array de strings → ["opción1", "opción2"]
 *   - Array de objetos → [{ options.config.value: "v1", options.config.show: "Opción 1" }]
 * @returns {HTMLElement} Elemento <div> conteniendo el label y el select
 */
function createListedElement(options = {}) {
    // Verificar que el conjunto de opciones sea un arreglo
    if (!Array.isArray(options[options.config.options])) {
      throw new Error("El parámetro 'values' debe ser un array.");
    }

    // Crear el div que contendrá los elementos html
    const wrapper = document.createElement("div");

    // Crear el label
    const label = document.createElement("label");
    label.textContent = options.label || "Seleccione una opción:";

    // Crear el select
    const select = document.createElement("select");

    // Aplicar los atributos definidos en las opciones
    applyAttributes(select, options);

    // Agrega las opciones
    options[options.config.options].forEach(opt => {

      // Crear el tag correspondiente a la opción
      const option = document.createElement("option");

      // Sí el tipo es string, definir el mismo valor mostrado y controlado internamente.
      // Sí es un objeto entonces colocar los valores correspondientes
      if (typeof opt === "string") {
        option.value = opt;
        option.textContent = opt;
      } else if (typeof opt === "object" && opt !== null) {
        option.value = opt[options.config.value];
        option.textContent = opt.label || opt[options.config.show];
      }

      // Agregar las opciones al select
      select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}
