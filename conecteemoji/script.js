document.addEventListener('DOMContentLoaded', () => {
    // --- Lista Completa de Todos os Pares ---
    const allPairs = [
        { id: 'queijo', item: '🐀', target: '🧀' },
        { id: 'peixe', item: '🐧', target: '🐟' },
        { id: 'banana', item: '🐒', target: '🍌' },
        { id: 'osso', item: '🐶', target: '🦴' },
        { id: 'cenoura', item: '🐰', target: '🥕' },
        { id: 'mel', item: '🐝', target: '🍯' },
        { id: 'mamadeira', item: '👶', target: '🍼' },
        { id: 'estrada', item: '🚗', target: '🛣️' },
        { id: 'naoestrada', item: '👧', target: '🚫🛣' },
        { id: 'cadeado', item: '🔑', target: '🔒' },
        { id: 'dormir', item: '😴', target: '🛌💤' },
        { id: 'voou', item: '✈', target: '🛫' },
        { id: 'basquete', item: '🏀', target: '⛹️‍♀️' },
        { id: 'dente', item: '🪥', target: '🦷' },
        { id: 'praia', item: '​👙​', target: '🏖️' }
    ];

    // --- Elementos do DOM ---
    const gameArea = document.querySelector('.game-area'); // Adicionado para referência de posicionamento
    const leftSide = document.querySelector('.left-side');
    const rightSide = document.querySelector('.right-side');
    const feedback = document.getElementById('feedback');
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const videoOverlay = document.getElementById('video-overlay');
    const restartButton = document.getElementById('restart-button');
    const finalScoreOverlay = document.getElementById('final-score-overlay');
    const starRating = document.getElementById('star-rating');
    const totalCorrectSpan = document.getElementById('total-correct');
    const totalWrongSpan = document.getElementById('total-wrong');

    // --- Variáveis de Estado do Jogo ---
    let availablePairs = [];
    let draggedItem = null;
    let correctPairsInRound = 0;
    const pairsPerRound = 3;
    let totalWrongAttempts = 0;

    // --- NOVO: Variáveis para o arraste visual ---
    let touchClone = null;
    let currentDropZone = null;

    // --- Funções Principais do Jogo (sem alterações) ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startNewGame() {
        availablePairs = [...allPairs];
        totalWrongAttempts = 0;
        finalScoreOverlay.style.display = 'none';
        startRound();
    }

    function startRound() {
        leftSide.innerHTML = '';
        rightSide.innerHTML = '';
        feedback.textContent = '';
        correctPairsInRound = 0;

        if (availablePairs.length < pairsPerRound && availablePairs.length > 0) {
            const currentPairs = availablePairs.splice(0, availablePairs.length);
            setupRoundUI(currentPairs);
        } else if (availablePairs.length >= pairsPerRound) {
            shuffleArray(availablePairs);
            const currentPairs = availablePairs.splice(0, pairsPerRound);
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
        addDragAndDropListeners();
    }

    function createDraggableItem(pair) {
        const item = document.createElement('div');
        item.className = 'item';
        item.draggable = true;
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

    // --- LÓGICA DE EVENTOS (DRAG & DROP E TOQUE) ---
    function addDragAndDropListeners() {
        // Eventos de MOUSE (Desktop)
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });

        // Eventos de TOQUE (Mobile/iPad)
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
        // Listeners de move e end são adicionados ao documento para melhor controle
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    // --- Handlers de MOUSE ---
    function handleDragStart(e) {
        draggedItem = e.target;
        setTimeout(() => e.target.style.opacity = '0.5', 0);
    }
    function handleDragEnd(e) {
        e.target.style.opacity = '1';
        draggedItem = null;
    }
    function handleDragOver(e) {
        e.preventDefault();
        e.target.closest('.drop-zone').classList.add('hovering');
    }
    function handleDragLeave(e) {
        e.target.closest('.drop-zone').classList.remove('hovering');
    }
    function handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        dropZone.classList.remove('hovering');
        if (draggedItem && draggedItem.dataset.targetId === dropZone.dataset.matchId) {
            handleCorrectMatch(draggedItem, dropZone);
        } else {
            handleWrongMatch();
        }
    }

    // --- ATUALIZADO: Handlers de TOQUE com Arraste Visual ---
    function handleTouchStart(e) {
        if (e.target.classList.contains('item')) {
            draggedItem = e.target;
            draggedItem.style.opacity = '0.5'; // Deixa o original transparente

            // Cria o clone para arrastar
            touchClone = draggedItem.cloneNode(true);
            touchClone.style.position = 'absolute';
            touchClone.style.pointerEvents = 'none'; // Impede que o clone intercepte eventos de toque
            touchClone.style.zIndex = '1000';
            touchClone.style.transform = 'scale(1.1)'; // Aumenta um pouco para dar feedback
            gameArea.appendChild(touchClone);

            // Posiciona o clone no local do toque
            const touch = e.touches[0];
            moveClone(touch.clientX, touch.clientY);
        }
    }

    function handleTouchMove(e) {
        if (!draggedItem || !touchClone) return;
        e.preventDefault(); // Previne o scroll da página

        const touch = e.touches[0];
        moveClone(touch.clientX, touch.clientY); // Move o clone

        // Encontra o que está sob o dedo
        touchClone.style.display = 'none'; // Esconde o clone temporariamente para ver o que está abaixo
        const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
        touchClone.style.display = ''; // Mostra o clone de novo
        
        const dropZoneUnder = elementUnder ? elementUnder.closest('.drop-zone') : null;

        if (currentDropZone && currentDropZone !== dropZoneUnder) {
            currentDropZone.classList.remove('hovering');
        }
        if (dropZoneUnder) {
            dropZoneUnder.classList.add('hovering');
        }
        currentDropZone = dropZoneUnder;
    }

    function handleTouchEnd(e) {
        if (!draggedItem) return;

        if (currentDropZone) {
            currentDropZone.classList.remove('hovering');
            if (draggedItem.dataset.targetId === currentDropZone.dataset.matchId) {
                handleCorrectMatch(draggedItem, currentDropZone);
            } else {
                handleWrongMatch();
                draggedItem.style.opacity = '1'; // Se errou, o original volta a aparecer
            }
        } else {
            draggedItem.style.opacity = '1'; // Se soltou fora, o original volta a aparecer
        }

        // Limpa tudo
        if (touchClone) {
            touchClone.remove();
        }
        draggedItem = null;
        touchClone = null;
        currentDropZone = null;
    }
    
    // --- NOVO: Função auxiliar para mover o clone ---
    function moveClone(x, y) {
        if (!touchClone) return;
        // Centraliza o clone no dedo
        touchClone.style.left = `${x - (touchClone.offsetWidth / 2)}px`;
        touchClone.style.top = `${y - (touchClone.offsetHeight / 2)}px`;
    }

    // --- Lógica de Resultado (sem alterações) ---
    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        item.classList.add('hidden');
        zone.classList.add('hidden');
        item.style.opacity = '1'; // Garante que a opacidade seja restaurada antes de sumir

        const videoId = 'video-' + zone.dataset.matchId;
        const video = document.getElementById(videoId);
        if (!video) {
            checkRoundCompletion();
            return;
        }
        setTimeout(() => {
            videoOverlay.style.display = 'flex';
            video.style.display = 'block';
            video.currentTime = 0;
            video.play();
            video.addEventListener('ended', () => {
                video.style.display = 'none';
                videoOverlay.style.display = 'none';
                checkRoundCompletion();
            }, { once: true });
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
        const totalPairsOnScreen = leftSide.querySelectorAll('.item:not(.hidden)').length + correctPairsInRound;
        if (correctPairsInRound >= totalPairsOnScreen) {
            feedback.textContent = '👏​👍';
            setTimeout(startRound, 2000);
        } else {
            feedback.textContent = '';
        }
    }

    function showFinalScore() {
        let stars = '';
        if (totalWrongAttempts === 0) stars = '⭐⭐⭐⭐⭐';
        else if (totalWrongAttempts <= 2) stars = '⭐⭐⭐⭐';
        else if (totalWrongAttempts <= 4) stars = '⭐⭐⭐';
        else if (totalWrongAttempts <= 6) stars = '⭐⭐';
        else stars = '⭐';
        starRating.textContent = stars;
        totalCorrectSpan.textContent = allPairs.length;
        totalWrongSpan.textContent = totalWrongAttempts;
        finalScoreOverlay.style.display = 'flex';
    }

    restartButton.addEventListener('click', startNewGame);
    startNewGame();
});