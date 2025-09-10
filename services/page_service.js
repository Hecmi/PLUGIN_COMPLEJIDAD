class PageLoadService {
    static waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                const onLoad = () => {
                    window.removeEventListener('load', onLoad);
                    resolve();
                };
                window.addEventListener('load', onLoad);
            }
        });
    }

    static getPageInfo() {
        const pageInfo = {
            host: window.location.hostname,
            urlFiltered: `${window.location.hostname}${window.location.pathname}`,
            url: window.location.href,
            path: window.location.pathname,
            protocol: window.location.protocol,
            port: window.location.port || null,
            referrer: document.referrer || null
            // language: document.documentElement.lang || null,
            // title: document.title,
        };


        return pageInfo;
    }
}
