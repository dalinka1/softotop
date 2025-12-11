// Игра "Ясновидение" - предсказание цветов и чисел
class ClairvoyanceGame {
    constructor(app) {
        this.app = app;
        this.currentTarget = null;
        this.gameMode = 'colors'; // 'colors', 'numbers', 'sequence'
        this.colors = [
            { name: 'Красный', value: '#E74C3C', energy: 'активность' },
            { name: 'Синий', value: '#3498DB', energy: 'спокойствие' },
            { name: 'Зеленый', value: '#27AE60', energy: 'гармония' },
            { name: 'Желтый', value: '#F1C40F', energy: 'радость' },
            { name: 'Фиолетовый', value: '#9B59B6', energy: 'мистика' },
            { name: 'Оранжевый', value: '#E67E22', energy: 'энергия' },
            { name: 'Розовый', value: '#E91E63', energy: 'любовь' },
            { name: 'Бирюзовый', value: '#1ABC9C', energy: 'исцеление' }
        ];
        this.numbers = Array.from({length: 10}, (_, i) => i);
        this.timer = null;
        this.visionSequence = [];
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
            <div class="clairvoyance-game">
                <div class="game-header">
                    <h2>Ясновидение</h2>
                    <p class="instruction">Настройтесь на будущее и предскажите, что появится</p>
                    
                    <div class="mode-switch">
                        <button class="mode-btn active" data-mode="colors">Цвета</button>
                        <button class="mode-btn" data-mode="numbers">Числа</button>
                        <button class="mode-btn" data-mode="sequence">Последовательность</button>
                    </div>
                </div>
                
                <div class="vision-display">
                    <div class="crystal-ball" id="crystal-ball">
                        <div class="crystal-surface">
                            <div class="energy-waves">
                                <div class="wave wave-1"></div>
                                <div class="wave wave-2"></div>
                                <div class="wave wave-3"></div>
                            </div>
                            <div class="vision-center" id="vision-center">
                                <div class="future-glimpse">Всматривайтесь в будущее...</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="energy-meter">
                        <div class="meter-label">Энергия предвидения</div>
                        <div class="meter-bar">
                            <div class="meter-fill" id="energy-fill"></div>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-area" id="prediction-area" style="display: none;">
                    <h3 id="prediction-question">Какой цвет вы видите?</h3>
                    <div class="predictions-grid" id="predictions-grid">
                        <!-- Варианты предсказаний -->
                    </div>
                    
                    <div class="confidence-slider">
                        <label>Уверенность в предсказании:</label>
                        <input type="range" id="confidence" min="1" max="10" value="5">
                        <span class="confidence-value">5/10</span>
                    </div>
                </div>
                
                <div class="meditation-space" id="meditation-space">
                    <div class="aura-circle">
                        <div class="aura-ring ring-1"></div>
                        <div class="aura-ring ring-2"></div>
                        <div class="aura-ring ring-3"></div>
                        <div class="center-focus">
                            <span>Фокус</span>
                        </div>
                    </div>
                    <p class="meditation-text">Очистите разум от мыслей... Позвольте образам прийти естественно...</p>
                </div>
                
                <div class="sequence-display" id="sequence-display" style="display: none;">
                    <h3>Запомните последовательность:</h3>
                    <div class="sequence-items" id="sequence-items">
                        <!-- Последовательность элементов -->
                    </div>
                    <div class="sequence-timer">
                        <span id="sequence-countdown">Приготовьтесь...</span>
                    </div>
                </div>
                
                <div class="vision-feedback" id="vision-feedback">
                    <div class="accuracy-indicator">
                        <span class="accuracy-label">Точность видений:</span>
                        <div class="accuracy-bar">
                            <div class="accuracy-fill" id="accuracy-fill" style="width: 0%;"></div>
                        </div>
                        <span class="accuracy-percent" id="accuracy-percent">0%</span>
                    </div>
                    
                    <div class="energy-level">
                        <span class="energy-label">Уровень энергии:</span>
                        <div class="energy-crystals">
                            <div class="crystal"></div>
                            <div class="crystal"></div>
                            <div class="crystal"></div>
                            <div class="crystal"></div>
                            <div class="crystal"></div>
                        </div>
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

        // Слайдер уверенности
        const confidenceSlider = document.getElementById('confidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                document.querySelector('.confidence-value').textContent = `${e.target.value}/10`;
            });
        }
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .clairvoyance-game {
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
                flex-wrap: wrap;
            }

            .vision-display {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 3rem 0;
            }

            .crystal-ball {
                width: 250px;
                height: 250px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%),
                           radial-gradient(circle, rgba(108, 92, 231, 0.2), rgba(253, 121, 168, 0.1));
                border: 3px solid var(--primary-color);
                position: relative;
                overflow: hidden;
                box-shadow: 
                    0 0 50px rgba(108, 92, 231, 0.5),
                    inset 0 0 50px rgba(255, 255, 255, 0.1);
                animation: float 4s ease-in-out infinite;
            }

            .crystal-surface {
                width: 100%;
                height: 100%;
                position: relative;
                border-radius: 50%;
                overflow: hidden;
            }

            .energy-waves {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
            }

            .wave {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 2px solid var(--accent-color);
                border-radius: 50%;
                animation: wave-expand 3s ease-out infinite;
            }

            .wave-1 {
                width: 50px;
                height: 50px;
                animation-delay: 0s;
            }

            .wave-2 {
                width: 50px;
                height: 50px;
                animation-delay: 1s;
                border-color: var(--secondary-color);
            }

            .wave-3 {
                width: 50px;
                height: 50px;
                animation-delay: 2s;
                border-color: var(--warning-color);
            }

            @keyframes wave-expand {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(4);
                    opacity: 0;
                }
            }

            .vision-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 80%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                color: var(--text-light);
                text-align: center;
                z-index: 2;
            }

            .future-glimpse {
                animation: pulse 2s ease-in-out infinite;
            }

            .energy-meter {
                margin-top: 2rem;
                width: 300px;
            }

            .meter-label {
                color: var(--text-medium);
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }

            .meter-bar {
                width: 100%;
                height: 10px;
                background: var(--bg-dark);
                border-radius: 5px;
                overflow: hidden;
                border: 1px solid var(--glass-border);
            }

            .meter-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                border-radius: 5px;
                transition: width 2s ease;
                animation: energy-pulse 1.5s ease-in-out infinite;
            }

            @keyframes energy-pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }

            .prediction-area {
                margin: 3rem 0;
            }

            .prediction-area h3 {
                color: var(--text-light);
                margin-bottom: 2rem;
                font-size: 1.5rem;
            }

            .predictions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 1rem;
                max-width: 600px;
                margin: 0 auto 2rem;
            }

            .prediction-item {
                background: var(--glass-bg);
                border: 3px solid var(--glass-border);
                border-radius: 15px;
                padding: 1.5rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }

            .prediction-item:hover {
                transform: translateY(-3px) scale(1.05);
                border-color: var(--primary-color);
                box-shadow: 0 10px 25px rgba(108, 92, 231, 0.3);
            }

            .prediction-item.correct {
                border-color: var(--success-color);
                background: linear-gradient(135deg, var(--glass-bg), rgba(0, 184, 148, 0.2));
                animation: correct-glow 1s ease-out;
            }

            .prediction-item.incorrect {
                border-color: var(--danger-color);
                background: linear-gradient(135deg, var(--glass-bg), rgba(225, 112, 85, 0.2));
                animation: incorrect-shake 0.5s ease-out;
            }

            @keyframes correct-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 184, 148, 0.5); }
                50% { box-shadow: 0 0 40px rgba(0, 184, 148, 0.8); }
            }

            @keyframes incorrect-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .color-preview {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-bottom: 0.5rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }

            .number-display {
                font-size: 2rem;
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 0.5rem;
            }

            .item-name {
                font-size: 0.9rem;
                color: var(--text-medium);
            }

            .confidence-slider {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                margin-top: 2rem;
                color: var(--text-medium);
            }

            .confidence-slider input[type="range"] {
                width: 200px;
                -webkit-appearance: none;
                height: 8px;
                border-radius: 5px;
                background: var(--bg-dark);
                outline: none;
            }

            .confidence-slider input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--accent-color);
                cursor: pointer;
            }

            .confidence-value {
                color: var(--primary-color);
                font-weight: bold;
            }

            .meditation-space {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 2rem 0;
            }

            .aura-circle {
                position: relative;
                width: 150px;
                height: 150px;
                margin-bottom: 1rem;
            }

            .aura-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                border: 2px solid;
                animation: aura-pulse 4s ease-in-out infinite;
            }

            .ring-1 {
                width: 80px;
                height: 80px;
                border-color: var(--primary-color);
                animation-delay: 0s;
            }

            .ring-2 {
                width: 110px;
                height: 110px;
                border-color: var(--accent-color);
                animation-delay: 1s;
            }

            .ring-3 {
                width: 140px;
                height: 140px;
                border-color: var(--secondary-color);
                animation-delay: 2s;
            }

            @keyframes aura-pulse {
                0%, 100% {
                    opacity: 0.3;
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    opacity: 0.8;
                    transform: translate(-50%, -50%) scale(1.1);
                }
            }

            .center-focus {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: var(--glass-bg);
                border: 2px solid var(--primary-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                color: var(--text-light);
                font-size: 0.8rem;
                animation: heartbeat 2s ease-in-out infinite;
            }

            .meditation-text {
                color: var(--text-medium);
                font-style: italic;
                max-width: 400px;
                text-align: center;
            }

            .sequence-display {
                margin: 2rem 0;
            }

            .sequence-display h3 {
                color: var(--text-light);
                margin-bottom: 1rem;
            }

            .sequence-items {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin: 2rem 0;
                flex-wrap: wrap;
            }

            .sequence-item {
                width: 60px;
                height: 60px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                border: 2px solid var(--glass-border);
                animation: sequence-appear 0.5s ease-out;
            }

            @keyframes sequence-appear {
                from { 
                    opacity: 0; 
                    transform: scale(0.5) rotateY(180deg); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1) rotateY(0deg); 
                }
            }

            .sequence-timer {
                font-size: 1.2rem;
                color: var(--accent-color);
                font-weight: bold;
            }

            .vision-feedback {
                margin-top: 3rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
            }

            .accuracy-indicator, .energy-level {
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 15px;
                padding: 1.5rem;
                backdrop-filter: blur(10px);
            }

            .accuracy-bar {
                width: 100%;
                height: 10px;
                background: var(--bg-dark);
                border-radius: 5px;
                overflow: hidden;
                margin: 0.5rem 0;
            }

            .accuracy-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--danger-color), var(--warning-color), var(--success-color));
                border-radius: 5px;
                transition: width 1s ease;
            }

            .accuracy-label, .energy-label {
                display: block;
                color: var(--text-medium);
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .accuracy-percent {
                color: var(--primary-color);
                font-weight: bold;
            }

            .energy-crystals {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .crystal {
                width: 20px;
                height: 20px;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                transform: rotate(45deg);
                position: relative;
            }

            .crystal.active {
                border-color: var(--primary-color);
                background: var(--primary-color);
                box-shadow: 0 0 10px var(--primary-color);
                animation: crystal-glow 1s ease-in-out infinite;
            }

            @keyframes crystal-glow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            @media (max-width: 768px) {
                .crystal-ball {
                    width: 200px;
                    height: 200px;
                }
                
                .energy-meter {
                    width: 250px;
                }
                
                .predictions-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .sequence-items {
                    gap: 0.5rem;
                }
                
                .sequence-item {
                    width: 50px;
                    height: 50px;
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
        this.generateTarget();
        this.showVisionPhase();
    }

    generateTarget() {
        switch (this.gameMode) {
            case 'colors':
                this.currentTarget = this.colors[Math.floor(Math.random() * this.colors.length)];
                break;
            case 'numbers':
                this.currentTarget = {
                    value: Math.floor(Math.random() * 10),
                    name: Math.floor(Math.random() * 10).toString()
                };
                break;
            case 'sequence':
                this.generateSequence();
                return;
        }
    }

    generateSequence() {
        this.visionSequence = [];
        const length = Math.min(3 + Math.floor(this.app.gameState.level / 2), 7);
        
        for (let i = 0; i < length; i++) {
            if (this.gameMode === 'sequence') {
                // Случайные цвета для последовательности
                this.visionSequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
            }
        }
        
        this.showSequence();
    }

    showVisionPhase() {
        const predictionArea = document.getElementById('prediction-area');
        const meditationSpace = document.getElementById('meditation-space');
        const visionCenter = document.getElementById('vision-center');
        const energyFill = document.getElementById('energy-fill');

        predictionArea.style.display = 'none';
        meditationSpace.style.display = 'block';
        
        // Анимация наполнения энергии
        let energy = 0;
        const energyInterval = setInterval(() => {
            energy += 2;
            energyFill.style.width = energy + '%';
            
            if (energy >= 100) {
                clearInterval(energyInterval);
                this.showPredictionChoices();
            }
        }, 50);

        // Обновить текст в кристалле
        visionCenter.innerHTML = `
            <div class="future-glimpse">
                Концентрируйтесь... Образы становятся четче...
            </div>
        `;
    }

    showSequence() {
        const sequenceDisplay = document.getElementById('sequence-display');
        const sequenceItems = document.getElementById('sequence-items');
        const sequenceCountdown = document.getElementById('sequence-countdown');
        const meditationSpace = document.getElementById('meditation-space');

        meditationSpace.style.display = 'none';
        sequenceDisplay.style.display = 'block';

        sequenceCountdown.textContent = 'Запомните последовательность:';
        
        // Показать последовательность
        sequenceItems.innerHTML = '';
        this.visionSequence.forEach((item, index) => {
            setTimeout(() => {
                const itemEl = document.createElement('div');
                itemEl.className = 'sequence-item';
                itemEl.style.backgroundColor = item.value;
                itemEl.textContent = index + 1;
                sequenceItems.appendChild(itemEl);
            }, index * 800);
        });

        // Через 5 секунд перейти к выбору
        setTimeout(() => {
            sequenceItems.innerHTML = '';
            sequenceCountdown.textContent = 'Восстановите последовательность:';
            this.showSequenceChoices();
        }, this.visionSequence.length * 800 + 3000);
    }

    showPredictionChoices() {
        const predictionArea = document.getElementById('prediction-area');
        const meditationSpace = document.getElementById('meditation-space');
        const predictionsGrid = document.getElementById('predictions-grid');
        const predictionQuestion = document.getElementById('prediction-question');

        meditationSpace.style.display = 'none';
        predictionArea.style.display = 'block';

        // Обновить вопрос
        const questions = {
            'colors': 'Какой цвет вы видите в своем видении?',
            'numbers': 'Какое число появилось в кристалле?'
        };
        predictionQuestion.textContent = questions[this.gameMode];

        // Создать варианты выбора
        const choices = this.generateChoices();
        predictionsGrid.innerHTML = '';

        choices.forEach(choice => {
            const choiceEl = document.createElement('div');
            choiceEl.className = 'prediction-item';
            
            if (this.gameMode === 'colors') {
                choiceEl.innerHTML = `
                    <div class="color-preview" style="background-color: ${choice.value}"></div>
                    <div class="item-name">${choice.name}</div>
                `;
            } else {
                choiceEl.innerHTML = `
                    <div class="number-display">${choice.value}</div>
                    <div class="item-name">Число ${choice.name}</div>
                `;
            }
            
            choiceEl.addEventListener('click', () => {
                this.selectPrediction(choice, choiceEl);
            });

            predictionsGrid.appendChild(choiceEl);
        });
    }

    showSequenceChoices() {
        const predictionArea = document.getElementById('prediction-area');
        const predictionsGrid = document.getElementById('predictions-grid');
        const predictionQuestion = document.getElementById('prediction-question');

        predictionArea.style.display = 'block';
        predictionQuestion.textContent = 'Выберите цвета в правильном порядке:';

        // Создать варианты для восстановления последовательности
        const shuffledColors = [...this.colors].sort(() => Math.random() - 0.5);
        predictionsGrid.innerHTML = '';

        this.selectedSequence = [];
        this.sequenceStep = 0;

        shuffledColors.forEach(color => {
            const choiceEl = document.createElement('div');
            choiceEl.className = 'prediction-item';
            choiceEl.innerHTML = `
                <div class="color-preview" style="background-color: ${color.value}"></div>
                <div class="item-name">${color.name}</div>
            `;
            
            choiceEl.addEventListener('click', () => {
                this.selectSequenceItem(color, choiceEl);
            });

            predictionsGrid.appendChild(choiceEl);
        });
    }

    generateChoices() {
        if (this.gameMode === 'colors') {
            return [...this.colors].sort(() => Math.random() - 0.5).slice(0, 6);
        } else {
            const choices = [];
            const correctNumber = this.currentTarget.value;
            choices.push(this.currentTarget);
            
            while (choices.length < 6) {
                const randomNum = Math.floor(Math.random() * 10);
                if (!choices.find(c => c.value === randomNum)) {
                    choices.push({
                        value: randomNum,
                        name: randomNum.toString()
                    });
                }
            }
            
            return choices.sort(() => Math.random() - 0.5);
        }
    }

    selectPrediction(choice, element) {
        const confidence = document.getElementById('confidence').value;
        
        // Отключить все кнопки
        document.querySelectorAll('.prediction-item').forEach(item => {
            item.style.pointerEvents = 'none';
        });

        const isCorrect = this.gameMode === 'colors' ? 
            choice.name === this.currentTarget.name : 
            choice.value === this.currentTarget.value;

        if (isCorrect) {
            element.classList.add('correct');
            this.handleCorrectPrediction(confidence);
        } else {
            element.classList.add('incorrect');
            this.handleIncorrectPrediction();
            
            // Показать правильный ответ
            document.querySelectorAll('.prediction-item').forEach(item => {
                const itemChoice = this.gameMode === 'colors' ?
                    item.querySelector('.item-name').textContent :
                    parseInt(item.querySelector('.number-display').textContent);
                
                const isCorrectItem = this.gameMode === 'colors' ?
                    itemChoice === this.currentTarget.name :
                    itemChoice === this.currentTarget.value;
                    
                if (isCorrectItem) {
                    item.classList.add('correct');
                }
            });
        }

        this.updateAccuracyDisplay();
        this.updateEnergyLevel();

        // Следующий раунд через 3 секунды
        setTimeout(() => {
            this.nextRound();
        }, 3000);
    }

    selectSequenceItem(color, element) {
        if (this.sequenceStep >= this.visionSequence.length) return;

        const isCorrect = color.name === this.visionSequence[this.sequenceStep].name;
        
        if (isCorrect) {
            element.classList.add('correct');
            element.style.pointerEvents = 'none';
            this.selectedSequence.push(color);
            this.sequenceStep++;
            
            if (this.sequenceStep >= this.visionSequence.length) {
                // Последовательность завершена
                this.handleCorrectPrediction(8); // Высокая точность за последовательность
                setTimeout(() => {
                    this.nextRound();
                }, 2000);
            }
        } else {
            element.classList.add('incorrect');
            this.handleIncorrectPrediction();
            
            // Показать правильный ответ
            const correctColor = this.visionSequence[this.sequenceStep];
            document.querySelectorAll('.prediction-item').forEach(item => {
                const itemName = item.querySelector('.item-name').textContent;
                if (itemName === correctColor.name) {
                    item.classList.add('correct');
                }
            });
            
            setTimeout(() => {
                this.nextRound();
            }, 3000);
        }
    }

    handleCorrectPrediction(confidence) {
        const basePoints = 100;
        const confidenceBonus = confidence * 10;
        const timeBonus = Math.max(0, this.app.gameState.timer - 15) * 3;
        const modeMultiplier = this.gameMode === 'sequence' ? 1.5 : 1.0;
        
        const points = Math.round((basePoints + confidenceBonus + timeBonus) * modeMultiplier);

        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });

        SoundManager?.play('success');
        this.showVisionFeedback(`Превосходное видение! +${points} очков`, 'success');
    }

    handleIncorrectPrediction() {
        this.app.updateGameState({ 
            lives: this.app.gameState.lives - 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });

        SoundManager?.play('error');
        this.showVisionFeedback('Видение было нечетким...', 'error');
    }

    showVisionFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            border: 2px solid var(--${type === 'success' ? 'success' : 'danger'}-color);
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
        }, 3000);
    }

    updateAccuracyDisplay() {
        const accuracyFill = document.getElementById('accuracy-fill');
        const accuracyPercent = document.getElementById('accuracy-percent');
        
        if (this.app.gameState.totalQuestions > 0) {
            const accuracy = Math.round((this.app.gameState.correctAnswers / this.app.gameState.totalQuestions) * 100);
            accuracyFill.style.width = accuracy + '%';
            accuracyPercent.textContent = accuracy + '%';
        }
    }

    updateEnergyLevel() {
        const crystals = document.querySelectorAll('.crystal');
        const energyLevel = Math.min(5, Math.floor(this.app.gameState.correctAnswers / 2));
        
        crystals.forEach((crystal, index) => {
            crystal.classList.toggle('active', index < energyLevel);
        });
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Экспорт для использования в главном приложении
window.ClairvoyanceGame = ClairvoyanceGame;