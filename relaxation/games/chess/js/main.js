/**
 * Главный файл приложения
 * Инициализация и управление всеми компонентами игры
 */

// Глобальные переменные
let gameLogic = null;
let puzzleDatabase = null;
let currentPuzzleMode = null;
let currentPuzzleCategory = null;
let currentPuzzleIndex = 0;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Инициализация Шахматы Мастер...');
    
    try {
        // Инициализируем компоненты
        gameLogic = new GameLogic();
        puzzleDatabase = new PuzzleDatabase();
        
        // Настраиваем интерфейс
        setupMainMenu();
        setupDifficultySelector();
        setupPuzzleMode();
        setupStatisticsScreen();
        setupModalHandlers();
        
        console.log('✅ Шахматы Мастер успешно загружены!');
        
        // Проверяем наличие сохранённой игры
        checkForSavedGame();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showErrorMessage('Ошибка загрузки игры. Попробуйте обновить страницу.');
    }
});

// === УПРАВЛЕНИЕ ЭКРАНАМИ ===

// Показать главное меню
function showMainMenu() {
    hideAllScreens();
    document.getElementById('mainMenu').style.display = 'flex';
    
    // Проверяем наличие сохранённой игры
    const continueButton = document.querySelector('button[onclick="continueGame()"]');
    if (continueButton) {
        const hasSaved = gameLogic && gameLogic.storage.hasSavedGame();
        continueButton.style.display = hasSaved ? 'flex' : 'none';
    }
}

// Показать игровой экран
function showGameScreen() {
    hideAllScreens();
    document.getElementById('gameScreen').style.display = 'flex';
}

// Показать экран обучения
function showTrainingMode() {
    hideAllScreens();
    document.getElementById('trainingScreen').style.display = 'flex';
    updatePuzzleStatistics();
}

// Показать статистику
function showStatistics() {
    hideAllScreens();
    document.getElementById('statisticsScreen').style.display = 'flex';
    updateStatisticsDisplay();
}

// Показать настройки
function showSettings() {
    // Пока что показываем сообщение
    alert('Настройки будут добавлены в следующем обновлении!');
}

// Скрыть все экраны
function hideAllScreens() {
    const screens = [
        'mainMenu', 'gameScreen', 'trainingScreen', 
        'statisticsScreen'
    ];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'none';
        }
    });
    
    // Скрываем селектор сложности
    hideDifficultySelector();
}

// === ИГРОВЫЕ ФУНКЦИИ ===

// Начать новую игру
function startNewGame() {
    const difficultySelector = document.getElementById('difficultySelector');
    
    if (difficultySelector.style.display === 'none' || !difficultySelector.style.display) {
        // Показываем селектор сложности
        showDifficultySelector();
    }
}

// Показать селектор сложности
function showDifficultySelector() {
    const selector = document.getElementById('difficultySelector');
    if (selector) {
        selector.style.display = 'block';
        
        // Добавляем обработчики для кнопок сложности
        const difficultyButtons = selector.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.onclick = function() {
                const level = parseInt(this.dataset.level);
                startGameWithDifficulty(level);
            };
        });
    }
}

// Скрыть селектор сложности
function hideDifficultySelector() {
    const selector = document.getElementById('difficultySelector');
    if (selector) {
        selector.style.display = 'none';
    }
}

// Начать игру с выбранной сложностью
function startGameWithDifficulty(level) {
    try {
        hideDifficultySelector();
        gameLogic.startNewGame(level);
        showGameScreen();
        
        console.log(`🎮 Новая игра начата, уровень сложности: ${level}`);
    } catch (error) {
        console.error('Ошибка начала новой игры:', error);
        showErrorMessage('Не удалось начать новую игру');
    }
}

// Продолжить сохранённую игру
function continueGame() {
    try {
        gameLogic.continueGame();
        showGameScreen();
        console.log('🔄 Игра продолжена');
    } catch (error) {
        console.error('Ошибка продолжения игры:', error);
        showErrorMessage('Не удалось загрузить сохранённую игру');
    }
}

// Отменить ход
function undoMove() {
    if (gameLogic) {
        gameLogic.undoMove();
    }
}

// Показать подсказку
async function showHint() {
    if (gameLogic) {
        await gameLogic.showHint();
    }
}

// Сдаться
function resignGame() {
    if (confirm('Вы уверены, что хотите сдаться?')) {
        gameLogic.resignGame();
    }
}

// === ПРЕВРАЩЕНИЕ ПЕШКИ ===

// Превратить пешку
function promotePawn(pieceType) {
    if (gameLogic) {
        gameLogic.promotePawn(pieceType);
    }
}

// === ГОЛОВОЛОМКИ ===

// Загрузить головоломки категории
function loadPuzzles(category) {
    try {
        currentPuzzleCategory = category;
        currentPuzzleIndex = 0;
        
        // Получаем прогресс игрока для этой категории
        const progress = puzzleDatabase.getProgress(category);
        currentPuzzleIndex = progress.current || 0;
        
        showPuzzleGame();
        loadCurrentPuzzle();
        
    } catch (error) {
        console.error('Ошибка загрузки головоломок:', error);
        showErrorMessage('Не удалось загрузить головоломки');
    }
}

// Показать интерфейс головоломки
function showPuzzleGame() {
    const puzzleSelection = document.querySelector('.puzzle-selection');
    const puzzleGame = document.getElementById('puzzleGame');
    
    if (puzzleSelection) puzzleSelection.style.display = 'none';
    if (puzzleGame) puzzleGame.style.display = 'block';
}

// Загрузить текущую головоломку
function loadCurrentPuzzle() {
    const puzzle = puzzleDatabase.getPuzzle(currentPuzzleCategory, currentPuzzleIndex);
    
    if (!puzzle) {
        showErrorMessage('Головоломка не найдена');
        return;
    }
    
    // Обновляем интерфейс
    const puzzleTitle = document.getElementById('puzzleTitle');
    const puzzleDescription = document.getElementById('puzzleDescription');
    const puzzleProgress = document.getElementById('puzzleProgress');
    
    if (puzzleTitle) puzzleTitle.textContent = puzzle.title;
    if (puzzleDescription) puzzleDescription.textContent = puzzle.description;
    
    const totalPuzzles = puzzleDatabase.getPuzzleCount(currentPuzzleCategory);
    if (puzzleProgress) {
        puzzleProgress.textContent = `${currentPuzzleIndex + 1} / ${totalPuzzles}`;
    }
    
    // Создаём позицию на доске
    const puzzleEngine = puzzleDatabase.createBoardFromPosition(puzzle.position);
    puzzleEngine.currentPlayer = puzzle.activePlayer || 'white';
    
    // Создаём временный игровой экземпляр для головоломки
    currentPuzzleMode = {
        engine: puzzleEngine,
        puzzle: puzzle,
        playerMoves: [],
        solved: false
    };
    
    // Отображаем доску головоломки
    renderPuzzleBoard();
}

// Отобразить доску головоломки
function renderPuzzleBoard() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    if (!puzzleBoard) return;
    
    puzzleBoard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = currentPuzzleMode.engine.board[row][col];
            if (piece) {
                square.textContent = piece;
                square.classList.add(`piece-${currentPuzzleMode.engine.getPieceColor(piece)}`);
            }
            
            puzzleBoard.appendChild(square);
        }
    }
    
    // Добавляем обработчик кликов для головоломки
    setupPuzzleBoardInteraction();
}

// Настроить взаимодействие с доской головоломки
function setupPuzzleBoardInteraction() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    if (!puzzleBoard) return;
    
    let selectedSquare = null;
    
    puzzleBoard.addEventListener('click', function(event) {
        if (currentPuzzleMode.solved) return;
        
        const square = event.target.closest('.chess-square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (selectedSquare) {
            // Пытаемся сделать ход
            const move = {
                from: { row: selectedSquare.row, col: selectedSquare.col },
                to: { row, col }
            };
            
            // Проверяем ход
            const isValidMove = currentPuzzleMode.engine.getPossibleMoves(
                selectedSquare.row, selectedSquare.col
            ).some(m => m.row === row && m.col === col);
            
            if (isValidMove) {
                // Делаем ход
                const success = currentPuzzleMode.engine.makeMove(
                    selectedSquare.row, selectedSquare.col, row, col
                );
                
                if (success) {
                    currentPuzzleMode.playerMoves.push(move);
                    
                    // Проверяем решение
                    checkPuzzleSolution();
                }
            }
            
            // Очищаем выделение
            clearPuzzleSelection();
            selectedSquare = null;
        } else {
            // Выбираем фигуру
            const piece = currentPuzzleMode.engine.board[row][col];
            if (piece && currentPuzzleMode.engine.getPieceColor(piece) === currentPuzzleMode.engine.currentPlayer) {
                selectedSquare = { row, col };
                highlightPuzzleSquare(row, col);
            }
        }
    });
}

// Подсветить клетку в головоломке
function highlightPuzzleSquare(row, col) {
    clearPuzzleSelection();
    
    const square = document.querySelector(`#puzzleBoard [data-row="${row}"][data-col="${col}"]`);
    if (square) {
        square.classList.add('selected');
    }
}

// Очистить выделение в головоломке
function clearPuzzleSelection() {
    const selectedSquares = document.querySelectorAll('#puzzleBoard .selected');
    selectedSquares.forEach(square => {
        square.classList.remove('selected');
    });
}

// Проверить решение головоломки
function checkPuzzleSolution() {
    const isCorrect = puzzleDatabase.checkSolution(
        currentPuzzleCategory, 
        currentPuzzleIndex, 
        currentPuzzleMode.playerMoves
    );
    
    if (isCorrect) {
        currentPuzzleMode.solved = true;
        
        // Отмечаем головоломку как решённую
        puzzleDatabase.completePuzzle(currentPuzzleCategory, currentPuzzleIndex);
        
        // Показываем поздравление
        setTimeout(() => {
            alert('🎉 Отлично! Головоломка решена правильно!');
            
            // Переходим к следующей головоломке
            nextPuzzle();
        }, 500);
        
    } else {
        // Неправильный ход - можно добавить визуальную обратную связь
        console.log('Неправильный ход, попробуйте ещё раз');
    }
    
    // Обновляем отображение
    renderPuzzleBoard();
}

// Сбросить головоломку
function resetPuzzle() {
    if (currentPuzzleMode) {
        currentPuzzleMode.playerMoves = [];
        currentPuzzleMode.solved = false;
        
        // Восстанавливаем начальную позицию
        const puzzle = puzzleDatabase.getPuzzle(currentPuzzleCategory, currentPuzzleIndex);
        currentPuzzleMode.engine = puzzleDatabase.createBoardFromPosition(puzzle.position);
        currentPuzzleMode.engine.currentPlayer = puzzle.activePlayer || 'white';
        
        renderPuzzleBoard();
    }
}

// Получить подсказку для головоломки
function getPuzzleHint() {
    if (currentPuzzleMode) {
        const hint = puzzleDatabase.getHint(currentPuzzleCategory, currentPuzzleIndex);
        if (hint) {
            alert(`💡 Подсказка: ${hint}`);
        } else {
            alert('Подсказка недоступна для этой головоломки');
        }
    }
}

// Следующая головоломка
function nextPuzzle() {
    if (!currentPuzzleCategory) return;
    
    const totalPuzzles = puzzleDatabase.getPuzzleCount(currentPuzzleCategory);
    
    if (currentPuzzleIndex < totalPuzzles - 1) {
        currentPuzzleIndex++;
        loadCurrentPuzzle();
    } else {
        alert('🎊 Поздравляем! Вы решили все головоломки в этой категории!');
        
        // Возвращаемся к выбору категории
        const puzzleSelection = document.querySelector('.puzzle-selection');
        const puzzleGame = document.getElementById('puzzleGame');
        
        if (puzzleSelection) puzzleSelection.style.display = 'block';
        if (puzzleGame) puzzleGame.style.display = 'none';
        
        // Обновляем статистику
        updatePuzzleStatistics();
    }
}

// === СТАТИСТИКА ===

// Обновить отображение статистики
function updateStatisticsDisplay() {
    if (!gameLogic || !gameLogic.storage) return;
    
    const stats = gameLogic.storage.getStatistics();
    if (!stats) return;
    
    // Обновляем общую статистику
    const elements = {
        totalWins: stats.wins,
        totalDraws: stats.draws,
        totalLosses: stats.losses,
        totalGames: stats.totalGames
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id] || 0;
        }
    });
    
    // Обновляем достижения
    updateAchievementsDisplay();
}

// Обновить отображение достижений
function updateAchievementsDisplay() {
    const achievementList = document.getElementById('achievementList');
    if (!achievementList || !gameLogic || !gameLogic.storage) return;
    
    const achievements = gameLogic.storage.getAchievements();
    if (!achievements) return;
    
    achievementList.innerHTML = '';
    
    Object.keys(achievements).forEach(achievementId => {
        const achievement = achievements[achievementId];
        
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        
        achievementDiv.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-details">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${achievement.unlocked ? `<small>Получено: ${new Date(achievement.unlockedAt || 0).toLocaleDateString()}</small>` : ''}
            </div>
        `;
        
        achievementList.appendChild(achievementDiv);
    });
}

// Обновить статистику головоломок
function updatePuzzleStatistics() {
    if (!puzzleDatabase) return;
    
    const stats = puzzleDatabase.getPuzzleStatistics();
    
    // Можно добавить отображение прогресса по каждой категории
    console.log('📊 Статистика головоломок:', stats);
}

// === МОДАЛЬНЫЕ ОКНА ===

// Настроить обработчики модальных окон
function setupModalHandlers() {
    // Закрытие модальных окон по клику вне их
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Закрыть все модальные окна
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
}

// === УТИЛИТЫ ===

// Показать сообщение об ошибке
function showErrorMessage(message) {
    alert(`❌ ${message}`);
}

// Проверить наличие сохранённой игры
function checkForSavedGame() {
    if (gameLogic && gameLogic.storage && gameLogic.storage.hasSavedGame()) {
        console.log('💾 Найдена сохранённая игра');
    }
}

// Настроить главное меню
function setupMainMenu() {
    // Анимация появления кнопок меню
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach((button, index) => {
        button.style.animationDelay = `${index * 0.1}s`;
        button.classList.add('fadeInUp');
    });
}

// Настроить селектор сложности
function setupDifficultySelector() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Настроить режим головоломок
function setupPuzzleMode() {
    const puzzleButtons = document.querySelectorAll('.puzzle-btn');
    
    puzzleButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Настроить экран статистики
function setupStatisticsScreen() {
    // Анимация карточек статистики
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    // Можно добавить логику адаптации интерфейса
    console.log('🔄 Размер окна изменён');
});

// Обработка перед закрытием страницы
window.addEventListener('beforeunload', function(event) {
    // Автосохранение если игра активна
    if (gameLogic && gameLogic.chessEngine && !gameLogic.chessEngine.isGameOver) {
        gameLogic.storage.saveGame(gameLogic.chessEngine);
    }
});

// === ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ===

// Экспорт игровых данных
function exportGameData() {
    if (!gameLogic || !gameLogic.storage) return;
    
    const data = gameLogic.storage.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-master-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// Импорт игровых данных
function importGameData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                const success = gameLogic.storage.importData(data);
                
                if (success) {
                    alert('✅ Данные успешно импортированы!');
                    // Обновляем отображение
                    if (document.getElementById('statisticsScreen').style.display !== 'none') {
                        updateStatisticsDisplay();
                    }
                } else {
                    alert('❌ Ошибка импорта данных');
                }
            } catch (error) {
                alert('❌ Неверный формат файла');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Очистить все данные
function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные игры? Это действие нельзя отменить.')) {
        if (gameLogic && gameLogic.storage) {
            gameLogic.storage.clearAllData();
            alert('✅ Все данные удалены');
            location.reload(); // Перезагружаем страницу
        }
    }
}

// Получить информацию о версии
function getVersionInfo() {
    return {
        version: '1.0.0',
        buildDate: '2024-01-01',
        features: [
            'Полный шахматный движок',
            'ИИ с 4 уровнями сложности',
            'Обучающие головоломки',
            'Статистика и достижения',
            'Локальное сохранение',
            'Адаптивный дизайн'
        ]
    };
}

// Показать информацию о игре
function showAbout() {
    const info = getVersionInfo();
    const message = `
🎮 Шахматы Мастер v${info.version}

📅 Дата сборки: ${info.buildDate}

🎯 Возможности:
${info.features.map(f => `• ${f}`).join('\n')}

👨‍💻 Создано с ❤️ для любителей шахмат
    `;
    
    alert(message);
}

console.log('🚀 main.js загружен успешно');