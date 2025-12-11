// Игра "Интуиция" - угадывание скрытых изображений
class IntuitionGame {
    constructor(app) {
        this.app = app;
        this.currentImage = null;
        this.images = [
            { name: 'Кот', emoji: '🐱', category: 'животные' },
            { name: 'Дерево', emoji: '🌳', category: 'природа' },
            { name: 'Дом', emoji: '🏠', category: 'строения' },
            { name: 'Сердце', emoji: '❤️', category: 'эмоции' },
            { name: 'Солнце', emoji: '☀️', category: 'природа' },
            { name: 'Луна', emoji: '🌙', category: 'природа' },
            { name: 'Звезда', emoji: '⭐', category: 'природа' },
            { name: 'Цветок', emoji: '🌸', category: 'природа' },
            { name: 'Бабочка', emoji: '🦋', category: 'животные' },
            { name: 'Ключ', emoji: '🔑', category: 'предметы' }
        ];
        this.timer = null;
        this.init();
    }

    init() {
        this.setupGame();
        this.startTimer();
        this.nextRound();
    }

    setupGame() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="intuition-game">
                <div class="game-header">
                    <h2>Интуиция</h2>
                    <p class="instruction">Доверьтесь своей интуиции и угадайте скрытое изображение</p>
                </div>
                
                <div class="intuition-display">
                    <div class="hidden-image" id="hidden-image">
                        <div class="blur-overlay">
                            <div class="intuition-waves">
                                <div class="wave"></div>
                                <div class="wave"></div>
                                <div class="wave"></div>
                            </div>
                        </div>
                        <div class="image-content" id="image-content">?</div>
                    </div>
                    
                    <div class="revelation-timer">
                        <div class="timer-ring">
                            <div class="timer-progress" id="revelation-progress"></div>
                        </div>
                        <span class="timer-label">Откровение через: <span id="revelation-countdown">5</span>s</span>
                    </div>
                </div>
                
                <div class="choices-container" id="choices-container" style="display: none;">
                    <h3>Что вы видите?</h3>
                    <div class="image-choices" id="image-choices">
                        <!-- Варианты изображений -->
                    </div>
                </div>
                
                <div class="intuition-guide" id="intuition-guide">
                    <div class="third-eye">
                        <div class="eye-center"></div>
                        <div class="eye-glow"></div>
                    </div>
                    <p>Закройте глаза... Позвольте образам прийти естественно...</p>
                </div>
            </div>
        `;
        
        this.updateStyles();
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .intuition-game { text-align: center; padding: 2rem; }
            .hidden-image { width: 200px; height: 200px; margin: 2rem auto; position: relative;
                border: 3px solid var(--primary-color); border-radius: 20px; overflow: hidden;
                background: var(--glass-bg); backdrop-filter: blur(10px); }
            .blur-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                backdrop-filter: blur(20px); z-index: 2; }
            .image-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                font-size: 4rem; z-index: 1; }
            .image-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 1rem; max-width: 600px; margin: 0 auto; }
            .image-choice { background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 15px; padding: 1.5rem; cursor: pointer; transition: all 0.3s ease;
                backdrop-filter: blur(10px); }
            .image-choice:hover { transform: scale(1.05); border-color: var(--primary-color); }
            .image-choice.correct { border-color: var(--success-color); }
            .image-choice.incorrect { border-color: var(--danger-color); }
            .choice-emoji { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .choice-name { color: var(--text-light); font-size: 0.9rem; }
            .third-eye { width: 80px; height: 80px; margin: 0 auto 1rem; position: relative;
                border: 3px solid var(--primary-color); border-radius: 50%;
                display: flex; align-items: center; justify-content: center; }
            .eye-center { width: 20px; height: 20px; background: var(--accent-color);
                border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
            .revelation-timer { margin: 1rem 0; }
            .timer-ring { width: 60px; height: 60px; margin: 0 auto 0.5rem; position: relative;
                border: 3px solid var(--glass-border); border-radius: 50%; }
            .timer-progress { position: absolute; top: -3px; left: -3px; width: 60px; height: 60px;
                border: 3px solid var(--primary-color); border-radius: 50%;
                border-color: var(--primary-color) transparent transparent transparent;
                animation: timer-spin 1s linear infinite; }
            @keyframes timer-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            const currentTimer = this.app.gameState.timer - 1;
            this.app.updateGameState({ timer: currentTimer });
            if (currentTimer <= 0) {
                clearInterval(this.timer);
                this.app.endGame();
            }
        }, 1000);
    }

    nextRound() {
        this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];
        this.showIntuitionPhase();
    }

    showIntuitionPhase() {
        const choicesContainer = document.getElementById('choices-container');
        const intuitionGuide = document.getElementById('intuition-guide');
        const imageContent = document.getElementById('image-content');
        const revelationCountdown = document.getElementById('revelation-countdown');
        
        choicesContainer.style.display = 'none';
        intuitionGuide.style.display = 'block';
        imageContent.textContent = this.currentImage.emoji;
        
        let countdown = 5;
        revelationCountdown.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            revelationCountdown.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.showChoices();
            }
        }, 1000);
    }

    showChoices() {
        const choicesContainer = document.getElementById('choices-container');
        const intuitionGuide = document.getElementById('intuition-guide');
        const imageChoices = document.getElementById('image-choices');
        
        intuitionGuide.style.display = 'none';
        choicesContainer.style.display = 'block';
        
        const choices = this.generateChoices();
        imageChoices.innerHTML = '';
        
        choices.forEach(choice => {
            const choiceEl = document.createElement('div');
            choiceEl.className = 'image-choice';
            choiceEl.innerHTML = `
                <div class="choice-emoji">${choice.emoji}</div>
                <div class="choice-name">${choice.name}</div>
            `;
            choiceEl.addEventListener('click', () => this.selectChoice(choice, choiceEl));
            imageChoices.appendChild(choiceEl);
        });
    }

    generateChoices() {
        const choices = [this.currentImage];
        const otherImages = this.images.filter(img => img.name !== this.currentImage.name);
        
        while (choices.length < 6) {
            const randomImage = otherImages[Math.floor(Math.random() * otherImages.length)];
            if (!choices.find(c => c.name === randomImage.name)) {
                choices.push(randomImage);
            }
        }
        
        return choices.sort(() => Math.random() - 0.5);
    }

    selectChoice(choice, element) {
        document.querySelectorAll('.image-choice').forEach(item => {
            item.style.pointerEvents = 'none';
        });
        
        const isCorrect = choice.name === this.currentImage.name;
        
        if (isCorrect) {
            element.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            element.classList.add('incorrect');
            this.handleIncorrectAnswer();
        }
        
        setTimeout(() => this.nextRound(), 2000);
    }

    handleCorrectAnswer() {
        const points = 120 + Math.max(0, this.app.gameState.timer - 20) * 3;
        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        SoundManager?.play('success');
    }

    handleIncorrectAnswer() {
        this.app.updateGameState({ 
            lives: this.app.gameState.lives - 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        SoundManager?.play('error');
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
    }
}

window.IntuitionGame = IntuitionGame;