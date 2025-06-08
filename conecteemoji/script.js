document.addEventListener('DOMContentLoaded', () => {
    // --- ATUALIZADO: Adicionamos a propriedade "video" com o nome do arquivo ---
    const allPairs = [
        { id: 'queijo', item: '🐀', target: '🧀', video: 'rato-queijo.mp4' },
        { id: 'peixe', item: '🐧', target: '🐟', video: 'pinguim-peixe.mp4' },
        { id: 'banana', item: '🐒', target: '🍌', video: 'macaco-banana.mp4' },
        { id: 'osso', item: '🐶', target: '🦴', video: 'cao-osso.mp4' },
        { id: 'cenoura', item: '🐰', target: '🥕', video: 'coelho-cenoura.mp4' },
        { id: 'mel', item: '🐝', target: '🍯', video: 'abelha-mel.mp4' },
        { id: 'mamadeira', item: '👶', target: '🍼', video: 'bebe-mamadeira.mp4' },
        { id: 'estrada', item: '🚗', target: '🛣️', video: 'carro-estrada.mp4' },
        { id: 'ovo', item: '🐔', target: '🥚', video: 'galinha-ovo.mp4' },
        { id: 'cadeado', item: '🔑', target: '🔒', video: 'chave-cadeado.mp4' },
        { id: 'dormir', item: '😴', target: '🛌💤', video: 'sono-dormir.mp4' },
        { id: 'voou', item: '✈', target: '🛫', video: 'aviao-voou.mp4' },
        { id: 'basquete', item: '🏀', target: '⛹️‍♀️', video: 'bola-basquete.mp4' },
        { id: 'dente', item: '🪥', target: '🦷', video: 'escova-dente.mp4' },
        { id: 'praia', item: '​👙​', target: '🏖️', video: 'biquine-praia.mp4' }
    ];

    // --- Elementos do DOM ---
    const gameArea = document.querySelector('.game-area');
    const leftSide = document.querySelector('.left-side');
    const rightSide = document.querySelector('.right-side');
    const feedback = document.getElementById('feedback');
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const videoOverlay = document.getElementById('video-overlay');
    // --- NOVO: Referência para o player de vídeo único ---
    const videoPlayer = document.getElementById('video-player');
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

    function addDragAndDropListeners() {
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

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

    function handleTouchStart(e) {
        if (e.target.classList.contains('item')) {
            draggedItem = e.target;
            draggedItem.style.opacity = '0.5';
            touchClone = draggedItem.cloneNode(true);
            touchClone.style.position = 'absolute';
            touchClone.style.pointerEvents = 'none';
            touchClone.style.zIndex = '1000';
            touchClone.style.transform = 'scale(1.1)';
            gameArea.appendChild(touchClone);
            const touch = e.touches[0];
            moveClone(touch.clientX, touch.clientY);
        }
    }

    function handleTouchMove(e) {
        if (!draggedItem || !touchClone) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveClone(touch.clientX, touch.clientY);
        touchClone.style.display = 'none';
        const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
        touchClone.style.display = '';
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
                draggedItem.style.opacity = '1';
            }
        } else {
            draggedItem.style.opacity = '1';
        }
        if (touchClone) {
            touchClone.remove();
        }
        draggedItem = null;
        touchClone = null;
        currentDropZone = null;
    }

    function moveClone(x, y) {
        if (!touchClone) return;
        touchClone.style.left = `${x - (touchClone.offsetWidth / 2)}px`;
        touchClone.style.top = `${y - (touchClone.offsetHeight / 2)}px`;
    }

    // --- ATUALIZADO: Função de acerto agora usa o player de vídeo único ---
    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        item.classList.add('hidden');
        zone.classList.add('hidden');
        item.style.opacity = '1';

        // 1. Encontra o par correspondente para obter o nome do arquivo do vídeo
        const correctPair = allPairs.find(p => p.id === zone.dataset.matchId);

        if (!correctPair || !correctPair.video) {
            console.error(`Vídeo não configurado para o id: ${zone.dataset.matchId}`);
            checkRoundCompletion(); // Continua o jogo mesmo se o vídeo falhar
            return;
        }

        setTimeout(() => {
            videoOverlay.style.display = 'flex';
            videoPlayer.style.display = 'block';

            // 2. Define o arquivo de vídeo a ser tocado
            videoPlayer.src = correctPair.video;
            videoPlayer.load(); // Carrega o novo vídeo

            // 3. Toca o vídeo e adiciona um listener para quando ele terminar
            const playPromise = videoPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Erro ao tocar o vídeo:", error);
                    // Se houver erro (ex: autoplay bloqueado), esconde o overlay e continua o jogo
                    videoPlayer.style.display = 'none';
                    videoOverlay.style.display = 'none';
                    checkRoundCompletion();
                });
            }

            videoPlayer.addEventListener('ended', () => {
                videoPlayer.style.display = 'none';
                videoOverlay.style.display = 'none';
                checkRoundCompletion();
            }, { once: true }); // {once: true} remove o listener após ser executado

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