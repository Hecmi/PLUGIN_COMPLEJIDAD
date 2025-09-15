class LoginManager {
    constructor() {
        this.language = "es";
    }

    initializeElementEvents(DOM) {
        this.btnIniciarSesion = DOM.getElementById('btnIniciarSesion')
        
        this.btnShowPassword = DOM.getElementById('showPassword');
        this.lblShowPassword = DOM.getElementById('lbl-showPassword');
        this.inputPassword = DOM.getElementById('loginPassword');
        this.aRegister = DOM.getElementById('aRegister');
        
        this.aRegister.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: "OPEN_PROFILE" });
        });
        
        this.btnShowPassword.addEventListener('click', () => {
            if (this.btnShowPassword.checked) {
                this.inputPassword.type = "text";
                this.lblShowPassword.setAttribute("data-i18n-active", "data-i18n-hide")
            } else {
                this.inputPassword.type = "password";
                this.lblShowPassword.setAttribute("data-i18n-active", "data-i18n-show")
            }
        
            Translator.tEl(lblShowPassword, language)
        });
        
        
        this.btnIniciarSesion.addEventListener('click', () => {
            const email = DOM.getElementById('loginEmail').value;
            const password = DOM.getElementById('loginPassword').value;
        
            chrome.runtime.sendMessage({ type: "LOGIN", payload: {
                    mail: email,
                    password: password
                  }
                },
                (response) => {
                    if (response.success == true) {
                        const badLogin = DOM.getElementById('spn-badLogin');
                        badLogin.classList.add('hide');
                        window.location.reload();
                        translatePage();
                    } else {
                        const badLogin = DOM.getElementById('spn-badLogin');
                        badLogin.classList.remove('hide');
                    }
                }
            );
        });
    }
    
    translatePage(language) {
        this.language = language;
        Translator.tPage(document, language);
    }
}
