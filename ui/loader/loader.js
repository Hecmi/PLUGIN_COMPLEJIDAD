class Loader {
    constructor(language = 'es') {
        this.language = language;
    }

    async init() {
        // Verificar que chrome.runtime.getURL está disponible
        if (!chrome.runtime || !chrome.runtime.getURL) {
          console.error('chrome.runtime.getURL no está disponible');
          return;
        }

        // Realizar la petición para obtener el loader
        const [loaderResponse] = await Promise.all([
            fetch(chrome.runtime.getURL('ui/loader/loader.html')),
        ]);

        // Obtener el contenido del loader (html)
        const [loaderContent] = await Promise.all([
            loaderResponse.text()
        ]);

        // Parsear el texto a contenido válido
        this.doc = new DOMParser().parseFromString(loaderContent, 'text/html');

        // Agregar el contenido a la página
        const wrapper = document.createElement('div');
        wrapper.id = 'accessibility-ext-loader';
        document.body.appendChild(wrapper);

        this.shadowRoot = wrapper.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>${this.doc.querySelector('style#style-loader-ext').textContent}</style>
            ${this.doc.querySelector('body').innerHTML}
        `;

        this.loadOverlay = this.shadowRoot.getElementById('loaderOverlay');
        this.loaderProcessDescription = this.shadowRoot.getElementById('loaderProcessDescription');
    }

    show() {
        this.loadOverlay.style.display = 'flex';
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            this.loadOverlay.classList.remove('fade-out');
            this.loadOverlay.style.opacity = '1';
        }, 10);
    }

    hide() {
        this.loadOverlay.classList.add('fade-out');
        // this.setProcessDescription("Proceso completado");
        document.body.style.overflow = "";

        setTimeout(() => {
            this.loadOverlay.style.display = 'none';
        }, 1000);
    }

    setProcessDescription(description) {
        this.loaderProcessDescription.textContent = description;
    }

    tPage(language) {
        Translator.tPage(this.shadowRoot, language);
    }
}