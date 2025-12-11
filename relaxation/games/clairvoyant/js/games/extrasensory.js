// Игра "Экстрасенсорика" - поиск скрытых объектов
class ExtrasensoryGame {
    constructor(app) {
        this.app = app;
        this.hiddenObject = null;
        this.searchGrid = [];
        this.gridSize = 5;
        this.foundObjects = 0;
        this.totalObjects = 3;
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
            <div class="extrasensory-game">
                <div class="game-header">
                    <h2>Экстрасенсорика</h2>
                    <p class="instruction">Найдите скрытые объекты, следуя своей интуиции</p>
                </div>
                
                <div class="search-area">
                    <div class="energy-scanner" id="energy-scanner">
                        <div class="scanner-display">
                            <canvas id="scanner-canvas" width="200" height="200"></canvas>
                            <div class="scanner-crosshair"></div>
                        </div>
                        <div class="energy-reading">
                            <span class="energy-level" id="energy-level">0%</span>
                            <div class="energy-bar">
                                <div class="energy-fill" id="energy-fill"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="search-grid" id="search-grid">
                        <!-- Сетка поиска -->
                    </div>
                </div>
                
                <div class="search-status">
                    <div class="objects-found">
                        <span class="status-label">Найдено:</span>
                        <span class="status-value" id="found-count">0</span> / 
                        <span class="status-total" id="total-count">3</span>
                    </div>
                    
                    <div class="psychic-sensitivity">
                        <span class="sensitivity-label">Экстрасенсорная чувствительность:</span>
                        <div class="sensitivity-indicators">
                            <div class="indicator" data-level="1"></div>
                            <div class="indicator" data-level="2"></div>
                            <div class="indicator" data-level="3"></div>
                            <div class="indicator" data-level="4"></div>
                            <div class="indicator" data-level="5"></div>
                        </div>
                    </div>
                </div>
                
                <div class="dowsing-guide">
                    <div class="pendulum">
                        <div class="pendulum-string"></div>
                        <div class="pendulum-weight" id="pendulum-weight"></div>
                    </div>
                    <p>Почувствуйте энергетические поля...</p>
                </div>
            </div>
        `;
        
        this.updateStyles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Отслеживание мыши для сканера энергии
        document.addEventListener('mousemove', (e) => {
            this.updateEnergyScanner(e.clientX, e.clientY);
        });
    }

    updateStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .extrasensory-game { text-align: center; padding: 2rem; }
            .search-area { display: flex; justify-content: center; gap: 3rem;
                margin: 2rem 0; align-items: flex-start; flex-wrap: wrap; }
            .energy-scanner { background: var(--glass-bg); border: 3px solid var(--primary-color);
                border-radius: 20px; padding: 1.5rem; backdrop-filter: blur(10px); }
            .scanner-display { width: 200px; height: 200px; position: relative;
                border-radius: 50%; border: 2px solid var(--accent-color); overflow: hidden; }
            #scanner-canvas { border-radius: 50%; }
            .scanner-crosshair { position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 20px; height: 20px;
                border: 2px solid var(--warning-color); }
            .scanner-crosshair::before, .scanner-crosshair::after {
                content: ''; position: absolute; background: var(--warning-color); }
            .scanner-crosshair::before { top: -2px; left: 8px; width: 2px; height: 24px; }
            .scanner-crosshair::after { top: 8px; left: -2px; width: 24px; height: 2px; }
            .energy-reading { margin-top: 1rem; }
            .energy-level { color: var(--primary-color); font-weight: bold; font-size: 1.2rem; }
            .energy-bar { width: 100%; height: 10px; background: var(--bg-dark);
                border-radius: 5px; margin-top: 0.5rem; overflow: hidden; }
            .energy-fill { height: 100%; background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--danger-color));
                width: 0%; transition: width 0.3s ease; }
            .search-grid { display: grid; grid-template-columns: repeat(5, 1fr);
                gap: 0.5rem; max-width: 300px; }
            .grid-cell { width: 50px; height: 50px; background: var(--glass-bg);
                border: 2px solid var(--glass-border); border-radius: 10px;
                cursor: pointer; transition: all 0.3s ease; position: relative;
                backdrop-filter: blur(10px); }
            .grid-cell:hover { border-color: var(--primary-color);
                box-shadow: 0 0 15px rgba(108, 92, 231, 0.5); }
            .grid-cell.found { background: linear-gradient(135deg, var(--success-color), var(--warning-color));
                border-color: var(--success-color); animation: found-pulse 1s ease-out; }
            @keyframes found-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); box-shadow: 0 0 30px var(--success-color); }
                100% { transform: scale(1); }
            }
            .grid-cell.searched { background: rgba(255, 255, 255, 0.1);
                border-color: var(--text-medium); }
            .search-status { display: flex; justify-content: center; gap: 3rem;
                margin: 2rem 0; flex-wrap: wrap; }
            .objects-found, .psychic-sensitivity { background: var(--glass-bg);
                border: 2px solid var(--glass-border); border-radius: 15px;
                padding: 1rem; backdrop-filter: blur(10px); }
            .status-label, .sensitivity-label { color: var(--text-medium);
                display: block; margin-bottom: 0.5rem; }
            .status-value, .status-total { color: var(--primary-color);
                font-weight: bold; font-size: 1.2rem; }
            .sensitivity-indicators { display: flex; gap: 0.5rem; }
            .indicator { width: 15px; height: 25px; background: var(--glass-bg);
                border: 2px solid var(--glass-border); border-radius: 3px;
                transition: all 0.3s ease; }
            .indicator.active { background: linear-gradient(to top, var(--primary-color), var(--accent-color));
                border-color: var(--primary-color); box-shadow: 0 0 10px var(--primary-color); }
            .dowsing-guide { margin: 2rem 0; }
            .pendulum { width: 100px; height: 120px; margin: 0 auto 1rem; position: relative; }
            .pendulum-string { position: absolute; top: 0; left: 50%;
                transform: translateX(-50%); width: 2px; height: 80px;
                background: var(--text-medium); }
            .pendulum-weight { position: absolute; bottom: 0; left: 50%;
                transform: translateX(-50%); width: 20px; height: 20px;
                background: var(--accent-color); border-radius: 50%;
                animation: pendulum-swing 3s ease-in-out infinite; }
            @keyframes pendulum-swing {
                0%, 100% { transform: translateX(-50%) rotate(-10deg); }
                50% { transform: translateX(-50%) rotate(10deg); }
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

    nextRound() {
        this.foundObjects = 0;
        this.createSearchGrid();
        this.placeHiddenObjects();
        this.updateStatus();
    }

    createSearchGrid() {
        const searchGrid = document.getElementById('search-grid');
        searchGrid.innerHTML = '';
        
        this.searchGrid = [];
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            
            cell.addEventListener('click', () => this.searchCell(i, cell));
            
            searchGrid.appendChild(cell);
            this.searchGrid.push({ 
                hasObject: false, 
                searched: false, 
                element: cell 
            });
        }
    }

    placeHiddenObjects() {
        const positions = [];
        
        // Случайно разместить объекты
        while (positions.length < this.totalObjects) {
            const pos = Math.floor(Math.random() * (this.gridSize * this.gridSize));
            if (!positions.includes(pos)) {
                positions.push(pos);
                this.searchGrid[pos].hasObject = true;
            }
        }
    }

    searchCell(index, cellElement) {
        const cell = this.searchGrid[index];
        
        if (cell.searched) return;
        
        cell.searched = true;
        
        if (cell.hasObject) {
            cellElement.classList.add('found');
            this.foundObjects++;
            this.handleObjectFound();
        } else {
            cellElement.classList.add('searched');
            this.handleIncorrectSearch();
        }
        
        this.updateStatus();
        
        // Проверить, найдены ли все объекты
        if (this.foundObjects >= this.totalObjects) {
            setTimeout(() => {
                this.nextRound();
            }, 2000);
        }
    }

    handleObjectFound() {
        const points = 150 + (this.foundObjects * 50);
        
        this.app.updateGameState({ 
            score: this.app.gameState.score + points,
            correctAnswers: this.app.gameState.correctAnswers + 1,
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        SoundManager?.play('success');
    }

    handleIncorrectSearch() {
        this.app.updateGameState({ 
            totalQuestions: this.app.gameState.totalQuestions + 1
        });
        
        // Не отнимаем жизни за неправильный поиск
    }

    updateEnergyScanner(mouseX, mouseY) {
        // Получить ближайший скрытый объект
        const searchGrid = document.getElementById('search-grid');
        if (!searchGrid) return;
        
        let minDistance = Infinity;
        
        this.searchGrid.forEach((cell, index) => {
            if (cell.hasObject && !cell.searched) {
                const cellRect = cell.element.getBoundingClientRect();
                const cellX = cellRect.left + cellRect.width / 2;
                const cellY = cellRect.top + cellRect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(mouseX - cellX, 2) + Math.pow(mouseY - cellY, 2)
                );
                
                minDistance = Math.min(minDistance, distance);
            }
        });
        
        // Обновить показания сканера
        if (minDistance < Infinity) {
            const maxScanDistance = 300;
            const energyLevel = Math.max(0, 100 - (minDistance / maxScanDistance * 100));
            this.updateEnergyDisplay(energyLevel);
            this.updateSensitivityIndicators(energyLevel);
        }
    }

    updateEnergyDisplay(level) {
        const energyLevel = document.getElementById('energy-level');
        const energyFill = document.getElementById('energy-fill');
        
        if (energyLevel) {
            energyLevel.textContent = Math.round(level) + '%';
        }
        
        if (energyFill) {
            energyFill.style.width = level + '%';
        }
    }

    updateSensitivityIndicators(energyLevel) {
        const indicators = document.querySelectorAll('.indicator');
        const activeCount = Math.ceil(energyLevel / 20);
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index < activeCount);
        });
    }

    updateStatus() {
        const foundCount = document.getElementById('found-count');
        const totalCount = document.getElementById('total-count');
        
        if (foundCount) {
            foundCount.textContent = this.foundObjects;
        }
        
        if (totalCount) {
            totalCount.textContent = this.totalObjects;
        }
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
    }
}

window.ExtrasensoryGame = ExtrasensoryGame;