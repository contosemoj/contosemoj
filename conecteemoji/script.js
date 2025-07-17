document.addEventListener('DOMContentLoaded', () => {
    const allPairs = [
        // { id: 'queijo', item: '🐀', target: '🧀', video: 'videos/rato-queijo.mp4', caption: '🐀 👄🧀' },
        { id: 'peixe', item: '🐧', target: '🐟', video: 'videos/pinguim-peixe.mp4', caption: '🐧 👄🐟' },
        { id: 'banana', item: '🐒', target: '🍌', video: 'videos/macaco-banana.mp4', caption: '🐒 👄🍌' },
        { id: 'osso', item: '🐶', target: '🦴', video: 'videos/cao-osso.mp4', caption: '🐶 ❤ 🦴' },
        { id: 'cenoura', item: '🐰', target: '🥕', video: 'videos/coelho-cenoura.mp4', caption: '🐰 👄🥕' },
        { id: 'mel', item: '🐝', target: '🍯', video: 'videos/abelha-mel.mp4', caption: '🐝 👄🍯' },
        // { id: 'mamadeira', item: '👶', target: '🍼', video: 'videos/bebe-mamadeira.mp4', caption: '👶 ​🫴​ 🍼' },
        // { id: 'estrada', item: '🚗', target: '🛣️', video: 'videos/carro-estrada.mp4', caption: '🚗 🚶‍♀️​ 🛣️' },
        { id: 'ovo', item: '🐔', target: '🥚', video: 'videos/galinha-ovo.mp4', caption: '🐔 📥 🥚' },
        { id: 'cadeado', item: '🔑', target: '🔒', video: 'videos/chave-cadeado.mp4', caption: '🔑 🔐​🔓 🔒' },
        { id: 'dormir', item: '😴', target: '🛌💤', video: 'videos/sono-dormir.mp4', caption: '😴 🫴​ 🛌💤' },
        { id: 'voou', item: '✈', target: '🛫', video: 'videos/aviao-voou.mp4', caption: '✈️ 🛫' },
        { id: 'basquete', item: '🏀', target: '⛹️‍♀️', video: 'videos/bola-basquete.mp4', caption: '⛹️‍♀️​' },
        // { id: 'dente', item: '🪥', target: '🦷', video: 'videos/escova-dente.mp4', caption: '🪥🦷' },
        // { id: 'praia', item: '​👙​', target: '🏖️', video: 'videos/biquine-praia.mp4', caption: '📥​👙 ➡ 🏖️' },
        { id: 'bombeiro', item: '​🧑‍🚒​', target: '​🔥​', video: 'videos/bombeiro-fogo.mp4', caption: '🧑‍🚒 🧯​ 🔥️' },
        { id: 'cientista', item: '​​👨‍🔬', target: '​🔬​', video: 'videos/cientista-microscopio.mp4', caption: '👨‍🔬 👀​​ ‍🔬' },
        { id: 'formiga', item: '​​🐜​', target: '​▪️​', video: 'videos/formiga-pequena.mp4', caption: '​​🐜▪️​' },
        { id: 'elefante', item: '🐘', target: '​⬛​​', video: 'videos/elefante-grande.mp4', caption: '​​🐘⬛​​​' },
		{ id: 'aranha', item: '🕷️', target: '​🕸️​​​', video: 'videos/aranha-teia.mp4', caption: '​​🕷️​🕸️​​​' },
		{ id: 'foguete', item: '🚀​', target: '🌕​​​​', video: 'videos/foguete-lua.mp4', caption: '​​🚀 ➡️​ 🌕' },
		{ id: 'gato', item: '​​​🐈​', target: '🐭​​​​', video: 'videos/gato-rato.mp4', caption: '​​🐈 🏃‍➡️​ 🐭​' },
		{ id: 'noel', item: '​​​🎅🏽​', target: '🎁​​​​', video: 'videos/noel-presente.mp4', caption: '​​🎅🏽 🫳​🎁' },
		{ id: 'menina', item: '​​​​👧🏽', target: '🚴🏽‍♀️‍​​​​', video: 'videos/menina-bicicleta.mp4', caption: '​​👧🏽 🚴🏽‍♀️' },
		{ id: 'veleiro', item: '​​​​⛵​', target: '🏝‍​​​​', video: 'videos/veleiro-ilha.mp4', caption: '​​⛵ ➡️ 🏝‍' }.
		{ id: 'virus', item: '​​​​🦠​', target: '🤧​​​​', video: 'videos/virus-doente.mp4', caption: '​​🦠 🤧​​​​' }
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

    // --- Variáveis de Estado do Jogo ---
    let availablePairs = [];
    let draggedItem = null;
    let correctPairsInRound = 0;
    const pairsPerRound = 3;
    let totalWrongAttempts = 0;
    let currentDropZone = null;
    let currentRound = 0;
    const maxRounds = 3;

    // --- INÍCIO DA LÓGICA UNIFICADA DE ARRASTAR ---

    function dragStart(e) {
        // Previne comportamentos padrão como selecionar texto
        if (e.cancelable) e.preventDefault();

        draggedItem = this; // 'this' se refere ao item que disparou o evento

        // Tira o item do fluxo normal da página e o prepara para ser movido
        draggedItem.style.position = 'absolute';
        draggedItem.style.zIndex = '1000';
        draggedItem.style.opacity = '0.5';
        draggedItem.style.transform = 'scale(1.1)';

        // Adiciona os listeners para mover e soltar
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        if (!draggedItem) return;
        if (e.cancelable) e.preventDefault();

        // Pega as coordenadas do mouse ou do toque
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        
        // Move o item para a posição do cursor/dedo
        draggedItem.style.left = `${x - (draggedItem.offsetWidth / 2)}px`;
        draggedItem.style.top = `${y - (draggedItem.offsetHeight / 2)}px`;

        // Lógica para detectar a área de destino embaixo do item
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

        // Remove os listeners de movimento para parar o arraste
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        
        // Restaura a aparência do item
        draggedItem.style.opacity = '1';
        draggedItem.style.transform = 'scale(1)';
        draggedItem.style.zIndex = '';

        if (currentDropZone) {
            currentDropZone.classList.remove('hovering');
            if (draggedItem.dataset.targetId === currentDropZone.dataset.matchId) {
                handleCorrectMatch(draggedItem, currentDropZone);
            } else {
                handleWrongMatch();
                // Faz o item voltar para a lista
                draggedItem.style.position = '';
                draggedItem.style.left = '';
                draggedItem.style.top = '';
            }
        } else {
            // Se foi solto fora de uma área válida, também volta para a lista
            draggedItem.style.position = '';
            draggedItem.style.left = '';
            draggedItem.style.top = '';
        }
        
        draggedItem = null;
        currentDropZone = null;
    }

    // --- FIM DA LÓGICA UNIFICADA DE ARRASTAR ---


    function unlockVideoPlayback() {
        videoPlayer.muted = true;
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => videoPlayer.pause()).catch(() => {});
            videoPlayer.muted = false;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function initializeGame() {
        startScreenOverlay.style.display = 'none';
        gameArea.style.display = 'flex';
        unlockVideoPlayback();
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
        
        // Adiciona o listener de início de arraste a cada item
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('mousedown', dragStart);
            item.addEventListener('touchstart', dragStart, { passive: false });
        });
    }

    function createDraggableItem(pair) {
        const item = document.createElement('div');
        item.className = 'item';
        item.draggable = false; // Desabilitamos o drag nativo
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

    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        // Em vez de só esconder, removemos o item para não interferir no layout
        item.remove(); 
        zone.classList.add('hidden');

        const correctPair = allPairs.find(p => p.id === zone.dataset.matchId);
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
        if (totalWrongAttempts === 0) {
            stars = '⭐⭐⭐⭐⭐'; star5Sound.play();
        } else if (totalWrongAttempts <= 2) {
            stars = '⭐⭐⭐⭐'; star4Sound.play();
        } else if (totalWrongAttempts <= 4) {
            stars = '⭐⭐⭐'; star3Sound.play();
        } else if (totalWrongAttempts <= 6) {
            stars = '⭐⭐';
        } else {
            stars = '⭐';
        }
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
});