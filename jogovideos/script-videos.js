// Espera que o conteúdo da página seja carregado
document.addEventListener('DOMContentLoaded', () => {
    // Estrutura de dados com as perguntas, vídeos e respostas
    // Adicione as tuas perguntas aqui!
    const questions = [
        {
            video: "videos/Menina_Comendo_Salada.mp4", // Caminho para o teu vídeo
            question: "A menina ____ salada.",     // Frase a ser completada
            options: [
                { emoji: "🥗", word: "come" },
                { emoji: "🥤", word: "bebe" },
                { emoji: "😴", word: "dorme" }
            ],
            answer: "come" // A palavra correta
        },
        {
            video: "videos/Menino_Bebendo_Suco_de_Uva.mp4",
            question: "O menino ____ a bola.",
            options: [
                { emoji: "⚽", word: "chuta" },
                { emoji: "🎤", word: "canta" },
                { emoji: "✏️", word: "escreve" }
            ],
            answer: "chuta"
        }
        // Podes adicionar mais perguntas como estas aqui
    ];

    // Elementos da página
    const videoPlayer = document.getElementById('video-player');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const nextButton = document.getElementById('next-button');
    const scoreDisplay = document.getElementById('score');
    const starsDisplay = document.getElementById('stars');

    // Variáveis do jogo
    let currentQuestionIndex = 0;
    let score = 0;

    // Sons (aproveitando os que já tens)
    const correctSound = new Audio('correct.mp3');
    const wrongSound = new Audio('wrong.mp3');

    // Função para mostrar a pergunta, as opções e o vídeo
    function displayQuestion() {
        // Limpa o estado anterior
        feedbackText.textContent = '';
        optionsContainer.innerHTML = '';
        nextButton.classList.add('hidden');
        optionsContainer.classList.remove('disabled');

        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];

            // Define o vídeo e o texto da pergunta
            questionText.textContent = currentQuestion.question;
            if (currentQuestion.video) {
                videoPlayer.src = currentQuestion.video;
                videoPlayer.style.display = 'block'; // Garante que o vídeo está visível
                videoPlayer.load(); // Carrega o novo vídeo
                videoPlayer.play().catch(error => {
                    // O navegador pode bloquear o autoplay, o que é normal.
                    console.log("A reprodução automática foi bloqueada. O utilizador precisa de clicar no play.");
                });
            } else {
                videoPlayer.style.display = 'none'; // Esconde o leitor se não houver vídeo
            }

            // Mostra as opções de resposta
            currentQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option');
                button.innerHTML = `<div class="emoji">${option.emoji}</div><div class="word">${option.word}</div>`;
                button.onclick = () => checkAnswer(option.word, button);
                optionsContainer.appendChild(button);
            });
        } else {
            // Fim do jogo
            endGame();
        }
    }

    // Função para verificar a resposta
    function checkAnswer(selectedWord, button) {
        const currentQuestion = questions[currentQuestionIndex];
        optionsContainer.classList.add('disabled'); // Desativa outras opções

        if (selectedWord === currentQuestion.answer) {
            feedbackText.textContent = 'Muito bem! 🎉';
            feedbackText.style.color = 'green';
            button.classList.add('correct');
            score++;
            correctSound.play();
        } else {
            feedbackText.textContent = 'Tenta outra vez.';
            feedbackText.style.color = 'red';
            button.classList.add('wrong');
            wrongSound.play();
        }

        scoreDisplay.textContent = score;
        updateStars();
        nextButton.classList.remove('hidden');
    }

    // Função para atualizar as estrelas
    function updateStars() {
        let starCount = Math.floor(score / 2); // Ex: 1 estrela a cada 2 pontos
        starsDisplay.textContent = '⭐'.repeat(starCount);
    }

    // Função para o fim do jogo
    function endGame() {
        questionText.textContent = 'Parabéns, terminaste o jogo!';
        optionsContainer.innerHTML = '';
        videoPlayer.style.display = 'none'; // Esconde o vídeo no final
        nextButton.classList.add('hidden');
    }

    // Evento do botão "Próxima Pergunta"
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });

    // Inicia o jogo
    displayQuestion();
});
