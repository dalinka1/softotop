// Игра "Телепатия" - угадывание карт и символов
class TelepathyGame {
    constructor(app) {
        this.app = app;
        this.currentCard = null;
        this.cards = [
            { symbol: '♠', name: 'Пики', color: 'black' },
            { symbol: '♥', name: 'Червы', color: 'red' },
            { symbol: '♦', name: 'Бубны', color: 'red' },
            { symbol: '♣', name: 'Трефы', color: 'black' }
        ];
        this.symbols = [
            { symbol: '●', name: 'Круг' },
            { symbol: '■', name: 'Квадрат' },
            { symbol: '▲', name: 'Треугольник' },
            { symbol: '★', name: 'Звезда' },
            { symbol: '♦', name: 'Ромб' },
            { symbol: '✚', name: 'Крест' }
        ];
        this.gameMode = 'cards'; // 'cards' или 'symbols'
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
            <div class="telepathy-game">
                <div class="game-header">
                    <h2>Телепатия</h2>
                    <p class="instruction">Сосредоточьтесь на скрытой карте и выберите правильный ответ</p>
                    
                    <div class="mode-switch">
                        <button class="mode-btn active" data-mode="cards">Карты</button>
                        <button class="mode-btn" data-mode="symbols">Символы</button>
                    </div>
                </div>
                
                <div class="card-display">
                    <div class="hidden-card" id="hidden-card">
                        <div class="card-back">
                            <div class="card-pattern"></div>
                            <div class="thinking-indicator">
                                <div class="pulse-ring"></div>
                                <div class="pulse-ring delay-1"></div>
                                <div class="pulse-ring delay-2"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="concentration-timer">
                        <div class="timer-circle">
                            <div class="timer-fill" id="concentration-fill"></div>
                            <span class="timer-text" id="concentration-text">3</span>
                        </div>
                    </div>
                </div>
                
                <div class="choices-container" id="choices-container" style="display: none;">
                    <h3>Какую карту вы видите?</h3>
                    <div class="choices-grid" id="choices-grid">
                        <!-- Варианты ответов -->
                    </div>
                </div>
                
                <div class="meditation-guide" id="meditation-guide">
                    <div class="breathing-guide">
                        <div class="breath-circle" id="breath-circle">
                            <span>Дышите глубоко</span>
                        </div>
                    </div>
                    <p>Расслабьтесь, очистите разум и сосредоточьтесь на карте...</p>
                </div>
                
                <div class="game-stats-detailed">
                    <div class="stat-item">
                        <span class="stat-label">Правильных:</span>
                        <span class="stat-value" id="correct-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Неправильных:</span>
                        <span class="stat-value" id="incorrect-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Точность:</span>
                        <span class="stat-value" id="accuracy-percent">0%</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.updateStyles();
    }

    setupEventListeners() {
        // Переключение режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameMode = e.target.dataset.mode;
                this.nextRound();
            });
        });
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .telepathy-game {
                text-align: center;
                padding: 2rem;
            }

            .game-header h2 {
                color: var(--primary-color);
                margin-bottom: 1rem;
                font-family: var(--font-primary);
            }

            .instruction {
                color: var(--text-medium);
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }

            .mode-switch {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-bottom: 3rem;
            }

            .mode-btn {
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 25px;
                padding: 0.8rem 2rem;
                color: var(--text-light);
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .mode-btn.active {
                background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                border-color: var(--primary-color);
                box-shadow: 0 0 20px rgba(108, 92, 231, 0.5);
            }

            .card-display {
                position: relative;
                display: flex;
                justify-content: center;
                margin: 3rem 0;
                min-height: 300px;
                align-items: center;
            }

            .hidden-card {
                width: 200px;
                height: 280px;
                perspective: 1000px;
                cursor: pointer;
            }

            .card-back {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, var(--bg-darker), var(--bg-dark));
                border: 3px solid var(--primary-color);
                border-radius: 15px;
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                animation: float 3s ease-in-out infinite;
            }

            .card-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(circle at 25% 25%, rgba(108, 92, 231, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(253, 121, 168, 0.1) 0%, transparent 50%);
                animation: shimmer 4s ease-in-out infinite;
            }

            .thinking-indicator {
                position: relative;
                z-index: 2;
            }

            .pulse-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                border: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: pulse-expand 2s ease-out infinite;
                opacity: 0.7;
            }

            .pulse-ring.delay-1 {
                animation-delay: 0.5s;
                border-color: var(--accent-color);
            }

            .pulse-ring.delay-2 {
                animation-delay: 1s;
                border-color: var(--secondary-color);
            }

            @keyframes pulse-expand {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }

            .concentration-timer {
                position: absolute;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
            }

            .timer-circle {
                width: 80px;
                height: 80px;
                border: 3px solid var(--glass-border);
                border-radius: 50%;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--glass-bg);
                backdrop-filter: blur(10px);
            }

            .timer-fill {
                position: absolute;
                top: -3px;
                left: -3px;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top: 3px solid var(--primary-color);
                transform: rotate(-90deg);
                transition: transform 1s linear;
            }

            .timer-text {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color);
                z-index: 2;
            }

            .choices-container {
                margin: 3rem 0;
            }

            .choices-container h3 {
                color: var(--text-light);
                margin-bottom: 2rem;
                font-size: 1.5rem;
            }

            .choices-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1.5rem;
                max-width: 600px;
                margin: 0 auto;
            }

            .choice-card {
                background: var(--glass-bg);
                border: 3px solid var(--glass-border);
                border-radius: 15px;
                padding: 2rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }

            .choice-card:hover {
                transform: translateY(-5px) scale(1.05);
                border-color: var(--primary-color);
                box-shadow: 0 10px 30px rgba(108, 92, 231, 0.3);
            }

            .choice-card.correct {
                border-color: var(--success-color);
                background: linear-gradient(135deg, var(--glass-bg), rgba(0, 184, 148, 0.2));
                animation: pulse-success 0.6s ease-out;
            }

            .choice-card.incorrect {
                border-color: var(--danger-color);
                background: linear-gradient(135deg, var(--glass-bg), rgba(225, 112, 85, 0.2));
                animation: shake 0.5s ease-out;
            }

            @keyframes pulse-success {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .card-symbol {
                font-size: 3rem;
                margin-bottom: 0.5rem;
                display: block;
            }

            .card-symbol.red {
                color: var(--danger-color);
            }

            .card-symbol.black {
                color: var(--text-light);
            }

            .card-name {
                font-size: 0.9rem;
                color: var(--text-medium);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .meditation-guide {
                text-align: center;
                color: var(--text-medium);
                margin: 2rem 0;
            }

            .breathing-guide {
                margin-bottom: 1rem;
            }

            .breath-circle {
                width: 100px;
                height: 100px;
                border: 2px solid var(--primary-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
                animation: breathe 4s ease-in-out infinite;
                font-size: 0.8rem;
                text-align: center;
            }

            @keyframes breathe {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.2); opacity: 1; }
            }

            .game-stats-detailed {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 2rem;
                flex-wrap: wrap;
            }

            .stat-item {
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 10px;
                padding: 1rem;
                backdrop-filter: blur(10px);
                min-width: 120px;
                text-align: center;
            }

            .stat-label {
                display: block;
                font-size: 0.9rem;
                color: var(--text-medium);
                margin-bottom: 0.5rem;
            }

            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color);
            }

            @media (max-width: 768px) {
                .choices-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .hidden-card {
                    width: 150px;
                    height: 210px;
                }
                
                .game-stats-detailed {
                    flex-direction: column;
                    align-items: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

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
        // Выбрать случайную карту или символ
        const items = this.gameMode === 'cards' ? this.cards : this.symbols;
        this.currentCard = items[Math.floor(Math.random() * items.length)];

        // Показать концентрацию
        this.showConcentrationPhase();
    }

    showConcentrationPhase() {
        const choicesContainer = document.getElementById('choices-container');
        const meditationGuide = document.getElementById('meditation-guide');
        const concentrationTimer = document.querySelector('.concentration-timer');
        const concentrationText = document.getElementById('concentration-text');
        const concentrationFill = document.getElementById('concentration-fill');

        choicesContainer.style.display = 'none';
        meditationGuide.style.display = 'block';
        concentrationTimer.style.display = 'block';

        let countdown = 5;
        concentrationText.textContent = countdown;

        const concentrationInterval = setInterval(() => {
            countdown--;
            concentrationText.textContent = countdown;
            
            // Обновить визуальный индикатор
            const rotation = (5 - countdown) * 72; // 360 / 5 = 72 градуса за секунду
            concentrationFill.style.transform = `rotate(${rotation - 90}deg)`;

            if (countdown <= 0) {
                clearInterval(concentrationInterval);
                this.showChoices();
            }
        }, 1000);
    }

    showChoices() {
        const choicesContainer = document.getElementById('choices-container');
        const meditationGuide = document.getElementById('meditation-guide');
        const concentrationTimer = document.querySelector('.concentration-timer');
        const choicesGrid = document.getElementById('choices-grid');

        meditationGuide.style.display = 'none';
        concentrationTimer.style.display = 'none';
        choicesContainer.style.display = 'block';

        // Создать варианты ответов
        const choices = this.generateChoices();
        choicesGrid.innerHTML = '';

        choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-card';
            choiceElement.innerHTML = `
                <span class="card-symbol ${choice.color || ''}">${choice.symbol}</span>
                <span class="card-name">${choice.name}</span>
            `;
            
            choiceElement.addEventListener('click', () => {
                this.selectChoice(choice, choiceElement);
            });

            choicesGrid.appendChild(choiceElement);
        });
    }

    generateChoices() {
        const items = this.gameMode === 'cards' ? this.cards : this.symbols;
        const choices = [...items];
        
        // Перемешать варианты
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return choices;
    }

    selectChoice(choice, element) {
        // Отключить все кнопки
        document.querySelectorAll('.choice-card').forEach(card => {
            card.style.pointerEvents = 'none';
        });

        const isCorrect = choice.symbol === this.currentCard.symbol;
        
        if (isCorrect) {
            element.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            element.classList.add('incorrect');
            this.handleIncorrectAnswer();
            
            // Показать правильный ответ
            document.querySelectorAll('.choice-card').forEach(card => {
                const symbol = card.querySelector('.card-symbol').textContent;
                if (symbol === this.currentCard.symbol) {
                    card.classList.add('correct');
                }
            });
        }

        // Обновить счетчики
        this.updateDetailedStats();

        // Следующий раунд через 2 секунды
        setTimeout(() => {
            this.nextRound();
        }, 2000);
    }

    handleCorrectAnswer() {
        const points = this.calculatePoints();
        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });

        SoundManager?.play('success');
        this.showFeedback('Правильно! +' + points);
    }

    handleIncorrectAnswer() {
        this.app.updateGameState({ 
            lives: this.app.gameState.lives - 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });

        SoundManager?.play('error');
        this.showFeedback('Неправильно! Правильный ответ: ' + this.currentCard.name);
    }

    calculatePoints() {
        const basePoints = 100;
        const timeBonus = Math.max(0, this.app.gameState.timer - 20) * 2;
        const difficultyMultiplier = this.gameMode === 'symbols' ? 1.2 : 1.0;
        
        return Math.round((basePoints + timeBonus) * difficultyMultiplier);
    }

    showFeedback(message) {
        // Создать временное уведомление
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            border: 2px solid var(--primary-color);
            border-radius: 15px;
            padding: 1rem 2rem;
            color: var(--text-light);
            font-size: 1.2rem;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    updateDetailedStats() {
        const correctCount = document.getElementById('correct-count');
        const incorrectCount = document.getElementById('incorrect-count');
        const accuracyPercent = document.getElementById('accuracy-percent');

        if (correctCount) {
            correctCount.textContent = this.app.gameState.correctAnswers;
        }
        
        if (incorrectCount) {
            const incorrect = this.app.gameState.totalQuestions - this.app.gameState.correctAnswers;
            incorrectCount.textContent = incorrect;
        }
        
        if (accuracyPercent) {
            const accuracy = this.app.gameState.totalQuestions > 0 ? 
                Math.round((this.app.gameState.correctAnswers / this.app.gameState.totalQuestions) * 100) : 0;
            accuracyPercent.textContent = accuracy + '%';
        }
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Экспорт для использования в главном приложении
window.TelepathyGame = TelepathyGame;