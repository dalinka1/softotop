/**
 * Менеджер локального хранения данных
 * Управляет сохранением и загрузкой игровых данных
 */
class StorageManager {
    constructor() {
        this.storagePrefix = 'chessmaster_';
        this.keys = {
            currentGame: this.storagePrefix + 'current_game',
            statistics: this.storagePrefix + 'statistics',
            achievements: this.storagePrefix + 'achievements',
            settings: this.storagePrefix + 'settings',
            puzzleProgress: this.storagePrefix + 'puzzle_progress'
        };
        
        this.initializeStorage();
    }

    // Инициализация хранилища
    initializeStorage() {
        // Проверяем поддержку localStorage
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage недоступен, данные не будут сохраняться');
            return;
        }

        // Инициализируем статистику если её нет
        if (!this.getStatistics()) {
            this.resetStatistics();
        }

        // Инициализируем достижения если их нет
        if (!this.getAchievements()) {
            this.resetAchievements();
        }

        // Инициализируем настройки если их нет
        if (!this.getSettings()) {
            this.resetSettings();
        }
    }

    // Проверка доступности localStorage
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Безопасное сохранение в localStorage
    setItem(key, value) {
        if (!this.isLocalStorageAvailable()) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            return false;
        }
    }

    // Безопасное чтение из localStorage
    getItem(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable()) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Ошибка чтения из localStorage:', e);
            return defaultValue;
        }
    }

    // Удаление элемента
    removeItem(key) {
        if (!this.isLocalStorageAvailable()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Ошибка удаления из localStorage:', e);
            return false;
        }
    }

    // === СОХРАНЕНИЕ И ЗАГРУЗКА ИГРЫ ===

    // Сохранить текущую игру
    saveGame(chessEngine) {
        const gameData = {
            board: chessEngine.board,
            currentPlayer: chessEngine.currentPlayer,
            gameHistory: chessEngine.gameHistory,
            capturedPieces: chessEngine.capturedPieces,
            isGameOver: chessEngine.isGameOver,
            gameResult: chessEngine.gameResult,
            enPassantTarget: chessEngine.enPassantTarget,
            castlingRights: chessEngine.castlingRights,
            halfMoveClock: chessEngine.halfMoveClock,
            fullMoveNumber: chessEngine.fullMoveNumber,
            positionHistory: chessEngine.positionHistory,
            timestamp: Date.now()
        };

        return this.setItem(this.keys.currentGame, gameData);
    }

    // Загрузить сохранённую игру
    loadGame() {
        const gameData = this.getItem(this.keys.currentGame);
        
        if (!gameData) return null;

        // Создаём новый экземпляр движка и восстанавливаем состояние
        const chessEngine = new ChessEngine();
        
        chessEngine.board = gameData.board;
        chessEngine.currentPlayer = gameData.currentPlayer;
        chessEngine.gameHistory = gameData.gameHistory || [];
        chessEngine.capturedPieces = gameData.capturedPieces || { white: [], black: [] };
        chessEngine.isGameOver = gameData.isGameOver || false;
        chessEngine.gameResult = gameData.gameResult || null;
        chessEngine.enPassantTarget = gameData.enPassantTarget || null;
        chessEngine.castlingRights = gameData.castlingRights || {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        chessEngine.halfMoveClock = gameData.halfMoveClock || 0;
        chessEngine.fullMoveNumber = gameData.fullMoveNumber || 1;
        chessEngine.positionHistory = gameData.positionHistory || [];

        return chessEngine;
    }

    // Проверить, есть ли сохранённая игра
    hasSavedGame() {
        const gameData = this.getItem(this.keys.currentGame);
        return gameData !== null && gameData.timestamp;
    }

    // Удалить сохранённую игру
    clearSavedGame() {
        return this.removeItem(this.keys.currentGame);
    }

    // === СТАТИСТИКА ===

    // Получить статистику
    getStatistics() {
        return this.getItem(this.keys.statistics);
    }

    // Сохранить результат игры
    saveGameResult(result, aiDifficulty) {
        const stats = this.getStatistics() || this.getDefaultStatistics();
        
        // Обновляем общую статистику
        stats.totalGames++;
        stats.lastPlayed = Date.now();
        
        // Обновляем статистику по результатам
        switch (result) {
            case 'white_wins':
                stats.wins++;
                break;
            case 'black_wins':
                stats.losses++;
                break;
            default:
                stats.draws++;
        }

        // Обновляем статистику по уровням сложности
        if (!stats.difficultyStats[aiDifficulty]) {
            stats.difficultyStats[aiDifficulty] = {
                games: 0,
                wins: 0,
                losses: 0,
                draws: 0
            };
        }

        const diffStats = stats.difficultyStats[aiDifficulty];
        diffStats.games++;
        
        switch (result) {
            case 'white_wins':
                diffStats.wins++;
                break;
            case 'black_wins':
                diffStats.losses++;
                break;
            default:
                diffStats.draws++;
        }

        // Обновляем серии
        if (result === 'white_wins') {
            stats.currentWinStreak++;
            stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.currentWinStreak);
            stats.currentLossStreak = 0;
        } else if (result === 'black_wins') {
            stats.currentLossStreak++;
            stats.maxLossStreak = Math.max(stats.maxLossStreak, stats.currentLossStreak);
            stats.currentWinStreak = 0;
        } else {
            stats.currentWinStreak = 0;
            stats.currentLossStreak = 0;
        }

        // Вычисляем процент побед
        stats.winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames * 100).toFixed(1) : 0;

        this.setItem(this.keys.statistics, stats);
        
        // Проверяем достижения
        this.checkAchievements(stats);
        
        return stats;
    }

    // Получить статистику по умолчанию
    getDefaultStatistics() {
        return {
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            currentWinStreak: 0,
            maxWinStreak: 0,
            currentLossStreak: 0,
            maxLossStreak: 0,
            difficultyStats: {},
            firstPlayed: Date.now(),
            lastPlayed: Date.now(),
            totalPlayTime: 0
        };
    }

    // Сбросить статистику
    resetStatistics() {
        const defaultStats = this.getDefaultStatistics();
        this.setItem(this.keys.statistics, defaultStats);
        return defaultStats;
    }

    // === ДОСТИЖЕНИЯ ===

    // Получить достижения
    getAchievements() {
        return this.getItem(this.keys.achievements);
    }

    // Разблокировать достижение
    unlockAchievement(achievementId) {
        const achievements = this.getAchievements() || this.getDefaultAchievements();
        
        if (achievements[achievementId] && !achievements[achievementId].unlocked) {
            achievements[achievementId].unlocked = true;
            achievements[achievementId].unlockedAt = Date.now();
            
            this.setItem(this.keys.achievements, achievements);
            
            // Показываем уведомление о разблокировке
            this.showAchievementNotification(achievements[achievementId]);
            
            return true;
        }
        
        return false;
    }

    // Проверить достижения
    checkAchievements(stats) {
        const achievements = [
            // Первая игра
            { id: 'first_game', condition: () => stats.totalGames >= 1 },
            
            // Победы
            { id: 'first_win', condition: () => stats.wins >= 1 },
            { id: 'win_10', condition: () => stats.wins >= 10 },
            { id: 'win_50', condition: () => stats.wins >= 50 },
            { id: 'win_100', condition: () => stats.wins >= 100 },
            
            // Серии побед
            { id: 'win_streak_3', condition: () => stats.maxWinStreak >= 3 },
            { id: 'win_streak_5', condition: () => stats.maxWinStreak >= 5 },
            { id: 'win_streak_10', condition: () => stats.maxWinStreak >= 10 },
            
            // Процент побед
            { id: 'win_rate_70', condition: () => stats.totalGames >= 10 && parseFloat(stats.winRate) >= 70 },
            { id: 'win_rate_80', condition: () => stats.totalGames >= 20 && parseFloat(stats.winRate) >= 80 },
            
            // Сложность
            { id: 'beat_master', condition: () => stats.difficultyStats[4] && stats.difficultyStats[4].wins >= 1 },
            { id: 'master_10_wins', condition: () => stats.difficultyStats[4] && stats.difficultyStats[4].wins >= 10 },
            
            // Игровая активность
            { id: 'games_100', condition: () => stats.totalGames >= 100 },
            { id: 'games_500', condition: () => stats.totalGames >= 500 }
        ];

        achievements.forEach(achievement => {
            if (achievement.condition()) {
                this.unlockAchievement(achievement.id);
            }
        });
    }

    // Получить достижения по умолчанию
    getDefaultAchievements() {
        return {
            first_game: {
                name: 'Первые шаги',
                description: 'Сыграйте свою первую игру',
                icon: '🎮',
                unlocked: false
            },
            first_win: {
                name: 'Первая победа',
                description: 'Выиграйте свою первую игру',
                icon: '🏆',
                unlocked: false
            },
            win_10: {
                name: 'Опытный игрок',
                description: 'Выиграйте 10 игр',
                icon: '⭐',
                unlocked: false
            },
            win_50: {
                name: 'Шахматист',
                description: 'Выиграйте 50 игр',
                icon: '🎯',
                unlocked: false
            },
            win_100: {
                name: 'Мастер',
                description: 'Выиграйте 100 игр',
                icon: '👑',
                unlocked: false
            },
            win_streak_3: {
                name: 'Серия побед',
                description: 'Выиграйте 3 игры подряд',
                icon: '🔥',
                unlocked: false
            },
            win_streak_5: {
                name: 'Горячая серия',
                description: 'Выиграйте 5 игр подряд',
                icon: '💥',
                unlocked: false
            },
            win_streak_10: {
                name: 'Непобедимый',
                description: 'Выиграйте 10 игр подряд',
                icon: '⚡',
                unlocked: false
            },
            win_rate_70: {
                name: 'Стабильность',
                description: '70% побед в 10+ играх',
                icon: '📈',
                unlocked: false
            },
            win_rate_80: {
                name: 'Доминирование',
                description: '80% побед в 20+ играх',
                icon: '🎪',
                unlocked: false
            },
            beat_master: {
                name: 'Покоритель мастера',
                description: 'Победите ИИ на уровне "Мастер"',
                icon: '🗡️',
                unlocked: false
            },
            master_10_wins: {
                name: 'Повелитель мастера',
                description: 'Выиграйте 10 игр против мастера',
                icon: '⚔️',
                unlocked: false
            },
            games_100: {
                name: 'Век игр',
                description: 'Сыграйте 100 игр',
                icon: '💯',
                unlocked: false
            },
            games_500: {
                name: 'Шахматный марафон',
                description: 'Сыграйте 500 игр',
                icon: '🏃',
                unlocked: false
            }
        };
    }

    // Показать уведомление о достижении
    showAchievementNotification(achievement) {
        // Создаём элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <h4>Достижение разблокировано!</h4>
                    <p><strong>${achievement.name}</strong></p>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;

        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.5s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);

        // Возможность закрыть по клику
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        });
    }

    // Сбросить достижения
    resetAchievements() {
        const defaultAchievements = this.getDefaultAchievements();
        this.setItem(this.keys.achievements, defaultAchievements);
        return defaultAchievements;
    }

    // === НАСТРОЙКИ ===

    // Получить настройки
    getSettings() {
        return this.getItem(this.keys.settings);
    }

    // Сохранить настройки
    saveSettings(settings) {
        return this.setItem(this.keys.settings, settings);
    }

    // Получить настройки по умолчанию
    getDefaultSettings() {
        return {
            soundEnabled: true,
            animationsEnabled: true,
            showCoordinates: true,
            highlightMoves: true,
            autoPromotionQueen: false,
            theme: 'default',
            language: 'ru',
            aiThinkingTime: 'normal', // fast, normal, slow
            boardOrientation: 'white', // white, black
            pieceStyle: 'classic' // classic, modern, minimal
        };
    }

    // Сбросить настройки
    resetSettings() {
        const defaultSettings = this.getDefaultSettings();
        this.setItem(this.keys.settings, defaultSettings);
        return defaultSettings;
    }

    // === ПРОГРЕСС В ГОЛОВОЛОМКАХ ===

    // Получить прогресс в головоломках
    getPuzzleProgress() {
        return this.getItem(this.keys.puzzleProgress, {
            'mate-in-1': { completed: [], current: 0 },
            'mate-in-2': { completed: [], current: 0 },
            'tactics': { completed: [], current: 0 },
            'endgame': { completed: [], current: 0 }
        });
    }

    // Сохранить прогресс в головоломке
    savePuzzleProgress(category, puzzleIndex, completed = true) {
        const progress = this.getPuzzleProgress();
        
        if (!progress[category]) {
            progress[category] = { completed: [], current: 0 };
        }
        
        if (completed && !progress[category].completed.includes(puzzleIndex)) {
            progress[category].completed.push(puzzleIndex);
        }
        
        progress[category].current = Math.max(progress[category].current, puzzleIndex + 1);
        
        return this.setItem(this.keys.puzzleProgress, progress);
    }

    // === ЭКСПОРТ/ИМПОРТ ДАННЫХ ===

    // Экспортировать все данные
    exportData() {
        return {
            statistics: this.getStatistics(),
            achievements: this.getAchievements(),
            settings: this.getSettings(),
            puzzleProgress: this.getPuzzleProgress(),
            exportDate: Date.now(),
            version: '1.0.0'
        };
    }

    // Импортировать данные
    importData(data) {
        try {
            if (data.statistics) {
                this.setItem(this.keys.statistics, data.statistics);
            }
            if (data.achievements) {
                this.setItem(this.keys.achievements, data.achievements);
            }
            if (data.settings) {
                this.setItem(this.keys.settings, data.settings);
            }
            if (data.puzzleProgress) {
                this.setItem(this.keys.puzzleProgress, data.puzzleProgress);
            }
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }

    // === ОЧИСТКА ДАННЫХ ===

    // Очистить все данные
    clearAllData() {
        this.removeItem(this.keys.currentGame);
        this.removeItem(this.keys.statistics);
        this.removeItem(this.keys.achievements);
        this.removeItem(this.keys.settings);
        this.removeItem(this.keys.puzzleProgress);
        
        // Переинициализируем с настройками по умолчанию
        this.initializeStorage();
    }

    // Получить размер использованного хранилища
    getStorageSize() {
        if (!this.isLocalStorageAvailable()) return 0;
        
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.storagePrefix)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    // Получить информацию о хранилище
    getStorageInfo() {
        return {
            available: this.isLocalStorageAvailable(),
            size: this.getStorageSize(),
            hasSavedGame: this.hasSavedGame(),
            totalGames: this.getStatistics()?.totalGames || 0,
            unlockedAchievements: Object.values(this.getAchievements() || {})
                .filter(achievement => achievement.unlocked).length
        };
    }
}