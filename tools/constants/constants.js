class Constants {
    static ATTRIBUTES = {
        attributeId: "attributeId",
        attributeName: "attributeName",
        attributeTranslations: "attributeTranslations",
        attributeType: "dataTypeAttribute",
        attributeTypeId: "dataTypeAttributeId",
        dataTypeId: "dataTypeId",
        dataType: "dataType",
        classAttribute: "classAttribute",
        attributeCode: "attributeCode",
        classAttribute_ts: "classAttribute_ts",
        classAttributeId: "classAttributeId",
        isDefault: "isDefault",
        options: "options",
        textValue: "textValue",
    };

    static OPTIONS = {
        dataListed: "dataListed",
        dataListed_ts: "dataListed_ts",
        value: "textEquivalent",
    };

    // Revisar el archivo de background para coincidir con estas
    // constantes
    static APP = {
        lastUpdate: "25082025",
        sessionData: "sessionData",
        userAttributes: "attributes",
        ACC: "acc",
        showNotifications: "showNotifications",
        acceptNotifications: "acceptNotifications",
        authToken: "authToken",
        userData: "user",
        email: "email",
        password: "password",
        language: "preferredLanguage",
        translationsPrefix: "DB",
        panelTracker: "panelTracker",
        recommendationsTracker: "recommendationTracker",
    }

    static STYLES = {}

    static addStyleTracker(key, tracker) {
        this.STYLES[key] = tracker;
        console.log("ESTILOS", this.STYLES)
    }
}