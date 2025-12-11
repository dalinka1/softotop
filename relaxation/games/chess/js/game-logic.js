/**
 * Основная игровая логика
 * Управляет взаимодействием между UI, шахматным движком и ИИ
 */
class GameLogic {
    constructor() {
        this.chessEngine = new ChessEngine();
        this.chessAI = new ChessAI();
        this.storage = new StorageManager();
        
        // Состояние игры
        this.gameMode = 'vs-ai'; // vs-ai, vs-human, puzzle
        this.playerColor = 'white';
        this.aiDifficulty = 2;
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameTimer = null;
        this.gameStartTime = null;
        
        // UI элементы
        this.boardElement = document.getElementById('chessBoard');
        this.moveHistoryElement = document.getElementById('moveHistory');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameStatusElement = document.getElementById('gameStatus');
        
        // Флаги состояния
        this.isPlayerTurn = true;
        this.isDragging = false;
        this.draggedPiece = null;
        this.waitingForPromotion = false;
        
        // Анимация
        this.animationDuration = 300;
        
        this.initializeBoard();
        this.attachEventListeners();
    }

    // Инициализация доски
    initializeBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Добавляем фигуру если она есть
                const piece = this.chessEngine.board[row][col];
                if (piece) {
                    square.textContent = piece;
                    square.classList.add(`piece-${this.chessEngine.getPieceColor(piece)}`);
                }
                
                this.boardElement.appendChild(square);
            }
        }
    }

    // Обновление доски
    updateBoard() {
        const squares = this.boardElement.querySelectorAll('.chess-square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.chessEngine.board[row][col];
            
            // Очищаем классы
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            if (piece) {
                square.textContent = piece;
                square.classList.add(`piece-${this.chessEngine.getPieceColor(piece)}`);
            } else {
                square.textContent = '';
            }
        });
        
        // Обновляем информацию о текущем игроке
        this.updateCurrentPlayerDisplay();
        
        // Обновляем историю ходов
        this.updateMoveHistory();
        
        // Обновляем статус игры
        this.updateGameStatus();
        
        // Обновляем захваченные фигуры
        this.updateCapturedPieces();
        
        // Проверяем на окончание игры
        this.checkGameEnd();
    }

    // Прикрепление обработчиков событий
    attachEventListeners() {
        // Клики по клеткам доски
        this.boardElement.addEventListener('click', this.handleSquareClick.bind(this));
        
        // Drag and Drop
        this.boardElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.boardElement.addEventListener('dragover', this.handleDragOver.bind(this));
        this.boardElement.addEventListener('drop', this.handleDrop.bind(this));
        
        // Touch события для мобильных устройств
        this.boardElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.boardElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.boardElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    // Обработка клика по клетке
    async handleSquareClick(event) {
        if (!this.isPlayerTurn || this.waitingForPromotion) return;
        
        const square = event.target.closest('.chess-square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Если уже выбрана клетка
        if (this.selectedSquare) {
            // Проверяем, является ли это валидным ходом
            const isValidMove = this.validMoves.some(move => 
                move.row === row && move.col === col
            );
            
            if (isValidMove) {
                await this.makePlayerMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
            } else {
                // Проверяем, кликнули ли по своей фигуре для нового выбора
                const piece = this.chessEngine.board[row][col];
                if (piece && this.chessEngine.getPieceColor(piece) === this.playerColor) {
                    this.selectSquare(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Выбираем фигуру, если это фигура игрока
            const piece = this.chessEngine.board[row][col];
            if (piece && this.chessEngine.getPieceColor(piece) === this.playerColor) {
                this.selectSquare(row, col);
            }
        }
    }

    // Выбор клетки
    selectSquare(row, col) {
        this.clearSelection();
        
        this.selectedSquare = { row, col };
        this.validMoves = this.chessEngine.getPossibleMoves(row, col);
        
        // Подсвечиваем выбранную клетку
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');
        
        // Подсвечиваем возможные ходы
        this.validMoves.forEach(move => {
            const moveSquare = this.getSquareElement(move.row, move.col);
            moveSquare.classList.add('valid-move');
            
            if (move.type === 'capture') {
                moveSquare.classList.add('capture-move');
            }
        });
    }

    // Очистка выделения
    clearSelection() {
        if (this.selectedSquare) {
            const square = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
            square.classList.remove('selected');
        }
        
        // Убираем подсветку возможных ходов
        this.boardElement.querySelectorAll('.valid-move').forEach(square => {
            square.classList.remove('valid-move', 'capture-move');
        });
        
        this.selectedSquare = null;
        this.validMoves = [];
    }

    // Получить элемент клетки
    getSquareElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    // Ход игрока
    async makePlayerMove(fromRow, fromCol, toRow, toCol) {
        this.clearSelection();
        
        // Проверяем, нужно ли превращение пешки
        if (this.needsPawnPromotion(fromRow, fromCol, toRow, toCol)) {
            this.waitingForPromotion = true;
            this.showPromotionDialog(toRow, toCol, fromRow, fromCol);
            return;
        }
        
        // Делаем ход
        const success = this.chessEngine.makeMove(fromRow, fromCol, toRow, toCol);
        
        if (success) {
            await this.animateMove(fromRow, fromCol, toRow, toCol);
            this.updateBoard();
            this.storage.saveGame(this.chessEngine);
            
            // Если игра не окончена, делаем ход ИИ
            if (!this.chessEngine.isGameOver && this.gameMode === 'vs-ai') {
                this.isPlayerTurn = false;
                await this.makeAIMove();
                this.isPlayerTurn = true;
            }
        }
    }

    // Проверка на превращение пешки
    needsPawnPromotion(fromRow, fromCol, toRow, toCol) {
        const piece = this.chessEngine.board[fromRow][fromCol];
        if (!piece || this.chessEngine.getPieceType(piece) !== 'pawn') return false;
        
        const color = this.chessEngine.getPieceColor(piece);
        return (color === 'white' && toRow === 0) || (color === 'black' && toRow === 7);
    }

    // Показать диалог превращения пешки
    showPromotionDialog(toRow, toCol, fromRow, fromCol) {
        const modal = document.getElementById('promotionModal');
        modal.classList.add('show');
        
        // Сохраняем данные для завершения хода после выбора
        this.promotionData = { fromRow, fromCol, toRow, toCol };
    }

    // Превращение пешки
    async promotePawn(pieceType) {
        const modal = document.getElementById('promotionModal');
        modal.classList.remove('show');
        
        const { fromRow, fromCol, toRow, toCol } = this.promotionData;
        
        // Делаем ход с превращением
        const success = this.chessEngine.makeMove(fromRow, fromCol, toRow, toCol, pieceType);
        
        if (success) {
            await this.animateMove(fromRow, fromCol, toRow, toCol);
            this.updateBoard();
            this.storage.saveGame(this.chessEngine);
            
            // Если игра не окончена, делаем ход ИИ
            if (!this.chessEngine.isGameOver && this.gameMode === 'vs-ai') {
                this.isPlayerTurn = false;
                await this.makeAIMove();
                this.isPlayerTurn = true;
            }
        }
        
        this.waitingForPromotion = false;
        this.promotionData = null;
    }

    // Ход ИИ
    async makeAIMove() {
        this.showLoadingScreen();
        
        try {
            const aiMove = await this.chessAI.getBestMove(this.chessEngine, (progress) => {
                // Обновляем прогресс если нужно
            });
            
            if (aiMove) {
                const success = this.chessEngine.makeMove(
                    aiMove.from.row, 
                    aiMove.from.col, 
                    aiMove.to.row, 
                    aiMove.to.col
                );
                
                if (success) {
                    await this.animateMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
                    this.updateBoard();
                    this.storage.saveGame(this.chessEngine);
                }
            }
        } catch (error) {
            console.error('Ошибка ИИ:', error);
        } finally {
            this.hideLoadingScreen();
        }
    }

    // Анимация хода
    async animateMove(fromRow, fromCol, toRow, toCol) {
        const fromSquare = this.getSquareElement(fromRow, fromCol);
        const toSquare = this.getSquareElement(toRow, toCol);
        
        if (!fromSquare || !toSquare) return;
        
        // Отмечаем последний ход
        this.boardElement.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });
        
        fromSquare.classList.add('last-move');
        toSquare.classList.add('last-move');
        
        // Простая анимация (можно улучшить)
        return new Promise(resolve => {
            setTimeout(resolve, this.animationDuration);
        });
    }

    // Обновление отображения текущего игрока
    updateCurrentPlayerDisplay() {
        const playerText = this.chessEngine.currentPlayer === 'white' ? 'Ход белых' : 'Ход черных';
        const icon = this.chessEngine.currentPlayer === 'white' ? '♔' : '♚';
        
        this.currentPlayerElement.innerHTML = `<i class="fas fa-chess-pawn"></i> ${playerText}`;
        
        // Показываем, под шахом ли король
        if (this.chessEngine.isInCheck(this.chessEngine.currentPlayer)) {
            this.currentPlayerElement.innerHTML += ' <span style="color: red;">(Шах!)</span>';
            
            // Подсвечиваем короля под шахом
            const king = this.chessEngine.findKing(this.chessEngine.currentPlayer);
            if (king) {
                const kingSquare = this.getSquareElement(king.row, king.col);
                kingSquare.classList.add('in-check');
            }
        } else {
            // Убираем подсветку шаха
            this.boardElement.querySelectorAll('.in-check').forEach(square => {
                square.classList.remove('in-check');
            });
        }
    }

    // Обновление истории ходов
    updateMoveHistory() {
        if (!this.moveHistoryElement) return;
        
        this.moveHistoryElement.innerHTML = '';
        
        const history = this.chessEngine.gameHistory;
        
        for (let i = 0; i < history.length; i += 2) {
            const moveDiv = document.createElement('div');
            moveDiv.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = history[i];
            const blackMove = history[i + 1];
            
            let moveText = `${moveNumber}. ${this.formatMove(whiteMove)}`;
            if (blackMove) {
                moveText += ` ${this.formatMove(blackMove)}`;
            }
            
            moveDiv.textContent = moveText;
            this.moveHistoryElement.appendChild(moveDiv);
        }
        
        // Прокручиваем в конец
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    // Форматирование хода для записи
    formatMove(moveData) {
        if (!moveData) return '';
        
        const piece = moveData.piece;
        const from = moveData.from;
        const to = moveData.to;
        
        const fromSquare = this.getSquareNotation(from.row, from.col);
        const toSquare = this.getSquareNotation(to.row, to.col);
        
        let notation = '';
        
        // Определяем тип фигуры
        const pieceType = this.chessEngine.getPieceType(piece);
        if (pieceType !== 'pawn') {
            const pieceSymbols = {
                'king': 'K', 'queen': 'Q', 'rook': 'R', 
                'bishop': 'B', 'knight': 'N'
            };
            notation += pieceSymbols[pieceType];
        }
        
        // Добавляем взятие
        if (moveData.capturedPiece) {
            if (pieceType === 'pawn') {
                notation += fromSquare[0]; // Файл пешки
            }
            notation += 'x';
        }
        
        notation += toSquare;
        
        // Специальные ходы
        if (moveData.moveType === 'castling') {
            notation = moveData.side === 'kingside' ? 'O-O' : 'O-O-O';
        }
        
        return notation;
    }

    // Получить нотацию клетки
    getSquareNotation(row, col) {
        const files = 'abcdefgh';
        const rank = 8 - row;
        return files[col] + rank;
    }

    // Обновление статуса игры
    updateGameStatus() {
        if (!this.gameStatusElement) return;
        
        const aiLevelElement = document.getElementById('aiLevel');
        const moveCountElement = document.getElementById('moveCount');
        const gameTimeElement = document.getElementById('gameTime');
        
        if (aiLevelElement) {
            aiLevelElement.textContent = this.chessAI.difficultyLevels[this.aiDifficulty].name;
        }
        
        if (moveCountElement) {
            moveCountElement.textContent = this.chessEngine.gameHistory.length;
        }
        
        if (gameTimeElement && this.gameStartTime) {
            const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Обновление захваченных фигур
    updateCapturedPieces() {
        const playerCaptured = document.getElementById('playerCaptured');
        const opponentCaptured = document.getElementById('opponentCaptured');
        
        if (playerCaptured) {
            playerCaptured.innerHTML = this.chessEngine.capturedPieces.black
                .map(piece => `<span class="piece">${piece}</span>`).join('');
        }
        
        if (opponentCaptured) {
            opponentCaptured.innerHTML = this.chessEngine.capturedPieces.white
                .map(piece => `<span class="piece">${piece}</span>`).join('');
        }
        
        // Обновляем очки
        const playerScore = document.getElementById('playerScore');
        const opponentScore = document.getElementById('opponentScore');
        
        if (playerScore) {
            const score = this.calculateCapturedScore('black');
            playerScore.textContent = `Очки: ${score}`;
        }
        
        if (opponentScore) {
            const score = this.calculateCapturedScore('white');
            opponentScore.textContent = `Очки: ${score}`;
        }
    }

    // Вычисление очков за захваченные фигуры
    calculateCapturedScore(color) {
        return this.chessEngine.capturedPieces[color].reduce((score, piece) => {
            const pieceType = this.chessEngine.getPieceType(piece);
            const values = { 'pawn': 1, 'knight': 3, 'bishop': 3, 'rook': 5, 'queen': 9 };
            return score + (values[pieceType] || 0);
        }, 0);
    }

    // Проверка окончания игры
    checkGameEnd() {
        if (this.chessEngine.isGameOver) {
            this.showGameOverModal();
        }
    }

    // Показать модальное окно окончания игры
    showGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        let titleText = '';
        let messageText = '';
        
        switch (this.chessEngine.gameResult) {
            case 'white_wins':
                titleText = this.playerColor === 'white' ? 'Победа!' : 'Поражение';
                messageText = 'Белые выиграли';
                break;
            case 'black_wins':
                titleText = this.playerColor === 'black' ? 'Победа!' : 'Поражение';
                messageText = 'Черные выиграли';
                break;
            case 'draw_stalemate':
                titleText = 'Ничья';
                messageText = 'Пат - нет возможных ходов';
                break;
            case 'draw_repetition':
                titleText = 'Ничья';
                messageText = 'Троекратное повторение позиции';
                break;
            case 'draw_fifty_move':
                titleText = 'Ничья';
                messageText = 'Правило 50 ходов';
                break;
            case 'draw_insufficient_material':
                titleText = 'Ничья';
                messageText = 'Недостаточно материала для мата';
                break;
        }
        
        title.textContent = titleText;
        message.textContent = messageText;
        modal.classList.add('show');
        
        // Сохраняем результат в статистику
        this.storage.saveGameResult(this.chessEngine.gameResult, this.aiDifficulty);
        
        // Останавливаем таймер
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    // Показать экран загрузки
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('show');
        }
    }

    // Скрыть экран загрузки
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('show');
        }
    }

    // Новая игра
    startNewGame(difficulty = 2) {
        this.chessEngine = new ChessEngine();
        this.chessAI.setDifficulty(difficulty);
        this.aiDifficulty = difficulty;
        
        this.selectedSquare = null;
        this.validMoves = [];
        this.isPlayerTurn = true;
        this.waitingForPromotion = false;
        
        this.gameStartTime = Date.now();
        
        // Запускаем таймер
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            this.updateGameStatus();
        }, 1000);
        
        this.initializeBoard();
        this.updateBoard();
        
        // Сохраняем начальное состояние
        this.storage.saveGame(this.chessEngine);
    }

    // Продолжить игру
    continueGame() {
        const savedGame = this.storage.loadGame();
        if (savedGame) {
            this.chessEngine = savedGame;
            this.gameStartTime = Date.now() - (this.chessEngine.gameHistory.length * 30000); // Примерное время
            
            this.initializeBoard();
            this.updateBoard();
            
            // Запускаем таймер
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            
            this.gameTimer = setInterval(() => {
                this.updateGameStatus();
            }, 1000);
        }
    }

    // Отменить ход
    undoMove() {
        if (this.chessEngine.gameHistory.length === 0) return;
        
        // Отменяем ход игрока
        this.chessEngine.undoLastMove();
        
        // Если играем против ИИ, отменяем и его ход
        if (this.gameMode === 'vs-ai' && this.chessEngine.gameHistory.length > 0) {
            this.chessEngine.undoLastMove();
        }
        
        this.clearSelection();
        this.updateBoard();
        this.storage.saveGame(this.chessEngine);
    }

    // Показать подсказку
    async showHint() {
        if (!this.isPlayerTurn) return;
        
        this.showLoadingScreen();
        
        try {
            const hint = await this.chessAI.getHint(this.chessEngine);
            
            if (hint) {
                // Подсвечиваем подсказку
                const fromSquare = this.getSquareElement(hint.from.row, hint.from.col);
                const toSquare = this.getSquareElement(hint.to.row, hint.to.col);
                
                fromSquare.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                toSquare.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
                
                // Убираем подсветку через 3 секунды
                setTimeout(() => {
                    fromSquare.style.backgroundColor = '';
                    toSquare.style.backgroundColor = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Ошибка при получении подсказки:', error);
        } finally {
            this.hideLoadingScreen();
        }
    }

    // Сдаться
    resignGame() {
        this.chessEngine.isGameOver = true;
        this.chessEngine.gameResult = this.playerColor === 'white' ? 'black_wins' : 'white_wins';
        this.showGameOverModal();
    }

    // Drag and Drop handlers
    handleDragStart(event) {
        const square = event.target.closest('.chess-square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.chessEngine.board[row][col];
        
        if (!piece || this.chessEngine.getPieceColor(piece) !== this.playerColor || !this.isPlayerTurn) {
            event.preventDefault();
            return;
        }
        
        this.draggedPiece = { row, col };
        square.classList.add('dragging');
        
        // Подсвечиваем возможные ходы
        this.selectSquare(row, col);
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    async handleDrop(event) {
        event.preventDefault();
        
        if (!this.draggedPiece) return;
        
        const square = event.target.closest('.chess-square');
        if (!square) return;
        
        const toRow = parseInt(square.dataset.row);
        const toCol = parseInt(square.dataset.col);
        
        // Убираем класс перетаскивания
        const draggedSquare = this.getSquareElement(this.draggedPiece.row, this.draggedPiece.col);
        draggedSquare.classList.remove('dragging');
        
        // Проверяем валидность хода
        const isValidMove = this.validMoves.some(move => 
            move.row === toRow && move.col === toCol
        );
        
        if (isValidMove) {
            await this.makePlayerMove(this.draggedPiece.row, this.draggedPiece.col, toRow, toCol);
        } else {
            this.clearSelection();
        }
        
        this.draggedPiece = null;
    }

    // Touch handlers для мобильных устройств
    handleTouchStart(event) {
        // Реализация touch событий для мобильных устройств
        // Можно расширить при необходимости
    }

    handleTouchMove(event) {
        event.preventDefault();
    }

    handleTouchEnd(event) {
        // Обработка окончания touch события
    }
}