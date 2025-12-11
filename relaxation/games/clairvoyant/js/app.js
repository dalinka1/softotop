// Основная логика приложения
class PsychicApp {
    constructor() {
        this.currentGame = null;
        this.gameState = {
            score: 0,
            lives: 3,
            timer: 0,
            level: 1,
            totalQuestions: 0,
            correctAnswers: 0
        };
        this.settings = this.loadSettings();
        this.gameData = this.loadGameData();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initParticles();
        this.showScreen('main-menu');
        this.updateUI();
    }

    initEventListeners() {
        // Кнопки главного меню
        document.getElementById('start-game')?.addEventListener('click', () => {
            this.showScreen('level-select');
        });

        document.getElementById('view-progress')?.addEventListener('click', () => {
            this.showProgressScreen();
        });

        document.getElementById('achievements')?.addEventListener('click', () => {
            this.showAchievementsScreen();
        });

        document.getElementById('settings')?.addEventListener('click', () => {
            this.showScreen('settings-screen');
        });

        document.getElementById('about')?.addEventListener('click', () => {
            this.showScreen('about-screen');
        });

        // Кнопки возврата
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.back-btn').getAttribute('data-target');
                this.showScreen(target);
            });
        });

        // Выбор уровня
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.getAttribute('data-game');
                this.startGame(gameType);
            });
        });

        // Игровые кнопки
        document.getElementById('hint-btn')?.addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.pauseGame();
        });

        // Модальные окна
        document.getElementById('play-again')?.addEventListener('click', () => {
            this.restartCurrentGame();
        });

        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('resume-game')?.addEventListener('click', () => {
            this.resumeGame();
        });

        document.getElementById('restart-game')?.addEventListener('click', () => {
            this.restartCurrentGame();
        });

        document.getElementById('quit-game')?.addEventListener('click', () => {
            this.showScreen('level-select');
        });

        // Настройки
        this.initSettingsListeners();

        // Сброс прогресса
        document.getElementById('reset-progress')?.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                this.resetProgress();
            }
        });

        // Звуковые эффекты на кнопки
        document.querySelectorAll('button, .level-card').forEach(element => {
            element.addEventListener('click', () => {
                SoundManager.play('click');
            });
        });
    }

    initSettingsListeners() {
        // Громкость
        const masterVolume = document.getElementById('master-volume');
        const effectsVolume = document.getElementById('effects-volume');

        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                this.settings.masterVolume = e.target.value;
                this.updateVolumeDisplay('master-volume', e.target.value);
                SoundManager.setMasterVolume(e.target.value / 100);
                this.saveSettings();
            });
        }

        if (effectsVolume) {
            effectsVolume.addEventListener('input', (e) => {
                this.settings.effectsVolume = e.target.value;
                this.updateVolumeDisplay('effects-volume', e.target.value);
                SoundManager.setEffectsVolume(e.target.value / 100);
                this.saveSettings();
            });
        }

        // Сложность
        const difficulty = document.getElementById('difficulty');
        if (difficulty) {
            difficulty.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value;
                this.saveSettings();
            });
        }

        // Анимации
        const animations = document.getElementById('animations');
        if (animations) {
            animations.addEventListener('change', (e) => {
                this.settings.animations = e.target.checked;
                this.toggleAnimations(e.target.checked);
                this.saveSettings();
            });
        }
    }

    showScreen(screenId) {
        // Скрыть все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Показать нужный экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Скрыть модальные окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    startGame(gameType) {
        this.currentGame = gameType;
        this.resetGameState();
        this.showScreen('game-screen');
        
        // Обновить заголовок игры
        const gameTitle = document.getElementById('current-game-title');
        if (gameTitle) {
            gameTitle.textContent = this.getGameTitle(gameType);
        }

        // Запустить соответствующую игру
        switch (gameType) {
            case 'telepathy':
                if (window.TelepathyGame) {
                    new TelepathyGame(this);
                }
                break;
            case 'clairvoyance':
                if (window.ClairvoyanceGame) {
                    new ClairvoyanceGame(this);
                }
                break;
            case 'intuition':
                if (window.IntuitionGame) {
                    new IntuitionGame(this);
                }
                break;
            case 'emotions':
                if (window.EmotionsGame) {
                    new EmotionsGame(this);
                }
                break;
            case 'precognition':
                if (window.PrecognitionGame) {
                    new PrecognitionGame(this);
                }
                break;
            case 'extrasensory':
                if (window.ExtrasensoryGame) {
                    new ExtrasensoryGame(this);
                }
                break;
            case 'energy':
                if (window.EnergyGame) {
                    new EnergyGame(this);
                }
                break;
        }

        this.updateUI();
    }

    getGameTitle(gameType) {
        const titles = {
            'telepathy': 'Телепатия',
            'clairvoyance': 'Ясновидение',
            'intuition': 'Интуиция',
            'emotions': 'Эмпатия',
            'precognition': 'Прекогниция',
            'extrasensory': 'Экстрасенсорика',
            'energy': 'Энергия'
        };
        return titles[gameType] || 'Игра';
    }

    resetGameState() {
        this.gameState = {
            score: 0,
            lives: 3,
            timer: 30,
            level: 1,
            totalQuestions: 0,
            correctAnswers: 0,
            startTime: Date.now()
        };
    }

    updateGameState(updates) {
        Object.assign(this.gameState, updates);
        this.updateUI();
        
        // Проверить окончание игры
        if (this.gameState.lives <= 0 || this.gameState.timer <= 0) {
            this.endGame();
        }
    }

    updateUI() {
        // Обновить игровой интерфейс
        const scoreEl = document.getElementById('score');
        const timerEl = document.getElementById('timer');
        const livesEl = document.getElementById('lives');

        if (scoreEl) scoreEl.textContent = this.gameState.score;
        if (timerEl) timerEl.textContent = this.gameState.timer;
        if (livesEl) livesEl.textContent = this.gameState.lives;

        // Обновить настройки
        this.updateSettingsUI();
    }

    updateSettingsUI() {
        const masterVolume = document.getElementById('master-volume');
        const effectsVolume = document.getElementById('effects-volume');
        const difficulty = document.getElementById('difficulty');
        const animations = document.getElementById('animations');

        if (masterVolume) {
            masterVolume.value = this.settings.masterVolume;
            this.updateVolumeDisplay('master-volume', this.settings.masterVolume);
        }

        if (effectsVolume) {
            effectsVolume.value = this.settings.effectsVolume;
            this.updateVolumeDisplay('effects-volume', this.settings.effectsVolume);
        }

        if (difficulty) {
            difficulty.value = this.settings.difficulty;
        }

        if (animations) {
            animations.checked = this.settings.animations;
        }
    }

    updateVolumeDisplay(inputId, value) {
        const input = document.getElementById(inputId);
        if (input) {
            const display = input.parentNode.querySelector('.volume-value');
            if (display) {
                display.textContent = `${value}%`;
            }
        }
    }

    endGame() {
        const gameTime = Date.now() - this.gameState.startTime;
        const accuracy = this.gameState.totalQuestions > 0 ? 
            Math.round((this.gameState.correctAnswers / this.gameState.totalQuestions) * 100) : 0;

        // Сохранить результат
        this.saveGameResult({
            gameType: this.currentGame,
            score: this.gameState.score,
            accuracy: accuracy,
            time: gameTime,
            date: new Date().toISOString()
        });

        // Показать результаты
        this.showGameResults(accuracy, gameTime);

        // Проверить достижения
        if (window.AchievementsManager) {
            AchievementsManager.checkAchievements(this.gameState, this.gameData);
        }
    }

    showGameResults(accuracy, gameTime) {
        const modal = document.getElementById('game-over-modal');
        const finalScore = document.getElementById('final-score');
        const finalAccuracy = document.getElementById('final-accuracy');
        const finalTime = document.getElementById('final-time');

        if (finalScore) finalScore.textContent = this.gameState.score;
        if (finalAccuracy) finalAccuracy.textContent = `${accuracy}%`;
        if (finalTime) finalTime.textContent = this.formatTime(gameTime);

        if (modal) {
            modal.classList.add('active');
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    pauseGame() {
        const modal = document.getElementById('pause-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    resumeGame() {
        const modal = document.getElementById('pause-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    restartCurrentGame() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        if (this.currentGame) {
            this.startGame(this.currentGame);
        }
    }

    showHint() {
        // Реализация подсказок для каждой игры
        SoundManager.play('click');
        // Логика подсказок будет в отдельных играх
    }

    showProgressScreen() {
        this.showScreen('progress-screen');
        if (window.ProgressManager) {
            ProgressManager.updateProgressDisplay(this.gameData);
        }
    }

    showAchievementsScreen() {
        this.showScreen('achievements-screen');
        if (window.AchievementsManager) {
            AchievementsManager.displayAchievements();
        }
    }

    saveGameResult(result) {
        if (!this.gameData.results) {
            this.gameData.results = [];
        }
        this.gameData.results.push(result);
        
        // Обновить общую статистику
        this.updateOverallStats(result);
        
        this.saveGameData();
    }

    updateOverallStats(result) {
        if (!this.gameData.stats) {
            this.gameData.stats = {};
        }

        const stats = this.gameData.stats;
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + result.score;
        stats.bestScore = Math.max(stats.bestScore || 0, result.score);
        stats.totalAccuracy = (stats.totalAccuracy || 0) + result.accuracy;
        stats.averageAccuracy = Math.round(stats.totalAccuracy / stats.totalGames);

        // Статистика по играм
        if (!stats.gameTypes) {
            stats.gameTypes = {};
        }
        if (!stats.gameTypes[result.gameType]) {
            stats.gameTypes[result.gameType] = {
                played: 0,
                bestScore: 0,
                averageScore: 0,
                totalScore: 0
            };
        }

        const gameStats = stats.gameTypes[result.gameType];
        gameStats.played += 1;
        gameStats.totalScore += result.score;
        gameStats.bestScore = Math.max(gameStats.bestScore, result.score);
        gameStats.averageScore = Math.round(gameStats.totalScore / gameStats.played);
    }

    initParticles() {
        if (window.ParticleSystem) {
            this.particles = new ParticleSystem();
        }
    }

    toggleAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
    }

    resetProgress() {
        localStorage.removeItem('psychic_game_data');
        localStorage.removeItem('psychic_achievements');
        this.gameData = {
            results: [],
            stats: {},
            unlockedLevels: ['telepathy']
        };
        this.saveGameData();
        
        // Сбросить достижения
        if (window.AchievementsManager) {
            AchievementsManager.resetAchievements();
        }
        
        alert('Прогресс успешно сброшен!');
    }

    loadSettings() {
        const defaultSettings = {
            masterVolume: 50,
            effectsVolume: 70,
            difficulty: 'medium',
            animations: true
        };

        try {
            const saved = localStorage.getItem('psychic_game_settings');
            return saved ? Object.assign(defaultSettings, JSON.parse(saved)) : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    saveSettings() {
        localStorage.setItem('psychic_game_settings', JSON.stringify(this.settings));
    }

    loadGameData() {
        const defaultData = {
            results: [],
            stats: {},
            unlockedLevels: ['telepathy']
        };

        try {
            const saved = localStorage.getItem('psychic_game_data');
            return saved ? Object.assign(defaultData, JSON.parse(saved)) : defaultData;
        } catch (e) {
            return defaultData;
        }
    }

    saveGameData() {
        localStorage.setItem('psychic_game_data', JSON.stringify(this.gameData));
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PsychicApp();
});

// Экспорт для использования в других модулях
window.PsychicApp = PsychicApp;