/**
 * Crea un modal dinámico con ElementCreator
 * @param {Object} config - Configuración del modal
 * @param {string} config.title - Título del modal
 * @param {HTMLElement|ElementCreator} config.content - Contenido principal
 * @param {boolean} [config.showCloseButton=true] - Mostrar botón de cerrar
 * @param {boolean} [config.backdropClose=true] - Cerrar al hacer clic fuera
 * @param {Array} [config.footerButtons=[]] - Botones para el footer
 * @param {Object} [config.classes={}] - Clases CSS personalizadas
 * @param {Object} [config.attributes={}] - Atributos HTML personalizados
 * @returns {HTMLElement} Elemento modal completo
 */
function createDynamicModal(config) {
    const {
        title = '',
        content,
        showCloseButton = true,
        backdropClose = true,
        footerButtons = [{ text: 'Aceptar', className: 'btn', onClick: closeModal }],
        classes = {},
        attributes = {}
    } = config;

    // Elementos por defecto
    const defaultClasses = {
        modal: 'modal',
        overlay: 'modal-overlay',
        dialog: 'modal-dialog',
        content: 'modal-content',
        header: 'modal-header',
        title: 'modal-title',
        closeButton: 'modal-close',
        body: 'modal-body',
        footer: 'modal-footer',
        ...classes
    };

    // Crear estructura base del modal
    const modal = ElementCreator.create('div')
        .addClass(defaultClasses.modal)
        .setAttr('tabindex', '-1')
        .setAttr('role', 'dialog')
        .setAttrs(attributes);

    // Overlay
    modal.buildChild('div', overlay => 
        overlay.addClass(defaultClasses.overlay)
        .on('click', () => backdropClose && closeModal())
    );

    // Dialog
    modal.buildChild('div', dialog => 
        dialog.addClass(defaultClasses.dialog)
        .buildChild('div', contentContainer => {
            contentContainer.addClass(defaultClasses.content);
            
            // Header
            const header = ElementCreator.create('div')
            .addClass(defaultClasses.header)
            .buildChild('h3', titleElement => 
                titleElement.addClass(defaultClasses.title)
                .setText(title)
            );
            
            // Botón cerrar (si está habilitado)
            if (showCloseButton) {
                header.buildChild('button', btn => 
                    btn.addClass(defaultClasses.closeButton)
                    .setHtml('&times;')
                    .on('click', closeModal)
                );
            }
            
            contentContainer.addChild(header.getElement());
            
            // Body
            contentContainer.buildChild('div', body => 
            body.addClass(defaultClasses.body)
                .addChild(content instanceof ElementCreator ? content.getElement() : content)
            );
            
            // Footer
            if (footerButtons.length > 0) {
                const footer = ElementCreator.create('div')
                    .addClass(defaultClasses.footer);
                
                footerButtons.forEach(btnConfig => {
                    footer.buildChild('button', btn => 
                    btn.addClass(btnConfig.className || 'btn')
                        .setText(btnConfig.text)
                        .on('click', btnConfig.onClick)
                    );
                });
                
                contentContainer.addChild(footer.getElement());
            }
        })
        );

    const modalElement = modal.getElement();

    // Función para cerrar el modal
    function closeModal() {
        modalElement.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modalElement);
            document.body.classList.remove('modal-open');
        }, 300);
    }

    // Añadir al DOM y activar
    document.body.appendChild(modalElement);
    document.body.classList.add('modal-open');
    
    setTimeout(() => modalElement.classList.add('show'), 10);
    
    return {
        element: modalElement,
        close: closeModal,
    };
}

