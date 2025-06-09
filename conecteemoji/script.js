document.addEventListener('DOMContentLoaded', () => {
    const allPairs = [
        { id: 'queijo', item: '🐀', target: '🧀', video: 'rato-queijo.mp4', caption: '🐀 👄🧀' },
        { id: 'peixe', item: '🐧', target: '🐟', video: 'pinguim-peixe.mp4', caption: '🐧 👄🐟' },
        { id: 'banana', item: '🐒', target: '🍌', video: 'macaco-banana.mp4', caption: '🐒 👄🍌' },
        { id: 'osso', item: '🐶', target: '🦴', video: 'cao-osso.mp4', caption: '🐶 ❤ 🦴' },
        { id: 'cenoura', item: '🐰', target: '🥕', video: 'coelho-cenoura.mp4', caption: '🐰 👄🥕' },
        { id: 'mel', item: '🐝', target: '🍯', video: 'abelha-mel.mp4', caption: '🐝 👄🍯' },
        { id: 'mamadeira', item: '👶', target: '🍼', video: 'bebe-mamadeira.mp4', caption: '👶 ​🫴​ 🍼' },
        { id: 'estrada', item: '🚗', target: '🛣️', video: 'carro-estrada.mp4', caption: '🚗 🚶‍♀️​ 🛣️' },
        { id: 'ovo', item: '🐔', target: '🥚', video: 'galinha-ovo.mp4', caption: '🐔 🫳​ 🥚' },
        { id: 'cadeado', item: '🔑', target: '🔒', video: 'chave-cadeado.mp4', caption: '🔑 🔐​🔓 🔒' },
        { id: 'dormir', item: '😴', target: '🛌💤', video: 'sono-dormir.mp4', caption: '😴 🫴​ 🛌💤' },
        { id: 'voou', item: '✈', target: '🛫', video: 'aviao-voou.mp4', caption: '✈️ 🛫' },
        { id: 'basquete', item: '🏀', target: '⛹️‍♀️', video: 'bola-basquete.mp4', caption: '⛹️‍♀️​' },
        { id: 'dente', item: '🪥', target: '🦷', video: 'escova-dente.mp4', caption: '🪥🦷' },
        { id: 'praia', item: '​👙​', target: '🏖️', video: 'biquine-praia.mp4', caption: '📥​👙 ➡ 🏖️' }
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
    const videoCaption = document.getElementById('video-caption'); // Novo elemento
    const restartButton = document.getElementById('restart-button');
    const finalScoreOverlay = document.getElementById('final-score-overlay');
    const starRating = document.getElementById('star-rating');
    const totalCorrectSpan = document.getElementById('total-correct');
    const totalWrongSpan = document.getElementById('total-wrong');
    
    // --- NOVOS Elementos da Tela Inicial ---
    const startScreenOverlay = document.getElementById('start-screen-overlay');
    const startButton = document.getElementById('start-button');
	
    // --- NOVOS Elementos de Áudio para Pontuação ---
	const star3Sound = document.getElementById('star3Sound');
    const star4Sound = document.getElementById('star4Sound');
    const star5Sound = document.getElementById('star5Sound');

    // --- Variáveis de Estado do Jogo ---
    let availablePairs = [];
    let draggedItem = null;
    let correctPairsInRound = 0;
    const pairsPerRound = 3;
    let totalWrongAttempts = 0;
    let touchClone = null;
    let currentDropZone = null;

    // NOVA Função para "destravar" a reprodução de vídeo em dispositivos móveis
    function unlockVideoPlayback() {
        videoPlayer.muted = true; 
        const playPromise = videoPlayer.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                videoPlayer.pause();
                videoPlayer.muted = false;
            }).catch(error => {
                 videoPlayer.muted = false;
            });
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
        finalScoreOverlay.style.display = 'none';
        startScreenOverlay.style.display = 'none';
        gameArea.style.display = 'flex';
        startRound();
    }

    function startRound() {
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
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
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
            e.preventDefault();
            draggedItem = e.target;
            draggedItem.style.opacity = '0.5';
            touchClone = draggedItem.cloneNode(true);
            touchClone.style.position = 'absolute';
            touchClone.style.pointerEvents = 'none';
            touchClone.style.zIndex = '1000';
            touchClone.style.transform = 'scale(1.1)';
            document.body.appendChild(touchClone);
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
        draggedItem.style.opacity = '1';
        if (currentDropZone) {
            currentDropZone.classList.remove('hovering');
            if (draggedItem.dataset.targetId === currentDropZone.dataset.matchId) {
                handleCorrectMatch(draggedItem, currentDropZone);
            } else {
                handleWrongMatch();
            }
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

    function handleCorrectMatch(item, zone) {
        correctSound.play();
        feedback.textContent = '✅';
        item.classList.add('hidden');
        zone.classList.add('hidden');
        item.style.opacity = '1';

        const correctPair = allPairs.find(p => p.id === zone.dataset.matchId);
        if (!correctPair || !correctPair.video) {
            checkRoundCompletion();
            return;
        }
        
        videoCaption.textContent = correctPair.caption; // Mostra a legenda
        videoPlayer.muted = false; 

        setTimeout(() => {
            videoOverlay.style.display = 'flex';
            videoPlayer.style.display = 'block';
            videoPlayer.src = correctPair.video;
            videoPlayer.load();

            const playPromise = videoPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    videoPlayer.style.display = 'none';
                    videoOverlay.style.display = 'none';
                    videoCaption.textContent = ''; // Limpa a legenda
                    checkRoundCompletion();
                });
            }

            videoPlayer.addEventListener('ended', () => {
                videoPlayer.style.display = 'none';
                videoOverlay.style.display = 'none';
                videoCaption.textContent = ''; // Limpa a legenda
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
        const totalPairsInThisRound = rightSide.querySelectorAll('.drop-zone').length;
        if (correctPairsInRound >= totalPairsInThisRound) {
            feedback.textContent = '👏​👍';
            setTimeout(startRound, 2000);
        } else {
            setTimeout(() => feedback.textContent = '', 1500);
        }
    }

    function showFinalScore() {
        let stars = '';
        if (totalWrongAttempts === 0) {
			stars = '⭐⭐⭐⭐⭐';
			star5Sound.play();
		}
        else if (totalWrongAttempts <= 2) {
			stars = '⭐⭐⭐⭐';
			star4Sound.play();
        }
		else if (totalWrongAttempts <= 4) {
			stars = '⭐⭐⭐';
			star3Sound.play();
		}
        else if (totalWrongAttempts <= 6) stars = '⭐⭐';
        else stars = '⭐';
        starRating.textContent = stars;
        totalCorrectSpan.textContent = allPairs.length;
        totalWrongSpan.textContent = totalWrongAttempts;
        finalScoreOverlay.style.display = 'flex';
        gameArea.style.display = 'none';
    }

    // --- Event Listeners Iniciais ---
    restartButton.addEventListener('click', startNewGame);
    startButton.addEventListener('click', initializeGame);
});