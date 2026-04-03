const CONFIG = {
    instanceName: "EshaWords",
    htmlUrl: "https://afagp.store/ew/index.html",
    game: {
        wordLength: 5,
        maxAttempts: 6
    },
    theme: {
        storageKey: "esw.data",
        themeKey: "esw.theme",
        defaultTheme: "dark"
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}