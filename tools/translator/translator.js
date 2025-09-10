class Translator {
    static TRANSLATIONS = {
        en: {
            // Popup
            "pop.name": "Name",
            "pop.mail": "Email",
            "pop.email": "Email",
            "pop.userExample": "Example user",
            "pop.helpText": "Account information. Not editable.",
            "pop.password": "Password",
            "pop.translatePage": "Translate page",
            "pop.createAccount": "Create account",
            "pop.editAccount": "Edit account",
            "pop.login": "Log in",
            "pop.logout": "Log out",
            "pop.welcome": "Welcome",
            "pop.showPassword": "Show password",
            "pop.hidePassword": "Hide password",
            "pop.badCredentials": "The credentials entered are incorrect",

            // Perfil de usuario
            "uP.userProfile": "User profile",
            "uP.save": "Save",
            "uP.close": "Close",
            "uP.required": "Required",
            "uP.dataSaved": "Data saved",
            "uP.dataSavedDescription": "Your user profile data has been saved successfully",
            "uP.closePage": "Close page",
            "uP.closePageConfirmation": "Are you sure you want close this page?",
            "uP.required": "required",

            // Datos del panel de accesibilidad
            "aP.panelName": "Accessibility center",
            "aP.titleIntroOptions": "Customize your browsing experience",
            "aP.descriptionIntroOptions": "Expand the following categories and adjust the options to best suit your needs.",
            "aP.optionsTab": "Options",
            "aP.adaptationsTab": "Adaptations",
            "aP.notificationConfiguration": "Notification settings",
            "aP.configuration": "Configuration",
            "aP.configurationDescription": "Configure the notifications and location of the access center according to your preferences.",
            "aP.locationDescription": "Select the location of the dashboard according to your preferences.",

            // Tab de opciones de accesibilidad
            "aP.adaptationPresentation": "Adaptation of the presentation",
            "aP.adaptationContent": "Adaptation of the content",
            "aP.adaptationStructure": "Adaptation of the structure",
            "aP.adaptationInteraction": "Adaptation of the interaction",
            "aP.adaptationLocation": "Location of the panel",
            "aP.reset": "Reset",
            "aP.needAditionalHelp": "Do you need additional help?",
            
            // Tab de adaptaciones
            "aP.recommendations": "Recommendations",
            "aP.recommendationsDescription": "It is recommended to apply the suggested adaptations according to your user profile and the evaluation of the website (",
            "aP.showNotifications": "Show notifications",
            "aP.dontShowAccept": "Do not show and accept",
            "aP.dontShowReject": "Do not show and reject",
            "aP.acceptAll": "Accept all",
            "aP.rejectAll": "Reject all",
            "aP.complex": "complex)",

            // Herramientas del panel
            "aP.size": "Size",
            "aP.typography": "Typography",
            "aP.colorBlindness": "Color blindness",
            "aP.colorFilter": "Color filter",
            "aP.colors": "Colors",
            "aP.highlight": "Highlight",
            "aP.images": "Images",
            "aP.lineSpacing": "Line spacing",
            "aP.letterSpace": "Letter space",
            "aP.wordSpace": "Word space",
            "aP.cursor": "Cursor",
            "aP.animations": "Animations",
            "aP.guideLine": "Guide line",
            "aP.guideWindow": "Guide window",
            "aP.lens": "Magnifying glass",
            "aP.highlightSelection": "Highlight selection",
            "aP.readSelection": "Read selection",
            "aP.readAll": "Read all",
            "aP.voice": "Voice",
            "aP.language": "Language",
            "aP.textAlign": "Alignment",
            "aP.paragraphSpacing": "Paragraph spacing",
            "aP.altText": "Alternative text",

            // Estado de las herramientas
            "aP.normal": "Normal",
            "aP.small": "Small",
            "aP.big": "Big",
            "aP.extraBig": "Extra big",
            "aP.medium": "Medium",
            "aP.wide": "Wide",
            "aP.any": "None",
            "aP.none": "None",
            "aP.hide": "Hide",
            "aP.show": "Show",
            "aP.stop": "Stop",
            "aP.continue": "Continue",
            "aP.active": "Activate",
            "aP.deactive": "Deactive",
            "aP.read": "Read",
            "aP.buttons": "Buttons",
            "aP.links": "Links",
            "aP.titles": "Titles",
            "aP.all": "All",
            "aP.protanopia": "Protanopia",
            "aP.deuteranopia": "Deuteranopia",
            "aP.tritanopia": "Tritanopia",
            "aP.incrementSizeOnHover": "Hover expand",
            "aP.left": "Left",
            "aP.center": "Center",
            "aP.right": "Right",
            "aP.justify": "Justify",
            "aP.overImage": "Over image",
            "aP.followCursor": "Follow cursor",
            "aP.apply": "Apply",

            "aP.highContrast": "High contrast",
            "aP.inverted": "Inverted",
            "aP.gray": "Gray",
            "aP.sepia": "Sepia",
            "aP.loading": "Loading...",
            "aP.read": "Read",
            "aP.contactUs": "Contact us",

            "aP.summarize": "Summarize",
            "aP.summarizeContent": "Summarize content",
            "aP.summarizePage": "Summarize page",

            "aP.abstractiveSummary": "Abstractive summary",
            "aP.extractiveSummary": "Extractive summary",
            "aP.simplifyPage": "Simplify page",

            // Ubicaciones
            "aP.topLeft": "Top left",
            "aP.topRight": "Top right",
            "aP.bottomLeft": "Bottom left",
            "aP.bottomRight": "Bottom right",

            // Notificaciones
            "n.timerCountdown": "Will dissapear in",
            "n.seconds": "seconds",
            "n.accept": "Accept",

            // Lenguajes
            "lan.spanish": "Spanish",
            "lan.english": "English",

            // Loader
            "l.loadUserProfile": "Loading user profile...",
            "l.loadActionsAndRules": "Loading actions and rules...",
            "l.evaluatingMetrics": "Evaluating metrics...",
            "l.completedProcess": "Process completed",
            "l.loaderTitle": "Loading extension",
            "l.loaderDescription": "Please wait, this process may take a few seconds.",
            "l.loaderPolite": "Loading, please wait",

            // Modal
            "m.summary": "Summary",
            "m.generatingAbstracticSummary": "Generating abstractive summary...",
            "m.generatingExtractiveSummary": "Generating extractive summary...",
            "m.generatingSimplifiedPage": "Generating simplified page...",

            // Validations
            "v.required": "This field is required",
            "v.email": "Enter a valid email address",
            "v.phone": "Enter a valid phone number",
            "v.password": "Password must be at least 8 characters long, with an uppercase, lowercase, and a number",
            "v.number": "Enter a valid number",
            "v.minLength": (minLength) => `Text must be at least ${minLength} characters`,
            "v.maxLength": (maxLength) => `Text must not exceed ${maxLength} characters`,
            "v.min": (min) => `Number must be greater than or equal to ${min}`,
            "v.max": (max) => `Number must be less than or equal to ${max}`,
            "v.pattern": "Invalid format",
            "v.radioRequired": "Select an option",
            "v.checkboxRequired": "You must accept this field",
            "v.duplicateEmail": "The email entered has already been registered"
        },
        es: {
            // Popup
            "pop.name": "Nombre",
            "pop.mail": "Correo",
            "pop.email": "Correo electrónico",
            "pop.userExample": "Usuario ejemplo",
            "pop.helpText": "Información de cuenta. No editable.",
            "pop.password": "Contraseña",
            "pop.translatePage": "Traducir página",
            "pop.createAccount": "Crear cuenta",
            "pop.editAccount": "Editar cuenta",
            "pop.login": "Iniciar sesión",
            "pop.logout": "Cerrar sesión",
            "pop.welcome": "Bienvenido",
            "pop.showPassword": "Mostrar contraseña",
            "pop.hidePassword": "Ocultar contraseña",
            "pop.badCredentials": "Las credenciales ingresadas son incorrectas",

            // Perfil de usuario
            "uP.userProfile": "Perfil de usuario",
            "uP.save": "Guardar",
            "uP.close": "Cerrar",
            "uP.required": "Requerido",
            "uP.dataSaved": "Datos guardados",
            "uP.dataSavedDescription": "Los datos de su perfil de usuario se han guardado correctamente",
            "uP.closePage": "Cerrar página",
            "uP.closePageConfirmation": "¿Está seguro que desea salir de su perfil de usuario?",
            "uP.required": "requerido",

            // Datos del panel de accesibilidad
            "aP.panelName": "Centro de accesibilidad",
            "aP.titleIntroOptions": "Personaliza tu experiencia de navegación",
            "aP.descriptionIntroOptions": "Despliega las siguientes categorías y ajusta las opciones para que el contenido se adapte a tus necesidades.",
            "aP.optionsTab": "Opciones",
            "aP.adaptationsTab": "Adaptaciones",
            "aP.notificationConfiguration": "Configuración de notificaciones",
            "aP.configuration": "Configuración",
            "aP.configurationDescription": "Configura las notificaciones y ubicación del centro de accesibiidad acorde a tus preferencias.",
            "aP.locationDescription": "Selecciona la ubicación del panel acorde a tus preferencias.",

            // Tab de opciones de accesibilidad
            "aP.adaptationPresentation": "Adaptación de la presentación",
            "aP.adaptationContent": "Adaptación del contenido",
            "aP.adaptationStructure": "Adaptación de la estructura",
            "aP.adaptationInteraction": "Adaptación de la interacción",
            "aP.adaptationLocation": "Ubicación del panel",
            "aP.reset": "Reiniciar",
            "aP.needAditionalHelp": "¿Necesita ayuda adicional?",

            // Tab de adaptaciones
            "aP.recommendations": "Recomendaciones",
            "aP.recommendationsDescription": "Se recomienda aplicar las siguientes adaptaciones acordes a su perfil de usuario y la evaluación de la página web (",
            "aP.showNotifications": "Mostrar notificaciones",
            "aP.dontShowAccept": "No mostrar y aceptar",
            "aP.dontShowReject": "No mostrar y rechazar",
            "aP.acceptAll": "Aceptar todas",
            "aP.rejectAll": "Rechazar todas",
            "aP.complex": "compleja)",

            // Herramientas del panel
            "aP.size": "Tamaño",
            "aP.typography": "Tipografía",
            "aP.colorBlindness": "Daltonismo",
            "aP.colorFilter": "Filtro color",
            "aP.colors": "Colores",
            "aP.highlight": "Resaltar",
            "aP.images": "Imágenes",
            "aP.lineSpacing": "Interlineado",
            "aP.letterSpace": "Esp. letras",
            "aP.wordSpace": "Esp. palabras",
            "aP.cursor": "Cursor",
            "aP.animations": "Animaciones",
            "aP.guideLine": "Línea guía",
            "aP.guideWindow": "Ventana guía",
            "aP.lens": "Lupa",
            "aP.highlightSelection": "Resaltar elección",
            "aP.readSelection": "Leer selección",
            "aP.readAll": "Leer todo",
            "aP.voice": "Voz",
            "aP.language": "Idioma",
            "aP.textAlign": "Alineación",
            "aP.paragraphSpacing": "Esp. párrafos",
            "aP.altText": "Texto alternativo",

            // Estados de las herramientas
            "aP.normal": "Normal",
            "aP.small": "Pequeño",
            "aP.big": "Grande",
            "aP.extraBig": "Extra grande",
            "aP.medium": "Medio",
            "aP.wide": "Amplio",
            "aP.any": "Ninguna",
            "aP.none": "Ninguna",
            "aP.hide": "Ocultar",
            "aP.show": "Mostrar",
            "aP.stop": "Parar",
            "aP.continue": "Continuar",
            "aP.active": "Activar",
            "aP.deactive": "Desactivar",
            "aP.read": "Leer",
            "aP.gray": "Gris",
            "aP.sepia": "Sepia",
            "aP.buttons": "Botones",
            "aP.links": "Enlaces",
            "aP.titles": "Títulos",
            "aP.highContrast": "Alto contraste",
            "aP.inverted": "Invertido",
            "aP.all": "Todos",
            "aP.protanopia": "Protanopía",
            "aP.deuteranopia": "Deuteranopía",
            "aP.tritanopia": "Tritanopía",
            "aP.incrementSizeOnHover": "Expandir al pasar",
            "aP.left": "Izquierda",
            "aP.center": "Centro",
            "aP.right": "Derecha",
            "aP.justify": "Justificado",
            "aP.overImage": "Sobre la imágen",
            "aP.followCursor": "Seguir al cursor",
            "aP.apply": "Aplicar",
            
            "aP.summarize": "Resumir",
            "aP.summarizeContent": "Resumir contenido",
            "aP.summarizePage": "Resumir página",

            "aP.abstractiveSummary": "Resumen abstractivo",
            "aP.extractiveSummary": "Resumen extractivo",
            "aP.simplifyPage": "Simplificar página",

            "aP.loading": "Cargando...",
            "aP.nonAvailable": "No disponible",
            "aP.contactUs": "Contáctenos",

            // Ubicaciones
            "aP.topLeft": "Superior izquierda",
            "aP.topRight": "Superior derecha",
            "aP.bottomLeft": "Inferior izquierda",
            "aP.bottomRight": "Inferior derecha",

            // Notificaciones
            "n.timerCountdown": "Desaparecerá en",
            "n.seconds": "segundos",
            "n.accept": "Aceptar",

            // Lenguajes
            "lan.spanish": "Español",
            "lan.english": "Inglés",

            // Loader
            "l.loadUserProfile": "Cargando perfil de usuario...",
            "l.loadActionsAndRules": "Cargando acciones y reglas...",
            "l.evaluatingMetrics": "Evaluando métricas...",
            "l.completedProcess": "Proceso completado",
            "l.loaderTitle": "Cargando extensión",
            "l.loaderDescription": "Por favor espere, este proceso puede tardar unos segundos.",
            "l.loaderPolite": "argando, por favor espere",

            // Modal
            "m.summary": "Resumen",
            "m.generatingAbstracticSummary": "Generando resumen abstractivo...",
            "m.generatingExtractiveSummary": "Generando resumen extractivo...",
            "m.generatingSimplifiedPage": "Generando página simplificada...",

            // Validations
            "v.required": "Este campo es obligatorio",
            "v.email": "Ingresa un correo electrónico válido",
            "v.phone": "Ingresa un número de teléfono válido",
            "v.password": "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
            "v.number": "Ingresa un número válido",
            "v.minLength": (minLength) => `El texto debe tener al menos ${minLength} caracteres`,
            "v.maxLength": (maxLength) => `El texto no debe exceder ${maxLength} caracteres`,
            "v.min": (min) => `El número debe ser mayor o igual a ${min}`,
            "v.max": (max) => `El número debe ser menor o igual a ${max}`,
            "v.pattern": "El formato no es válido",
            "v.radioRequired": "Selecciona una opción",
            "v.checkboxRequired": "Debes aceptar este campo",
            "v.duplicateEmail": "El email ingresado ya ha sido registrado"
        }
    };

    static setActiveState(el, stateName) {
        if (!el) return;

        let state = `data-i18n-${stateName}`
        el.setAttribute("data-i18n-active", state);
    }

    static t(lang, key) {
        return this.TRANSLATIONS[lang]?.[key] || key;
    }

    static translate(lang, key, ...params) {
        const entry = this.TRANSLATIONS[lang]?.[key];

        if (!entry) return key;
        if (typeof entry !== 'function') return entry;

        return entry(...params);
    }

    static tElState(el, lang) {
        const activeTag = el.getAttribute("data-i18n-active");
        if (!activeTag) return;

        const key = el.getAttribute(activeTag);
        if (!key) return;

        const translation = Translator.t(lang, key);
        el.textContent = translation;
    }

    static tPage(document, lang) {
        // Elementos que tienen una traducción inmediata
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = Translator.t(lang, key);
        });

        // Elementos que tienen estados:
        // State: Variaciones que puede tener el elemento
        // Active: Estado activo, que actua como key para la traducción
        document.querySelectorAll('[data-i18n-active]').forEach(el => {
            this.tElState(el, lang);
        });
    }
   
    static addTranslation(lang, key, value) {
        if (!this.TRANSLATIONS[lang]) {
            this.TRANSLATIONS[lang] = {};
        }
        this.TRANSLATIONS[lang][key] = value;
    }
}
