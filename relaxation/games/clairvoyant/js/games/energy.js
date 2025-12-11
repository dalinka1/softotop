// Игра "Энергия" - энергетические практики
class EnergyGame {
    constructor(app) {
        this.app = app;
        this.currentExercise = null;
        this.energyLevel = 50;
        this.exerciseTypes = [
            { name: 'Концентрация', type: 'focus', difficulty: 1 },
            { name: 'Накопление', type: 'gather', difficulty: 2 },
            { name: 'Передача', type: 'transfer', difficulty: 3 },
            { name: 'Баланс', type: 'balance', difficulty: 2 }
        ];
        this.timer = null;
        this.exerciseTimer = null;
        this.init();
    }

    init() {
        this.setupGame();
        this.startTimer();
        this.nextExercise();
    }

    setupGame() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="energy-game">
                <div class="game-header">
                    <h2>Энергетические практики</h2>
                    <p class="instruction">Управляйте энергией и выполняйте задания</p>
                </div>
                
                <div class="energy-workspace" id="energy-workspace">
                    <div class="energy-orb" id="energy-orb">
                        <div class="orb-core" id="orb-core">
                            <div class="energy-particles"></div>
                        </div>
                        <div class="orb-aura" id="orb-aura"></div>
                    </div>
                    
                    <div class="energy-controls">
                        <div class="energy-meter">
                            <div class="meter-label">Уровень энергии</div>
                            <div class="meter-container">
                                <div class="energy-bar">
                                    <div class="energy-fill" id="energy-fill" style="width: 50%;"></div>
                                </div>
                                <span class="energy-value" id="energy-value">50%</span>
                            </div>
                        </div>
                        
                        <div class="energy-actions">
                            <button class="energy-btn" id="focus-btn" data-action="focus">
                                <i class="fas fa-dot-circle"></i> Концентрация
                            </button>
                            <button class="energy-btn" id="gather-btn" data-action="gather">
                                <i class="fas fa-compress-arrows-alt"></i> Накопление
                            </button>
                            <button class="energy-btn" id="release-btn" data-action="release">
                                <i class="fas fa-expand-arrows-alt"></i> Выброс
                            </button>
                            <button class="energy-btn" id="balance-btn" data-action="balance">
                                <i class="fas fa-balance-scale"></i> Баланс
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="exercise-panel" id="exercise-panel">
                    <div class="current-exercise">
                        <h3 id="exercise-title">Упражнение</h3>
                        <p class="exercise-description" id="exercise-description">Описание упражнения</p>
                        <div class="exercise-target" id="exercise-target">
                            <span class="target-label">Цель:</span>
                            <span class="target-value" id="target-value">70%</span>
                        </div>
                        <div class="exercise-timer">
                            <span class="timer-label">Время:</span>
                            <span class="timer-value" id="exercise-time">10s</span>
                        </div>
                    </div>
                    
                    <div class="success-indicator" id="success-indicator">
                        <div class="success-ring">
                            <div class="success-fill" id="success-fill"></div>
                        </div>
                        <span class="success-text">Успех</span>
                    </div>
                </div>
                
                <div class="chakra-system" id="chakra-system">
                    <div class="chakra-wheel">
                        <div class="chakra" data-chakra="crown" style="--chakra-color: #9C27B0;">
                            <span class="chakra-name">Коронная</span>
                        </div>
                        <div class="chakra" data-chakra="third-eye" style="--chakra-color: #3F51B5;">
                            <span class="chakra-name">Третий глаз</span>
                        </div>
                        <div class="chakra" data-chakra="throat" style="--chakra-color: #2196F3;">
                            <span class="chakra-name">Горловая</span>
                        </div>
                        <div class="chakra" data-chakra="heart" style="--chakra-color: #4CAF50;">
                            <span class="chakra-name">Сердечная</span>
                        </div>
                        <div class="chakra" data-chakra="solar" style="--chakra-color: #FF9800;">
                            <span class="chakra-name">Солнечное сплетение</span>
                        </div>
                        <div class="chakra" data-chakra="sacral" style="--chakra-color: #FF5722;">
                            <span class="chakra-name">Крестцовая</span>
                        </div>
                        <div class="chakra" data-chakra="root" style="--chakra-color: #F44336;">
                            <span class="chakra-name">Корневая</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateStyles();
    }

    setupEventListeners() {
        // Кнопки энергетических действий
        document.querySelectorAll('.energy-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                const action = e.target.dataset.action || e.target.closest('.energy-btn').dataset.action;
                this.startEnergyAction(action);
            });
            
            btn.addEventListener('mouseup', () => {
                this.stopEnergyAction();
            });
            
            btn.addEventListener('mouseleave', () => {
                this.stopEnergyAction();
            });
        });
        
        // Чакры
        document.querySelectorAll('.chakra').forEach(chakra => {
            chakra.addEventListener('click', (e) => {
                this.activateChakra(e.target.closest('.chakra').dataset.chakra);
            });
        });
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .energy-game { text-align: center; padding: 2rem; }
            .energy-workspace { display: flex; justify-content: center; align-items: center;
                gap: 3rem; margin: 3rem 0; flex-wrap: wrap; }
            .energy-orb { width: 200px; height: 200px; position: relative;
                display: flex; align-items: center; justify-content: center; }
            .orb-core { width: 120px; height: 120px; background: radial-gradient(circle, var(--primary-color), var(--accent-color));
                border-radius: 50%; position: relative; overflow: hidden;
                animation: orb-pulse 2s ease-in-out infinite; }
            @keyframes orb-pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 30px var(--primary-color); }
                50% { transform: scale(1.1); box-shadow: 0 0 50px var(--accent-color); }
            }
            .energy-particles { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 2px, transparent 2px),
                           radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
                animation: particles-float 4s linear infinite; }
            @keyframes particles-float {
                0% { transform: rotate(0deg) scale(1); }
                100% { transform: rotate(360deg) scale(1.2); }
            }
            .orb-aura { position: absolute; top: -40px; left: -40px; width: 280px; height: 280px;
                border: 3px solid var(--secondary-color); border-radius: 50%;
                opacity: 0.6; animation: aura-spin 8s linear infinite; }
            @keyframes aura-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .energy-controls { display: flex; flex-direction: column; gap: 2rem;
                background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 20px; padding: 2rem; backdrop-filter: blur(10px); }
            .energy-meter { text-align: center; }
            .meter-label { color: var(--text-medium); margin-bottom: 1rem; }
            .meter-container { display: flex; align-items: center; gap: 1rem; }
            .energy-bar { flex: 1; height: 20px; background: var(--bg-dark);
                border-radius: 10px; overflow: hidden; border: 2px solid var(--glass-border); }
            .energy-fill { height: 100%; background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--primary-color));
                border-radius: 8px; transition: width 0.3s ease; }
            .energy-value { color: var(--primary-color); font-weight: bold; min-width: 50px; }
            .energy-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .energy-btn { background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 15px; padding: 1rem; color: var(--text-light);
                cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);
                font-size: 0.9rem; }
            .energy-btn:hover { border-color: var(--primary-color);
                box-shadow: 0 0 15px rgba(108, 92, 231, 0.5); }
            .energy-btn:active, .energy-btn.active {
                background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                transform: scale(0.95); }
            .exercise-panel { background: var(--glass-bg); border: 3px solid var(--glass-border);
                border-radius: 20px; padding: 2rem; margin: 2rem 0;
                backdrop-filter: blur(10px); max-width: 500px; margin-left: auto; margin-right: auto; }
            .current-exercise h3 { color: var(--primary-color); margin-bottom: 1rem; }
            .exercise-description { color: var(--text-medium); margin-bottom: 1.5rem;
                line-height: 1.5; }
            .exercise-target, .exercise-timer { display: flex; justify-content: space-between;
                margin-bottom: 1rem; }
            .target-label, .timer-label { color: var(--text-medium); }
            .target-value, .timer-value { color: var(--primary-color); font-weight: bold; }
            .success-indicator { margin-top: 2rem; text-align: center; }
            .success-ring { width: 80px; height: 80px; margin: 0 auto 1rem;
                border: 5px solid var(--glass-border); border-radius: 50%;
                position: relative; overflow: hidden; }
            .success-fill { position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: conic-gradient(var(--success-color) 0deg, transparent 0deg);
                border-radius: 50%; transition: all 0.5s ease; }
            .success-text { color: var(--success-color); font-weight: bold; }
            .chakra-system { margin: 3rem 0; }
            .chakra-wheel { display: flex; flex-direction: column; align-items: center;
                gap: 1rem; max-width: 600px; margin: 0 auto; }
            .chakra { width: 60px; height: 60px; border: 3px solid var(--chakra-color);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.3s ease; position: relative;
                background: radial-gradient(circle, var(--chakra-color), transparent); }
            .chakra:hover { transform: scale(1.1); box-shadow: 0 0 20px var(--chakra-color); }
            .chakra.active { animation: chakra-spin 2s linear infinite;
                box-shadow: 0 0 30px var(--chakra-color); }
            @keyframes chakra-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .chakra-name { position: absolute; left: 80px; white-space: nowrap;
                color: var(--text-light); font-size: 0.8rem; }
            @media (max-width: 768px) {
                .energy-workspace { flex-direction: column; gap: 2rem; }
                .energy-actions { grid-template-columns: 1fr; }
                .chakra-wheel { flex-direction: row; flex-wrap: wrap; justify-content: center; }
                .chakra { width: 40px; height: 40px; }
                .chakra-name { position: relative; left: 0; margin-top: 5px; }
            }
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

    nextExercise() {
        this.currentExercise = this.exerciseTypes[Math.floor(Math.random() * this.exerciseTypes.length)];
        this.setupExercise();
    }

    setupExercise() {
        const exerciseTitle = document.getElementById('exercise-title');
        const exerciseDescription = document.getElementById('exercise-description');
        const targetValue = document.getElementById('target-value');
        const exerciseTime = document.getElementById('exercise-time');
        
        const exercises = {
            'focus': {
                title: 'Концентрация энергии',
                description: 'Сосредоточьте энергию в орбе, удерживая кнопку концентрации',
                target: Math.floor(Math.random() * 30) + 70,
                duration: 15
            },
            'gather': {
                title: 'Накопление энергии',
                description: 'Накопите энергию до указанного уровня',
                target: Math.floor(Math.random() * 20) + 80,
                duration: 20
            },
            'balance': {
                title: 'Балансировка',
                description: 'Удерживайте энергию на указанном уровне',
                target: 50,
                duration: 25
            }
        };
        
        const exercise = exercises[this.currentExercise.type];
        this.targetLevel = exercise.target;
        this.exerciseDuration = exercise.duration;
        
        if (exerciseTitle) exerciseTitle.textContent = exercise.title;
        if (exerciseDescription) exerciseDescription.textContent = exercise.description;
        if (targetValue) targetValue.textContent = exercise.target + '%';
        if (exerciseTime) exerciseTime.textContent = exercise.duration + 's';
        
        this.startExercise();
    }

    startExercise() {
        let timeLeft = this.exerciseDuration;
        let progress = 0;
        
        const exerciseTime = document.getElementById('exercise-time');
        const successFill = document.getElementById('success-fill');
        
        if (this.exerciseTimer) clearInterval(this.exerciseTimer);
        
        this.exerciseTimer = setInterval(() => {
            timeLeft--;
            if (exerciseTime) exerciseTime.textContent = timeLeft + 's';
            
            // Проверить успех
            const tolerance = 10;
            const inRange = Math.abs(this.energyLevel - this.targetLevel) <= tolerance;
            
            if (inRange) {
                progress = Math.min(100, progress + (100 / this.exerciseDuration));
            } else {
                progress = Math.max(0, progress - 5);
            }
            
            if (successFill) {
                successFill.style.background = `conic-gradient(var(--success-color) ${progress * 3.6}deg, transparent 0deg)`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.exerciseTimer);
                this.completeExercise(progress);
            }
        }, 1000);
    }

    completeExercise(progress) {
        const success = progress >= 70;
        
        if (success) {
            const points = Math.floor(150 + (progress * 2) + (this.currentExercise.difficulty * 50));
            
            this.app.updateGameState({ 
                score: this.app.gameState.score + points,
                correctAnswers: this.app.gameState.correctAnswers + 1,
                totalQuestions: this.app.gameState.totalQuestions + 1
            });
            
            SoundManager?.play('success');
        } else {
            this.app.updateGameState({ 
                lives: this.app.gameState.lives - 1,
                totalQuestions: this.app.gameState.totalQuestions + 1
            });
            
            SoundManager?.play('error');
        }
        
        setTimeout(() => {
            this.nextExercise();
        }, 2000);
    }

    startEnergyAction(action) {
        if (this.actionInterval) clearInterval(this.actionInterval);
        
        const button = document.querySelector(`[data-action="${action}"]`);
        if (button) button.classList.add('active');
        
        this.actionInterval = setInterval(() => {
            switch (action) {
                case 'focus':
                    this.energyLevel = Math.min(100, this.energyLevel + 2);
                    break;
                case 'gather':
                    this.energyLevel = Math.min(100, this.energyLevel + 3);
                    break;
                case 'release':
                    this.energyLevel = Math.max(0, this.energyLevel - 3);
                    break;
                case 'balance':
                    const target = 50;
                    if (this.energyLevel > target) {
                        this.energyLevel = Math.max(target, this.energyLevel - 1);
                    } else if (this.energyLevel < target) {
                        this.energyLevel = Math.min(target, this.energyLevel + 1);
                    }
                    break;
            }
            
            this.updateEnergyDisplay();
        }, 100);
    }

    stopEnergyAction() {
        if (this.actionInterval) {
            clearInterval(this.actionInterval);
            this.actionInterval = null;
        }
        
        document.querySelectorAll('.energy-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    updateEnergyDisplay() {
        const energyFill = document.getElementById('energy-fill');
        const energyValue = document.getElementById('energy-value');
        const orbCore = document.getElementById('orb-core');
        
        if (energyFill) {
            energyFill.style.width = this.energyLevel + '%';
        }
        
        if (energyValue) {
            energyValue.textContent = Math.round(this.energyLevel) + '%';
        }
        
        if (orbCore) {
            const intensity = this.energyLevel / 100;
            orbCore.style.filter = `brightness(${0.5 + intensity}) saturate(${0.5 + intensity})`;
        }
    }

    activateChakra(chakraName) {
        const chakra = document.querySelector(`[data-chakra="${chakraName}"]`);
        if (!chakra) return;
        
        // Удалить активность со всех чакр
        document.querySelectorAll('.chakra').forEach(c => c.classList.remove('active'));
        
        // Активировать выбранную
        chakra.classList.add('active');
        
        // Бонус к энергии
        this.energyLevel = Math.min(100, this.energyLevel + 15);
        this.updateEnergyDisplay();
        
        setTimeout(() => {
            chakra.classList.remove('active');
        }, 3000);
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
        if (this.exerciseTimer) clearInterval(this.exerciseTimer);
        if (this.actionInterval) clearInterval(this.actionInterval);
    }
}

window.EnergyGame = EnergyGame;