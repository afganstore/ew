const WordParser = (function() {
    'use strict';
    
    function normalizeWord(raw, requiredLength) {
        let cleaned = raw.trim().toUpperCase();
        let filtered = cleaned.replace(/[^A-ZА-Я]/g, '');
        if (filtered.length !== requiredLength) return null;
        return filtered;
    }
    
    function encodeBase64(word) {
        return btoa(unescape(encodeURIComponent(word)));
    }
    
    function decodeBase64(encoded) {
        try {
            return decodeURIComponent(escape(atob(encoded)));
        } catch(e) { 
            return null; 
        }
    }
    
    function isValidWord(word, requiredLength) {
        const normalized = normalizeWord(word, requiredLength);
        return normalized !== null;
    }
    
    function getLetterState(secret, guess, idx) {
        if (guess[idx] === secret[idx]) return "correct";
        if (secret.includes(guess[idx])) return "present";
        return "absent";
    }
    
    return {
        normalizeWord: normalizeWord,
        encodeBase64: encodeBase64,
        decodeBase64: decodeBase64,
        isValidWord: isValidWord,
        getLetterState: getLetterState
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordParser;
}