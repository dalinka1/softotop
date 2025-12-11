// Игра "Прекогниция" - предчувствие событий
class PrecognitionGame {
    constructor(app) {
        this.app = app;
        this.futureEvents = [
            { name: 'Молния', icon: '⚡', pattern: 'zigzag' },
            { name: 'Дождь', icon: '☔', pattern: 'drops' },
            { name: 'Солнце', icon: '☀️', pattern: 'rays' },
            { name: 'Ветер', icon: '💨', pattern: 'spiral' },
            { name: 'Звезда', icon: '⭐', pattern: 'pulse' }
        ];
        this.currentEvent = null;
        this.predictionMade = false;
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
            <div class="precognition-game">
                <div class="game-header">
                    <h2>Прекогниция</h2>
                    <p class="instruction">Почувствуйте будущее и предскажите событие</p>
                </div>
                
                <div class="time-portal" id="time-portal">
                    <div class="portal-rings">
                        <div class="ring ring-outer"></div>
                        <div class="ring ring-middle"></div>
                        <div class="ring ring-inner"></div>
                    </div>
                    <div class="portal-center" id="portal-center">
                        <div class="temporal-flux"></div>
                        <div class="vision-text">Взгляд в будущее...</div>
                    </div>
                </div>
                
                <div class="prediction-panel" id="prediction-panel">
                    <h3>Что произойдет?</h3>
                    <div class="predictions" id="predictions">
                        <!-- Предсказания -->
                    </div>
                    <div class="confidence-meter">
                        <label>Уверенность в предсказании:</label>
                        <input type="range" id="prediction-confidence" min="1" max="10" value="5">
                        <span class="confidence-display">5/10</span>
                    </div>
                </div>
                
                <div class="future-reveal" id="future-reveal" style="display: none;">
                    <h3>Произошло:</h3>
                    <div class="actual-event" id="actual-event">
                        <!-- Реальное событие -->
                    </div>
                </div>
                
                <div class="chronometer">
                    <div class="time-remaining">Время до события: <span id="event-countdown">10</span>s</div>
                    <div class="prophecy-accuracy">Точность пророчеств: <span id="prophecy-score">0%</span></div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateStyles();
    }

    setupEventListeners() {
        const confidenceSlider = document.getElementById('prediction-confidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                document.querySelector('.confidence-display').textContent = `${e.target.value}/10`;
            });
        }
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .precognition-game { text-align: center; padding: 2rem; }
            .time-portal { width: 300px; height: 300px; margin: 2rem auto; position: relative;
                border-radius: 50%; overflow: hidden; }
            .portal-rings { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            .ring { position: absolute; border: 3px solid; border-radius: 50%;
                animation: portal-spin 4s linear infinite; }
            .ring-outer { top: 0; left: 0; width: 100%; height: 100%;
                border-color: var(--primary-color); }
            .ring-middle { top: 15%; left: 15%; width: 70%; height: 70%;
                border-color: var(--accent-color); animation-direction: reverse; }
            .ring-inner { top: 30%; left: 30%; width: 40%; height: 40%;
                border-color: var(--secondary-color); }
            @keyframes portal-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .portal-center { position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 200px; height: 200px;
                background: radial-gradient(circle, rgba(108, 92, 231, 0.3), transparent);
                border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .temporal-flux { position: absolute; width: 100%; height: 100%;
                background: conic-gradient(var(--primary-color), var(--accent-color), var(--secondary-color), var(--primary-color));
                border-radius: 50%; opacity: 0.3; animation: flux-rotate 3s ease-in-out infinite; }
            @keyframes flux-rotate {
                0%, 100% { transform: rotate(0deg); opacity: 0.3; }
                50% { transform: rotate(180deg); opacity: 0.6; }
            }
            .vision-text { position: relative; z-index: 2; color: var(--text-light);
                font-style: italic; text-align: center; }
            .predictions { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem; margin: 2rem 0; }
            .prediction-item { background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 15px; padding: 1.5rem 1rem; cursor: pointer;
                transition: all 0.3s ease; backdrop-filter: blur(10px); }
            .prediction-item:hover { transform: scale(1.05); border-color: var(--primary-color); }
            .prediction-item.selected { border-color: var(--accent-color);
                background: linear-gradient(135deg, var(--glass-bg), rgba(253, 121, 168, 0.2)); }
            .prediction-item.correct { border-color: var(--success-color); }
            .prediction-item.incorrect { border-color: var(--danger-color); }
            .prediction-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .prediction-name { color: var(--text-light); font-size: 0.9rem; }
            .confidence-meter { margin: 2rem 0; color: var(--text-medium); }
            .confidence-meter input[type="range"] { width: 200px; margin: 0 1rem; }
            .confidence-display { color: var(--primary-color); font-weight: bold; }
            .future-reveal { margin: 2rem 0; }
            .actual-event { background: var(--glass-bg); border: 3px solid var(--primary-color);
                border-radius: 20px; padding: 2rem; margin: 1rem auto; max-width: 200px;
                backdrop-filter: blur(10px); animation: reveal-glow 2s ease-out; }
            @keyframes reveal-glow {
                0% { box-shadow: 0 0 0 rgba(108, 92, 231, 0.5); }
                50% { box-shadow: 0 0 50px rgba(108, 92, 231, 0.8); }
                100% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.3); }
            }
            .chronometer { display: flex; justify-content: center; gap: 2rem;
                margin: 2rem 0; flex-wrap: wrap; }
            .time-remaining, .prophecy-accuracy { background: var(--glass-bg);
                border: 2px solid var(--glass-border); border-radius: 10px; padding: 1rem;
                backdrop-filter: blur(10px); color: var(--text-medium); }
            #event-countdown, #prophecy-score { color: var(--primary-color); font-weight: bold; }
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
        this.currentEvent = this.futureEvents[Math.floor(Math.random() * this.futureEvents.length)];
        this.predictionMade = false;
        this.showPredictionPhase();
    }

    showPredictionPhase() {
        const predictionPanel = document.getElementById('prediction-panel');
        const futureReveal = document.getElementById('future-reveal');
        const predictions = document.getElementById('predictions');
        const eventCountdown = document.getElementById('event-countdown');
        
        predictionPanel.style.display = 'block';
        futureReveal.style.display = 'none';
        
        // Создать варианты предсказаний
        predictions.innerHTML = '';
        this.futureEvents.forEach(event => {
            const predictionEl = document.createElement('div');
            predictionEl.className = 'prediction-item';
            predictionEl.innerHTML = `
                <div class="prediction-icon">${event.icon}</div>
                <div class="prediction-name">${event.name}</div>
            `;
            predictionEl.addEventListener('click', () => this.makePrediction(event, predictionEl));
            predictions.appendChild(predictionEl);
        });
        
        // Обратный отсчет до события
        let countdown = 10;
        eventCountdown.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            eventCountdown.textContent = countdown;
            
            if (countdown <= 0 || this.predictionMade) {
                clearInterval(countdownInterval);
                this.revealFuture();
            }
        }, 1000);
    }

    makePrediction(event, element) {
        if (this.predictionMade) return;
        
        this.predictionMade = true;
        this.selectedEvent = event;
        
        // Отметить выбранное
        document.querySelectorAll('.prediction-item').forEach(item => {
            item.classList.remove('selected');
            item.style.pointerEvents = 'none';
        });
        element.classList.add('selected');
    }

    revealFuture() {
        const predictionPanel = document.getElementById('prediction-panel');
        const futureReveal = document.getElementById('future-reveal');
        const actualEvent = document.getElementById('actual-event');
        
        predictionPanel.style.display = 'none';
        futureReveal.style.display = 'block';
        
        actualEvent.innerHTML = `
            <div class="prediction-icon">${this.currentEvent.icon}</div>
            <div class="prediction-name">${this.currentEvent.name}</div>
        `;
        
        // Проверить предсказание
        if (this.selectedEvent && this.selectedEvent.name === this.currentEvent.name) {
            this.handleCorrectPrediction();
        } else if (this.selectedEvent) {
            this.handleIncorrectPrediction();
        } else {
            this.handleNoPrediction();
        }
        
        this.updateProphecyScore();
        
        setTimeout(() => {
            this.nextRound();
        }, 3000);
    }

    handleCorrectPrediction() {
        const confidence = document.getElementById('prediction-confidence').value;
        const points = 200 + (confidence * 25) + Math.max(0, this.app.gameState.timer - 10) * 10;
        
        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        SoundManager?.play('success');
    }

    handleIncorrectPrediction() {
        this.app.updateGameState({ 
            lives: this.app.gameState.lives - 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        SoundManager?.play('error');
    }

    handleNoPrediction() {
        this.app.updateGameState({ 
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
    }

    updateProphecyScore() {
        const prophecyScore = document.getElementById('prophecy-score');
        if (this.app.gameState.totalQuestions > 0) {
            const accuracy = Math.round((this.app.gameState.correctAnswers / this.app.gameState.totalQuestions) * 100);
            prophecyScore.textContent = accuracy + '%';
        }
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
    }
}

window.PrecognitionGame = PrecognitionGame;