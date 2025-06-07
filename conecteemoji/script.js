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
    // --- NOVOS ELEMENTOS DO PLACAR FINAL ---
    const finalScoreOverlay = document.getElementById('final-score-overlay');
    const starRating = document.getElementById('star-rating');
    const totalCorrectSpan = document.getElementById('total-correct');
    const totalWrongSpan = document.getElementById('total-wrong');


    // --- Variáveis de Estado do Jogo ---
    let availablePairs = [];
    let draggedItem = null;
    let correctPairsInRound = 0;
    const pairsPerRound = 3;
    let totalWrongAttempts = 0; // <-- NOVA VARIÁVEL para contar erros totais

    // --- Funções do Jogo ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startNewGame() {
        availablePairs = [...allPairs];
        totalWrongAttempts = 0; // <-- RESETAR erros no início
        finalScoreOverlay.style.display = 'none'; // <-- Esconder placar
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
            // --- MODIFICADO: Chama a função para mostrar o placar final ---
            showFinalScore();
        }
    }
    
    // Nenhuma alteração necessária nas funções:
    // setupRoundUI, createDraggableItem, createDropZone, addDragAndDropListeners
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
    }
    
    // --- Funções de Evento (Handlers) ---
    // Nenhuma alteração necessária aqui
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
    
    // Nenhuma alteração necessária em handleCorrectMatch
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
    
    // --- MODIFICADO: handleWrongMatch agora conta os erros ---
    function handleWrongMatch() {
        wrongSound.play();
        feedback.textContent = '❌';
        totalWrongAttempts++; // <-- Incrementa o contador de erros
        setTimeout(() => feedback.textContent = '', 1500);
    }
    
    // Nenhuma alteração necessária em checkRoundCompletion
    function checkRoundCompletion() {
        correctPairsInRound++;
        const totalPairsInThisRound = Array.from(rightSide.children).filter(child => !child.classList.contains('hidden')).length;
        const totalItemsInThisRound = Array.from(leftSide.children).filter(child => !child.classList.contains('hidden')).length;
        const totalPairsOnScreen = leftSide.children.length;


        if (correctPairsInRound >= totalPairsOnScreen) {
            feedback.textContent = '👏​👍';
            setTimeout(startRound, 2000);
        } else {
            feedback.textContent = '';
        }
    }

    // --- NOVA FUNÇÃO: Para calcular e mostrar o placar final ---
    function showFinalScore() {
        let stars = '';
        if (totalWrongAttempts === 0) {
            stars = '⭐⭐⭐⭐⭐'; // 5 estrelas
        } else if (totalWrongAttempts <= 2) {
            stars = '⭐⭐⭐⭐'; // 4 estrelas
        } else if (totalWrongAttempts <= 4) {
            stars = '⭐⭐⭐'; // 3 estrelas
        } else if (totalWrongAttempts <= 6) {
            stars = '⭐⭐'; // 2 estrelas
        } else {
            stars = '⭐'; // 1 estrela
        }

        // Atualiza o conteúdo do placar
        starRating.textContent = stars;
        totalCorrectSpan.textContent = allPairs.length; // O total de acertos é sempre o total de pares
        totalWrongSpan.textContent = totalWrongAttempts;

        // Exibe o placar
        finalScoreOverlay.style.display = 'flex';
    }

    restartButton.addEventListener('click', startNewGame);

    // --- Inicia o Jogo ---
    startNewGame();
});