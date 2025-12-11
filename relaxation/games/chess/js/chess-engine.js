/**
 * Шахматный движок - основная логика игры
 * Реализует все правила шахмат включая специальные ходы
 */
class ChessEngine {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.isGameOver = false;
        this.gameResult = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.positionHistory = [];
    }

    // Создание начальной позиции
    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Белые фигуры
        board[7] = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
        board[6] = Array(8).fill('♙');
        
        // Черные фигуры
        board[1] = Array(8).fill('♟');
        board[0] = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
        
        return board;
    }

    // Получить тип фигуры
    getPieceType(piece) {
        if (!piece) return null;
        
        const pieceTypes = {
            '♔': 'king', '♕': 'queen', '♖': 'rook', '♗': 'bishop', '♘': 'knight', '♙': 'pawn',
            '♚': 'king', '♛': 'queen', '♜': 'rook', '♝': 'bishop', '♞': 'knight', '♟': 'pawn'
        };
        
        return pieceTypes[piece] || null;
    }

    // Получить цвет фигуры
    getPieceColor(piece) {
        if (!piece) return null;
        
        const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
        return whitePieces.includes(piece) ? 'white' : 'black';
    }

    // Проверка, находится ли позиция на доске
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Получить все возможные ходы для фигуры
    getPossibleMoves(fromRow, fromCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return [];
        
        const pieceColor = this.getPieceColor(piece);
        if (pieceColor !== this.currentPlayer) return [];
        
        const pieceType = this.getPieceType(piece);
        let moves = [];
        
        switch (pieceType) {
            case 'pawn':
                moves = this.getPawnMoves(fromRow, fromCol);
                break;
            case 'rook':
                moves = this.getRookMoves(fromRow, fromCol);
                break;
            case 'knight':
                moves = this.getKnightMoves(fromRow, fromCol);
                break;
            case 'bishop':
                moves = this.getBishopMoves(fromRow, fromCol);
                break;
            case 'queen':
                moves = this.getQueenMoves(fromRow, fromCol);
                break;
            case 'king':
                moves = this.getKingMoves(fromRow, fromCol);
                break;
        }
        
        // Фильтруем ходы, которые ставят короля под шах
        return moves.filter(move => {
            return !this.wouldBeInCheckAfterMove(fromRow, fromCol, move.row, move.col);
        });
    }

    // Ходы пешки
    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Движение вперед на одну клетку
        const newRow = row + direction;
        if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
            moves.push({ row: newRow, col, type: 'move' });
            
            // Движение на две клетки с начальной позиции
            if (row === startRow) {
                const twoStepsRow = row + direction * 2;
                if (this.isValidPosition(twoStepsRow, col) && !this.board[twoStepsRow][col]) {
                    moves.push({ row: twoStepsRow, col, type: 'move' });
                }
            }
        }
        
        // Взятие по диагонали
        for (const colOffset of [-1, 1]) {
            const attackRow = row + direction;
            const attackCol = col + colOffset;
            
            if (this.isValidPosition(attackRow, attackCol)) {
                const targetPiece = this.board[attackRow][attackCol];
                if (targetPiece && this.getPieceColor(targetPiece) !== color) {
                    moves.push({ row: attackRow, col: attackCol, type: 'capture' });
                }
                
                // Взятие на проходе
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === attackRow && 
                    this.enPassantTarget.col === attackCol) {
                    moves.push({ row: attackRow, col: attackCol, type: 'enpassant' });
                }
            }
        }
        
        return moves;
    }

    // Ходы ладьи
    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else {
                    if (this.getPieceColor(targetPiece) !== this.getPieceColor(this.board[row][col])) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    // Ходы коня
    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        const pieceColor = this.getPieceColor(this.board[row][col]);
        
        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.getPieceColor(targetPiece) !== pieceColor) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }
        
        return moves;
    }

    // Ходы слона
    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else {
                    if (this.getPieceColor(targetPiece) !== this.getPieceColor(this.board[row][col])) {
                        moves.push({ row: newRow, col: newCol, type: 'capture' });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    // Ходы ферзя
    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    // Ходы короля
    getKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const pieceColor = this.getPieceColor(this.board[row][col]);
        
        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || this.getPieceColor(targetPiece) !== pieceColor) {
                    moves.push({ 
                        row: newRow, 
                        col: newCol, 
                        type: targetPiece ? 'capture' : 'move' 
                    });
                }
            }
        }
        
        // Рокировка
        moves.push(...this.getCastlingMoves(row, col));
        
        return moves;
    }

    // Рокировка
    getCastlingMoves(kingRow, kingCol) {
        const moves = [];
        const color = this.getPieceColor(this.board[kingRow][kingCol]);
        
        if (this.isInCheck(color)) return moves;
        
        // Короткая рокировка
        if (this.castlingRights[color].kingside) {
            if (this.board[kingRow][kingCol + 1] === null && 
                this.board[kingRow][kingCol + 2] === null &&
                !this.isSquareAttacked(kingRow, kingCol + 1, color) &&
                !this.isSquareAttacked(kingRow, kingCol + 2, color)) {
                moves.push({ row: kingRow, col: kingCol + 2, type: 'castling', side: 'kingside' });
            }
        }
        
        // Длинная рокировка
        if (this.castlingRights[color].queenside) {
            if (this.board[kingRow][kingCol - 1] === null && 
                this.board[kingRow][kingCol - 2] === null &&
                this.board[kingRow][kingCol - 3] === null &&
                !this.isSquareAttacked(kingRow, kingCol - 1, color) &&
                !this.isSquareAttacked(kingRow, kingCol - 2, color)) {
                moves.push({ row: kingRow, col: kingCol - 2, type: 'castling', side: 'queenside' });
            }
        }
        
        return moves;
    }

    // Проверка, атакована ли клетка
    isSquareAttacked(row, col, defendingColor) {
        const attackingColor = defendingColor === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && this.getPieceColor(piece) === attackingColor) {
                    const moves = this.getPieceMovesIgnoringCheck(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // Получить ходы фигуры без проверки на шах
    getPieceMovesIgnoringCheck(fromRow, fromCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return [];
        
        const pieceType = this.getPieceType(piece);
        
        switch (pieceType) {
            case 'pawn':
                return this.getPawnMovesIgnoringCheck(fromRow, fromCol);
            case 'rook':
                return this.getRookMoves(fromRow, fromCol);
            case 'knight':
                return this.getKnightMoves(fromRow, fromCol);
            case 'bishop':
                return this.getBishopMoves(fromRow, fromCol);
            case 'queen':
                return this.getQueenMoves(fromRow, fromCol);
            case 'king':
                return this.getKingMovesIgnoringCastling(fromRow, fromCol);
            default:
                return [];
        }
    }

    // Ходы пешки без проверки на шах
    getPawnMovesIgnoringCheck(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const color = this.getPieceColor(piece);
        const direction = color === 'white' ? -1 : 1;
        
        // Взятие по диагонали
        for (const colOffset of [-1, 1]) {
            const attackRow = row + direction;
            const attackCol = col + colOffset;
            
            if (this.isValidPosition(attackRow, attackCol)) {
                moves.push({ row: attackRow, col: attackCol, type: 'capture' });
            }
        }
        
        return moves;
    }

    // Ходы короля без рокировки
    getKingMovesIgnoringCastling(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const pieceColor = this.getPieceColor(this.board[row][col]);
        
        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || this.getPieceColor(targetPiece) !== pieceColor) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                }
            }
        }
        
        return moves;
    }

    // Найти короля
    findKing(color) {
        const kingPiece = color === 'white' ? '♔' : '♚';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === kingPiece) {
                    return { row, col };
                }
            }
        }
        
        return null;
    }

    // Проверка на шах
    isInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;
        
        return this.isSquareAttacked(king.row, king.col, color);
    }

    // Проверка, будет ли шах после хода
    wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol) {
        // Сохраняем состояние
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        const color = this.getPieceColor(movingPiece);
        
        // Делаем временный ход
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        
        // Проверяем шах
        const inCheck = this.isInCheck(color);
        
        // Восстанавливаем состояние
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }

    // Выполнить ход
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
        const move = possibleMoves.find(m => m.row === toRow && m.col === toCol);
        
        if (!move) return false;
        
        // Сохраняем ход в истории
        const moveData = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            capturedPiece: this.board[toRow][toCol],
            moveType: move.type,
            enPassantTarget: this.enPassantTarget,
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            halfMoveClock: this.halfMoveClock
        };
        
        this.gameHistory.push(moveData);
        
        // Выполняем ход
        this.executeMove(moveData, promotionPiece);
        
        // Обновляем состояние игры
        this.updateGameState(moveData);
        
        // Проверяем окончание игры
        this.checkGameEnd();
        
        return true;
    }

    // Выполнить ход
    executeMove(moveData, promotionPiece) {
        const { from, to, moveType } = moveData;
        
        // Обычный ход или взятие
        if (moveData.capturedPiece) {
            const capturedColor = this.getPieceColor(moveData.capturedPiece);
            this.capturedPieces[capturedColor].push(moveData.capturedPiece);
        }
        
        this.board[to.row][to.col] = this.board[from.row][from.col];
        this.board[from.row][from.col] = null;
        
        // Специальные ходы
        switch (moveType) {
            case 'castling':
                this.executeCastling(moveData);
                break;
            case 'enpassant':
                this.executeEnPassant(moveData);
                break;
        }
        
        // Превращение пешки
        if (this.isPawnPromotion(to.row, to.col)) {
            this.promotePawn(to.row, to.col, promotionPiece);
        }
    }

    // Рокировка
    executeCastling(moveData) {
        const { to } = moveData;
        const row = to.row;
        const color = this.currentPlayer;
        
        if (moveData.moveType === 'castling') {
            if (moveData.side === 'kingside') {
                // Короткая рокировка
                this.board[row][5] = this.board[row][7]; // Ладья
                this.board[row][7] = null;
            } else {
                // Длинная рокировка
                this.board[row][3] = this.board[row][0]; // Ладья
                this.board[row][0] = null;
            }
        }
    }

    // Взятие на проходе
    executeEnPassant(moveData) {
        const { to } = moveData;
        const direction = this.currentPlayer === 'white' ? 1 : -1;
        const capturedPawnRow = to.row + direction;
        
        const capturedPawn = this.board[capturedPawnRow][to.col];
        this.capturedPieces[this.getPieceColor(capturedPawn)].push(capturedPawn);
        this.board[capturedPawnRow][to.col] = null;
    }

    // Проверка на превращение пешки
    isPawnPromotion(row, col) {
        const piece = this.board[row][col];
        const pieceType = this.getPieceType(piece);
        
        if (pieceType !== 'pawn') return false;
        
        const color = this.getPieceColor(piece);
        return (color === 'white' && row === 0) || (color === 'black' && row === 7);
    }

    // Превращение пешки
    promotePawn(row, col, pieceType = 'queen') {
        const color = this.getPieceColor(this.board[row][col]);
        
        const promotionPieces = {
            white: { queen: '♕', rook: '♖', bishop: '♗', knight: '♘' },
            black: { queen: '♛', rook: '♜', bishop: '♝', knight: '♞' }
        };
        
        this.board[row][col] = promotionPieces[color][pieceType];
    }

    // Обновление состояния игры
    updateGameState(moveData) {
        const { piece, capturedPiece, from, to, moveType } = moveData;
        
        // Обновляем права на рокировку
        this.updateCastlingRights(moveData);
        
        // Обновляем цель для взятия на проходе
        this.updateEnPassantTarget(moveData);
        
        // Обновляем счетчик полуходов
        if (this.getPieceType(piece) === 'pawn' || capturedPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }
        
        // Смена хода
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        if (this.currentPlayer === 'white') {
            this.fullMoveNumber++;
        }
        
        // Сохраняем позицию для проверки на повторение
        this.positionHistory.push(this.getBoardHash());
    }

    // Обновление прав на рокировку
    updateCastlingRights(moveData) {
        const { piece, from, to } = moveData;
        const pieceType = this.getPieceType(piece);
        const color = this.getPieceColor(piece);
        
        // Король сдвинулся
        if (pieceType === 'king') {
            this.castlingRights[color].kingside = false;
            this.castlingRights[color].queenside = false;
        }
        
        // Ладья сдвинулась
        if (pieceType === 'rook') {
            if (from.col === 0) { // Ферзевый фланг
                this.castlingRights[color].queenside = false;
            } else if (from.col === 7) { // Королевский фланг
                this.castlingRights[color].kingside = false;
            }
        }
        
        // Ладья была взята
        if (to.row === 0) { // Черные ладьи
            if (to.col === 0) this.castlingRights.black.queenside = false;
            if (to.col === 7) this.castlingRights.black.kingside = false;
        } else if (to.row === 7) { // Белые ладьи
            if (to.col === 0) this.castlingRights.white.queenside = false;
            if (to.col === 7) this.castlingRights.white.kingside = false;
        }
    }

    // Обновление цели для взятия на проходе
    updateEnPassantTarget(moveData) {
        const { piece, from, to } = moveData;
        this.enPassantTarget = null;
        
        if (this.getPieceType(piece) === 'pawn' && Math.abs(from.row - to.row) === 2) {
            this.enPassantTarget = {
                row: (from.row + to.row) / 2,
                col: to.col
            };
        }
    }

    // Получить хэш позиции для проверки на повторение
    getBoardHash() {
        let hash = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                hash += this.board[row][col] || '0';
            }
        }
        hash += this.currentPlayer;
        hash += JSON.stringify(this.castlingRights);
        hash += JSON.stringify(this.enPassantTarget);
        return hash;
    }

    // Проверка окончания игры
    checkGameEnd() {
        const hasLegalMoves = this.hasLegalMoves(this.currentPlayer);
        const inCheck = this.isInCheck(this.currentPlayer);
        
        if (!hasLegalMoves) {
            if (inCheck) {
                // Мат
                this.isGameOver = true;
                this.gameResult = this.currentPlayer === 'white' ? 'black_wins' : 'white_wins';
            } else {
                // Пат
                this.isGameOver = true;
                this.gameResult = 'draw_stalemate';
            }
        } else if (this.isDrawByRepetition()) {
            this.isGameOver = true;
            this.gameResult = 'draw_repetition';
        } else if (this.halfMoveClock >= 100) {
            this.isGameOver = true;
            this.gameResult = 'draw_fifty_move';
        } else if (this.isDrawByInsufficientMaterial()) {
            this.isGameOver = true;
            this.gameResult = 'draw_insufficient_material';
        }
    }

    // Проверка наличия легальных ходов
    hasLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.getPieceColor(piece) === color) {
                    const moves = this.getPossibleMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Проверка на ничью по повторению
    isDrawByRepetition() {
        const currentPosition = this.getBoardHash();
        let count = 0;
        
        for (const position of this.positionHistory) {
            if (position === currentPosition) {
                count++;
                if (count >= 3) return true;
            }
        }
        
        return false;
    }

    // Проверка на ничью по недостатку материала
    isDrawByInsufficientMaterial() {
        const pieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    pieces.push({
                        type: this.getPieceType(piece),
                        color: this.getPieceColor(piece)
                    });
                }
            }
        }
        
        // Только короли
        if (pieces.length === 2) return true;
        
        // Король и слон/конь против короля
        if (pieces.length === 3) {
            const nonKings = pieces.filter(p => p.type !== 'king');
            if (nonKings.length === 1 && 
                (nonKings[0].type === 'bishop' || nonKings[0].type === 'knight')) {
                return true;
            }
        }
        
        // Король и слон против короля и слона одного цвета
        if (pieces.length === 4) {
            const bishops = pieces.filter(p => p.type === 'bishop');
            if (bishops.length === 2) {
                // Проверяем, что слоны на клетках одного цвета
                let bishopPositions = [];
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        if (this.getPieceType(this.board[row][col]) === 'bishop') {
                            bishopPositions.push((row + col) % 2);
                        }
                    }
                }
                if (bishopPositions[0] === bishopPositions[1]) return true;
            }
        }
        
        return false;
    }

    // Отменить последний ход
    undoLastMove() {
        if (this.gameHistory.length === 0) return false;
        
        const lastMove = this.gameHistory.pop();
        this.positionHistory.pop();
        
        // Восстанавливаем позицию
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
        
        // Восстанавливаем специальные ходы
        if (lastMove.moveType === 'castling') {
            this.undoCastling(lastMove);
        } else if (lastMove.moveType === 'enpassant') {
            this.undoEnPassant(lastMove);
        }
        
        // Восстанавливаем состояние
        this.enPassantTarget = lastMove.enPassantTarget;
        this.castlingRights = lastMove.castlingRights;
        this.halfMoveClock = lastMove.halfMoveClock;
        
        // Возвращаем взятую фигуру
        if (lastMove.capturedPiece) {
            const capturedColor = this.getPieceColor(lastMove.capturedPiece);
            const capturedPieces = this.capturedPieces[capturedColor];
            const index = capturedPieces.indexOf(lastMove.capturedPiece);
            if (index > -1) {
                capturedPieces.splice(index, 1);
            }
        }
        
        // Смена хода
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        if (this.currentPlayer === 'black') {
            this.fullMoveNumber--;
        }
        
        // Сброс состояния игры
        this.isGameOver = false;
        this.gameResult = null;
        
        return true;
    }

    // Отмена рокировки
    undoCastling(moveData) {
        const row = moveData.to.row;
        
        if (moveData.side === 'kingside') {
            this.board[row][7] = this.board[row][5];
            this.board[row][5] = null;
        } else {
            this.board[row][0] = this.board[row][3];
            this.board[row][3] = null;
        }
    }

    // Отмена взятия на проходе
    undoEnPassant(moveData) {
        const direction = this.getPieceColor(moveData.piece) === 'white' ? 1 : -1;
        const capturedPawnRow = moveData.to.row + direction;
        
        this.board[capturedPawnRow][moveData.to.col] = moveData.capturedPiece;
        
        // Убираем из списка взятых фигур
        const capturedColor = this.getPieceColor(moveData.capturedPiece);
        const capturedPieces = this.capturedPieces[capturedColor];
        const index = capturedPieces.indexOf(moveData.capturedPiece);
        if (index > -1) {
            capturedPieces.splice(index, 1);
        }
    }

    // Получить оценку позиции
    evaluatePosition() {
        let score = 0;
        
        const pieceValues = {
            'pawn': 1,
            'knight': 3,
            'bishop': 3,
            'rook': 5,
            'queen': 9,
            'king': 0
        };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const pieceType = this.getPieceType(piece);
                    const pieceColor = this.getPieceColor(piece);
                    const value = pieceValues[pieceType] || 0;
                    
                    if (pieceColor === 'white') {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }
        
        return score;
    }

    // Копировать двигатель для анализа
    clone() {
        const newEngine = new ChessEngine();
        newEngine.board = this.board.map(row => [...row]);
        newEngine.currentPlayer = this.currentPlayer;
        newEngine.gameHistory = [...this.gameHistory];
        newEngine.capturedPieces = {
            white: [...this.capturedPieces.white],
            black: [...this.capturedPieces.black]
        };
        newEngine.isGameOver = this.isGameOver;
        newEngine.gameResult = this.gameResult;
        newEngine.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
        newEngine.castlingRights = JSON.parse(JSON.stringify(this.castlingRights));
        newEngine.halfMoveClock = this.halfMoveClock;
        newEngine.fullMoveNumber = this.fullMoveNumber;
        newEngine.positionHistory = [...this.positionHistory];
        
        return newEngine;
    }
}