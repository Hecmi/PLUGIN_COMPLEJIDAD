let imageBlockingEnabled = false;
let imageBlockListener = null;

export function checkConnectionAndToggleImages() {
    if (navigator.connection && navigator.connection.downlink) {
        const connectionSpeed = navigator.connection.downlink;
                
        // Si la conexión es lenta cancelar la carga de imágenes
        if (connectionSpeed < 1 && !imageBlockingEnabled) {
            imageBlockListener = function(details) {
                return { cancel: true };
            };

            chrome.webRequest.onBeforeRequest.addListener(
                imageBlockListener,
                { urls: ["<all_urls>"], types: ["image"] },
                ["blocking"]
            );
            imageBlockingEnabled = true;
        } else if (connectionSpeed >= 1 && imageBlockingEnabled) {
            chrome.webRequest.onBeforeRequest.removeListener(imageBlockListener);
            imageBlockingEnabled = false;
        }
    }
}
