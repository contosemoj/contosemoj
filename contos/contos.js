document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA PARA CARREGAR O CONTO CERTO ---
    const params = new URLSearchParams(window.location.search);
    const contoId = params.get('conto'); // Ex: "branca_de_neve"

    if (!contoId) {
        document.getElementById('story-title').textContent = "Erro: Conteúdo não encontrado.";
        return;
    }

    const storyFile = `${contoId}.json`;
    let storyData = {};

    // --- VARIÁVEIS DO JOGO ---
    let currentSlide = 0;
    let currentQuestion = 0;
    let score = 0;

    // --- ELEMENTOS DO DOM ---
    const storyTitleEl = document.getElementById('story-title');
    const quizTitleEl = document.getElementById('quiz-title');
    const storyContentEl = document.getElementById('story-content');
    const slideCounterEl = document.getElementById('slide-counter');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const storySection = document.getElementById('story-section');
    const quizSection = document.getElementById('quiz-section');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const feedbackTextEl = document.getElementById('feedback-text');
    const quizResultsEl = document.getElementById('quiz-results');
    const finalScoreEl = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    
    // ✅ NOVOS ELEMENTOS DO DOM
    const endStoryButtonsEl = document.getElementById('end-story-buttons');
    const startQuizButton = document.getElementById('start-quiz-button');
    const showGlossaryButton = document.getElementById('show-glossary-button');
    const glossarySectionEl = document.getElementById('glossary-section');
    const glossaryContentEl = document.getElementById('glossary-content');


    // --- FUNÇÕES DO JOGO ---
    function showSlide(index) {
        const part = storyData.storyParts[index];
        let audioPlayer = '';
        if (part.audio) {
            audioPlayer = `
                <audio controls class="w-full mt-4">
                    <source src="${part.audio}" type="audio/mpeg">
                    O seu navegador não suporta o elemento de áudio.
                </audio>
            `;
        }

        // --- MODIFICAÇÃO PARA EXIBIR A IMAGEM ---
        let imageElement = '';
        if (part.image) {
            // Supondo que as imagens estão na mesma pasta que o contos.html
            // Se estiverem em outra pasta (ex: 'imagens/'), mude para `imagens/${part.image}`
            imageElement = `<img src="${part.image}" alt="Ilustração do conto" class="mx-auto mb-4 rounded-lg shadow-md max-h-60">`;
        }

        storyContentEl.innerHTML = `
            ${imageElement}
            <p class="emoji-text mb-4">${part.emoji}</p>
            <p class="portuguese-text">${part.text}</p>
            ${audioPlayer}
        `;
        slideCounterEl.textContent = `${index + 1} / ${storyData.storyParts.length}`;
        prevButton.disabled = index === 0;
        prevButton.classList.toggle('opacity-50', index === 0);

        // ✅ LÓGICA ATUALIZADA PARA MOSTRAR BOTÕES FINAIS
        if (index === storyData.storyParts.length - 1) {
            nextButton.classList.add('hidden');
            endStoryButtonsEl.classList.remove('hidden');
            // Esconde o botão do dicionário se o conto não tiver um
            if (!storyData.glossary || storyData.glossary.length === 0) {
                showGlossaryButton.classList.add('hidden');
            }
        } else {
            nextButton.classList.remove('hidden');
            endStoryButtonsEl.classList.add('hidden');
            glossarySectionEl.classList.add('hidden'); // Esconde o glossário ao sair do último slide
        }
    }

    function startQuiz() {
        storySection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestion >= storyData.quizQuestions.length) {
            showResults();
            return;
        }
        const q = storyData.quizQuestions[currentQuestion];
        questionTextEl.textContent = q.emoji_question;
        questionTextEl.title = q.question;
        optionsContainerEl.innerHTML = '';
        feedbackTextEl.innerHTML = '&nbsp;';
        q.options.forEach((option, index) => {
            const optionEl = document.createElement('span');
            optionEl.className = 'quiz-option';
            optionEl.textContent = option;
            optionEl.onclick = () => checkAnswer(index, q.correct, optionEl);
            optionsContainerEl.appendChild(optionEl);
        });
    }

    function checkAnswer(selectedIndex, correctIndex, element) {
        document.querySelectorAll('.quiz-option').forEach(el => el.onclick = null);
        if (selectedIndex === correctIndex) {
            score++;
            feedbackTextEl.textContent = "Certo! ✅";
            feedbackTextEl.style.color = 'green';
            element.classList.add('correct-answer');
        } else {
            feedbackTextEl.textContent = "Errado! ❌";
            feedbackTextEl.style.color = 'red';
            element.classList.add('wrong-answer');
        }
        setTimeout(() => {
            currentQuestion++;
            showQuestion();
        }, 1500);
    }

    function showResults() {
        document.getElementById('quiz-content').classList.add('hidden');
        quizResultsEl.classList.remove('hidden');
        finalScoreEl.textContent = `${score} de ${storyData.quizQuestions.length}`;
    }

    function restartGame() {
        currentSlide = 0;
        currentQuestion = 0;
        score = 0;
        quizResultsEl.classList.add('hidden');
        document.getElementById('quiz-content').classList.remove('hidden');
        quizSection.classList.add('hidden');
        storySection.classList.remove('hidden');
        glossarySectionEl.classList.add('hidden'); // Esconde o glossário ao reiniciar
        showSlide(0);
    }

    // ✅ NOVA FUNÇÃO PARA MONTAR O GLOSSÁRIO
    function setupGlossary() {
        if (!storyData.glossary || storyData.glossary.length === 0) return;

        glossaryContentEl.innerHTML = ''; // Limpa conteúdo anterior
        storyData.glossary.forEach(item => {
            const p = document.createElement('p');
            p.className = "portuguese-text";
            p.innerHTML = `<span class="emoji-text text-2xl">${item.emoji}</span>: ${item.definition}`;
            glossaryContentEl.appendChild(p);
        });

        showGlossaryButton.addEventListener('click', () => {
            glossarySectionEl.classList.toggle('hidden');
        });
    }

    function initializeGame(data) {
        storyData = data;
        storyTitleEl.textContent = storyData.title;
        quizTitleEl.textContent = `Quiz: ${storyData.title}`;
        
        setupGlossary(); // ✅ CHAMA A NOVA FUNÇÃO DO GLOSSÁRIO

        // --- EVENT LISTENERS ---
        nextButton.addEventListener('click', () => {
            if (currentSlide < storyData.storyParts.length - 1) {
                currentSlide++;
                showSlide(currentSlide);
            }
        });
        prevButton.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                showSlide(currentSlide);
            }
        });
        startQuizButton.addEventListener('click', startQuiz);
        restartButton.addEventListener('click', restartGame);

        // --- Inicia o jogo ---
        showSlide(currentSlide);
    }

    // --- CARREGAR DADOS E INICIAR ---
    fetch(storyFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ficheiro do conto não encontrado.');
            }
            return response.json();
        })
        .then(data => {
            initializeGame(data);
        })
        .catch(error => {
            console.error(error);
            storyTitleEl.textContent = "Erro ao carregar a história.";
        });
});