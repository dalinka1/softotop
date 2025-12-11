// Система достижений
class AchievementsManager {
    static achievements = [
        {
            id: 'first_steps',
            name: 'Первые шаги',
            description: 'Сыграйте первую игру',
            icon: '👶',
            condition: (gameState, gameData) => gameData.stats?.totalGames >= 1,
            points: 50
        },
        {
            id: 'telepathy_novice',
            name: 'Телепат-новичок',
            description: 'Правильно угадайте 5 карт подряд в телепатии',
            icon: '🧠',
            condition: (gameState, gameData) => this.getStreak('telepathy', gameData) >= 5,
            points: 100
        },
        {
            id: 'clairvoyant_eye',
            name: 'Ясновидящий глаз',
            description: 'Достигните 80% точности в ясновидении',
            icon: '👁️',
            condition: (gameState, gameData) => this.getAccuracy('clairvoyance', gameData) >= 80,
            points: 150
        },
        {
            id: 'intuitive_master',
            name: 'Мастер интуиции',
            description: 'Угадайте 10 скрытых изображений без ошибок',
            icon: '💡',
            condition: (gameState, gameData) => this.getPerfectRounds('intuition', gameData) >= 10,
            points: 200
        },
        {
            id: 'empath_heart',
            name: 'Сердце эмпата',
            description: 'Правильно определите 15 эмоций подряд',
            icon: '💖',
            condition: (gameState, gameData) => this.getStreak('emotions', gameData) >= 15,
            points: 175
        },
        {
            id: 'future_sight',
            name: 'Взгляд в будущее',
            description: 'Сделайте 20 правильных предсказаний',
            icon: '🔮',
            condition: (gameState, gameData) => this.getCorrectCount('precognition', gameData) >= 20,
            points: 250
        },
        {
            id: 'psychic_seeker',
            name: 'Психический искатель',
            description: 'Найдите 50 скрытых объектов',
            icon: '🔍',
            condition: (gameState, gameData) => this.getCorrectCount('extrasensory', gameData) >= 50,
            points: 300
        },
        {
            id: 'energy_master',
            name: 'Мастер энергии',
            description: 'Завершите 10 энергетических упражнений с оценкой выше 90%',
            icon: '⚡',
            condition: (gameState, gameData) => this.getHighScoreCount('energy', gameData, 90) >= 10,
            points: 350
        },
        {
            id: 'speed_demon',
            name: 'Демон скорости',
            description: 'Наберите 500 очков менее чем за 2 минуты',
            icon: '💨',
            condition: (gameState, gameData) => this.checkSpeedRecord(gameData, 500, 120),
            points: 200
        },
        {
            id: 'perfectionist',
            name: 'Перфекционист',
            description: 'Достигните 100% точности в любой игре',
            icon: '✨',
            condition: (gameState, gameData) => this.hasPerfectGame(gameData),
            points: 400
        },
        {
            id: 'dedicated_student',
            name: 'Преданный ученик',
            description: 'Сыграйте в каждую игру минимум 5 раз',
            icon: '📚',
            condition: (gameState, gameData) => this.hasPlayedAllGames(gameData, 5),
            points: 300
        },
        {
            id: 'high_scorer',
            name: 'Рекордсмен',
            description: 'Наберите 1000 очков в одной игре',
            icon: '🏆',
            condition: (gameState, gameData) => gameData.stats?.bestScore >= 1000,
            points: 500
        },
        {
            id: 'marathon_runner',
            name: 'Марафонец',
            description: 'Сыграйте 100 игр',
            icon: '🏃',
            condition: (gameState, gameData) => gameData.stats?.totalGames >= 100,
            points: 1000
        },
        {
            id: 'psychic_prodigy',
            name: 'Экстрасенсорный вундеркинд',
            description: 'Достигните среднего результата 85% во всех играх',
            icon: '🌟',
            condition: (gameState, gameData) => this.getOverallAccuracy(gameData) >= 85,
            points: 1500
        }
    ];

    static unlockedAchievements = new Set();

    static init() {
        this.loadAchievements();
    }

    static checkAchievements(gameState, gameData) {
        let newAchievements = [];
        
        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id)) {
                if (achievement.condition(gameState, gameData)) {
                    this.unlockAchievement(achievement);
                    newAchievements.push(achievement);
                }
            }
        });

        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
    }

    static unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        this.saveAchievements();
        
        // Добавить очки к общему счету
        const savedData = JSON.parse(localStorage.getItem('psychic_game_data') || '{}');
        if (!savedData.achievementPoints) savedData.achievementPoints = 0;
        savedData.achievementPoints += achievement.points;
        localStorage.setItem('psychic_game_data', JSON.stringify(savedData));
    }

    static displayAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;

        achievementsList.innerHTML = '';

        this.achievements.forEach(achievement => {
            const isUnlocked = this.unlockedAchievements.has(achievement.id);
            
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-points">
                        ${isUnlocked ? 'Получено' : achievement.points + ' очков'}
                    </div>
                </div>
            `;
            
            achievementsList.appendChild(achievementEl);
        });
    }

    static showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: ${100 + index * 120}px;
                    right: 20px;
                    background: linear-gradient(135deg, var(--success-color), var(--primary-color));
                    border: 2px solid var(--success-color);
                    border-radius: 15px;
                    padding: 1rem 1.5rem;
                    color: white;
                    font-weight: bold;
                    z-index: 10000;
                    animation: slideInRight 0.5s ease-out;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                `;
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem;">${achievement.icon}</div>
                        <div>
                            <div style="font-size: 1.1rem;">Достижение получено!</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">${achievement.name}</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">+${achievement.points} очков</div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // Добавить стили для анимации
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
                
                // Удалить через 5 секунд
                setTimeout(() => {
                    notification.remove();
                    style.remove();
                }, 5000);
            }, index * 500);
        });
    }

    // Вспомогательные методы для проверки условий
    static getStreak(gameType, gameData) {
        const results = gameData.results || [];
        const typeResults = results.filter(r => r.gameType === gameType);
        
        let currentStreak = 0;
        let maxStreak = 0;
        
        for (let i = typeResults.length - 1; i >= 0; i--) {
            if (typeResults[i].accuracy === 100) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        return maxStreak;
    }

    static getAccuracy(gameType, gameData) {
        const results = gameData.results || [];
        const typeResults = results.filter(r => r.gameType === gameType);
        
        if (typeResults.length === 0) return 0;
        
        return typeResults.reduce((sum, r) => sum + r.accuracy, 0) / typeResults.length;
    }

    static getPerfectRounds(gameType, gameData) {
        const results = gameData.results || [];
        return results.filter(r => r.gameType === gameType && r.accuracy === 100).length;
    }

    static getCorrectCount(gameType, gameData) {
        const results = gameData.results || [];
        return results.filter(r => r.gameType === gameType).reduce((sum, r) => {
            return sum + Math.floor(r.accuracy / 100 * 10); // Примерное количество правильных ответов
        }, 0);
    }

    static getHighScoreCount(gameType, gameData, threshold) {
        const results = gameData.results || [];
        return results.filter(r => r.gameType === gameType && r.accuracy >= threshold).length;
    }

    static checkSpeedRecord(gameData, minScore, maxTime) {
        const results = gameData.results || [];
        return results.some(r => r.score >= minScore && r.time <= maxTime * 1000);
    }

    static hasPerfectGame(gameData) {
        const results = gameData.results || [];
        return results.some(r => r.accuracy === 100);
    }

    static hasPlayedAllGames(gameData, minGames) {
        const gameTypes = ['telepathy', 'clairvoyance', 'intuition', 'emotions', 'precognition', 'extrasensory', 'energy'];
        const results = gameData.results || [];
        
        return gameTypes.every(gameType => {
            const typeResults = results.filter(r => r.gameType === gameType);
            return typeResults.length >= minGames;
        });
    }

    static getOverallAccuracy(gameData) {
        const results = gameData.results || [];
        if (results.length === 0) return 0;
        
        return results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    }

    static saveAchievements() {
        localStorage.setItem('psychic_achievements', JSON.stringify([...this.unlockedAchievements]));
    }

    static loadAchievements() {
        try {
            const saved = localStorage.getItem('psychic_achievements');
            if (saved) {
                this.unlockedAchievements = new Set(JSON.parse(saved));
            }
        } catch (e) {
            this.unlockedAchievements = new Set();
        }
    }

    static resetAchievements() {
        this.unlockedAchievements.clear();
        localStorage.removeItem('psychic_achievements');
    }

    static getTotalAchievementPoints() {
        return Array.from(this.unlockedAchievements).reduce((total, id) => {
            const achievement = this.achievements.find(a => a.id === id);
            return total + (achievement ? achievement.points : 0);
        }, 0);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    AchievementsManager.init();
});

// Экспорт для использования в других модулях
window.AchievementsManager = AchievementsManager;