class ChromeApiService {
    static getPanelConfiguration() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_PANEL_CONFIGURATION" }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received from extension"));
                    return;
                }
                
                // Validar estructura de la respuesta
                if (response?.panel) {
                    resolve(response.panel);
                } else {
                    reject(new Error("Invalid panel configuration response structure"));
                }
            });
        });
    }

    static capturePageImage() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for screenshot capture"));
                    return;
                }
                
                const screenshot = response?.screenshot;
                if (screenshot) {
                    resolve(screenshot);
                } else {
                    const errorMessage = response?.error || "Invalid screenshot response structure";
                    reject(new Error(errorMessage));
                }
            });
        });
    }

    static getUserSession() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for user session"));
                    return;
                }

                // Validar que exista los datos de la sesión
                if (!response[Constants.APP.sessionData]) {
                    reject(new Error("No data session received in response"));
                    return;
                }
                
                try {
                    console.log("get session", response.sessionData)
                    resolve(response.sessionData);
                } catch (parseError) {
                    reject(new Error(`Failed to get user session: ${parseError.message}`));
                }
            });
        });
    }

    static getUserModelAttributes() {
        return new Promise((resolve, reject) => {
            console.log("get user moedl");
            chrome.runtime.sendMessage({ type: "GET_USER_MODEL_ATTRIBUTES" }, (response) => {
                console.log("get user moedl", response);
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    console.log("error")
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for user attributes"));
                    return;
                }
                
                // Validar estructura de datos
                if (!response?.data) {
                    reject(new Error("There aren't user attributes in the response"));
                    return;
                }

                
                try {
                    const parsedData = JSON.parse(response.data);
                    resolve(parsedData);
                } catch (parseError) {
                    reject(new Error(`Failed to parse user attributes: ${parseError.message}`));
                }
            });
        });
    }

    static getECAActions() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_ECA_ACTIONS" }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for ECA actions"));
                    return;
                }
                
                // Validar estructura de datos
                if (!response?.data) {
                    reject(new Error("The actions data is missing from response"));
                    return;
                }
                
                try {
                    const parsedData = JSON.parse(response.data);
                    resolve(parsedData);
                } catch (parseError) {
                    reject(new Error(`Failed to parse ECA actions: ${parseError.message}`));
                }
            });
        });
    }

    static getMetrics() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_METRICS" }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for metrics"));
                    return;
                }
                
                // Validar estructura de datos
                if (!response?.data) {
                    reject(new Error("The metrics data is missing from response"));
                    return;
                }
                
                try {
                    const parsedData = JSON.parse(response.data);
                    resolve(parsedData);
                } catch (parseError) {
                    reject(new Error(`Failed to parse metrics: ${parseError.message}`));
                }
            });
        });
    }

    static getECARules() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_ECA_RULES" }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for ECA rules"));
                    return;
                }
                
                // Validar estructura de datos
                if (!response?.data) {
                    reject(new Error("The rules data is missing from response"));
                    return;
                }
                
                try {
                    const parsedData = JSON.parse(response.data);
                    resolve(parsedData);
                } catch (parseError) {
                    reject(new Error(`Failed to parse ECA rules: ${parseError.message}`));
                }
            });
        });
    }

    static getUnloggedPreferences() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_UNLOGGED_PREFERENCES" }, (response => {
                try {
                    const unloggedPreferences = response.unloggedPreferences;
                    console.log("unlogged", response)
                    resolve(unloggedPreferences);
                } catch(error) {
                    reject(new Error(`Faile while trying to get the offline language: ${error.message}`))
                }
            }))
        });
    }

    static setLanguage(language) {
        if (!language) return;
        if (typeof language !== 'string') return;

        return new Promise((resolve, reject) => {
            console.log("set unlogged language", language)
            chrome.runtime.sendMessage({ type: "SET_LANGUAGE", language: language }, (response => {
                try {
                    console.log(response);
                    resolve(response);
                } catch(error) {
                    reject(new Error(`Faile while trying to set the offline language: ${error.message}`))
                }
            }));
        });
    }

     static setUserACC(configuration) {
        if (!configuration) return;
        if (typeof configuration !== 'object') return;

        return new Promise((resolve, reject) => {
            console.log("setting acc configuration", configuration)
            chrome.runtime.sendMessage({ type: "UPDATE_USER_ACC", acc: configuration }, (response => {
                try {
                    console.log(response);
                    resolve(response);
                } catch(error) {
                    reject(new Error(`Faile while trying to set acc configuration: ${error.message}`))
                }
            }));
        });
    }

    static getElderlyUserSiteConfiguration(site) {
        console.log("asd????")
        return new Promise((resolve, reject) => {

            chrome.runtime.sendMessage({
                type: "GET_USER_SITE_CONFIGURATION",
                site: {
                    "site": site
                }
            }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received for ECA rules"));
                    return;
                }
                
                console.log("The response is", response);
                // Validar estructura de datos
                if (!response?.data) {
                    reject(new Error("The data is missing from response"));
                    return;
                }

                const responseData = JSON.parse(response.data);

                if (!responseData.configuration) {
                    reject(new Error("The configuration is missing from response data"));
                    return;
                }
                
                try {
                    console.log("response get site", response);
                    const parsedData = JSON.parse(responseData.configuration);
                    resolve(parsedData);
                } catch (parseError) {
                    reject(new Error(`Failed to parse ECA rules: ${parseError.message}`));
                }
            });
        });
    }

    static getIACallResponse (prompt) {
        return new Promise((resolve, reject) => {

            chrome.runtime.sendMessage({
                type: "IA_CALL",
                prompt: prompt
            }, (response) => {
                // Verificar errores de Chrome Runtime
                if (chrome.runtime.lastError) {
                    reject(new Error(`Chrome runtime error: ${chrome.runtime.lastError.message}`));
                    return;
                }
                
                // Validar que exista respuesta
                if (!response) {
                    reject(new Error("No response received from IA call"));
                    return;
                }
                
                try {
                    resolve(response);
                } catch (error) {
                    reject(new Error(`Failed to call IA: ${error.message}`));
                }
            });
        });
    }

    // Verificar si la extensión está disponible
    static isExtensionAvailable() {
        return !!chrome?.runtime?.sendMessage;
    }
}