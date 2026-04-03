(function() {
    'use strict';
    
    let gameState = {
        secretWord: "",
        attempts: [],
        currentAttempt: "",
        gameOver: false,
        maxAttempts: CONFIG.game.maxAttempts,
        wordLength: CONFIG.game.wordLength
    };
    
    document.getElementById('appTitle').textContent = CONFIG.instanceName;
    document.getElementById('wordLengthLabel').textContent = CONFIG.game.wordLength;
    document.getElementById('attemptsLabel').textContent = CONFIG.game.maxAttempts;
    
    const createSection = document.getElementById('createSection');
    const gameZone = document.getElementById('gameZone');
    const boardDiv = document.getElementById('board');
    const messageDiv = document.getElementById('message');
    const secretWordInput = document.getElementById('secretWordInput');
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const linkContainer = document.getElementById('linkContainer');
    const gameLinkText = document.getElementById('gameLinkText');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const backToCreateBtn = document.getElementById('backToCreateBtn');
    const themeToggle = document.getElementById('themeToggle');
    
    secretWordInput.maxLength = CONFIG.game.wordLength;
    secretWordInput.placeholder = `Введите ${CONFIG.game.wordLength} букв`;
    
    function loadTheme() {
        try {
            const eswData = localStorage.getItem(CONFIG.theme.storageKey);
            if (eswData) {
                const parsed = JSON.parse(eswData);
                if (parsed && parsed[CONFIG.theme.themeKey]) {
                    return parsed[CONFIG.theme.themeKey];
                }
            }
        } catch(e) {}
        return CONFIG.theme.defaultTheme;
    }
    
    function saveTheme(theme) {
        try {
            let eswData = {};
            const existing = localStorage.getItem(CONFIG.theme.storageKey);
            if (existing) {
                eswData = JSON.parse(existing);
            }
            eswData[CONFIG.theme.themeKey] = theme;
            localStorage.setItem(CONFIG.theme.storageKey, JSON.stringify(eswData));
        } catch(e) {}
    }
    
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        saveTheme(theme);
    }
    
    function toggleTheme() {
        const current = document.body.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    const savedTheme = loadTheme();
    setTheme(savedTheme);
    themeToggle.addEventListener('click', toggleTheme);
    
    function renderBoard() {
        boardDiv.innerHTML = '';
        const state = gameState;
        for (let row = 0; row < state.maxAttempts; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'word-row';
            let attemptWord = '';
            if (row < state.attempts.length) {
                attemptWord = state.attempts[row];
            } else if (row === state.attempts.length) {
                attemptWord = state.currentAttempt.padEnd(state.wordLength, ' ');
            } else {
                attemptWord = ' '.repeat(state.wordLength);
            }
            
            for (let col = 0; col < state.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                const letter = attemptWord[col] === ' ' ? '' : attemptWord[col];
                tile.textContent = letter;
                if (row < state.attempts.length && letter) {
                    const secret = state.secretWord;
                    const guess = state.attempts[row];
                    const stateType = WordParser.getLetterState(secret, guess, col);
                    tile.classList.add(stateType);
                }
                rowDiv.appendChild(tile);
            }
            boardDiv.appendChild(rowDiv);
        }
    }
    
    function showMessage(msg, isError = false) {
        messageDiv.innerHTML = msg;
        if (isError) {
            messageDiv.style.background = '#3a2a2a';
            messageDiv.style.color = '#ffaaaa';
        } else {
            messageDiv.style.background = '#2a2a3a';
            messageDiv.style.color = '#bbbbff';
        }
        setTimeout(() => {
            if (messageDiv.innerHTML === msg) {
                if (document.body.getAttribute('data-theme') === 'dark') {
                    messageDiv.style.background = '#2a2a2a';
                    messageDiv.style.color = '#d0d0d0';
                } else {
                    messageDiv.style.background = '#f1f3f4';
                    messageDiv.style.color = '#1c1b1f';
                }
            }
        }, 2800);
    }
    
    function submitAttempt() {
        const state = gameState;
        if (state.gameOver) {
            showMessage(`Игра окончена. Слово: ${state.secretWord}`, true);
            return;
        }
        if (state.currentAttempt.length !== state.wordLength) {
            showMessage(`Нужно ровно ${state.wordLength} букв!`, true);
            return;
        }
        const guess = state.currentAttempt;
        state.attempts.push(guess);
        state.currentAttempt = '';
        
        if (guess === state.secretWord) {
            state.gameOver = true;
            renderBoard();
            showMessage(`🎉 ПОБЕДА! Слово отгадано: ${state.secretWord} 🎉`, false);
            return;
        }
        
        if (state.attempts.length === state.maxAttempts) {
            state.gameOver = true;
            renderBoard();
            showMessage(`❌ Попытки кончились. Загаданное слово: ${state.secretWord}`, true);
            return;
        }
        renderBoard();
        showMessage(`Осталось попыток: ${state.maxAttempts - state.attempts.length}`);
    }
    
    function initGameWithWord(word) {
        const normalized = WordParser.normalizeWord(word, CONFIG.game.wordLength);
        if (!normalized) {
            alert(`Ошибка: слово должно быть ${CONFIG.game.wordLength} букв (только буквы, русские или английские)`);
            return false;
        }
        gameState = {
            secretWord: normalized,
            attempts: [],
            currentAttempt: "",
            gameOver: false,
            maxAttempts: CONFIG.game.maxAttempts,
            wordLength: CONFIG.game.wordLength
        };
        renderBoard();
        showMessage(`Игра началась! Угадай слово из ${CONFIG.game.wordLength} букв.`);
        return true;
    }
    
    function buildGameLink(word) {
        const normalized = WordParser.normalizeWord(word, CONFIG.game.wordLength);
        if (!normalized) return null;
        const encoded = WordParser.encodeBase64(normalized);
        const baseUrl = CONFIG.htmlUrl;
        return `${baseUrl}?id=${encoded}`;
    }
    
    function startGameFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const encodedWord = params.get('id');
        if (encodedWord) {
            const decoded = WordParser.decodeBase64(encodedWord);
            if (decoded && WordParser.normalizeWord(decoded, CONFIG.game.wordLength)) {
                if (initGameWithWord(decoded)) {
                    createSection.style.display = 'none';
                    gameZone.style.display = 'block';
                    return true;
                } else {
                    alert("Не удалось расшифровать слово. Загадайте новое.");
                    createSection.style.display = 'block';
                    gameZone.style.display = 'none';
                    return false;
                }
            } else {
                alert("Ссылка повреждена. Создайте новое слово.");
                createSection.style.display = 'block';
                gameZone.style.display = 'none';
                return false;
            }
        } else {
            createSection.style.display = 'block';
            gameZone.style.display = 'none';
            return false;
        }
    }
    
    generateLinkBtn.addEventListener('click', () => {
        const raw = secretWordInput.value;
        const normWord = WordParser.normalizeWord(raw, CONFIG.game.wordLength);
        if (!normWord) {
            alert(`Введите корректное слово: ${CONFIG.game.wordLength} букв, только кириллица или латиница`);
            return;
        }
        const link = buildGameLink(normWord);
        if (link) {
            gameLinkText.textContent = link;
            linkContainer.style.display = 'flex';
            showMessage("✅ Ссылка готова! Отправь её другу.", false);
        }
    });
    
    copyLinkBtn.addEventListener('click', () => {
        const link = gameLinkText.textContent;
        if (link && link.startsWith('http')) {
            navigator.clipboard.writeText(link).then(() => {
                alert("Ссылка скопирована в буфер!");
            }).catch(() => alert("Выделите ссылку вручную"));
        }
    });
    
    backToCreateBtn.addEventListener('click', () => {
        createSection.style.display = 'block';
        gameZone.style.display = 'none';
        gameState.gameOver = true;
    });
    
    window.addEventListener('keydown', (e) => {
        if (gameZone.style.display !== 'block') return;
        if (gameState.gameOver) {
            if (e.key === 'Enter') {
                showMessage(`Игра завершена. Слово: ${gameState.secretWord}`, true);
                e.preventDefault();
            }
            return;
        }
        
        const key = e.key;
        if (key === 'Enter') {
            e.preventDefault();
            submitAttempt();
        }
        else if (key === 'Backspace') {
            e.preventDefault();
            if (gameState.currentAttempt.length > 0) {
                gameState.currentAttempt = gameState.currentAttempt.slice(0, -1);
                renderBoard();
            }
        }
        else if (/^[A-Za-zА-Яа-я]$/.test(key)) {
            e.preventDefault();
            const upperKey = key.toUpperCase();
            if (gameState.currentAttempt.length < gameState.wordLength) {
                gameState.currentAttempt += upperKey;
                renderBoard();
            }
        }
    });
    
    secretWordInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });
    
    startGameFromUrl();
})();