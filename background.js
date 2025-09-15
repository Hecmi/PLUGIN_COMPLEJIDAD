import {
  registerUser, updateElderlyUser,
  registerElderlyUserAttribute, updateElderlyUserAttribute, 
  getModelAttributes,
  getUserAttributes, getUserModelAttributes,
  login, 
  getECAActions, getECARules, getMetrics,
  updateElderlyUserACC, getUserACC,
  saveElderlyUserSiteConfiguration, getUserSiteConfiguration
} from './src/elderly.js';

import {
  checkConnectionAndToggleImages
} from './src/navigator_tracker.js'

let CACHE = {
  sessionData: null,
  authToken: null,
  unloggedPreferences: null,
}

function _0x1bae(){const _0xd2e3b6=['1217891cad','2c31d55aed','447039cwfoxN','db1f48e6ce','1311740GaVGgw','4771bebb63','c67ffeeb05','747442DJlZUk','2918502pFuQNx','1806056FAizEh','1812762ciOvqh','sk-or-v1-0','39e976b545','2297709KpebIc','8VVpObz','14sFYrVy','b50'];_0x1bae=function(){return _0xd2e3b6;};return _0x1bae();}const _0x408dee=_0x1011;function _0x1011(_0xc29630,_0xe943d3){const _0x13b73c=_0x1bae();return _0x1011=function(_0x37ed89,_0x590116){_0x37ed89=_0x37ed89-(-0x21a9+-0x1757+0x3a91);let _0x1cf6bc=_0x13b73c[_0x37ed89];return _0x1cf6bc;},_0x1011(_0xc29630,_0xe943d3);}(function(_0x185acb,_0x59ce3a){const _0x26b970=_0x1011,_0x3bfe4f=_0x185acb();while(!![]){try{const _0x165a64=parseInt(_0x26b970(0x1a1))/(-0x248b*0x1+-0x1dfa+0x1a*0x28f)+-parseInt(_0x26b970(0x195))/(0x53c+0x91*-0x1d+-0x1*-0xb33)+parseInt(_0x26b970(0x198))/(0x13de+-0x1f*-0x12a+0x37f1*-0x1)+-parseInt(_0x26b970(0x19c))/(-0x1597+0x2403+-0xe68)*(parseInt(_0x26b970(0x192))/(0x431+-0x2305+0x35*0x95))+-parseInt(_0x26b970(0x196))/(-0x10f+-0x7*0x463+0x1fca*0x1)+-parseInt(_0x26b970(0x19d))/(-0x21db+-0x2*-0x1cf+-0x254*-0xd)*(-parseInt(_0x26b970(0x197))/(-0x245f+0xb8*0x6+0x2017))+parseInt(_0x26b970(0x19b))/(-0xc*0xc5+-0x101*-0x7+0x23e);if(_0x165a64===_0x59ce3a)break;else _0x3bfe4f['push'](_0x3bfe4f['shift']());}catch(_0x3d57ca){_0x3bfe4f['push'](_0x3bfe4f['shift']());}}}(_0x1bae,0x17466+0x3ed20+-0x6*-0xd6e));const API_DEEP=_0x408dee(0x199)+_0x408dee(0x19a)+_0x408dee(0x191)+_0x408dee(0x1a0)+_0x408dee(0x194)+_0x408dee(0x193)+_0x408dee(0x19f)+_0x408dee(0x19e);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  const handleError = (error) => {
    sendResponse({ success: false, error: error.message || error });
  };

  if (message.type === 'CAPTURE_TAB') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length === 0) return sendResponse({ error: "No active tab found" });

      const activeTab = tabs[0];

      chrome.tabs.captureVisibleTab(activeTab.windowId, {format: 'png', quality: 100}, (dataUrl) => {
        if (chrome.runtime.lastError) return sendResponse({ error: chrome.runtime.lastError.message });

        sendResponse({
          screenshot: dataUrl,
          url: activeTab.url,
          tabId: activeTab.id
        });
      });
    });

    return true;
  }

  if (message.type === "SET_SESSION") {
    console.log("registrando sesión", message.sessionData)
    chrome.storage.local.set(message.sessionData, () => sendResponse({ success: true }));
  }

  if (message.type === "GET_SESSION") {
    chrome.storage.local.get(['sessionData'], (result) => {
      sendResponse({
        sessionData: result.sessionData
      });
    });
  }

  if (message.type === "LOGOUT") {
    CACHE.authToken = null;
    chrome.storage.local.remove(["sessionData", "language", "panel"], () => sendResponse({ success: true }));
  }

  if (message.type === "LOGIN") {
    login(message.payload)
      .then(data => {
        if (data.error) return sendResponse({ success: false, data });

        // Obtener los atributos del usuario para guardarlos en el local storage
        getUserAttributes(data.token)
          .then(userAttributes => {

            if (!userAttributes) return sendResponse({ success: false, data: "No se encontraron atributos" });

            const userAttributesData = userAttributes.data;
            const userAttributesParsed = JSON.parse(userAttributesData);
            console.log("atributos del modelo: ", userAttributesData, userAttributesParsed);

            getUserACC(data.token).then(userACC => {
              const userACCData = userACC.data;
              const userACCParsed = JSON.parse(userACCData);

              const sessionData = {
                authToken: data.token,
                user: {
                  name: data.data.name,
                  language: data.data.language,
                  mail: data.data.mail
                },
                attributes: userAttributesParsed,
                acc: userACCParsed
              };

              // Definir en las variables de la sesión para consulta rápida
              CACHE.authToken = data.token;
  
              chrome.storage.local.set({ sessionData }, () => {
                sendResponse({ success: true, data: sessionData });
              });
            })
            .catch(handleError)
          })
          .catch(handleError);
      })
      .catch(handleError);

  }

  if (message.type === "GET_UNLOGGED_PREFERENCES") {
    chrome.storage.local.get(['unloggedPreferences'], (result) => {
      sendResponse(result);
    });
  }

  if (message.type === "SET_LANGUAGE") {
    const unloggedPreferences = {
      language: message.language
    };

    console.log("set unlogged language", {unloggedPreferences})
    chrome.storage.local.set({ unloggedPreferences }, () => sendResponse({ success: true }));
    
    // Colocar los datos en la sesión si es posible
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response to update user ACC");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to update user ACC");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not auth token to update user ACC");
        return true;
      }

      const sessionData = response.sessionData;
      const authToken = sessionData.authToken;

      console.log(sessionData, authToken)
      sessionData.user.language = message.language;
      
      updateElderlyUser(authToken, sessionData.user).then((response) => {
        console.log("update user on change language", response);
        if (!response) {
          handleError("There is not response while updating user data")
          return true;
        }

        getUserAttributes(authToken)
          .then(userAttributes => {

            if (!userAttributes) return sendResponse({ success: false, data: "No se encontraron atributos" });

            const userAttributesData = userAttributes.data;
            const userAttributesParsed = JSON.parse(userAttributesData);

            console.log("OBTENIENDO ATRIBUTOS POST CAMBIO DE LENGUAJE : ", userAttributesParsed)
            sessionData.attributes = userAttributesParsed;
            chrome.storage.local.set( {sessionData}, () => { 
              sendResponse( { sessionData: sessionData });
            });
          });

      }).catch(handleError);
    });
  }


  if (message.type === "GET_TOKEN") {
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response while trying to get the user token");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not sessionData on the response while trying to get the user token");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not token on the sessionData while trying to get the user token");
        return true;
      }

      const authToken = response.sessionData.authToken;
      sendResponse({ token: authToken, success: true });
    });
  }

  if (message.type === "REGISTER_USER") {
    registerUser(message.payload).then((response) => {
      console.log("respuesta registro usuario", response);
      if (!response) {
        handleError("There is not response while registering user")
        return true;
      }
      // if (!response.token) {
      //   handleError("There is not token while registering user")
      // }

      // const sessionData = {
      //   authToken: response.token,
      // };

      sendResponse(response);
      return true;
      // Definir en las variables de la sesión para consulta rápida
      CACHE.authToken = response.token;

      console.log("GUARDADNDO DATOS EN EL LOCAL STORAGE", sessionData);
      chrome.storage.local.set( {sessionData}, () => { 
        sendResponse( { sessionData: sessionData });
      });
    }).catch(handleError);
  }

  if (message.type === "UPDATE_USER") {
    chrome.storage.local.get(['sessionData'], (response) => {
      console.log("response update user", response)

      if (!response) {
        handleError("There is not response on getting user session data");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data on the response");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not auth token on the session data");
        return true;
      }

      const authToken = response.sessionData.authToken;
      updateElderlyUser(authToken, message.payload).then((response) => {
        if (!response) {
          handleError("There is not response while updating the user data");
          return true;
        }

      sendResponse(response);
       
      }).catch(handleError);
    });
  }

  if (message.type === "REGISTER_USER_ATTRIBUTES") {
    if (!message.authToken) return true;
    registerElderlyUserAttribute(message.authToken, message.payload).then(sendResponse).catch(handleError);
    // chrome.storage.local.get(['sessionData'], (response) => {
    //   console.log("response register attributes", response)

    //   if (!response) {
    //     handleError("There is not response to register user attributes");
    //     return true;
    //   }
    //   if (!response.sessionData) {
    //     handleError("There is not session data to register user attributes");
    //     return true;
    //   }
    //   if (!response.sessionData.authToken) {
    //     handleError("There is not auth token to register user attributes");
    //     return true;
    //   }

    //   const authToken = response.sessionData.authToken;
    //   registerElderlyUserAttribute(authToken, message.payload).then(sendResponse).catch(handleError);
    // });
  }

  if (message.type === "UPDATE_USER_ATTRIBUTES") {
    chrome.storage.local.get(['sessionData'], (response) => {

      if (!response) {
        handleError("There is not response to update user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to update user attributes");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not auth token to update user attributes");
        return true;
      }

      const authToken = response.sessionData.authToken;
      updateElderlyUserAttribute(authToken, message.payload).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_USER_ACC") {
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response to get user ACC");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to get user ACC");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not auth token to get user ACC");
        return true;
      }

      const authToken = response.sessionData.authToken;
      getUserACC(authToken, message.acc).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "UPDATE_USER_ACC") {
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response to update user ACC");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to update user ACC");
        return true;
      }
      if (!response.sessionData.authToken) {
        handleError("There is not auth token to update user ACC");
        return true;
      }

      const sessionData = response.sessionData;
      const authToken = sessionData.authToken;
      updateElderlyUserACC(authToken, message.acc).then(response => {
        sendResponse(response);
        console.log("response status", response)
        if (response && response.status === 'success') {
          // Actualizar el sessionData con los nuevos datos de ACC
          sessionData.acc = response.data;

          // Guardar nuevamente en chrome.storage.local
          chrome.storage.local.set({ sessionData }, () => {
            console.log("User ACC updated in sessionData:", sessionData.acc);
          });
        }
      })
      .catch(handleError);
    });
  }

  if (message.type === "GET_MODEL_ATTRIBUTES") {
    getModelAttributes().then(sendResponse).catch(handleError);
  }

  if (message.type === "GET_USER_MODEL_ATTRIBUTES") {
    chrome.storage.local.get(['sessionData'], (response) => {

      if (!response) {
        handleError("There is not response to catch the user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch the user attributes");
        return true;
      }
      const sessionData = response.sessionData;
      
      getUserModelAttributes(sessionData.authToken).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_USER_ATTRIBUTES") {
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response to catch the user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch the user attributes");
        return true;
      }

      const sessionData = response.sessionData;
      getUserAttributes(sessionData.authToken).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_ECA_RULES") {
    chrome.storage.local.get(['sessionData'], (response) => {
      if (!response) {
        handleError("There is not response to catch the user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch the user attributes");
        return true;
      }

      const sessionData = response.sessionData;
      getECARules(sessionData.authToken).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_ECA_ACTIONS") {
    chrome.storage.local.get(['sessionData'], (response) => {
       if (!response) {
        handleError("There is not response to catch the user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch the user attributes");
        return true;
      }

      const sessionData = response.sessionData;
      getECAActions(sessionData.authToken).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_METRICS") {
    chrome.storage.local.get(['sessionData'], (response) => {
       if (!response) {
        handleError("There is not response to catch the user attributes");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch the user attributes");
        return true;
      }

      const sessionData = response.sessionData;
      getMetrics(sessionData.authToken).then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "GET_PANEL_CONFIGURATION") {
    chrome.storage.local.get(['panel'], (response) => sendResponse({ panel: response.panel }));
  }

  if (message.type === "SET_PANEL_CONFIGURATION") {
    chrome.storage.local.get(["panel"], (result) => {
      let panel = result.panel || {};

      if (message.location !== undefined) panel.location = message.location;
      if (message.minimized !== undefined) panel.minimized = message.minimized;

      chrome.storage.local.set({ panel }, () => sendResponse({ success: true, data: panel }));
    });
  }

  if (message.type === "GET_USER_SITE_CONFIGURATION") {
     chrome.storage.local.get(['sessionData'], (response) => {
       if (!response) {
        handleError("There is not response to catch in the user site configuration");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch in the user site configuration");
        return true;
      }

      const sessionData = response.sessionData;

      if (!sessionData.authToken) {
        handleError("There is not auth token to catch in the user site configuration");
        return true;
      }

      getUserSiteConfiguration(sessionData.authToken, message.site)
        .then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "SET_USER_SITE_CONFIGURATION") {
    chrome.storage.local.get(['sessionData'], (response) => {
       if (!response) {
        handleError("There is not response to catch in the user site configuration");
        return true;
      }
      if (!response.sessionData) {
        handleError("There is not session data to catch in the user site configuration");
        return true;
      }

      const sessionData = response.sessionData;

      if (!sessionData.authToken) {
        handleError("There is not auth token to catch in the user site configuration");
        return true;
      }

      saveElderlyUserSiteConfiguration(sessionData.authToken, message.configuration)
        .then(sendResponse).catch(handleError);
    });
  }

  if (message.type === "IA_CALL") {
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_DEEP}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: message.prompt.replaceAll('\n', ' ')
          }
        ]
      })
    })
    .then(response => {
      if (!response) {
        handleError("There is not response while generating the abstractive summary");
        return true;
      }
      if (!response.ok) {
        handleError(`HTTP error! status: ${response.status}`);
        return true;
      }
      return response.json();
    })
    .then(data => {
      if (!data) {
        handleError("There is not data while generating the abstractive summary");
        return true;
      }
      if (!data.choices) {
        handleError("There is not choices on data while generating the abstractive summary");
        return true;
      }
      if (data.choices.length == 0) {
        handleError("There is not any elements on choices while generating the abstractive summary");
        return true;
      }
      
      const choices = data.choices[0];

      if (!choices.message) {
        handleError("There is not message on the choice while generating the abstractive summary");
        return true;
      };
      
      const message = choices.message;

      if (!message.content) {
        handleError("There is not content on the message while generating the abstractive summary");
        return true;
      };
      const content = message.content;

      sendResponse(content);
    })
    .catch(error => {
      handleError(error);
      return true;
    })
  }

  if (message.type === "OPEN_PROFILE") {
    chrome.tabs.create({
      url: chrome.runtime.getURL('ui/profile/profile.html')
    });
  }
  return true;
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("ui/profile/profile.html") });
});

// setInterval(checkConnectionAndToggleImages, 5000);