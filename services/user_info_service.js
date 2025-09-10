class UserInfoService {
    static _cachedUserInfo = null;

    static getUserInfo() {
        if (this._cachedUserInfo) return this._cachedUserInfo;

        const language = this.getLanguage();
        const device = this.getDeviceInfo();
        const screen = this.getScreenInfo();
        const browser = this.getBrowserInfo();
        const connection = this.getConnectionInfo();
        const supports = this.getSupportInfo();
        const system = this.getSystemInfo();

        this._cachedUserInfo = {
            ...language,
            ...device,
            ...screen,
            ...browser,
            ...connection,
            ...supports,
            ...system
        };

        return this._cachedUserInfo;
    }

    static getLanguage() {
        let lang = navigator.language || 'en';
        return {
            language: lang,
            lang: lang.split('-')[0].toLowerCase()
        }
    }

    static getDeviceInfo() {
        const isTouch = 'ontouchstart' in window;
        const type = this.detectDeviceType();

        return {
            deviceType: type,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchSupport: isTouch
        };
    }

    static getScreenInfo() {
        return {
            screen: {
                resolution: `${screen.width}x${screen.height}`,
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                orientation: screen.orientation ? screen.orientation.type : 'Unknown',
                devicePixelRatio: window.devicePixelRatio || 1
            }
        };
    }

    static getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            browser: this.detectBrowser(ua),
            userAgent: ua,
            vendor: navigator.vendor || 'Unknown',
            productSub: navigator.productSub || 'Unknown',
            appVersion: navigator.appVersion || 'Unknown',
            userAgentData: navigator.userAgentData || null
        };
    }

    static getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
        return {
            connection: {
                effectiveType: connection.effectiveType || 'Unknown',
                downlink: connection.downlink || 'Unknown',
                rtt: connection.rtt || 'Unknown',
                saveData: connection.saveData || 'Unknown'
            },
            isOnline: navigator.onLine
        };
    }

    static getSupportInfo() {
        return {
            supports: {
                geolocation: 'geolocation' in navigator,
                clipboard: 'clipboard' in navigator,
                localStorage: 'localStorage' in window,
                sessionStorage: 'sessionStorage' in window,
                indexedDB: 'indexedDB' in window,
                fetch: 'fetch' in window,
                webSocket: 'WebSocket' in window,
                audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
                webAssembly: 'WebAssembly' in window,
                serviceWorker: 'serviceWorker' in navigator,
                webGL: !!window.WebGLRenderingContext,
                serviceWorkerSupport: 'serviceWorker' in navigator,
                notificationSupport: 'Notification' in window
            }
        };
    }

    static getSystemInfo() {
        return {
            ramGB: navigator.deviceMemory || 'Not available',
            cpuCores: navigator.hardwareConcurrency || 'Not available',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localDateTime: new Date().toString(),
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'Unknown'
        };
    }

    static detectBrowser(ua) {
        if (ua.includes("Edg")) return "Microsoft Edge";
        if (ua.includes("Chrome")) return "Google Chrome";
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
        if (ua.includes("Firefox")) return "Mozilla Firefox";
        if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
        return "Unknown";
    }

    static detectDeviceType() {
        const ua = navigator.userAgent;
        const isTouch = 'ontouchstart' in window;

        if (/mobile/i.test(ua)) return "Mobile";
        if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
        if (/android/i.test(ua) && !/mobile/i.test(ua)) return "Tablet";
        if (isTouch && screen.width < 1024) return "Mobile";
        return "Computer";
    }
}
