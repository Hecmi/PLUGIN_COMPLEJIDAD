const btnSave = document.getElementById("saveProfile");
const frmProfile = document.getElementById("form-container");

const sessionInfo = UserInfoService.getUserInfo();
console.log(sessionInfo.connection)

let sessionLanguage = "es";

async function getLanguage() {
    // Obtener los datos de la sesión iniciada
    const userSession = await ChromeApiService.getUserSession()
        .catch((error) => {
            console.log(error); 
            return null;
        });

    // Cargar el idioma del usuario en el perfil de usuario
    // (si no está registrado, tomarlo del navegador)
    let language = "es";
    if (userSession && userSession.user) {
        language = userSession.user.language || "es";
        console.log("language from profile")
    } else {
        // Obtener datos de la sesión sin iniciar sesión
        const unloggedPreferences = await ChromeApiService.getUnloggedPreferences();
    
        if (unloggedPreferences) {
            language = unloggedPreferences.language;
            console.log("language from preferences")
        } else {
            language = UserInfoService.getLanguage().lang;
            console.log("language from navigator")
        }
    }

    console.log("language", language);
    
    return language ? language : "es";
}

async function init() {
    try {
        // Primero cargar el idioma
        sessionLanguage = await getLanguage();
        
        // Verificar si hay datos en la sesión para determinar si es registro
        // o actualización
        chrome.storage.local.get(['sessionData'], (response) => {
            if (response && response.sessionData) {
                console.log(response.sessionData)

                chrome.runtime.sendMessage({
                    type: "GET_USER_MODEL_ATTRIBUTES"
                }, (response) => {
                    let modelAttributes = JSON.parse(response.data)
                    
                    modelAttributes.sort((a, b) => {
                        if (a.classAttributeId !== b.classAttributeId) {
                            return a.classAttributeId - b.classAttributeId;
                        }
                        return a.position - b.position;
                    });
                    
                    new Generator(sessionLanguage).execute(modelAttributes);
                })
            } else {                    
                chrome.runtime.sendMessage({
                    type: "GET_MODEL_ATTRIBUTES"
                }, (response) => {
                    console.log(response)
                    let modelAttributes = JSON.parse(response.data)
                    
                    modelAttributes.sort((a, b) => {
                        if (a.classAttributeId !== b.classAttributeId) {
                            return a.classAttributeId - b.classAttributeId;
                        }
                        return a.position - b.position;
                    });
                    
                    new Generator(sessionLanguage).execute(modelAttributes);
                })
            }
        });

        // Cargar los eventos para los elementos de la páigna
        setupEventListeners();
    } catch (error) {
        console.error("Error inicializando la página:", error);
    }
}

function setupEventListeners() {
    document.getElementById('closeProfile').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response) => {
            console.log(response)
        })

        showBiModal(
            Translator.t(sessionLanguage, "uP.closePage"),
            Translator.t(sessionLanguage, "uP.closePageConfirmation"),
            Translator.t(sessionLanguage, "n.accept"),
            Translator.t(sessionLanguage, "uP.close"),
            (close) => { close(); window.close(); },
            (close) => { close(); }
        );
    });

    btnSave.addEventListener('click', () => {    
        form = new Form(frmProfile, {
            DEFAULT_LANG: sessionLanguage
        });

        // Verificar si el formulario no es válido
        if (!form.validate()) {
            
            // Buscar el primer elemento inválido y redirigir al tab correspondiente
            const elementError = document.querySelector('.invalid');
            const tab = elementError.dataset.tabId;
            
            const tabElement = document.querySelector(`[data-tab="${tab}"]`)
            
            // Forzar el click para ir al tab correspondiente
            if (tabElement) {
                tabElement.click();
                window.location.href = `#${elementError.id}`;
            }

            return;
        }
            
        // Obtener los datos definidos por el usuario
        const formElements = form.getSelectedNodes();

        // Extraer los elementos con el atributo isDefault
        let explicitElements = []
        formElements.forEach(element => {
            if (element.getAttribute("isdefault")) {
                explicitElements.push(element);
            }
        })

        // Obtener los datos que son obtenidos por defecto (true) para el perfil del usuario
        const defaultElements = explicitElements.filter(el => 
            el.getAttribute('isdefault') === 'true'
        );

        // Formatear para obtener clave / valor
        // Datos específicos del perfil del usuario:
        const defaultData = {};
        defaultElements.forEach(field => {
            defaultData[field.name] = field.value;
        })

        // Datos generales del perfil del usuario
        const explicitData = [];
        explicitElements.forEach(field => {
            const id = (field.type == 'radio') ? field.dataset.id : field.id;
            explicitData.push({
                attributeId: parseInt(id),
                value: field.value,
            })
        });
        
        console.log("default", defaultData)
        console.log("explicit", explicitData)
        let name = defaultData.name;
        let password = defaultData.password;
        let email = defaultData.mail;

        chrome.runtime.sendMessage({ type: "GET_TOKEN" }, (response) => {
            if (!response.success) {
                chrome.runtime.sendMessage({
                    type: "REGISTER_USER",
                    payload: defaultData,
                }, (response) => {
                    console.log("Usuario registrado (?", response);
                    
                    if (!response) return;
                    if (response.status && response.status == "error") {
                        if (response["error_code"] == "DUPLICATE_EMAIL") {
                            const emailElements = document.getElementsByName(response["field"]);

                            if (!emailElements) return;
                            if (emailElements.length != 1) return;

                            const emailElement = emailElements[0];
                            form.validator.triggerValidation(emailElement, "DUPLICATE_EMAIL");

                            // Obtener el tab asociado al elemento erróneo
                            const tab = emailElement.dataset.tabId;            
                            const tabElement = document.querySelector(`[data-tab="${tab}"]`)
                            
                            // Forzar el click para ir al tab correspondiente
                            if (tabElement) {
                                tabElement.click();
                                window.location.href = `#${emailElement.id}`;
                            }
                        }
                        
                        return;
                    }

                    if (!response.token) {
                        console.log("There is any token on the response after inserting user");
                        return;
                    }

                    chrome.runtime.sendMessage({
                        type: "REGISTER_USER_ATTRIBUTES",
                        payload: explicitData,
                        authToken: response.token
                    }, (response) => {
                        if (!response) return;
                        if (response && response.status != "success") return;
                        
                        showDescriptionModal(
                            Translator.t(sessionLanguage, "uP.dataSaved"),
                            Translator.t(sessionLanguage, "uP.dataSavedDescription"),
                            Translator.t(sessionLanguage, "uP.close")
                        );

                        // Login para guardar los datos en la sesión
                        chrome.runtime.sendMessage({
                            type: "LOGIN",
                            payload: defaultData                            
                        }, () => {
                            console.log("Inicio de sesión jijija")
                        });
                    });
                });
            } else {
                chrome.runtime.sendMessage({
                    type: "UPDATE_USER",
                    payload: defaultData,
                }, (response) => {
                    if (!response) return;
                    if (response.status && response.status == "error") {
                        if (response["error_code"] == "DUPLICATE_EMAIL") {
                            const emailElements = document.getElementsByName(response["field"]);

                            if (!emailElements) return;
                            if (emailElements.length != 1) return;

                            const emailElement = emailElements[0];
                            form.validator.triggerValidation(emailElement, "DUPLICATE_EMAIL");

                            // Obtener el tab asociado al elemento erróneo
                            const tab = emailElement.dataset.tabId;            
                            const tabElement = document.querySelector(`[data-tab="${tab}"]`)
                            
                            // Forzar el click para ir al tab correspondiente
                            if (tabElement) {
                                tabElement.click();
                                window.location.href = `#${emailElement.id}`;
                            }
                        }

                        return;
                    }

                    console.log("Actualización de datos de usuario", response);

                    chrome.runtime.sendMessage({
                        type: "UPDATE_USER_ATTRIBUTES",
                        payload: explicitData,
                    }, (response) => {
                        if (!response) return;
                        if (response && response.status != "success") return; 
                        
                        showDescriptionModal(
                            Translator.t(sessionLanguage, "uP.dataSaved"),
                            Translator.t(sessionLanguage, "uP.dataSavedDescription"),
                            Translator.t(sessionLanguage, "uP.close")
                        );
                    
                        
                        // Login para guardar los datos en la sesión
                        chrome.runtime.sendMessage({
                            type: "LOGIN",
                            payload:  {
                                mail: email,
                                password: password
                            }
                        }, () => {
                            console.log("Inicio de sesión actualización jijija")
                        });
                    });
                });
            }
        });
    });
}

// Iniciar la aplicación
init();