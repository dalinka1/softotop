// Игра "Эмпатия" - определение эмоций
class EmotionsGame {
    constructor(app) {
        this.app = app;
        this.currentEmotion = null;
        this.emotions = [
            { name: 'Радость', emoji: '😄', energy: 'светлая', color: '#F1C40F' },
            { name: 'Грусть', emoji: '😢', energy: 'тяжелая', color: '#3498DB' },
            { name: 'Гнев', emoji: '😡', energy: 'огненная', color: '#E74C3C' },
            { name: 'Страх', emoji: '😨', energy: 'холодная', color: '#9B59B6' },
            { name: 'Удивление', emoji: '😲', energy: 'яркая', color: '#E67E22' },
            { name: 'Любовь', emoji: '😍', energy: 'теплая', color: '#E91E63' },
            { name: 'Отвращение', emoji: '🤢', energy: 'резкая', color: '#27AE60' },
            { name: 'Спокойствие', emoji: '😌', energy: 'равновесная', color: '#1ABC9C' }
        ];
        this.timer = null;
        this.empathyLevel = 0;
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
            <div class="emotions-game">
                <div class="game-header">
                    <h2>Эмпатия</h2>
                    <p class="instruction">Почувствуйте эмоциональную энергию и определите эмоцию</p>
                </div>
                
                <div class="emotion-display">
                    <div class="aura-field" id="aura-field">
                        <div class="emotion-avatar" id="emotion-avatar">
                            <div class="face-outline">
                                <div class="emotion-symbol" id="emotion-symbol">😐</div>
                            </div>
                            <div class="energy-aura" id="energy-aura"></div>
                        </div>
                    </div>
                    
                    <div class="empathy-meter">
                        <div class="meter-label">Уровень эмпатии</div>
                        <div class="empathy-bars">
                            <div class="empathy-bar" data-level="1"></div>
                            <div class="empathy-bar" data-level="2"></div>
                            <div class="empathy-bar" data-level="3"></div>
                            <div class="empathy-bar" data-level="4"></div>
                            <div class="empathy-bar" data-level="5"></div>
                        </div>
                    </div>
                </div>
                
                <div class="emotion-choices" id="emotion-choices" style="display: none;">
                    <h3>Какую эмоцию вы чувствуете?</h3>
                    <div class="emotions-grid" id="emotions-grid">
                        <!-- Варианты эмоций -->
                    </div>
                </div>
                
                <div class="connection-guide" id="connection-guide">
                    <div class="heart-chakra">
                        <div class="chakra-center"></div>
                        <div class="chakra-rings">
                            <div class="ring ring-1"></div>
                            <div class="ring ring-2"></div>
                            <div class="ring ring-3"></div>
                        </div>
                    </div>
                    <p>Откройте свое сердце... Почувствуйте эмоциональное поле...</p>
                </div>
                
                <div class="emotion-feedback" id="emotion-feedback">
                    <div class="empathy-score">
                        <span>Очки эмпатии: </span>
                        <span class="score-value" id="empathy-points">0</span>
                    </div>
                </div>
            </div>
        `;
        
        this.updateStyles();
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .emotions-game { text-align: center; padding: 2rem; }
            .emotion-display { margin: 3rem 0; }
            .aura-field { position: relative; width: 250px; height: 250px; margin: 0 auto;
                border-radius: 50%; border: 3px solid var(--primary-color); }
            .emotion-avatar { position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 150px; height: 150px; }
            .face-outline { width: 100%; height: 100%; border: 2px solid var(--accent-color);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                background: var(--glass-bg); backdrop-filter: blur(10px); }
            .emotion-symbol { font-size: 4rem; animation: pulse 2s ease-in-out infinite; }
            .energy-aura { position: absolute; top: -25px; left: -25px; width: 200px; height: 200px;
                border: 2px solid; border-radius: 50%; opacity: 0.6;
                animation: aura-pulse 3s ease-in-out infinite; }
            @keyframes aura-pulse {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.1); opacity: 0.9; }
            }
            .empathy-meter { margin: 2rem 0; }
            .meter-label { color: var(--text-medium); margin-bottom: 1rem; }
            .empathy-bars { display: flex; justify-content: center; gap: 0.5rem; }
            .empathy-bar { width: 20px; height: 40px; background: var(--glass-bg);
                border: 2px solid var(--glass-border); border-radius: 5px;
                transition: all 0.3s ease; }
            .empathy-bar.active { background: linear-gradient(to top, var(--primary-color), var(--accent-color));
                border-color: var(--primary-color); box-shadow: 0 0 10px var(--primary-color); }
            .emotions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem; max-width: 600px; margin: 0 auto; }
            .emotion-choice { background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 15px; padding: 1.5rem 1rem; cursor: pointer;
                transition: all 0.3s ease; backdrop-filter: blur(10px); }
            .emotion-choice:hover { transform: scale(1.05); border-color: var(--primary-color); }
            .emotion-choice.correct { border-color: var(--success-color); }
            .emotion-choice.incorrect { border-color: var(--danger-color); }
            .choice-emotion { font-size: 2.5rem; margin-bottom: 0.5rem; }
            .choice-name { color: var(--text-light); font-size: 0.9rem; }
            .choice-energy { color: var(--text-medium); font-size: 0.8rem; }
            .heart-chakra { width: 100px; height: 100px; margin: 0 auto 1rem; position: relative; }
            .chakra-center { width: 30px; height: 30px; background: var(--accent-color);
                border-radius: 50%; position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); animation: heartbeat 2s ease-in-out infinite; }
            .chakra-rings { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            .ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                border: 2px solid; border-radius: 50%; }
            .ring-1 { width: 50px; height: 50px; border-color: var(--primary-color); }
            .ring-2 { width: 70px; height: 70px; border-color: var(--accent-color); }
            .ring-3 { width: 90px; height: 90px; border-color: var(--secondary-color); }
            .empathy-score { background: var(--glass-bg); border: 2px solid var(--glass-border);
                border-radius: 15px; padding: 1rem; display: inline-block;
                backdrop-filter: blur(10px); }
            .score-value { color: var(--primary-color); font-weight: bold; font-size: 1.2rem; }
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
        this.currentEmotion = this.emotions[Math.floor(Math.random() * this.emotions.length)];
        this.showEmotionSensing();
    }

    showEmotionSensing() {
        const emotionChoices = document.getElementById('emotion-choices');
        const connectionGuide = document.getElementById('connection-guide');
        const emotionSymbol = document.getElementById('emotion-symbol');
        const energyAura = document.getElementById('energy-aura');
        
        emotionChoices.style.display = 'none';
        connectionGuide.style.display = 'block';
        
        emotionSymbol.textContent = this.currentEmotion.emoji;
        energyAura.style.borderColor = this.currentEmotion.color;
        
        setTimeout(() => {
            this.showEmotionChoices();
        }, 4000);
    }

    showEmotionChoices() {
        const emotionChoices = document.getElementById('emotion-choices');
        const connectionGuide = document.getElementById('connection-guide');
        const emotionsGrid = document.getElementById('emotions-grid');
        
        connectionGuide.style.display = 'none';
        emotionChoices.style.display = 'block';
        
        const choices = this.generateEmotionChoices();
        emotionsGrid.innerHTML = '';
        
        choices.forEach(emotion => {
            const choiceEl = document.createElement('div');
            choiceEl.className = 'emotion-choice';
            choiceEl.innerHTML = `
                <div class="choice-emotion">${emotion.emoji}</div>
                <div class="choice-name">${emotion.name}</div>
                <div class="choice-energy">${emotion.energy}</div>
            `;
            choiceEl.addEventListener('click', () => this.selectEmotion(emotion, choiceEl));
            emotionsGrid.appendChild(choiceEl);
        });
    }

    generateEmotionChoices() {
        const choices = [this.currentEmotion];
        const otherEmotions = this.emotions.filter(e => e.name !== this.currentEmotion.name);
        
        while (choices.length < 6) {
            const randomEmotion = otherEmotions[Math.floor(Math.random() * otherEmotions.length)];
            if (!choices.find(c => c.name === randomEmotion.name)) {
                choices.push(randomEmotion);
            }
        }
        
        return choices.sort(() => Math.random() - 0.5);
    }

    selectEmotion(emotion, element) {
        document.querySelectorAll('.emotion-choice').forEach(item => {
            item.style.pointerEvents = 'none';
        });
        
        const isCorrect = emotion.name === this.currentEmotion.name;
        
        if (isCorrect) {
            element.classList.add('correct');
            this.handleCorrectEmotion();
        } else {
            element.classList.add('incorrect');
            this.handleIncorrectEmotion();
        }
        
        this.updateEmpathyLevel();
        setTimeout(() => this.nextRound(), 2500);
    }

    handleCorrectEmotion() {
        const empathyBonus = this.empathyLevel * 20;
        const points = 150 + empathyBonus + Math.max(0, this.app.gameState.timer - 15) * 5;
        
        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        this.empathyLevel = Math.min(5, this.empathyLevel + 1);
        SoundManager?.play('success');
    }

    handleIncorrectEmotion() {
        this.app.updateGameState({ 
            lives: this.app.gameState.lives - 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        this.empathyLevel = Math.max(0, this.empathyLevel - 1);
        SoundManager?.play('error');
    }

    updateEmpathyLevel() {
        const empathyPoints = document.getElementById('empathy-points');
        const empathyBars = document.querySelectorAll('.empathy-bar');
        
        if (empathyPoints) {
            empathyPoints.textContent = this.empathyLevel * 100;
        }
        
        empathyBars.forEach((bar, index) => {
            bar.classList.toggle('active', index < this.empathyLevel);
        });
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
    }
}

window.EmotionsGame = EmotionsGame;