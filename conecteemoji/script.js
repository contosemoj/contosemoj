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

    // --- Funções do Jogo ---

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
    
    // --- LÓGICA DE EVENTOS (MODIFICADA) ---
    function addDragAndDropListeners() {
        // --- Eventos de MOUSE (para Desktop) ---
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });

        // --- NOVO: Eventos de TOQUE (para iPad/Celular) ---
        let currentDropZone = null;

        document.querySelectorAll('.item').forEach(item => {
            // Quando o usuário toca no item
            item.addEventListener('touchstart', (e) => {
                draggedItem = e.target.closest('.item');
                // Simula o efeito visual do dragstart
                setTimeout(() => {
                    if (draggedItem) draggedItem.style.opacity = '0.5';
                }, 0);
            }, { passive: true });

            // Quando o usuário arrasta o dedo na tela
            item.addEventListener('touchmove', (e) => {
                if (!draggedItem) return;
                
                // Evita que a página role
                e.preventDefault();

                // Encontra o que está sob o dedo
                const touch = e.targetTouches[0];
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropZoneUnder = elementUnder ? elementUnder.closest('.drop-zone') : null;

                // Remove o realce da zona anterior se nos movermos para fora
                if (currentDropZone && currentDropZone !== dropZoneUnder) {
                    currentDropZone.classList.remove('hovering');
                }

                // Adiciona o realce na nova zona
                if (dropZoneUnder) {
                    dropZoneUnder.classList.add('hovering');
                }
                
                currentDropZone = dropZoneUnder;
            }, { passive: false });

            // Quando o usuário solta o item
            item.addEventListener('touchend', (e) => {
                if (!draggedItem) return;

                // Restaura o visual do item
                draggedItem.style.opacity = '1';

                // Se soltou sobre uma zona de drop válida
                if (currentDropZone) {
                    currentDropZone.classList.remove('hovering');
                    // Verifica se o par está correto
                    if (draggedItem.dataset.targetId === currentDropZone.dataset.matchId) {
                        handleCorrectMatch(draggedItem, currentDropZone);
                    } else {
                        handleWrongMatch();
                    }
                }
                // Limpa as variáveis de estado
                draggedItem = null;
                currentDropZone = null;
            });
        });
    }
    
    // --- Funções de Evento (Handlers) ---

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

    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        
        item.classList.add('hidden');
        zone.classList.add('hidden');
        
        const videoId = 'video-' + zone.dataset.matchId;
        const video = document.getElementById(videoId);

        if (!video) {
            console.error(`ERRO: Vídeo não encontrado! Verifique se existe uma tag de vídeo com id="${videoId}" no seu HTML.`);
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
        const totalPairsOnScreen = leftSide.children.length;

        if (correctPairsInRound >= totalPairsOnScreen) {
            feedback.textContent = '👏​👍';
            setTimeout(startRound, 2000);
        } else {
            feedback.textContent = '';
        }
    }

    function showFinalScore() {
        let stars = '';
        if (totalWrongAttempts === 0) {
            stars = '⭐⭐⭐⭐⭐';
        } else if (totalWrongAttempts <= 2) {
            stars = '⭐⭐⭐⭐';
        } else if (totalWrongAttempts <= 4) {
            stars = '⭐⭐⭐';
        } else if (totalWrongAttempts <= 6) {
            stars = '⭐⭐';
        } else {
            stars = '⭐';
        }
        starRating.textContent = stars;
        totalCorrectSpan.textContent = allPairs.length;
        totalWrongSpan.textContent = totalWrongAttempts;
        finalScoreOverlay.style.display = 'flex';
    }

    restartButton.addEventListener('click', startNewGame);

    // --- Inicia o Jogo ---
    startNewGame();
});