class ToggleNotifications {
    constructor() {
        this.notifications = new Map();
    }

    /**
     * Crea una nueva notificación con toggle
     * @param {string} description - Texto de la notificación
     * @param {Function} onEnable - Acción cuando el toggle se activa
     * @param {Function} onDisable - Acción cuando el toggle se desactiva
     * @returns {HTMLElement} Elemento de la notificación creado
     */
    create(description, onEnable = null, onDisable = null, i18nTags) {
        const id = 'toggle-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        notificationEl.id = id;
        notificationEl.innerHTML = `
            <span class="check">✓</span>
            <div class="content">
                <span data-i18n="${i18nTags}" class="description">${description}</span>
                <div class="button-group">
                    <label class="toggle-button">
                        <input type="checkbox" aria-label="Toggle notification">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;

        const toggleInput = notificationEl.querySelector('input[type="checkbox"]');
        toggleInput.addEventListener('change', () => {
            if (toggleInput.checked) {
                if (onEnable && typeof onEnable === 'function') {
                    onEnable(id);
                }
            } else {
                if (onDisable && typeof onDisable === 'function') {
                    onDisable(id);
                }
            }
        });

        this.notifications.set(id, {
            id,
            element: notificationEl,
            description,
            onEnable,
            onDisable,
            toggleInput
        });

        return notificationEl;
    }
    
    /**
     * Crea una nueva notificación con toggle
     * @param {string} description - Texto de la notificación
     * @param {Function} onEnable - Acción cuando el toggle se activa
     * @param {Function} onDisable - Acción cuando el toggle se desactiva
     * @returns {string} ID de la notificación creada
     */
    createAndAdd(container, description, onEnable = null, onDisable = null) {
        const id = 'toggle-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        notificationEl.id = id;
        notificationEl.innerHTML = `
            <span class="check">✓</span>
            <div class="content">
                <span class="description">${description}</span>
                <div class="button-group">
                    <label class="toggle-button">
                        <input type="checkbox" aria-label="Toggle notification">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;

        container.appendChild(notificationEl);

        const toggleInput = notificationEl.querySelector('input[type="checkbox"]');
        toggleInput.addEventListener('change', () => {
            if (toggleInput.checked) {
                if (onEnable && typeof onEnable === 'function') {
                    onEnable(id);
                }
            } else {
                if (onDisable && typeof onDisable === 'function') {
                    onDisable(id);
                }
            }
        });

        this.notifications.set(id, {
            id,
            element: notificationEl,
            description,
            onEnable,
            onDisable,
            toggleInput
        });

        return id;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
        this.notifications.delete(id);
    }

    clearAll() {
        this.notifications.forEach(n => {
            if (n.element.parentNode) {
                n.element.parentNode.removeChild(n.element);
            }
        });
        this.notifications.clear();
    }

    getAll() {
        return Array.from(this.notifications.values());
    }

    setToggleState(id, state) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        notification.toggleInput.checked = state;
        notification.toggleInput.dispatchEvent(new Event('change'));
    }

    setToggleStateElement(notification, state) {
        if (!notification) return;
        notification.toggleInput.checked = state;
        notification.toggleInput.dispatchEvent(new Event('change'));
    }

    isToggled(id) {
        const notification = this.notifications.get(id);
        return notification ? notification.toggleInput.checked : false;
    }
}
