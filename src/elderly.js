const BASE = "http://localhost:8080/api/";

export async function registerUser(userData) {
    try {
        const response = await fetch(BASE + 'elderly/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Error al registrar usuario, respuesta: ", errorData);
            return errorData;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function updateElderlyUser(authToken, userData) {
    if (!authToken) {
        console.error('Missing auth token');
        return { error: 'Missing authentication token' };
    }

    console.log("DATA USER UPDATE", userData);
    
    const url = BASE + 'elderly'
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {            
            console.log("Error al actualizar usuario, respuesta: ", data);
            return data;
        }

        console.log('Perfil actualizado:', data);
        return data;
    } catch (error) {
        console.error('Error al actualizar atributos:', error.message);
        return { error: error.message };
    }
}

export async function registerElderlyUserAttribute(authToken, attributes) {
    console.log("atributos", authToken, attributes)
    console.log(attributes, [
        { attributeId: 25, value: 'Hipertensión' },
        { attributeId: 26, value: 'Diabetes tipo 2' },
    ])
    // attributes = [
    //     { attributeId: 25, value: 'Hipertensión' },
    //     { attributeId: 26, value: 'Diabetes tipo 2' },
    // ];
    const url = BASE + 'elderly/attribute/register'
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                attributes: attributes,
            }),
        });

        const data = await response.json();

        console.log(data);
        if (!response.ok) {            
            throw new Error(`Error ${response.status}: ${data.message || 'Registro de atributos fallido'}`);
        }

        console.log('Atributos registrados con éxito:', data);
        return data;
    } catch (error) {
        console.error('Error al registrar atributos:', error.message);
        return { error: error.message };
    }
}

export async function updateElderlyUserAttribute(authToken, attributes) {
    console.log("atributos actualizar", authToken, attributes)
    console.log(JSON.stringify({
                attributes: attributes,
            }))


    if (!authToken) {
        console.error('Missing auth token');
        return { error: 'Missing authentication token' };
    }
    
    if (!Array.isArray(attributes)) {
        console.error('Attributes must be an array');
        return { error: 'Attributes must be an array' };
    }
    
    const url = BASE + 'elderly/attribute/update'
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                attributes: attributes
            }),
        });

        const data = await response.json();

        if (!response.ok) {            
            throw new Error(`Error ${response.status}: ${data   .message || 'Registro de atributos fallido'}`);
        }

        console.log('Atributos actualizados:', data);
        return data;
    } catch (error) {
        console.error('Error al actualizar atributos:', error.message);
        return { error: error.message };
    }
}

export async function getModelAttributes() {
    const response = await fetch(BASE + `model/attributes/1`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function getUserModelAttributes(authToken) {
    console.log(authToken)
    const response = await fetch(BASE + `elderly/attribute`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ "model_id": 1 }),
    });

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function getUserAttributes(authToken) {
    console.log(authToken)
    const response = await fetch(BASE + `elderly/attribute`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function login(userData) {
    try {
        const response = await fetch(BASE + 'elderly/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Inicio de sesión fallido'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function getECARules(authToken) {
    try {
        const response = await fetch(BASE + 'eca/rules', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            // body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener las reglas'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function getECAActions(authToken) {
    try {
        const response = await fetch(BASE + 'eca/actions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            // body: JSON.stringifyS(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener las acciones'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function getMetrics(authToken) {
    try {
        const response = await fetch(BASE + 'metrics', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener las métricas'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function updateElderlyUserACC(authToken, acc) {
    console.log("acc actualizar", authToken, acc)

    if (!authToken) {
        console.error('Missing auth token');
        return { error: 'Missing authentication token' };
    }
    
    if (typeof acc != 'object') {
        console.error('ACC must be an object');
        return { error: 'ACC must be an object' };
    }
    
    const url = BASE + 'elderly/ACC'
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(acc),
        });

        const data = await response.json();

        if (!response.ok) {            
            throw new Error(`Error ${response.status}: ${data   .message || 'Actualización de ACC fallido'}`);
        }

        console.log('ACC actualizado:', data);
        return data;
    } catch (error) {
        console.error('Error al actualizar ACC:', error.message);
        return { error: error.message };
    }
}

export async function getUserACC(authToken) {
    try {
        const response = await fetch(BASE + 'elderly/ACC', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener el ACC del usuario'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

export async function saveElderlyUserSiteConfiguration(authToken, configuration) {
    console.log("site configuration to save", authToken, configuration)

    if (!authToken) {
        console.error('Missing auth token');
        return { error: 'Missing authentication token' };
    }
    
    if (typeof configuration != 'object') {
        console.error('configuration must be an object');
        return { error: 'configuration must be an object' };
    }

    console.log("a GUARDAR ", configuration)

    const url = BASE + 'elderly/site'
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(configuration),
        });

        const data = await response.json();

        if (!response.ok) {            
            throw new Error(`Error ${response.status}: ${data   .message || 'Actualización de ACC fallido'}`);
        }

        console.log('ACC actualizado:', data);
        return data;
    } catch (error) {
        console.error('Error al actualizar ACC:', error.message);
        return { error: error.message };
    }
}

export async function getUserSiteConfiguration(authToken, site) {
    try {
        const response = await fetch(BASE + 'elderly/site/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(site),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener la configuración del sitio'}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: error.message };
    }
}