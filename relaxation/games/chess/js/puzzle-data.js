/**
 * База данных шахматных головоломок
 * Содержит различные категории задач для обучения
 */
class PuzzleDatabase {
    constructor() {
        this.puzzles = this.initializePuzzles();
        this.currentCategory = null;
        this.currentPuzzleIndex = 0;
        this.storage = new StorageManager();
    }

    // Инициализация базы головоломок
    initializePuzzles() {
        return {
            'mate-in-1': this.getMateInOnePuzzles(),
            'mate-in-2': this.getMateInTwoPuzzles(),
            'tactics': this.getTacticalPuzzles(),
            'endgame': this.getEndgamePuzzles()
        };
    }

    // Головоломки "Мат в 1 ход"
    getMateInOnePuzzles() {
        return [
            {
                title: "Мат в 1 ход #1",
                description: "Белые ставят мат в один ход",
                position: [
                    ["♜", null, null, null, "♚", null, null, "♜"],
                    ["♟", "♟", "♟", null, null, "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, "♙", null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ["♙", "♙", "♙", null, null, "♙", "♙", "♙"],
                    ["♖", null, null, "♕", "♔", null, null, "♖"]
                ],
                solution: [{ from: [7, 3], to: [0, 3] }], // Qd8#
                activePlayer: "white",
                hint: "Ферзь может дать мат по 8-й горизонтали"
            },
            {
                title: "Мат в 1 ход #2",
                description: "Белые ставят мат в один ход",
                position: [
                    ["♜", "♞", "♝", "♛", "♚", null, "♞", "♜"],
                    ["♟", "♟", "♟", null, null, "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, "♟", null, null, null, null],
                    [null, null, null, "♙", null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ["♙", "♙", "♙", null, "♙", "♙", "♙", "♙"],
                    ["♖", "♘", "♗", "♕", "♔", "♗", null, "♖"]
                ],
                solution: [{ from: [7, 3], to: [0, 3] }], // Qd8#
                activePlayer: "white",
                hint: "Ищите вскрытый шах по диагонали"
            },
            {
                title: "Мат в 1 ход #3",
                description: "Белые ставят мат в один ход",
                position: [
                    [null, null, null, null, "♚", null, null, null],
                    [null, null, null, null, null, "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, "♙", "♙", "♙"],
                    [null, null, null, "♖", "♔", null, null, "♖"]
                ],
                solution: [{ from: [7, 3], to: [0, 3] }], // Rd8#
                activePlayer: "white",
                hint: "Ладья может дать мат по вертикали"
            },
            {
                title: "Мат в 1 ход #4",
                description: "Белые ставят мат в один ход",
                position: [
                    ["♜", null, null, null, "♚", "♝", "♞", "♜"],
                    ["♟", "♟", null, null, null, "♟", "♟", "♟"],
                    [null, null, "♟", null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, "♙", null, null, null],
                    [null, null, "♙", null, null, null, null, null],
                    ["♙", "♙", null, null, null, "♙", "♙", "♙"],
                    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
                ],
                solution: [{ from: [7, 3], to: [0, 3] }], // Qd8#
                activePlayer: "white",
                hint: "Двойной шах решает всё"
            },
            {
                title: "Мат в 1 ход #5",
                description: "Белые ставят мат в один ход",
                position: [
                    [null, null, null, null, null, "♜", "♚", null],
                    [null, null, null, null, null, "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, "♙", "♙", "♙"],
                    [null, null, null, null, "♖", null, "♔", null]
                ],
                solution: [{ from: [7, 4], to: [0, 4] }], // Re8#
                activePlayer: "white",
                hint: "Ладья по задней горизонтали"
            }
        ];
    }

    // Головоломки "Мат в 2 хода"
    getMateInTwoPuzzles() {
        return [
            {
                title: "Мат в 2 хода #1",
                description: "Белые ставят мат в два хода",
                position: [
                    [null, null, null, null, "♚", null, null, null],
                    [null, null, null, null, "♟", "♟", null, null],
                    [null, null, null, null, null, null, "♟", null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, "♙", null],
                    [null, null, null, null, "♙", "♙", null, null],
                    [null, null, null, "♖", "♔", null, null, null]
                ],
                solution: [
                    { from: [7, 3], to: [0, 3] }, // Rd8+
                    { from: [0, 4], to: [0, 5] }, // Kf8
                    { from: [0, 3], to: [0, 5] }  // Rf8#
                ],
                activePlayer: "white",
                hint: "Начните с шаха ладьёй"
            },
            {
                title: "Мат в 2 хода #2",
                description: "Белые ставят мат в два хода",
                position: [
                    [null, null, null, null, "♚", null, null, "♜"],
                    [null, null, null, null, null, "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, "♙", "♙", "♙"],
                    [null, null, null, null, "♔", "♖", null, null]
                ],
                solution: [
                    { from: [7, 5], to: [0, 5] }, // Rf8+
                    { from: [0, 7], to: [0, 5] }, // Rxf8
                    { from: [7, 4], to: [0, 4] }  // Ke8#
                ],
                activePlayer: "white",
                hint: "Жертва ладьи открывает путь королю"
            }
        ];
    }

    // Тактические головоломки
    getTacticalPuzzles() {
        return [
            {
                title: "Двойной удар #1",
                description: "Найдите двойной удар",
                position: [
                    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
                    ["♟", "♟", "♟", null, "♟", "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, "♟", null, null, null, null],
                    [null, null, null, "♙", null, null, null, null],
                    [null, null, "♘", null, null, null, null, null],
                    ["♙", "♙", "♙", null, "♙", "♙", "♙", "♙"],
                    ["♖", null, "♗", "♕", "♔", "♗", "♘", "♖"]
                ],
                solution: [{ from: [5, 2], to: [3, 3] }], // Nxd5
                activePlayer: "white",
                hint: "Конь может напасть на две фигуры одновременно"
            },
            {
                title: "Вилка #1",
                description: "Используйте вилку коня",
                position: [
                    ["♜", null, "♝", "♛", "♚", "♝", "♞", "♜"],
                    ["♟", "♟", "♟", null, "♟", "♟", "♟", "♟"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, "♟", null, null, null, null],
                    [null, null, null, "♙", null, null, null, null],
                    [null, null, "♘", null, null, null, null, null],
                    ["♙", "♙", "♙", null, "♙", "♙", "♙", "♙"],
                    ["♖", "♞", "♗", "♕", "♔", "♗", "♘", "♖"]
                ],
                solution: [{ from: [5, 2], to: [3, 1] }], // Nb2
                activePlayer: "white",
                hint: "Вилка на короля и ладью"
            },
            {
                title: "Связка #1",
                description: "Используйте связку",
                position: [
                    ["♜", "♞", "♝", "♛", "♚", null, "♞", "♜"],
                    ["♟", "♟", "♟", null, "♟", "♟", "♟", "♟"],
                    [null, null, null, null, null, "♝", null, null],
                    [null, null, null, "♟", null, null, null, null],
                    [null, null, null, "♙", null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ["♙", "♙", "♙", null, "♙", "♙", "♙", "♙"],
                    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
                ],
                solution: [{ from: [7, 2], to: [4, 5] }], // Bxf6
                activePlayer: "white",
                hint: "Слон создаёт связку по диагонали"
            }
        ];
    }

    // Эндшпиль головоломки
    getEndgamePuzzles() {
        return [
            {
                title: "Король и пешка #1",
                description: "Проведите пешку в ферзи",
                position: [
                    [null, null, null, null, "♚", null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, "♙", null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, "♔", null, null, null]
                ],
                solution: [
                    { from: [7, 4], to: [6, 4] }, // Ke6
                    { from: [0, 4], to: [1, 4] }, // Ke7
                    { from: [5, 4], to: [4, 4] }  // e5
                ],
                activePlayer: "white",
                hint: "Король должен поддержать пешку"
            },
            {
                title: "Ладейный эндшпиль #1",
                description: "Выиграйте ладейный эндшпиль",
                position: [
                    [null, null, null, null, "♚", null, null, "♜"],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null],
                    ["♖", null, null, null, "♔", null, null, null]
                ],
                solution: [
                    { from: [7, 0], to: [0, 0] }, // Ra8+
                    { from: [0, 7], to: [0, 0] }, // Rxa8
                    { from: [7, 4], to: [6, 4] }  // Ke6
                ],
                activePlayer: "white",
                hint: "Активность ладьи решает всё"
            }
        ];
    }

    // Получить головоломку по категории и индексу
    getPuzzle(category, index) {
        if (!this.puzzles[category] || !this.puzzles[category][index]) {
            return null;
        }
        return this.puzzles[category][index];
    }

    // Получить количество головоломок в категории
    getPuzzleCount(category) {
        return this.puzzles[category] ? this.puzzles[category].length : 0;
    }

    // Получить все категории
    getCategories() {
        return Object.keys(this.puzzles);
    }

    // Получить информацию о категории
    getCategoryInfo(category) {
        const categoryInfo = {
            'mate-in-1': {
                name: 'Мат в 1 ход',
                description: 'Найдите мат в один ход',
                difficulty: 'Легкий',
                icon: '⚡'
            },
            'mate-in-2': {
                name: 'Мат в 2 хода',
                description: 'Найдите форсированный мат в два хода',
                difficulty: 'Средний',
                icon: '🎯'
            },
            'tactics': {
                name: 'Тактика',
                description: 'Тактические приёмы и комбинации',
                difficulty: 'Средний',
                icon: '⚔️'
            },
            'endgame': {
                name: 'Эндшпиль',
                description: 'Техника игры в окончаниях',
                difficulty: 'Сложный',
                icon: '👑'
            }
        };

        return categoryInfo[category] || null;
    }

    // Проверить решение головоломки
    checkSolution(category, puzzleIndex, playerMoves) {
        const puzzle = this.getPuzzle(category, puzzleIndex);
        if (!puzzle) return false;

        // Простая проверка - сравниваем первый ход
        if (puzzle.solution.length === 0) return false;
        
        const expectedMove = puzzle.solution[0];
        if (playerMoves.length === 0) return false;
        
        const playerMove = playerMoves[0];
        
        return (
            expectedMove.from[0] === playerMove.from.row &&
            expectedMove.from[1] === playerMove.from.col &&
            expectedMove.to[0] === playerMove.to.row &&
            expectedMove.to[1] === playerMove.to.col
        );
    }

    // Получить подсказку для головоломки
    getHint(category, puzzleIndex) {
        const puzzle = this.getPuzzle(category, puzzleIndex);
        return puzzle ? puzzle.hint : null;
    }

    // Получить прогресс игрока
    getProgress(category) {
        const progress = this.storage.getPuzzleProgress();
        return progress[category] || { completed: [], current: 0 };
    }

    // Отметить головоломку как решённую
    completePuzzle(category, puzzleIndex) {
        this.storage.savePuzzleProgress(category, puzzleIndex, true);
    }

    // Получить следующую головоломку
    getNextPuzzle(category, currentIndex) {
        const nextIndex = currentIndex + 1;
        return this.getPuzzle(category, nextIndex);
    }

    // Получить предыдущую головоломку
    getPreviousPuzzle(category, currentIndex) {
        if (currentIndex <= 0) return null;
        const prevIndex = currentIndex - 1;
        return this.getPuzzle(category, prevIndex);
    }

    // Получить случайную головоломку из категории
    getRandomPuzzle(category) {
        const puzzleCount = this.getPuzzleCount(category);
        if (puzzleCount === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * puzzleCount);
        return {
            puzzle: this.getPuzzle(category, randomIndex),
            index: randomIndex
        };
    }

    // Получить статистику по головоломкам
    getPuzzleStatistics() {
        const progress = this.storage.getPuzzleProgress();
        const stats = {};

        for (const category of this.getCategories()) {
            const categoryProgress = progress[category] || { completed: [], current: 0 };
            const totalPuzzles = this.getPuzzleCount(category);
            
            stats[category] = {
                total: totalPuzzles,
                completed: categoryProgress.completed.length,
                current: categoryProgress.current,
                percentage: totalPuzzles > 0 ? 
                    Math.round((categoryProgress.completed.length / totalPuzzles) * 100) : 0
            };
        }

        return stats;
    }

    // Сбросить прогресс по категории
    resetProgress(category) {
        const progress = this.storage.getPuzzleProgress();
        progress[category] = { completed: [], current: 0 };
        this.storage.setItem(this.storage.keys.puzzleProgress, progress);
    }

    // Создать позицию на доске из массива
    createBoardFromPosition(position) {
        const engine = new ChessEngine();
        
        // Очищаем доску
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                engine.board[row][col] = null;
            }
        }
        
        // Устанавливаем фигуры согласно позиции
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (position[row] && position[row][col]) {
                    engine.board[row][col] = position[row][col];
                }
            }
        }
        
        return engine;
    }

    // Проверить, является ли ход частью решения
    isMoveInSolution(category, puzzleIndex, moveIndex, move) {
        const puzzle = this.getPuzzle(category, puzzleIndex);
        if (!puzzle || !puzzle.solution[moveIndex]) return false;
        
        const solutionMove = puzzle.solution[moveIndex];
        return (
            solutionMove.from[0] === move.from.row &&
            solutionMove.from[1] === move.from.col &&
            solutionMove.to[0] === move.to.row &&
            solutionMove.to[1] === move.to.col
        );
    }

    // Получить оценку сложности головоломки
    getDifficultyRating(category, puzzleIndex) {
        const ratings = {
            'mate-in-1': { min: 800, max: 1200 },
            'mate-in-2': { min: 1200, max: 1600 },
            'tactics': { min: 1000, max: 1800 },
            'endgame': { min: 1400, max: 2000 }
        };

        const categoryRating = ratings[category];
        if (!categoryRating) return 1000;

        // Простой расчёт рейтинга на основе индекса
        const puzzleCount = this.getPuzzleCount(category);
        const difficulty = puzzleIndex / Math.max(puzzleCount - 1, 1);
        
        return Math.round(
            categoryRating.min + difficulty * (categoryRating.max - categoryRating.min)
        );
    }
}