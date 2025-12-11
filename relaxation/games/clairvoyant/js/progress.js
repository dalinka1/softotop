// Система прогресса и статистики
class ProgressManager {
    static updateProgressDisplay(gameData) {
        this.updateOverallStats(gameData);
        this.createProgressChart(gameData);
    }

    static updateOverallStats(gameData) {
        const stats = gameData.stats || {};
        
        // Обновить общие показатели
        const totalGames = document.getElementById('total-games');
        const successRate = document.getElementById('success-rate');
        const bestScore = document.getElementById('best-score');

        if (totalGames) {
            totalGames.textContent = stats.totalGames || 0;
        }

        if (successRate) {
            successRate.textContent = (stats.averageAccuracy || 0) + '%';
        }

        if (bestScore) {
            bestScore.textContent = stats.bestScore || 0;
        }
    }

    static createProgressChart(gameData) {
        const canvas = document.getElementById('progress-chart');
        if (!canvas || !window.Chart) return;

        // Подготовить данные для графика
        const results = gameData.results || [];
        const gameTypes = ['telepathy', 'clairvoyance', 'intuition', 'emotions', 'precognition', 'extrasensory', 'energy'];
        
        const datasets = gameTypes.map((gameType, index) => {
            const typeResults = results.filter(r => r.gameType === gameType);
            const scores = typeResults.map(r => r.score);
            
            const colors = [
                'rgba(108, 92, 231, 0.8)',
                'rgba(253, 121, 168, 0.8)',
                'rgba(162, 155, 254, 0.8)',
                'rgba(0, 184, 148, 0.8)',
                'rgba(253, 203, 110, 0.8)',
                'rgba(225, 112, 85, 0.8)',
                'rgba(156, 39, 176, 0.8)'
            ];

            const gameNames = {
                'telepathy': 'Телепатия',
                'clairvoyance': 'Ясновидение', 
                'intuition': 'Интуиция',
                'emotions': 'Эмпатия',
                'precognition': 'Прекогниция',
                'extrasensory': 'Экстрасенсорика',
                'energy': 'Энергия'
            };

            return {
                label: gameNames[gameType],
                data: scores.length > 0 ? scores : [0],
                backgroundColor: colors[index],
                borderColor: colors[index],
                borderWidth: 2,
                tension: 0.4
            };
        });

        // Уничтожить существующий график
        if (this.progressChart) {
            this.progressChart.destroy();
        }

        // Создать новый график
        this.progressChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: [
                    'Телепатия',
                    'Ясновидение', 
                    'Интуиция',
                    'Эмпатия',
                    'Прекогниция',
                    'Экстрасенсорика',
                    'Энергия'
                ],
                datasets: [{
                    label: 'Средний результат',
                    data: gameTypes.map(gameType => {
                        const typeResults = results.filter(r => r.gameType === gameType);
                        if (typeResults.length === 0) return 0;
                        const avgScore = typeResults.reduce((sum, r) => sum + r.score, 0) / typeResults.length;
                        return Math.round(avgScore);
                    }),
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderColor: 'rgba(108, 92, 231, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(253, 121, 168, 1)',
                    pointBorderColor: 'rgba(253, 121, 168, 1)',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#DDD6FE',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1000,
                        ticks: {
                            color: '#A78BFA',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(139, 69, 19, 0.2)'
                        },
                        angleLines: {
                            color: 'rgba(139, 69, 19, 0.2)'
                        },
                        pointLabels: {
                            color: '#DDD6FE',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    static getSkillLevel(gameType, gameData) {
        const results = gameData.results || [];
        const typeResults = results.filter(r => r.gameType === gameType);
        
        if (typeResults.length === 0) return { level: 0, title: 'Новичок', progress: 0 };
        
        const avgAccuracy = typeResults.reduce((sum, r) => sum + r.accuracy, 0) / typeResults.length;
        const gamesPlayed = typeResults.length;
        
        // Определить уровень навыка
        let level = 0;
        let title = 'Новичок';
        let progress = 0;
        
        if (avgAccuracy >= 90 && gamesPlayed >= 20) {
            level = 5;
            title = 'Мастер';
            progress = 100;
        } else if (avgAccuracy >= 80 && gamesPlayed >= 15) {
            level = 4;
            title = 'Эксперт';
            progress = 80;
        } else if (avgAccuracy >= 70 && gamesPlayed >= 10) {
            level = 3;
            title = 'Продвинутый';
            progress = 60;
        } else if (avgAccuracy >= 60 && gamesPlayed >= 5) {
            level = 2;
            title = 'Ученик';
            progress = 40;
        } else if (gamesPlayed >= 1) {
            level = 1;
            title = 'Начинающий';
            progress = 20;
        }
        
        return { level, title, progress };
    }

    static exportProgress(gameData) {
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `psychic-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    static importProgress(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject('Неверный формат файла');
                }
            };
            reader.onerror = () => reject('Ошибка чтения файла');
            reader.readAsText(file);
        });
    }
}

// Экспорт для использования в других модулях
window.ProgressManager = ProgressManager;