class AccessibilityManager {
    constructor(config = {}) {
        const {
            language = 'es',
            translationPrefix = 'db',
            notificationSeconds = 20,
            isLogged = false,
            acceptNotifications = false,
            showNotifications = true,
            siteConfiguration = {}
        } = config;

        this.toggleNotifications = new ToggleNotifications();
        this.loader = null;
        this.pageScreenshot = null;
        
        this.language = language;
        this.isLogged = isLogged;
        this.showNotifications = showNotifications;
        this.acceptNotifications = acceptNotifications;
        this.siteConfiguration = siteConfiguration;
        
        this.translationPrefix = translationPrefix;
        this.notificationSeconds = notificationSeconds;
        this.inversedPanelPosition = 'right';
        this.complexityScore = 0.00;

        // Inicializar con valores por defecto
        this.userAttributes = [];
        this.actions = [];
        this.rules = [];
        this.metrics = [];

        console.log("lenguaje del centro de accesibilidad", this.language)
    }

    async initialize() {
        try {
            await this.setupAllComponents();
            await this.loadUserProfileData();
            await this.loadRulesAndMetrics();
            await this.setupRulesEngine();
            await this.calculatePageComplexity();
            await this.processAllRules();
        } catch (error) {
            console.error("Error during initialization:", error);
        } finally {
            if (this.loader) { 
                this.loader.setProcessDescription(Translator.t(this.language, "l.completedProcess"))
                this.loader.hide();
            }
        }
    }

    async setupAllComponents() {
        // Capturar screenshot y configuración del panel
        const [screenshotResult, panelConfig] = await Promise.allSettled([
            ChromeApiService.capturePageImage(),
            ChromeApiService.getPanelConfiguration()
        ]);

        // if (screenshotResult.status === "fulfilled") {
        //     const imageBase64 = screenshotResult.value;

        //     const img = new Image();
        //     img.src = imageBase64;
        //     img.onload = () => {
        //         const canvas = document.createElement("canvas");
        //         const ctx = canvas.getContext("2d");
        //         canvas.width = img.width;
        //         canvas.height = img.height;

        //         ctx.drawImage(img, 0, 0);

        //         Tesseract.recognize(img, 'eng').then(({ data }) => {
        //             data.words.forEach(word => {
        //                 let { x0, y0, x1, y1 } = word.bbox;
        //                 let w = x1 - x0;
        //                 let h = y1 - y0;

        //                 console.log("Texto detectado:", word.text, "en:", word.bbox);
        //             });
        //         });
        //     };
        // }

        this.pageScreenshot = screenshotResult.status === "fulfilled" ? screenshotResult.value : null;
        
        await PageLoadService.waitForPageLoad();

        // Inicializar componentes principales
        try {
            this.accessibilityPanel = new AccessibilityPanel(this.language);
            // this.accessibilityPanel.setTracker(Constants.STYLES[Constants.APP.panelTracker]);
            await this.accessibilityPanel.init(this.siteConfiguration);

            this.applyEventsNotificationsOnPanel();
        } catch (error) {
            console.error("Error initializing panel:", error);
            this.accessibilityPanel = null;
        }

        // Cargar y mostrar el loader
        try {
            this.loader = new Loader(this.language);
            await this.loader.init();
            this.loader.tPage(this.language);
            this.loader.show();

            // Asignar el loader al panel
            if (this.accessibilityPanel) {
                this.accessibilityPanel.loader = this.loader;
            }
        } catch (error) {
            console.error("Error initializing loader:", error);
            this.loader = { setProcessDescription: () => {}, hide: () => {} };
        }

        try {
            this.notifications = new Notifications(this.notificationSeconds);
            await this.notifications.init();
        } catch (error) {
            console.error("Error initializing notifications:", error);
            this.notifications = null;
        }

        // Aplicar configuración del panel si está disponible
        if (panelConfig.status === "fulfilled" && panelConfig.value) {
            this.applyPanelConfiguration(panelConfig.value);
        }
    }

    applyEventsNotificationsOnPanel() {
        if (this.accessibilityPanel) {
            this.accessibilityPanel.handleClickShowNotificationsEvent(() => {
                ChromeApiService.setUserACC({
                    showNotifications: true, 
                    acceptNotifications: false
                });
            });
            this.accessibilityPanel.handleClickDontShowAcceptNotificationsEvent(() => {
                ChromeApiService.setUserACC({
                    showNotifications: false, 
                    acceptNotifications: true
                });
            });
            this.accessibilityPanel.handleClickDontShowRejectNotificationsEvent(() => {
                ChromeApiService.setUserACC({
                    showNotifications: false, 
                    acceptNotifications: false
                });
            });
        }
    }

    applyPanelConfiguration(panelConfig) {
        if (panelConfig?.location?.horizontal) {
            this.inversedPanelPosition = panelConfig.location.horizontal === 'right' ? 'left' : 'right';
        }

        if (this.accessibilityPanel) {
            this.accessibilityPanel.setPanelConfiguration(
                panelConfig?.location?.position,
                panelConfig?.minimized
            );

            this.accessibilityPanel.translatePanel(this.language);
            this.accessibilityPanel.setComplexityLevel(this.complexityScore.toFixed(2));
        }
    }

    async loadUserProfileData() {
        this.updateLoaderStatus(Translator.t(this.language, "l.loadUserProfile"));
        
        try {
            console.log("user attributes pre")
            const userAttributes = await ChromeApiService.getUserModelAttributes();
            console.log("user attributes post", userAttributes)
            this.userAttributes = userAttributes.map(attr => ({
                [attr.attributeCode]: attr.textValue
            }));
        } catch (error) {
            console.error("Error loading user profile:", error);
            console.log("Error loading user profile:", error);
            this.userAttributes = [];
        }
    }

    async loadRulesAndMetrics() {
        this.updateLoaderStatus(Translator.t(this.language, "l.loadActionsAndRules"));
        
        const [actionsResult, rulesResult, metricsResult] = await Promise.allSettled([
            ChromeApiService.getECAActions().catch(error => {
                console.error("Error loading actions:", error);
                return [];
            }),
            ChromeApiService.getECARules().catch(error => {
                console.error("Error loading rules:", error);
                return [];
            }),
            ChromeApiService.getMetrics().catch(error => {
                console.error("Error loading metrics:", error);
                return [];
            })
        ]);

        this.actions = actionsResult.status === "fulfilled" ? actionsResult.value : [];
        this.rules = rulesResult.status === "fulfilled" ? rulesResult.value : [];
        this.metrics = metricsResult.status === "fulfilled" ? metricsResult.value : [];
    }

    async setupRulesEngine() {
        try {
            console.log("cargando reglas")
            this.engine = new ExpressionEngine();
            this.ecaEngine = new ECARulesEngine(this.rules);
            
            // Registrar todas las acciones
            for (const action of this.actions) {
                try {
                    this.ecaEngine.registerStructuredFunction(action);
                } catch (error) {
                    console.error("Error registering action:", action, error);
                }
            }
            
            this.engine = this.ecaEngine.engine;
            this.context = this.createInitialContext();
            
            console.log("EL CONTEXTO GENERAL ES : ", this.context)
            // await this.processAllRules();
        } catch (error) {
            console.error("Error setting up rules engine:", error);
            // Fallback a engine básico
            this.engine = new ExpressionEngine();
            this.context = this.createInitialContext();
        }
    }

    createInitialContext() {
        // Contexto por defecto que siempre estará disponible
        return {
            "pageLegibility": "LOW",
            "fontSize": "18",
            "motorSkills": "MEDIUM",
            "contrastPreference": "HIGH",
            "hyperlinkRecognition": "LOW",
            "visualProcessingCapacity": "LOW",

            // Agregar atributos del usuario si están disponibles
            ...Object.assign({}, ...this.userAttributes)
        };
    }

    async processAllRules() {
        if (!this.ecaEngine) return;
        console.log("CONTEXT FOR RULES => ", this.context);
        for (const rule of this.rules) {
            try {
                const ruleConditionResult = this.ecaEngine.evaluateRuleCondition(rule.name, this.context);
                console.log(rule, ruleConditionResult);
                if (!ruleConditionResult) continue;

                await this.createAdaptationForRule(rule);
            } catch (error) {
                console.error("Error processing rule:", rule, error);
            }
        }

        if (this.notifications && this.notifications.getAll().length > 0) {
            this.notifications.t(this.language);
        }

        this.setupEventListeners();
    }

    async createAdaptationForRule(rule) {
        if (!this.toggleNotifications || !this.accessibilityPanel || !this.notifications) return;

        try {
            const i18nTag = `${this.translationPrefix}.${rule.name}`;
            const description = rule.translations[this.language]?.description || "Adaptación disponible";

            // Crear toggle de adaptación
            const toggleAdaptation = this.toggleNotifications.create(
                description,
                (id) => this.executeRuleActions(rule, id),
                (id) => this.executeRuleRollback(rule, id),
                `${i18nTag}.description`
            );

            this.accessibilityPanel.addOptionToAdaptationTab(toggleAdaptation);
            this.setupPanelButtonEvents();

            // Crear notificación
            const newNotification = this.notifications.create(
                description,
                `top-${this.inversedPanelPosition}`,
                (id) => this.handleNotificationAcceptance(rule, toggleAdaptation.id, id),
                (id) => this.notifications.remove(id),
                `${i18nTag}.description`
            );

            if (this.showNotifications) {
                this.notifications.showNotification(newNotification);
                this.notifications.startNotificationTimer(newNotification);
            } else {
                // Ejecutar las acciones automáticamente
                if (this.acceptNotifications) {
                    this.executeRuleActions(rule);
                    this.toggleNotifications.setToggleState(toggleAdaptation.id, true);
                }
            }

            // Agregar traducciones
            for (const lang in rule.translations) {
                const translationObj = rule.translations[lang];
                for (const key in translationObj) {
                    const formattedKey = `${i18nTag}.${key}`;
                    Translator.addTranslation(lang, formattedKey, translationObj[key]);
                }
            }
        } catch (error) {
            console.error("Error creating rule adaptation:", error);
        }
    }

    executeRuleActions(rule, id) {
        if (this.ecaEngine) {
            this.ecaEngine.evaluateRule(rule.name, this.context, true);
        }
    }

    executeRuleRollback(rule, id) {
        if (!rule.rollbackActions || !this.engine) return;
        
        for (const rollbackAction of rule.rollbackActions) {
            try {
                this.engine.evaluate(rollbackAction, this.context);
            } catch (error) {
                console.error("Error evaluating rollback action:", error);
            }
        }
    }

    handleNotificationAcceptance(rule, toggleId, notificationId) {
        this.executeRuleActions(rule);
        
        if (this.toggleNotifications.setToggleState) {
            this.toggleNotifications.setToggleState(toggleId, true);
        }
        if (this.notifications.remove) {
            this.notifications.remove(notificationId);
        }
    }

    setupPanelButtonEvents() {
        if (!this.accessibilityPanel?.eventManager) return;

        this.accessibilityPanel.eventManager.handleAdaptationEvents();
    }

    setupEventListeners() {
        // Listener para cambios de posición del panel
        console.log("move panel position? ")
        document.addEventListener('panelPositionChanged', (event) => {
            if (this.notifications?.moveAllToPosition) {
                this.notifications.moveAllToPosition(`top-${event.detail.inversedHorizontalPosition}`);
            }
        });

        // Listener cuando no hay interacción con el panle posterior al cambio en alguna opción
        document.addEventListener('optionExtPanelInactivity', (event) => {
            const currentConfiguration = event.detail;
            console.log("current configuration", currentConfiguration);

            chrome.runtime.sendMessage({
                type: "SET_USER_SITE_CONFIGURATION",
                configuration: currentConfiguration
            }, (response) => {
                
                console.log("save user site", response);
                if (!response) return;
            })
        });

        // Listener para cambios de idioma
        console.log("change language? ")
        document.addEventListener('extLanguageChange', (event) => {
            const language = event.detail.language;
            this.language = language;
            
            console.log("cambiar a ", language)
            // if (this.isLogged == false) {
                console.log("cambiar a en unlogged data", language)
                ChromeApiService.setLanguage(language);
            // }

            if (this.loader) {
                this.loader.tPage(language);
            }

            if (this.notifications) {
                this.notifications.t(language);
            }
            if (this.accessibilityPanel) {
                this.accessibilityPanel.translatePanel(language);

                if (this.accessibilityPanel.modal) {
                    this.accessibilityPanel.modal.t(language);
                }
            }
        });
    }

    async calculatePageComplexity() {
        this.updateLoaderStatus(Translator.t(this.language, "l.evaluatingMetrics"));
        
        try {
            if (this.metrics.length > 0 && this.engine) {
                const metricExecuter = new MetricExecuter(this.metrics, this.engine, { 
                    pageScreenshot: this.pageScreenshot 
                });

                const result = await metricExecuter.evaluateMetricsSimultaneously();
                
                const metricsValues = {};
                for (const key in result) {
                    metricsValues[key] = result[key].value;
                }

                // Agregar al contexto los resultados de las métricas
                if (this.context) {
                    this.context = {
                        ...this.context,
                        ...metricsValues
                    };
                    console.log("CONTEXTO POST MÉTRICAS", this.context);
                }



                this.complexityScore = Object.values(result).reduce((sum, metric) => sum + metric.valueWeighted, 0);
                
                if (this.accessibilityPanel?.setComplexityLevel) {
                    this.accessibilityPanel.setComplexityLevel(this.complexityScore.toFixed(2));
                }
                
                console.table(result);
            } else {
                console.warn("No metrics available to evaluate");
                if (this.accessibilityPanel?.setComplexityLevel) {
                    this.accessibilityPanel.setComplexityLevel("0.00");
                }
            }
        } catch (error) {
            console.error("Error evaluating metrics:", error);
            if (this.accessibilityPanel?.setComplexityLevel) {
                this.accessibilityPanel.setComplexityLevel("0.00");
            }
        } finally {
            this.updateLoaderStatus(Translator.t(this.language, "l.completedProcess"));
            if (this.loader.hide) {
                this.loader.setProcessDescription(Translator.t(this.language, "l.completedProcess"))
                this.loader.hide();
            }
        }
    }

    updateLoaderStatus(description) {
        if (this.loader.setProcessDescription) {
            this.loader.setProcessDescription(description);
        }
    }
}

async function initializeApp() {
    try {
        // Obtener los datos de la sesión iniciada
        const userSession = await ChromeApiService.getUserSession()
            .catch((error) => {
                console.log(error); 
                return null;
            });


        const site = PageLoadService.getPageInfo().urlFiltered;
        const siteConfiguration = await ChromeApiService.getElderlyUserSiteConfiguration(site)
            .catch((error) => {
                console.log(error);
                return null;
            });

        console.log("site configuration: ", siteConfiguration);

        // Cargar el idioma del usuario en el perfil de usuario
        // (si no está registrado, tomarlo del navegador)
        let language = "es";
        let showNotifications = true;
        let acceptNotifications = false;
        

        if (userSession && userSession.user) {
            console.log("sesion de usuario =", userSession)
            language = userSession.user.language;
            
            userACC = userSession[Constants.APP.ACC];
            showNotifications = userACC[Constants.APP.showNotifications];
            acceptNotifications = userACC[Constants.APP.acceptNotifications];

            console.log("Selected language from user profile", language, showNotifications, acceptNotifications)
        } else {
            // Obtener datos de la sesión sin iniciar sesión
            const unloggedPreferences = await ChromeApiService.getUnloggedPreferences();
            console.log("Preferencias unlogged", unloggedPreferences);

            if (unloggedPreferences) {
                language = unloggedPreferences.language;
                console.log("Selected language from unlogged", language);
            } else {
                language = UserInfoService.getLanguage().lang;
                console.log("Selected language from navigator", language);
            }
        }
        
        const isLogged = (userSession != null && userSession != undefined) ? true : false;
        console.log("is logged? ", isLogged);
        const config = {
            language: language,
            translationPrefix: Constants.APP.translationsPrefix,
            notificationSeconds: 20,
            isLogged: isLogged,
            showNotifications: showNotifications,
            acceptNotifications: acceptNotifications,
            siteConfiguration: siteConfiguration
        };

        const accessibilityManager = new AccessibilityManager(config);
        await accessibilityManager.initialize();
        console.log("modal cargado =>", accessibilityManager.accessibilityPanel.modal)
        console.log("modal cargado =>", accessibilityManager.accessibilityPanel.modal.shadowRoot)
        
        // for (let i = 0; i < 50; i++) {

        //     const p = document.createElement("p");
        //     p.textContent = "Prueba de párrafo";
        //     modalContent.push(p);
        // }


        // accessibilityManager.accessibilityPanel.modal.setContent(modalContent);
        // accessibilityManager.modal.show();
        
        console.log("Initialization finished");
    } catch (error) {
        console.error("Fatal error in initialization:", error);
    }
}


initializeApp().then().catch();