const btnTraducir = document.getElementById('btnTraducir');
const btnCuenta = document.getElementById('btnCuenta')
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnIniciarSesion = document.getElementById('btnIniciarSesion')

const btnShowPassword = document.getElementById('showPassword');
const lblShowPassword = document.getElementById('lbl-showPassword');
const inputPassword = document.getElementById('loginPassword');

let language = "es"//UserInfoService.getLanguage().lang;

btnShowPassword.addEventListener('click', () => {
    if (btnShowPassword.checked) {
        inputPassword.type = "text";
        lblShowPassword.setAttribute("data-i18n-active", "data-i18n-hide")
    } else {
        inputPassword.type = "password";
        lblShowPassword.setAttribute("data-i18n-active", "data-i18n-show")
    }

    Translator.tEl(lblShowPassword, language)
});

btnTraducir.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        const translated = `https://translate.google.com/translate?sl=auto&tl=es&u=${encodeURIComponent(url)}`;
        chrome.tabs.update(tabs[0].id, { url: translated });
    });
});

btnCuenta.addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('ui/profile/profile.html')
    });
});

btnCerrarSesion.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "LOGOUT" }, (response) => {
        if (response.success) {
            window.location.reload();
            translatePage();
        }
    });
});

btnIniciarSesion.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    chrome.runtime.sendMessage({ type: "LOGIN", payload: {
            mail: email,
            password: password
          }
        },
        (response) => {
            console.log(response)
            if (response.success == true) {
                const badLogin = document.getElementById('spn-badLogin');
                badLogin.classList.add('hide');
                window.location.reload();
                translatePage();
            } else {
                console.log("fake")
                const badLogin = document.getElementById('spn-badLogin');
                badLogin.classList.remove('hide');
            }
        }
    );
});

chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response) => {
    const userInfoContainer = document.getElementById("userInfoContainer");
    const loginFormContainer = document.getElementById("loginFormContainer");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    if (response && response.sessionData) {
        const sessionData = response.sessionData;

        userInfoContainer.style.display = "block";
        loginFormContainer.style.display = "none";
        btnCerrarSesion.style.display = "block";

        document.getElementById("userName").textContent = sessionData.user.name;
        document.getElementById("spn-welcome").textContent = `, ${sessionData.user.name}`;
        document.getElementById("userEmail").textContent = sessionData.user.mail;

        document.getElementById('spn-btnCrearCuenta').setAttribute("data-i18n-active", "data-i18n-edit")
        
        translatePage();
    } else {
        userInfoContainer.style.display = "none";
        loginFormContainer.style.display = "block";
        btnCerrarSesion.style.display = "none";

        document.getElementById('spn-btnCrearCuenta').setAttribute("data-i18n-active", "data-i18n-create")

        translatePage();
    }
});

function translatePage() {
    Translator.tPage(document, language);
}
