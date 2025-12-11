/**
 * ИИ движок для игры в шахматы
 * Реализует алгоритм минимакс с альфа-бета отсечением
 * Поддерживает 4 уровня сложности
 */
class ChessAI {
    constructor() {
        this.difficultyLevels = {
            1: { depth: 2, name: 'Новичок', errorRate: 0.3 },      // Слабый ИИ с ошибками
            2: { depth: 3, name: 'Любитель', errorRate: 0.15 },    // Средний ИИ
            3: { depth: 4, name: 'Опытный', errorRate: 0.05 },     // Сильный ИИ
            4: { depth: 5, name: 'Мастер', errorRate: 0.0 }        // Очень сильный ИИ
        };
        this.currentDifficulty = 2;
        this.isThinking = false;
        
        // Позиционные таблицы для оценки
        this.positionTables = this.initializePositionTables();
        
        // Кэш оценок позиций
        this.evaluationCache = new Map();
        
        // Статистика работы ИИ
        this.stats = {
            positionsEvaluated: 0,
            cacheHits: 0,
            searchDepth: 0
        };
    }

    // Инициализация позиционных таблиц
    initializePositionTables() {
        return {
            pawn: [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            knight: [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            bishop: [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            rook: [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            queen: [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            king_middlegame: [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ],
            king_endgame: [
                [-50,-40,-30,-20,-20,-30,-40,-50],
                [-30,-20,-10,  0,  0,-10,-20,-30],
                [-30,-10, 20, 30, 30, 20,-10,-30],
                [-30,-10, 30, 40, 40, 30,-10,-30],
                [-30,-10, 30, 40, 40, 30,-10,-30],
                [-30,-10, 20, 30, 30, 20,-10,-30],
                [-30,-30,  0,  0,  0,  0,-30,-30],
                [-50,-30,-30,-30,-30,-30,-30,-50]
            ]
        };
    }

    // Установить уровень сложности
    setDifficulty(level) {
        if (level >= 1 && level <= 4) {
            this.currentDifficulty = level;
        }
    }

    // Получить лучший ход
    async getBestMove(chessEngine, onProgress = null) {
        this.isThinking = true;
        this.stats.positionsEvaluated = 0;
        this.stats.cacheHits = 0;
        
        const difficulty = this.difficultyLevels[this.currentDifficulty];
        
        return new Promise((resolve) => {
            // Добавляем задержку для реалистичности
            setTimeout(async () => {
                let bestMove = null;
                
                // Для новичка иногда делаем случайный ход
                if (this.currentDifficulty === 1 && Math.random() < difficulty.errorRate) {
                    bestMove = this.getRandomMove(chessEngine);
                } else {
                    bestMove = await this.findBestMove(chessEngine, difficulty.depth, onProgress);
                }
                
                this.isThinking = false;
                resolve(bestMove);
            }, this.getThinkingTime());
        });
    }

    // Найти лучший ход с помощью минимакс
    async findBestMove(chessEngine, depth, onProgress = null) {
        const allMoves = this.getAllPossibleMoves(chessEngine);
        if (allMoves.length === 0) return null;
        
        // Сортируем ходы для лучшего альфа-бета отсечения
        allMoves.sort((a, b) => this.scoreMove(chessEngine, b) - this.scoreMove(chessEngine, a));
        
        let bestMove = null;
        let bestScore = -Infinity;
        const alpha = -Infinity;
        const beta = Infinity;
        
        for (let i = 0; i < allMoves.length; i++) {
            const move = allMoves[i];
            
            // Делаем ход на клоне
            const clonedEngine = chessEngine.clone();
            clonedEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // Оцениваем позицию
            const score = await this.minimax(clonedEngine, depth - 1, alpha, beta, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            // Обновляем прогресс
            if (onProgress) {
                onProgress((i + 1) / allMoves.length);
            }
            
            // Даем браузеру время на обновление
            if (i % 10 === 0) {
                await this.sleep(1);
            }
        }
        
        return bestMove;
    }

    // Алгоритм минимакс с альфа-бета отсечением
    async minimax(chessEngine, depth, alpha, beta, maximizingPlayer) {
        this.stats.positionsEvaluated++;
        
        // Проверяем кэш
        const positionKey = this.getPositionKey(chessEngine);
        if (this.evaluationCache.has(positionKey)) {
            this.stats.cacheHits++;
            return this.evaluationCache.get(positionKey);
        }
        
        // Базовый случай
        if (depth === 0 || chessEngine.isGameOver) {
            const evaluation = this.evaluatePosition(chessEngine);
            this.evaluationCache.set(positionKey, evaluation);
            return evaluation;
        }
        
        const moves = this.getAllPossibleMoves(chessEngine);
        if (moves.length === 0) {
            const evaluation = this.evaluatePosition(chessEngine);
            this.evaluationCache.set(positionKey, evaluation);
            return evaluation;
        }
        
        // Сортируем ходы
        moves.sort((a, b) => this.scoreMove(chessEngine, b) - this.scoreMove(chessEngine, a));
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            
            for (const move of moves) {
                const clonedEngine = chessEngine.clone();
                clonedEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const evaluation = await this.minimax(clonedEngine, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
            }
            
            this.evaluationCache.set(positionKey, maxEval);
            return maxEval;
        } else {
            let minEval = Infinity;
            
            for (const move of moves) {
                const clonedEngine = chessEngine.clone();
                clonedEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const evaluation = await this.minimax(clonedEngine, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
            }
            
            this.evaluationCache.set(positionKey, minEval);
            return minEval;
        }
    }

    // Получить все возможные ходы
    getAllPossibleMoves(chessEngine) {
        const moves = [];
        const currentColor = chessEngine.currentPlayer;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = chessEngine.board[row][col];
                if (piece && chessEngine.getPieceColor(piece) === currentColor) {
                    const pieceMoves = chessEngine.getPossibleMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col },
                            piece: piece,
                            moveType: move.type
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    // Быстрая оценка хода для сортировки
    scoreMove(chessEngine, move) {
        let score = 0;
        
        const movingPiece = chessEngine.board[move.from.row][move.from.col];
        const targetPiece = chessEngine.board[move.to.row][move.to.col];
        
        // Взятие фигуры
        if (targetPiece) {
            const capturedValue = this.getPieceValue(chessEngine.getPieceType(targetPiece));
            const movingValue = this.getPieceValue(chessEngine.getPieceType(movingPiece));
            score += capturedValue - movingValue; // MVV-LVA
        }
        
        // Продвижение пешки
        if (chessEngine.getPieceType(movingPiece) === 'pawn') {
            const color = chessEngine.getPieceColor(movingPiece);
            if ((color === 'white' && move.to.row === 0) || (color === 'black' && move.to.row === 7)) {
                score += 800; // Превращение в ферзя
            }
        }
        
        // Развитие фигур в дебюте
        if (chessEngine.fullMoveNumber <= 10) {
            const pieceType = chessEngine.getPieceType(movingPiece);
            if (pieceType === 'knight' || pieceType === 'bishop') {
                score += 30;
            }
        }
        
        return score;
    }

    // Оценка позиции
    evaluatePosition(chessEngine) {
        if (chessEngine.isGameOver) {
            if (chessEngine.gameResult === 'white_wins') {
                return chessEngine.currentPlayer === 'black' ? 10000 : -10000;
            } else if (chessEngine.gameResult === 'black_wins') {
                return chessEngine.currentPlayer === 'black' ? -10000 : 10000;
            }
            return 0; // Ничья
        }
        
        let score = 0;
        let whiteKingPos = null;
        let blackKingPos = null;
        let materialCount = 0;
        
        // Материальная оценка и позиционная оценка
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = chessEngine.board[row][col];
                if (piece) {
                    const pieceType = chessEngine.getPieceType(piece);
                    const color = chessEngine.getPieceColor(piece);
                    const pieceValue = this.getPieceValue(pieceType);
                    const positionValue = this.getPositionValue(pieceType, row, col, color);
                    
                    materialCount += pieceValue;
                    
                    if (color === 'white') {
                        score += pieceValue + positionValue;
                        if (pieceType === 'king') whiteKingPos = { row, col };
                    } else {
                        score -= pieceValue + positionValue;
                        if (pieceType === 'king') blackKingPos = { row, col };
                    }
                }
            }
        }
        
        // Мобильность (количество возможных ходов)
        const whiteMobility = this.calculateMobility(chessEngine, 'white');
        const blackMobility = this.calculateMobility(chessEngine, 'black');
        score += (whiteMobility - blackMobility) * 10;
        
        // Контроль центра
        score += this.evaluateCenterControl(chessEngine);
        
        // Безопасность короля
        if (whiteKingPos) {
            score += this.evaluateKingSafety(chessEngine, whiteKingPos, 'white');
        }
        if (blackKingPos) {
            score -= this.evaluateKingSafety(chessEngine, blackKingPos, 'black');
        }
        
        // Структура пешек
        score += this.evaluatePawnStructure(chessEngine);
        
        // Эндшпиль
        if (materialCount < 2000) { // Эндшпиль
            score += this.evaluateEndgame(chessEngine);
        }
        
        // Добавляем небольшой случайный фактор для разнообразия
        if (this.currentDifficulty < 4) {
            const randomFactor = (Math.random() - 0.5) * 20;
            score += randomFactor;
        }
        
        return chessEngine.currentPlayer === 'white' ? score : -score;
    }

    // Получить ценность фигуры
    getPieceValue(pieceType) {
        const values = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
        return values[pieceType] || 0;
    }

    // Получить позиционную ценность
    getPositionValue(pieceType, row, col, color) {
        if (!this.positionTables[pieceType]) return 0;
        
        // Для черных фигур отражаем таблицу
        const tableRow = color === 'white' ? row : 7 - row;
        
        // Для короля выбираем таблицу в зависимости от стадии игры
        if (pieceType === 'king') {
            const isEndgame = this.isEndgame();
            const table = isEndgame ? this.positionTables.king_endgame : this.positionTables.king_middlegame;
            return table[tableRow][col];
        }
        
        return this.positionTables[pieceType][tableRow][col];
    }

    // Проверка на эндшпиль
    isEndgame() {
        // Простая проверка: если на доске мало фигур
        return Object.values(this.capturedPieces).flat().length > 8;
    }

    // Вычислить мобильность
    calculateMobility(chessEngine, color) {
        const originalPlayer = chessEngine.currentPlayer;
        chessEngine.currentPlayer = color;
        
        const moves = this.getAllPossibleMoves(chessEngine);
        
        chessEngine.currentPlayer = originalPlayer;
        return moves.length;
    }

    // Оценка контроля центра
    evaluateCenterControl(chessEngine) {
        let score = 0;
        const centerSquares = [
            [3, 3], [3, 4], [4, 3], [4, 4] // e4, e5, d4, d5
        ];
        
        for (const [row, col] of centerSquares) {
            const piece = chessEngine.board[row][col];
            if (piece) {
                const color = chessEngine.getPieceColor(piece);
                const value = color === 'white' ? 30 : -30;
                score += value;
            }
        }
        
        return score;
    }

    // Оценка безопасности короля
    evaluateKingSafety(chessEngine, kingPos, color) {
        let safety = 0;
        
        // Проверяем клетки вокруг короля
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            const newRow = kingPos.row + dr;
            const newCol = kingPos.col + dc;
            
            if (chessEngine.isValidPosition(newRow, newCol)) {
                const piece = chessEngine.board[newRow][newCol];
                if (piece && chessEngine.getPieceColor(piece) === color) {
                    safety += 10; // Защита своими фигурами
                }
                
                if (chessEngine.isSquareAttacked(newRow, newCol, color)) {
                    safety -= 20; // Атака на клетки рядом с королем
                }
            }
        }
        
        return safety;
    }

    // Оценка структуры пешек
    evaluatePawnStructure(chessEngine) {
        let score = 0;
        
        for (let col = 0; col < 8; col++) {
            let whitePawns = [];
            let blackPawns = [];
            
            for (let row = 0; row < 8; row++) {
                const piece = chessEngine.board[row][col];
                if (piece && chessEngine.getPieceType(piece) === 'pawn') {
                    if (chessEngine.getPieceColor(piece) === 'white') {
                        whitePawns.push(row);
                    } else {
                        blackPawns.push(row);
                    }
                }
            }
            
            // Сдвоенные пешки
            if (whitePawns.length > 1) score -= 20 * (whitePawns.length - 1);
            if (blackPawns.length > 1) score += 20 * (blackPawns.length - 1);
            
            // Изолированные пешки
            if (whitePawns.length === 1) {
                const hasNeighborPawn = this.hasNeighborPawn(chessEngine, col, 'white');
                if (!hasNeighborPawn) score -= 15;
            }
            if (blackPawns.length === 1) {
                const hasNeighborPawn = this.hasNeighborPawn(chessEngine, col, 'black');
                if (!hasNeighborPawn) score += 15;
            }
        }
        
        return score;
    }

    // Проверка на соседние пешки
    hasNeighborPawn(chessEngine, col, color) {
        for (const neighborCol of [col - 1, col + 1]) {
            if (neighborCol >= 0 && neighborCol < 8) {
                for (let row = 0; row < 8; row++) {
                    const piece = chessEngine.board[row][neighborCol];
                    if (piece && 
                        chessEngine.getPieceType(piece) === 'pawn' && 
                        chessEngine.getPieceColor(piece) === color) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Оценка эндшпиля
    evaluateEndgame(chessEngine) {
        let score = 0;
        
        // В эндшпиле активность короля важна
        const whiteKing = chessEngine.findKing('white');
        const blackKing = chessEngine.findKing('black');
        
        if (whiteKing && blackKing) {
            // Централизация короля
            const whiteCentralization = this.getKingCentralization(whiteKing);
            const blackCentralization = this.getKingCentralization(blackKing);
            score += (whiteCentralization - blackCentralization) * 10;
        }
        
        return score;
    }

    // Централизация короля
    getKingCentralization(kingPos) {
        const centerDistance = Math.abs(kingPos.row - 3.5) + Math.abs(kingPos.col - 3.5);
        return 7 - centerDistance;
    }

    // Получить случайный ход
    getRandomMove(chessEngine) {
        const moves = this.getAllPossibleMoves(chessEngine);
        if (moves.length === 0) return null;
        
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Получить ключ позиции для кэширования
    getPositionKey(chessEngine) {
        let key = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                key += chessEngine.board[row][col] || '0';
            }
        }
        key += chessEngine.currentPlayer;
        return key;
    }

    // Время на размышления
    getThinkingTime() {
        const baseTimes = {
            1: 500,   // Новичок - быстро
            2: 1000,  // Любитель - средне
            3: 2000,  // Опытный - долго
            4: 3000   // Мастер - очень долго
        };
        
        const baseTime = baseTimes[this.currentDifficulty] || 1000;
        return baseTime + Math.random() * 1000; // Добавляем случайность
    }

    // Получить подсказку для игрока
    async getHint(chessEngine) {
        const originalPlayer = chessEngine.currentPlayer;
        const bestMove = await this.findBestMove(chessEngine, 3);
        return bestMove;
    }

    // Анализ позиции
    analyzePosition(chessEngine) {
        const evaluation = this.evaluatePosition(chessEngine);
        const moves = this.getAllPossibleMoves(chessEngine);
        
        return {
            evaluation: evaluation,
            movesCount: moves.length,
            isCheck: chessEngine.isInCheck(chessEngine.currentPlayer),
            materialBalance: this.getMaterialBalance(chessEngine),
            recommendation: this.getPositionRecommendation(evaluation)
        };
    }

    // Баланс материала
    getMaterialBalance(chessEngine) {
        let whiteValue = 0;
        let blackValue = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = chessEngine.board[row][col];
                if (piece) {
                    const value = this.getPieceValue(chessEngine.getPieceType(piece));
                    if (chessEngine.getPieceColor(piece) === 'white') {
                        whiteValue += value;
                    } else {
                        blackValue += value;
                    }
                }
            }
        }
        
        return whiteValue - blackValue;
    }

    // Рекомендация по позиции
    getPositionRecommendation(evaluation) {
        if (evaluation > 300) return 'Значительное преимущество';
        if (evaluation > 100) return 'Небольшое преимущество';
        if (evaluation > -100) return 'Равная позиция';
        if (evaluation > -300) return 'Небольшое отставание';
        return 'Значительное отставание';
    }

    // Очистить кэш
    clearCache() {
        this.evaluationCache.clear();
    }

    // Получить статистику
    getStats() {
        return { ...this.stats };
    }

    // Утилита для задержки
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}