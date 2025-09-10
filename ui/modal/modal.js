class ExtensionModal {
    constructor() {
        this.style = `<style>
        body {
            background: #FFFFFF !important;
            color: #000000 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
            margin: 1.25rem !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
        }

        header h1 {
            text-align: center !important;
            color: #000000 !important;
            font-size: 1.25rem !important;
            line-height: 1.375rem !important;
        }

        header p {
            text-align: center !important;
            color: #000000 !important;
            font-size: 1rem !important;
            margin-top: 0.5rem !important;
        }

        h1, h2 {
            color: #000000 !important;
            font-weight: 700 !important;
            line-height: 1.375rem !important;
        }

        h1 {
            font-size: 1.25rem !important;
        }

        h2 {
            font-size: 1.125rem !important;
        }

        table {
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            border: 0.125rem solid #000000 !important;
        }

        table th, table td {
            padding: 0.5rem 0.75rem !important;
            text-align: center !important;
            border: 0.0625rem solid #000000 !important;
            font-size: 1rem !important;
        }

        table caption {
            caption-side: top !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            margin: 0.5rem !important;
            color: #000000 !important;
        }

        img {
            max-width: 100% !important;
            height: auto !important;
            margin: 0.625rem 0 !important;
            display: block !important;
        }

        a {
            color: #2B6CB0 !important;
            text-decoration: underline !important;
            transition: color 0.2s ease !important;
        }

        a:hover, a:focus {
            color: #1A4971 !important;
            text-decoration: none !important;
        }

        a:focus {
            outline: 0.125rem solid #E65100 !important;
            outline-offset: 0.125rem !important;
        }

        section {
            margin-bottom: 1.25rem !important;
        }

        footer {
            border-top: 0.125rem solid #2B6CB0 !important;
            padding-top: 0.9375rem !important;
            text-align: center !important;
        }
        </style>`
    }

    async init() {
        console.log("INICIANDO MODAL DE LA EXTENSIÓN")
        // Verificar que chrome.runtime.getURL está disponible
        if (!chrome.runtime || !chrome.runtime.getURL) {
            console.error('chrome.runtime.getURL no está disponible');
            return;
        }

        try {
            // Realizar la petición para obtener el loader
            const [notificationResponse] = await Promise.all([
                fetch(chrome.runtime.getURL('ui/modal/modal.html')),
            ]);

            // Obtener el contenido del loader (html)
            const [notificationContent] = await Promise.all([
                notificationResponse.text()
            ]);

            // Parsear el texto a contenido válido
            this.doc = new DOMParser().parseFromString(notificationContent, 'text/html');

            // Agregar el contenido a la página
            const wrapper = document.createElement('div');
            wrapper.id = 'accessibility-ext-modal';
            document.body.appendChild(wrapper);

            
            this.shadowRoot = wrapper.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
            <style>${this.doc.querySelector('style#style-ext-modal').textContent}</style>
            ${this.doc.querySelector('body').innerHTML}
            `;

            console.log("Loading the modal", this.shadowRoot);

            this.setEvents();
        } catch (error) {
            console.error('Error cargando notificaciones desde extensión:', error);
        }
    }

    setEvents() {
        console.log(this.shadowRoot)
        const btnCloseModal = this.shadowRoot.getElementById("btnClose-modal");
        const btnHeaderCloseModal = this.shadowRoot.getElementById("modal-header-close");
        const modalContainer = this.shadowRoot.getElementById("extensionModal");
        
        btnCloseModal.addEventListener('click', () => {
            modalContainer.classList.remove('show');    
        });
        btnHeaderCloseModal.addEventListener('click', () => {
            modalContainer.classList.remove('show');    
        });
    }

    setTextualContent(content) {
        const paragraphs = content
            .trim()
            .split(/\n\s*\n/)
            .map(p => `<p>${p.trim()}</p>`)
            .join("\n");
            
        const iframe = this.shadowRoot.getElementById("modal-body-content");
        if (iframe && iframe.tagName === "IFRAME") {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                    <head>
                        ${this.style}
                    </head>
                    <body>
                        ${paragraphs}
                    </body>
                </html> 
            `);
            doc.close();

            this.adjustIframeHeight();
        }
    }

    setContentHTML(content) {
        const iframe = this.shadowRoot.getElementById("modal-body-content");
        if (iframe && iframe.tagName === "IFRAME") {
            const allStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(el => {
                    if (el.tagName === 'STYLE') {
                        return el.outerHTML;
                    } else if (el.tagName === 'LINK') {
                        return `<link rel="stylesheet" href="${el.href}">`;
                    }
                    return '';
                })
                .join('');

            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                    <head>
                        ${this.style}
                    </head>
                    <body>
                        ${content}
                    </body>
                </html> 
            `);
            doc.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.href) {
                    e.preventDefault();
                    window.top.location.href = e.target.href;
                }
            });
            doc.close();
        }
    }


    setContent(elements) {
        const iframe = this.shadowRoot.getElementById("modal-body-content");
        if (iframe && iframe.tagName === "IFRAME") {
            const doc = iframe.contentDocument || iframe.contentWindow.document;

            // Reiniciar el contenido del iframe
            doc.body.innerHTML = "";

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                doc.body.appendChild(element.cloneNode(true));
            }

            this.adjustIframeHeight();
        }
    }


    show() {
        const modalContainer = this.shadowRoot.getElementById("extensionModal"); 
        if (!modalContainer) return;

        modalContainer.classList.add('show');
    }

    hide() {
        const modalContainer = this.shadowRoot.getElementById("extensionModal");
        if (!modalContainer) return;

        modalContainer.classList.remove('show');
    }

    adjustIframeHeight() {
        const iframe = this.shadowRoot.getElementById("modal-body-content");
        if (!iframe) return;

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc.body) return;

        // // Limitar la altura del documento
        const iframeStyles = getComputedStyle(iframe);
        const maxHeight = parseInt(iframeStyles.maxHeight);
        // const paddingTop = parseInt(iframeStyles.paddingTop) || 0;
        // const paddingBottom = parseInt(iframeStyles.paddingBottom) || 0;

        // console.log(maxHeight, paddingTop, paddingBottom);
        const contentHeight = doc.body.getBoundingClientRect().heihgt;
        // iframe.style.height = Math.min(contentHeight, maxHeight) + "px";
    }

    
    t(language) {
        console.log("Traduciendo modal", language)
        Translator.tPage(this.shadowRoot, language);
    }
}