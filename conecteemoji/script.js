document.addEventListener('DOMContentLoaded', () => {
    const allPairs = [
        // { id: 'queijo', item: '🐀', target: '🧀', video: 'videos/rato-queijo.mp4', caption: '🐀 👄🧀', speechPhrase: 'o rato come queijo' },
        { id: 'peixe', item: '🐧', target: '🐟', video: 'videos/pinguim-peixe.mp4', caption: '🐧 👄🐟', speechPhrase: 'o pinguim come peixe' },
        { id: 'banana', item: '🐒', target: '🍌', video: 'videos/macaco-banana.mp4', caption: '🐒 👄🍌', speechPhrase: 'o macaco come banana' },
        { id: 'osso', item: '🐶', target: '🦴', video: 'videos/cao-osso.mp4', caption: '🐶 ❤ 🦴', speechPhrase: 'o cachorro gosta do osso' },
        { id: 'cenoura', item: '🐰', target: '🥕', video: 'videos/coelho-cenoura.mp4', caption: '🐰 👄🥕', speechPhrase: 'o coelho come cenoura' },
        { id: 'mel', item: '🐝', target: '🍯', video: 'videos/abelha-mel.mp4', caption: '🐝 👄🍯', speechPhrase: 'a abelha faz mel' },
        { id: 'mamadeira', item: '👶', target: '🍼', video: 'videos/bebe-mamadeira.mp4', caption: '👶 ​🫴​ 🍼', speechPhrase: 'o bebê quer a mamadeira' },
        { id: 'estrada', item: '🚗', target: '🛣️', video: 'videos/carro-estrada.mp4', caption: '🚗 🚶‍♀️​ 🛣️', speechPhrase: 'o carro está na estrada' },
        { id: 'ovo', item: '🐔', target: '🥚', video: 'videos/galinha-ovo.mp4', caption: '🐔 📥 🥚', speechPhrase: 'a galinha bota o ovo' },
        { id: 'cadeado', item: '🔑', target: '🔒', video: 'videos/chave-cadeado.mp4', caption: '🔑 🔐​🔓 🔒', speechPhrase: 'a chave abre o cadeado' },
        { id: 'dormir', item: '😴', target: '🛌💤', video: 'videos/sono-dormir.mp4', caption: '😴 🫴​ 🛌💤', speechPhrase: 'a pessoa vai dormir na cama' },
        { id: 'voou', item: '✈', target: '🛫', video: 'videos/aviao-voou.mp4', caption: '✈️ 🛫', speechPhrase: 'o avião vai decolar' },
        { id: 'basquete', item: '🏀', target: '⛹️‍♀️', video: 'videos/bola-basquete.mp4', caption: '⛹️‍♀️​', speechPhrase: 'a jogadora joga basquete' },
        { id: 'dente', item: '🪥', target: '🦷', video: 'videos/escova-dente.mp4', caption: '🪥🦷', speechPhrase: 'a escova limpa o dente' },
        { id: 'praia', item: '​👙​', target: '🏖️', video: 'videos/biquine-praia.mp4', caption: '📥​👙 ➡ 🏖️', speechPhrase: 'o biquíni é para a praia' },
        { id: 'bombeiro', item: '​🧑‍🚒​', target: '​🔥​', video: 'videos/bombeiro-fogo.mp4', caption: '🧑‍🚒 🧯​ 🔥️', speechPhrase: 'o bombeiro apaga o fogo' },
        { id: 'cientista', item: '​​👨‍🔬', target: '​🔬​', video: 'videos/cientista-microscopio.mp4', caption: '👨‍🔬 👀​​ ‍🔬', speechPhrase: 'o cientista usa o microscópio' },
        { id: 'formiga', item: '​​🐜​', target: '​▪️​', video: 'videos/formiga-pequena.mp4', caption: '​​🐜▪️​', speechPhrase: 'a formiga é pequena' },
        { id: 'elefante', item: '🐘', target: '​⬛​​', video: 'videos/elefante-grande.mp4', caption: '​​🐘⬛​​​', speechPhrase: 'o elefante é grande' },
		{ id: 'aranha', item: '🕷️', target: '​🕸️​​​', video: 'videos/aranha-teia.mp4', caption: '​​🕷️​🕸️​​​', speechPhrase: 'a aranha faz a teia' },
		{ id: 'foguete', item: '🚀​', target: '🌕​​​​', video: 'videos/foguete-lua.mp4', caption: '​​🚀 ➡️​ 🌕', speechPhrase: 'o foguete vai para a lua' },
		{ id: 'gato', item: '​​​🐈​', target: '🐭​​​​', video: 'videos/gato-rato.mp4', caption: '​​🐈 🏃‍➡️​ 🐭​', speechPhrase: 'o gato persegue o rato' },
		{ id: 'noel', item: '​​​🎅🏽​', target: '🎁​​​​', video: 'videos/noel-presente.mp4', caption: '​​🎅🏽 🫳​🎁', speechPhrase: 'o papai noel entrega o presente' },
		{ id: 'menina', item: '​​​​👧🏽', target: '🚴🏽‍♀️‍​​​​', video: 'videos/menina-bicicleta.mp4', caption: '​​👧🏽 🚴🏽‍♀️', speechPhrase: 'a menina anda de bicicleta' },
		{ id: 'veleiro', item: '​​​​⛵​', target: '🏝‍​​​​', video: 'videos/veleiro-ilha.mp4', caption: '​​⛵ ➡️ 🏝‍', speechPhrase: 'o veleiro vai para a ilha' },
		{ id: 'virus', item: '​​​​🦠​', target: '🤧​​​​', video: 'videos/virus-doente.mp4', caption: '​​🦠 🤧​​​​', speechPhrase: 'o vírus deixa doente' },
		{ id: 'frio', item: '​​​​❄️', target: '​​​​🧣', video: 'videos/frio-cachecol.mp4', caption: '​​❄️ 👧🏽👈🏽🧣​​​​', speechPhrase: 'no frio usamos cachecol' },
		{ id: 'sol', item: '​​​​☀️', target: '🕶️​​​​', video: 'videos/sol-oculos.mp4', caption: '​​​​​​☀️ 👧🏽👈🏽​​​​🕶️​​​​', speechPhrase: 'no sol usamos óculos' },
		{ id: 'chuva', item: '​​​​🌧️​', target: '☂️​​​​', video: 'videos/chuva-guarda.mp4', caption: '​​🌧️ 👧🏽👈🏽​​​​☂️​​​​', speechPhrase: 'na chuva usamos guarda chuva' }
    ];

    // --- Elementos do DOM ---
    const gameArea = document.querySelector('.game-area');
    const leftSide = document.querySelector('.left-side');
    const rightSide = document.querySelector('.right-side');
    const feedback = document.getElementById('feedback');
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const videoOverlay = document.getElementById('video-overlay');
    const videoPlayer = document.getElementById('video-player');
    const videoCaption = document.getElementById('video-caption');
    const restartButton = document.getElementById('restart-button');
    const finalScoreOverlay = document.getElementById('final-score-overlay');
    const starRating = document.getElementById('star-rating');
    const totalCorrectSpan = document.getElementById('total-correct');
    const totalWrongSpan = document.getElementById('total-wrong');
    const startScreenOverlay = document.getElementById('start-screen-overlay');
    const startButton = document.getElementById('start-button');
    const star3Sound = document.getElementById('star3Sound');
    const star4Sound = document.getElementById('star4Sound');
    const star5Sound = document.getElementById('star5Sound');
    const settingsButton = document.getElementById('settings-button');
    const settingsOverlay = document.getElementById('settings-overlay');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const micFeedback = document.getElementById('mic-feedback');

    // --- Variáveis de Estado do Jogo ---
    let availablePairs = [];
    let draggedItem = null;
    let correctPairsInRound = 0;
    const pairsPerRound = 3;
    let totalWrongAttempts = 0;
    let currentDropZone = null;
    let currentRound = 0;
    const maxRounds = 3;
    let speechDifficulty = 1; // Nível 1 (Desativado) por padrão

    // --- LÓGICA DE ARRASTAR --- (Sem alterações)
    function dragStart(e) {
        if (e.cancelable) e.preventDefault();
        draggedItem = this;
        draggedItem.style.position = 'absolute';
        draggedItem.style.zIndex = '1000';
        draggedItem.style.opacity = '0.5';
        draggedItem.style.transform = 'scale(1.1)';
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }
    function dragMove(e) {
        if (!draggedItem) return;
        if (e.cancelable) e.preventDefault();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        draggedItem.style.left = `${x - (draggedItem.offsetWidth / 2)}px`;
        draggedItem.style.top = `${y - (draggedItem.offsetHeight / 2)}px`;
        draggedItem.style.display = 'none';
        const elementUnder = document.elementFromPoint(x, y);
        draggedItem.style.display = '';
        const dropZoneUnder = elementUnder ? elementUnder.closest('.drop-zone') : null;
        if (currentDropZone && currentDropZone !== dropZoneUnder) {
            currentDropZone.classList.remove('hovering');
        }
        if (dropZoneUnder) {
            dropZoneUnder.classList.add('hovering');
        }
        currentDropZone = dropZoneUnder;
    }
    function dragEnd(e) {
        if (!draggedItem) return;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        draggedItem.style.opacity = '1';
        draggedItem.style.transform = 'scale(1)';
        draggedItem.style.zIndex = '';
        if (currentDropZone) {
            currentDropZone.classList.remove('hovering');
            if (draggedItem.dataset.targetId === currentDropZone.dataset.matchId) {
                handleCorrectMatch(draggedItem, currentDropZone);
            } else {
                handleWrongMatch();
                draggedItem.style.position = '';
                draggedItem.style.left = '';
                draggedItem.style.top = '';
            }
        } else {
            draggedItem.style.position = '';
            draggedItem.style.left = '';
            draggedItem.style.top = '';
        }
        draggedItem = null;
        currentDropZone = null;
    }
    
    // --- LÓGICA DO MENU DE CONFIGURAÇÕES ---
    function openSettings() {
        settingsOverlay.style.display = 'flex';
        document.querySelector(`input[name="difficulty"][value="${speechDifficulty}"]`).checked = true;
    }
    function closeSettings() {
        settingsOverlay.style.display = 'none';
    }
    function saveSettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
        speechDifficulty = parseInt(selectedDifficulty, 10);
        closeSettings();
    }
    
    // --- FUNÇÃO DE SIMILARIDADE DE TEXTO (Levenshtein) ---
    function getLevenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // --- LÓGICA PRINCIPAL DO JOGO ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function initializeGame() {
        startScreenOverlay.style.display = 'none';
        gameArea.style.display = 'flex';
        startNewGame();
    }
    function startNewGame() {
        availablePairs = [...allPairs];
        totalWrongAttempts = 0;
        currentRound = 0;
        finalScoreOverlay.style.display = 'none';
        startScreenOverlay.style.display = 'none';
        gameArea.style.display = 'flex';
        startRound();
    }
    function startRound() {
        currentRound++;
        if (currentRound > maxRounds) {
            showFinalScore();
            return;
        }
        leftSide.innerHTML = '';
        rightSide.innerHTML = '';
        feedback.textContent = '';
        correctPairsInRound = 0;
        const pairsForThisRound = availablePairs.length >= pairsPerRound ? pairsPerRound : availablePairs.length;
        if (pairsForThisRound > 0) {
            shuffleArray(availablePairs);
            const currentPairs = availablePairs.splice(0, pairsForThisRound);
            setupRoundUI(currentPairs);
        } else {
            showFinalScore();
        }
    }
    function setupRoundUI(pairs) {
        const items = pairs.map(pair => createDraggableItem(pair));
        const targets = pairs.map(pair => createDropZone(pair));
        shuffleArray(targets);
        items.forEach(item => leftSide.appendChild(item));
        targets.forEach(target => rightSide.appendChild(target));
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('mousedown', dragStart);
            item.addEventListener('touchstart', dragStart, { passive: false });
        });
    }
    function createDraggableItem(pair) {
        const item = document.createElement('div');
        item.className = 'item';
        item.draggable = false;
        item.dataset.targetId = pair.id;
        item.innerHTML = pair.item;
        return item;
    }
    function createDropZone(pair) {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.matchId = pair.id;
        zone.innerHTML = pair.target;
        return zone;
    }
    
    // --- LÓGICA DE MATCH E RECONHECIMENTO DE VOZ (ATUALIZADA) ---
    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        item.remove();
        zone.classList.add('hidden');
        const correctPair = allPairs.find(p => p.id === zone.dataset.matchId);
        if (speechDifficulty === 1 || !correctPair.speechPhrase) {
            proceedToVideo(correctPair);
            return;
        }
        startSpeechRecognition(correctPair);
    }

    function startSpeechRecognition(pair) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Seu navegador não suporta o reconhecimento de voz. A atividade continuará sem a fala.");
            proceedToVideo(pair);
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        micFeedback.textContent = `🎙️ Diga: "${pair.speechPhrase}"`;
        micFeedback.style.display = 'block';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            let success = false;
            const targetPhrase = pair.speechPhrase.toLowerCase();
            switch (speechDifficulty) {
                case 2: success = true; break;
                case 3: success = getLevenshteinDistance(transcript, targetPhrase) < targetPhrase.length * 0.5; break;
                case 4: success = getLevenshteinDistance(transcript, targetPhrase) < targetPhrase.length * 0.25; break;
                case 5: success = getLevenshteinDistance(transcript, targetPhrase) <= 2; break;
            }
            if (success) {
                micFeedback.textContent = '👍 Ótimo!';
                setTimeout(() => {
                    micFeedback.style.display = 'none';
                    proceedToVideo(pair);
                }, 1500);
            } else {
                micFeedback.textContent = `❌ Tente de novo: "${pair.speechPhrase}"`;
                setTimeout(() => recognition.start(), 1500);
            }
        };
        recognition.onerror = (event) => {
            micFeedback.textContent = "Houve um erro. Tente novamente.";
            micFeedback.style.display = 'none';
            setTimeout(() => proceedToVideo(pair), 2000);
        };
    }
    
    function proceedToVideo(correctPair) {
        if (!correctPair || !correctPair.video) {
            checkRoundCompletion();
            return;
        }
        videoCaption.textContent = correctPair.caption;
        videoPlayer.muted = false;
        setTimeout(() => {
            videoOverlay.style.display = 'flex';
            videoPlayer.style.display = 'block';
            videoPlayer.src = correctPair.video;
            videoPlayer.load();
            videoPlayer.play().catch(() => checkRoundCompletion());
            videoPlayer.onended = () => {
                videoOverlay.style.display = 'none';
                videoCaption.textContent = '';
                checkRoundCompletion();
            };
        }, 400);
    }
    
    function handleWrongMatch() {
        wrongSound.play();
        feedback.textContent = '❌';
        totalWrongAttempts++;
        setTimeout(() => feedback.textContent = '', 1500);
    }
    function checkRoundCompletion() {
        correctPairsInRound++;
        const totalPairsInThisRound = rightSide.querySelectorAll('.drop-zone:not(.hidden)').length;
        if (totalPairsInThisRound === 0) {
            feedback.textContent = '👏​👍';
            setTimeout(startRound, 2000);
        } else {
            setTimeout(() => feedback.textContent = '', 1500);
        }
    }
    function showFinalScore() {
        let stars = '';
        if (totalWrongAttempts === 0) { stars = '⭐⭐⭐⭐⭐'; star5Sound.play(); }
        else if (totalWrongAttempts <= 2) { stars = '⭐⭐⭐⭐'; star4Sound.play(); }
        else if (totalWrongAttempts <= 4) { stars = '⭐⭐⭐'; star3Sound.play(); }
        else if (totalWrongAttempts <= 6) { stars = '⭐⭐'; }
        else { stars = '⭐'; }
        starRating.textContent = stars;
        const correctAnswers = allPairs.length - availablePairs.length - (leftSide.childNodes.length);
        totalCorrectSpan.textContent = correctAnswers > 0 ? correctAnswers : 0;
        totalWrongSpan.textContent = totalWrongAttempts;
        finalScoreOverlay.style.display = 'flex';
        gameArea.style.display = 'none';
    }

    // --- Event Listeners Iniciais ---
    restartButton.addEventListener('click', startNewGame);
    startButton.addEventListener('click', initializeGame);
    settingsButton.addEventListener('click', openSettings);
    saveSettingsButton.addEventListener('click', saveSettings);
});