<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Настройки
define('DB_FILE', 'library.db');
define('UPLOAD_DIR', 'uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB

// Создание директории для загрузок
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Подключение к базе данных
function getDB() {
    $db = new SQLite3(DB_FILE);
    
    // Создание таблицы с полем автора
    $db->exec('CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        filename TEXT NOT NULL,
        format TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )');
    
    // Добавляем поле author если его нет (для обновления существующих баз)
    try {
        $db->exec('ALTER TABLE books ADD COLUMN author TEXT');
    } catch (Exception $e) {
        // Поле уже существует, игнорируем ошибку
    }
    
    return $db;
}

// Получение действия
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            listBooks();
            break;
            
        case 'upload':
            uploadBook();
            break;
            
        case 'read':
            readBook();
            break;
            
        case 'delete':
            deleteBook();
            break;
            
        default:
            throw new Exception('Неизвестное действие');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Список всех книг
function listBooks() {
    $db = getDB();
    $result = $db->query('SELECT * FROM books ORDER BY uploaded_at DESC');
    
    $books = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $books[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'books' => $books
    ]);
}

// Загрузка книги
function uploadBook() {
    if (!isset($_FILES['file'])) {
        throw new Exception('Файл не загружен');
    }
    
    $file = $_FILES['file'];
    
    // Проверка ошибок загрузки
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Ошибка загрузки файла');
    }
    
    // Проверка размера
    if ($file['size'] > MAX_FILE_SIZE) {
        throw new Exception('Файл слишком большой (макс. 50MB)');
    }
    
    // Определение формата
    $pathinfo = pathinfo($file['name']);
    $format = strtolower($pathinfo['extension'] ?? '');
    
    $allowedFormats = ['txt', 'fb2', 'pdf', 'epub', 'doc', 'docx'];
    if (!in_array($format, $allowedFormats)) {
        throw new Exception('Неподдерживаемый формат файла');
    }
    
    // Получение автора и названия
    $author = $_POST['author'] ?? '';
    $customTitle = $_POST['custom_title'] ?? '';
    $title = $customTitle ?: $pathinfo['filename'];
    
    // Генерация уникального имени файла
    $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
    $filepath = UPLOAD_DIR . $filename;
    
    // Перемещение файла
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Не удалось сохранить файл');
    }
    
    // Сохранение в БД
    $db = getDB();
    $stmt = $db->prepare('INSERT INTO books (title, author, filename, format, size) VALUES (:title, :author, :filename, :format, :size)');
    $stmt->bindValue(':title', $title, SQLITE3_TEXT);
    $stmt->bindValue(':author', $author, SQLITE3_TEXT);
    $stmt->bindValue(':filename', $filename, SQLITE3_TEXT);
    $stmt->bindValue(':format', $format, SQLITE3_TEXT);
    $stmt->bindValue(':size', $file['size'], SQLITE3_INTEGER);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'id' => $db->lastInsertRowID()
    ]);
}

// Чтение книги
function readBook() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        throw new Exception('ID не указан');
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM books WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $book = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$book) {
        throw new Exception('Книга не найдена');
    }
    
    $filepath = UPLOAD_DIR . $book['filename'];
    
    if (!file_exists($filepath)) {
        throw new Exception('Файл не найден');
    }
    
    // Для PDF отправляем путь к файлу, для текстовых - содержимое
    if ($book['format'] === 'pdf') {
        echo json_encode([
            'success' => true,
            'content' => null,
            'filepath' => $filepath
        ]);
    } else {
        // Чтение текстового содержимого
        $content = readTextContent($filepath, $book['format']);
        
        echo json_encode([
            'success' => true,
            'content' => $content
        ]);
    }
}

// Чтение текстового содержимого с поддержкой разных кодировок
function readTextContent($filepath, $format) {
    $content = file_get_contents($filepath);
    
    if ($format === 'fb2' || $format === 'epub') {
        // FB2 и EPUB - это XML, возвращаем как есть
        return $content;
    }
    
    // TXT, DOC - пытаемся определить кодировку
    $encoding = mb_detect_encoding($content, ['UTF-8', 'Windows-1251', 'CP1251', 'KOI8-R', 'ISO-8859-5'], true);
    
    if ($encoding && $encoding !== 'UTF-8') {
        $content = mb_convert_encoding($content, 'UTF-8', $encoding);
    }
    
    // Для DOC/DOCX - базовая экстракция текста (требует дополнительных библиотек для полноценной поддержки)
    if ($format === 'doc' || $format === 'docx') {
        // Упрощенная версия - просто возвращаем содержимое
        // Для полной поддержки нужны библиотеки типа PHPWord
        $content = strip_tags($content);
    }
    
    return $content;
}

// Удаление книги
function deleteBook() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        throw new Exception('ID не указан');
    }
    
    $db = getDB();
    
    // Получение информации о книге
    $stmt = $db->prepare('SELECT * FROM books WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $book = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$book) {
        throw new Exception('Книга не найдена');
    }
    
    // Удаление файла
    $filepath = UPLOAD_DIR . $book['filename'];
    if (file_exists($filepath)) {
        unlink($filepath);
    }
    
    // Удаление из БД
    $stmt = $db->prepare('DELETE FROM books WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->execute();
    
    echo json_encode([
        'success' => true
    ]);
}
?>