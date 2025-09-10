class Notifications {
    constructor(AUTODESTROY_SECONDS) {
        this.AUTODESTROY_SECONDS = AUTODESTROY_SECONDS;
        this.notifications = new Set();
        this.containers = {
            'top-left': null,
            'top-right': null
        };
    }

    async init() {
        // Verificar que chrome.runtime.getURL está disponible
        if (!chrome.runtime || !chrome.runtime.getURL) {
            console.error('chrome.runtime.getURL no está disponible');
            // Usar los contenedores del DOM principal
            this.containers['top-left'] = document.querySelector('.notification-container.top-left');
            this.containers['top-right'] = document.querySelector('.notification-container.top-right');
            return;
        }

        try {
            // Realizar la petición para obtener el loader
            const [notificationResponse] = await Promise.all([
                fetch(chrome.runtime.getURL('ui/notifications/notifications.html')),
            ]);

            // Obtener el contenido del loader (html)
            const [notificationContent] = await Promise.all([
                notificationResponse.text()
            ]);

            // Parsear el texto a contenido válido
            this.doc = new DOMParser().parseFromString(notificationContent, 'text/html');

            // Agregar el contenido a la página
            const wrapper = document.createElement('div');
            wrapper.id = 'accessibility-ext-notifications';
            document.body.appendChild(wrapper);

            this.shadowRoot = wrapper.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <style>${this.doc.querySelector('style#style-notification-ext').textContent}</style>
                ${this.doc.querySelector('body').innerHTML}
            `;
            
            // Obtener referencias a los contenedores
            this.containers['top-left'] = this.shadowRoot.querySelector('.top-left');
            this.containers['top-right'] = this.shadowRoot.querySelector('.top-right');
        } catch (error) {
            console.error('Error cargando notificaciones desde extensión:', error);
            // Fallback: usar los contenedores del DOM principal
            this.containers['top-left'] = document.querySelector('.notification-container.top-left');
            this.containers['top-right'] = document.querySelector('.notification-container.top-right');
        }
    }

    /**
     * Crea una nueva notificación
     * @param {string} description - Texto descriptivo de la notificación
     * @param {string} position - Posición ('top-left' o 'top-right')
     * @param {Function} onAccept - Función a ejecutar al hacer clic en Aceptar
     * @param {Function} onClose - Función a ejecutar al hacer clic en Cerrar
     * @returns {string} ID de la notificación creada
     */
    create(description, position = 'top-right', onAccept = null, onClose = null, i18nTags) {
        // Validar posición
        if (!['top-left', 'top-right'].includes(position)) {
            console.error('Posición no válida. Usando top-right por defecto.');
            position = 'top-right';
        }
        
        // Generar ID único
        const id = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Crear elemento de notificación
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        notificationEl.id = id;
        notificationEl.innerHTML = `
            <span class="check">✓</span>
            <div class="content">
                <div class="text-container">
                    <span data-i18n="${i18nTags}" class="description">${description}</span>
                    <div class="timer" data-timer="${this.AUTODESTROY_SECONDS}">
                        <span data-i18n="n.timerCountdown">Se cerrará en</span>
                        <span id="timer-countdown"> ${this.AUTODESTROY_SECONDS} </span>
                        <span data-i18n="n.seconds"> segundos</span>
                    </div> 
                </div>
                <div class="button-group">
                    <button data-i18n="n.accept" class="accept-btn">Aceptar</button>
                    <span class="divider"></span>
                    <span class="close" role="button" aria-label="Close notification">&times;</span>
                </div>
            </div>
        `;
        
        // Agregar al contenedor correspondiente
        this.containers[position].appendChild(notificationEl);
        
        // Configurar eventos
        const acceptBtn = notificationEl.querySelector('.accept-btn');
        const closeBtn = notificationEl.querySelector('.close');
        
        acceptBtn.onclick = () => {
            if (onAccept && typeof onAccept === 'function') {
                onAccept(id);
            }
            // this.remove(id);
        };
        
        closeBtn.onclick = () => {
            if (onClose && typeof onClose === 'function') {
                onClose(id);
            }
            // this.remove(id);
        };
        
        // Guardar en el registro
        this.notifications.add({
            id,
            element: notificationEl,
            description,
            position,
            onAccept,
            onClose
        });


        // if (this.AUTODESTROY_TIME) {
        //     setTimeout(() => {
        //         this.remove(id);
        //     }, this.AUTODESTROY_TIME);
        // }

        return notificationEl;
    }

    showNotification(notification) {
        if (!notification) return;

        notification.className = 'notification show';
    }

    startNotificationTimer(notification) {
        const timerElement = notification.querySelector('.timer');
        let timeLeft = parseInt(timerElement.getAttribute('data-timer'));
        let finalCountdown = notification.querySelector('#timer-countdown');
        const timerInterval = setInterval(() => {
            timeLeft--;
            finalCountdown.textContent = `${timeLeft}`;
            if (timeLeft <= 0) {
            clearInterval(timerInterval);
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
            this.remove(notification.id);
            }
        }, 1000);
    }
    
    /**
     * Elimina una notificación por su ID
     * @param {string} id - ID de la notificación a eliminar
     */
    remove(id) {
        const notification = this.findById(id);
        if (!notification) return;
        
        // Aplicar animación de salida si está disponible
        if (notification.element.classList) {
            notification.element.classList.add('fade-out');
            
            // Esperar a que termine la animación antes de eliminar
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications.delete(notification);
            }, 300);
        } else {
            // Eliminación directa si no hay animación
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(notification);
        }
    }
    
    /**
     * Elimina todas las notificaciones
     */
    clearAll() {
        this.notifications.forEach(notification => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        });
        this.notifications.clear();
    }
    
    /**
     * Busca una notificación por su ID
     * @param {string} id - ID de la notificación
     * @returns {Object|null} Objeto de notificación o null si no se encuentra
     */
    findById(id) {
        for (let notification of this.notifications) {
            if (notification.id === id) return notification;
        }
        return null;
    }
    
    /**
     * Obtiene todas las notificaciones
     * @returns {Array} Array con todas las notificaciones
     */
    getAll() {
        return Array.from(this.notifications);
    }
    
    /**
     * Mueve todas las notificaciones a una posición específica
     * @param {string} position - Posición a la que mover las notificaciones ('top-left' o 'top-right')
     */
    moveAllToPosition(position) {
        // Validar posición
        if (!['top-left', 'top-right'].includes(position)) {
            console.error('Posición no válida. Debe ser "top-left" o "top-right".');
            return;
        }
        
        this.notifications.forEach(notification => {
            // Si la notificación ya está en la posición objetivo, no hacer nada
            if (notification.position === position) return;
            
            // Mover el elemento al contenedor correspondiente
            this.containers[position].appendChild(notification.element);
            
            // Actualizar la posición en el registro
            notification.position = position;
        });
    }
    
    /**
     * Filtra notificaciones por descripción
     * @param {string} searchText - Texto a buscar en las descripciones
     * @returns {Array} Array con las notificaciones que coinciden
     */
    filterByDescription(searchText) {
        return Array.from(this.notifications).filter(notification => 
            notification.description.toLowerCase().includes(searchText.toLowerCase())
        );
    }
    
    /**
     * Cuenta las notificaciones en una posición específica
     * @param {string} position - Posición a contar ('top-left' o 'top-right')
     * @returns {number} Número de notificaciones en esa posición
     */
    countByPosition(position) {
        if (!['top-left', 'top-right'].includes(position)) {
            console.error('Posición no válida. Debe ser "top-left" o "top-right".');
            return 0;
        }
        
        return Array.from(this.notifications).filter(notification => 
            notification.position === position
        ).length;
    }

    t(language) {
        Translator.tPage(this.shadowRoot, language);
    }
}