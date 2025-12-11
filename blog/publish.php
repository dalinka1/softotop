<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Только POST запросы']);
    exit;
}

$language = $_POST['language'] ?? 'ru';
$author = $_POST['author'] ?? '';
$slug = $_POST['slug'] ?? '';
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$content = $_POST['content'] ?? '';

if (empty($language) || empty($author) || empty($slug) || empty($title) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit;
}

// ✅ ТРАНСЛИТЕРАЦИЯ ДЛЯ АВТОРА
$authorFolder = transliterate(strtolower($author));
$authorFolder = preg_replace('/[^a-z0-9-]/', '_', $authorFolder);
$authorFolder = trim($authorFolder, '_');

// ✅ ТРАНСЛИТЕРАЦИЯ ДЛЯ SLUG
$slug = transliterate(strtolower($slug));
$slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
$slug = trim($slug, '-');

// ✅ ИСПРАВЛЕНО: Статьи создаются в текущей директории
$blogPath = __DIR__;
$authorPath = $blogPath . '/' . $authorFolder;
$articlePath = $authorPath . '/' . $slug;

// ✅ НОВАЯ ПРОВЕРКА - ЗАПРЕТ ПОВТОРНОЙ ПУБЛИКАЦИИ ПО ОДНОМУ SLUG
if (is_dir($articlePath) && file_exists($articlePath . '/index.html')) {
    echo json_encode([
        'success' => false, 
        'message' => '⚠️ Статья с таким URL уже существует! Измените "Page URL" или удалите старую статью.'
    ]);
    exit;
}

// Создаем директории
if (!is_dir($blogPath)) {
    if (!mkdir($blogPath, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Ошибка создания папки blog']);
        exit;
    }
}

if (!is_dir($authorPath)) {
    if (!mkdir($authorPath, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Ошибка создания папки автора: ' . $authorFolder]);
        exit;
    }
}

if (!is_dir($articlePath)) {
    if (!mkdir($articlePath, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Ошибка создания папки статьи: ' . $slug]);
        exit;
    }
}

// Генерируем HTML статьи
$html = generateArticlePage($language, $author, $title, $description, $content, $authorFolder);
$filePath = $articlePath . '/index.html';

if (file_put_contents($filePath, $html) === false) {
    echo json_encode(['success' => false, 'message' => 'Ошибка записи файла index.html']);
    exit;
}

chmod($filePath, 0644);

// Обновляем страницу автора
createAuthorPage($authorFolder, $author, $language);

// ✅ ИСПРАВЛЕНО: URL без /relaxation/
$url = "https://softo.top/blog/{$authorFolder}/{$slug}/";

echo json_encode([
    'success' => true,
    'url' => $url,
    'language' => $language,
    'debug' => [
        'authorFolder' => $authorFolder,
        'slug' => $slug,
        'filePath' => realpath($filePath) ?: $filePath
    ]
]);

// ✅ ФУНКЦИЯ ТРАНСЛИТЕРАЦИИ
function transliterate($text) {
    $translitMap = [
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
        'е' => 'e', 'ё' => 'yo', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
        'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
        'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
        'у' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch',
        'ш' => 'sh', 'щ' => 'sch', 'ъ' => '', 'ы' => 'y', 'ь' => '',
        'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
        ' ' => '-', '_' => '-'
    ];
    
    $text = mb_strtolower($text, 'UTF-8');
    $result = '';
    
    for ($i = 0; $i < mb_strlen($text, 'UTF-8'); $i++) {
        $char = mb_substr($text, $i, 1, 'UTF-8');
        $result .= isset($translitMap[$char]) ? $translitMap[$char] : $char;
    }
    
    return $result;
}

// ✅ МНОГОЯЗЫЧНЫЙ ДИКЦИОНАРЬ (ОБНОВЛЕН С КНОПКОЙ "ЧИТАТЬ БЛОГИ")
function getTranslations($language) {
    $translations = [
        'ru' => [
            'all_articles' => '← Все статьи ',
            'powered_by' => 'Powered by ',
            'read_more' => 'Читать',
            'editor' => 'Редактор',
            'no_articles' => 'Пока нет статей',
            'articles_count_suffix' => ' статей',
            'read_blogs' => 'Читать блоги'
        ],
        'en' => [
            'all_articles' => '← All articles ',
            'powered_by' => 'Powered by ',
            'read_more' => 'Read',
            'editor' => 'Editor',
            'no_articles' => 'No articles yet',
            'articles_count_suffix' => ' articles',
            'read_blogs' => 'Read Blogs'
        ],
        'es' => [
            'all_articles' => '← Todos los artículos ',
            'powered_by' => 'Impulsado por ',
            'read_more' => 'Leer',
            'editor' => 'Editor',
            'no_articles' => 'Aún no hay artículos',
            'articles_count_suffix' => ' artículos',
            'read_blogs' => 'Leer Blogs'
        ],
        'de' => [
            'all_articles' => '← Alle Artikel ',
            'powered_by' => 'Von ',
            'read_more' => 'Lesen',
            'editor' => 'Editor',
            'no_articles' => 'Noch keine Artikel',
            'articles_count_suffix' => ' Artikel',
            'read_blogs' => 'Blogs lesen'
        ],
        'fr' => [
            'all_articles' => '← Tous les articles ',
            'powered_by' => 'Propulsé par ',
            'read_more' => 'Lire',
            'editor' => 'Éditeur',
            'no_articles' => 'Pas encore d\'articles',
            'articles_count_suffix' => ' articles',
            'read_blogs' => 'Lire les Blogs'
        ],
        'it' => [
            'all_articles' => '← Tutti gli articoli ',
            'powered_by' => 'Powered by ',
            'read_more' => 'Leggi',
            'editor' => 'Editore',
            'no_articles' => 'Nessun articolo ancora',
            'articles_count_suffix' => ' articoli',
            'read_blogs' => 'Leggi i Blog'
        ],
        'pl' => [
            'all_articles' => '← Wszystkie artykuły ',
            'powered_by' => 'Napędzane przez ',
            'read_more' => 'Czytaj',
            'editor' => 'Redaktor',
            'no_articles' => 'Jeszcze brak artykułów',
            'articles_count_suffix' => ' artykuły',
            'read_blogs' => 'Czytaj Blogi'
        ]
    ];
    return $translations[$language] ?? $translations['ru'];
}

// ✅ НАЗВАНИЕ ЯЗЫКА
function getLanguageName($language) {
    return [
        'ru' => 'Русский',
        'en' => 'English', 
        'es' => 'Español',
        'de' => 'Deutsch',
        'fr' => 'Français',
        'it' => 'Italiano',
        'pl' => 'Polski'
    ][$language] ?? 'Русский';
}

function generateArticlePage($language, $author, $title, $description, $content, $authorFolder) {
    $date = date('d.m.Y H:i');
    // ✅ ИСПРАВЛЕНО: URL без /relaxation/
    $authorUrl = "/blog/" . $authorFolder . "/";
    $langName = getLanguageName($language);
    $translations = getTranslations($language);

    $html = '<!DOCTYPE html>
<html lang="' . htmlspecialchars($language) . '">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="' . htmlspecialchars($description) . '">
    <meta property="og:title" content="' . htmlspecialchars($title) . '">
    <meta property="og:description" content="' . htmlspecialchars($description) . '">
    <title>' . htmlspecialchars($title) . ' | ' . htmlspecialchars($author) . '</title>
 <link rel="stylesheet" href="/menu/menu.css">
  <script src="/menu/menu.js" defer></script>
    <style>
        :root {
            --primary: #667eea;
            --primary-dark: #5a67d8;
            --accent: #764ba2;
            --text: #333;
            --text-light: #666;
            --bg: #f8f9fa;
            --white: #ffffff;
            --shadow: 0 10px 30px rgba(0,0,0,0.1);
            --shadow-hover: 0 20px 40px rgba(0,0,0,0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            line-height: 1.7; color: var(--text); background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh; overflow-x: hidden;
        }

        /* ✅ СУПЕР УЛУЧШЕННЫЕ СТИЛИ ДЛЯ ВСТРОЕННЫХ ВИДЕО */
        .video-wrapper {
            width: 900px;
            max-width: 100%;
            margin: 40px auto;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            position: relative;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            padding: 6px;
        }
        .video-wrapper::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.6s ease;
        }
        .video-wrapper:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 30px 80px rgba(102, 126, 234, 0.5);
        }
        .video-wrapper:hover::after {
            left: 100%;
        }
        .video-wrapper::before {
            content: "▶";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 5em;
            color: rgba(255,255,255,0.9);
            z-index: 1;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.4s ease;
            text-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .video-wrapper:hover::before {
            opacity: 0.4;
            animation: playPulse 1.5s ease-in-out infinite;
        }
        @keyframes playPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        .video-wrapper iframe {
            width: 100%;
            height: 500px;
            border: none;
            border-radius: 16px;
            background: #000;
            display: block;
            position: relative;
            z-index: 2;
        }

        /* ✅ АНИМАЦИЯ ПОЯВЛЕНИЯ */
        .fade-in { opacity: 0; transform: translateY(30px); animation: fadeInUp 0.6s ease forwards; }
        .fade-in:nth-child(1) { animation-delay: 0.1s; }
        .fade-in:nth-child(2) { animation-delay: 0.2s; }
        .fade-in:nth-child(3) { animation-delay: 0.3s; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

        .container { 
            max-width: 900px; margin: 40px auto; background: var(--white); 
            border-radius: 20px; box-shadow: var(--shadow); overflow: hidden;
            animation: slideIn 0.8s ease-out;
        }
        @keyframes slideIn { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .header { 
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); 
            color: white; padding: 50px 40px; text-align: center; position: relative;
            overflow: hidden;
        }
        .header::before {
            content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 10\'><defs><pattern id=\'grain\' width=\'100\' height=\'10\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'5\' r=\'1\' fill=\'white\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'10\' fill=\'url(%23grain)\'/></svg>");
        }
        .header h1 { 
            font-size: 2.8em; margin-bottom: 15px; position: relative; z-index: 2;
            background: linear-gradient(45deg, #fff, #f0f4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .meta { 
            display: flex; justify-content: center; gap: 30px; font-size: 1.1em; opacity: 0.95; position: relative; z-index: 2;
        }
        .meta span { 
            display: flex; align-items: center; gap: 8px; padding: 8px 16px; 
            background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        .meta span:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
        .meta a { color: white; text-decoration: none; font-weight: 600; }
        .meta a:hover { text-decoration: underline; }

        .content { padding: 60px 40px; font-size: 1.1em; }
        
        /* ✅ СУПЕР КРАСИВЫЕ ЗАГОЛОВКИ H1 - ГРАДИЕНТНЫЙ БЛОК */
        .content h1 { 
            font-size: 2.6em; 
            margin: 50px 0 25px; 
            position: relative; 
            padding: 25px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); 
            color: white;
            border-radius: 15px;
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
            animation: gradientFlow 8s ease infinite;
            background-size: 200% 200%;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content h1::before {
            content: ""; 
            position: absolute; 
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            border-radius: 15px;
            animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes gradientFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
        }

        /* ✅ СУПЕР КРАСИВЫЕ ЗАГОЛОВКИ H2 - БЕЗ СТРЕЛКИ */
        .content h2 { 
            font-size: 2em; 
            color: var(--text); 
            margin: 40px 0 20px;
            position: relative; 
            padding: 15px 25px;
            background: linear-gradient(120deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%);
            border-left: 5px solid var(--primary);
            border-radius: 0 10px 10px 0;
            transition: all 0.3s ease;
            font-weight: 600;
        }
        .content h2::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            transition: width 0.4s ease;
        }
        .content h2:hover {
            transform: translateX(5px);
            background: linear-gradient(120deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
            box-shadow: 0 8px 20px rgba(102,126,234,0.15);
        }
        .content h2:hover::after {
            width: 100%;
        }

        /* ✅ СУПЕР КРАСИВЫЕ ЗАГОЛОВКИ H3 - С ИКОНКОЙ */
        .content h3 { 
            font-size: 1.7em; 
            color: var(--text); 
            margin: 35px 0 18px;
            position: relative; 
            padding: 15px 25px 15px 60px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            font-weight: 600;
        }
        .content h3::before {
            content: "◆";
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.6em;
            box-shadow: 0 4px 12px rgba(102,126,234,0.3);
        }
        .content h3:hover { 
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(102,126,234,0.2);
        }

        /* ✅ СУПЕР КРАСИВЫЕ ЗАГОЛОВКИ H4 - РАМКА */
        .content h4 {
            font-size: 1.5em;
            color: var(--text);
            margin: 30px 0 15px;
            padding: 15px 25px;
            position: relative;
            border: 2px solid transparent;
            border-radius: 10px;
            background: 
                linear-gradient(white, white) padding-box,
                linear-gradient(135deg, var(--primary), var(--accent)) border-box;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            font-weight: 600;
        }
        .content h4:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(102,126,234,0.2);
        }

        /* ✅ СУПЕР КРАСИВЫЕ ЗАГОЛОВКИ H5 - ПОДЧЕРКНУТЫЙ */
        .content h5 {
            font-size: 1.3em;
            color: var(--primary);
            margin: 25px 0 12px;
            padding: 10px 0;
            position: relative;
            font-weight: 600;
            border-bottom: 3px solid transparent;
            border-image: linear-gradient(90deg, var(--primary), var(--accent), transparent) 1;
            transition: all 0.3s ease;
        }
        .content h5::before {
            content: "✦";
            margin-right: 10px;
            color: var(--accent);
            animation: rotate360 3s linear infinite;
            display: inline-block;
        }
        @keyframes rotate360 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .content h5:hover {
            color: var(--accent);
            padding-left: 10px;
        }

        /* ✅ СУПЕР КРАСИВЫЕ СПИСКИ */
        .content ul, .content ol { 
            margin: 25px 0; padding-left: 0; 
        }
        .content li { 
            margin: 12px 0; padding: 12px 20px; 
            background: var(--white); border-radius: 10px; 
            box-shadow: var(--shadow); position: relative; overflow: hidden;
            transition: all 0.3s ease; cursor: pointer;
        }
        .content li:hover { 
            transform: translateX(10px); box-shadow: var(--shadow-hover);
            background: linear-gradient(135deg, #f0f4ff, #e6e6ff);
        }

        /* МАРКИРОВАННЫЙ СПИСОК */
        .content ul li::before {
            content: "✦"; color: var(--primary); font-size: 1.2em; 
            position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
            animation: sparkle 1.5s ease-in-out infinite;
        }
        @keyframes sparkle { 
            0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
            50% { opacity: 0.7; transform: translateY(-50%) scale(1.2); }
        }

        /* НУМЕРОВАННЫЙ СПИСОК */
        .content ol { counter-reset: list-counter; }
        .content ol li::before {
            content: counter(list-counter); counter-increment: list-counter;
            position: absolute; left: 15px; top: 12px; 
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white; width: 25px; height: 25px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 0.9em;
            animation: pulseNumber 2s ease-in-out infinite;
        }
        @keyframes pulseNumber { 
            0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        }
        .content ol li { padding-left: 50px; }
        .content ul li { padding-left: 50px; }

        .content p { 
            margin-bottom: 20px; 
            line-height: 1.8; 
        }

        /* ✅ СУПЕР КРАСИВЫЕ ТАБЛИЦЫ */
        .content table { 
            border-collapse: collapse; width: 100%; margin: 25px 0; 
            background: var(--white); border-radius: 15px; overflow: hidden; 
            box-shadow: var(--shadow); animation: tableSlide 0.8s ease-out;
        }
        @keyframes tableSlide { from { transform: translateY(20px); opacity: 0; } }
        .content th { 
            background: linear-gradient(135deg, var(--primary), var(--accent)); 
            color: white; padding: 18px 20px; font-weight: 600; text-align: left;
            position: sticky; top: 0; z-index: 10;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 1px;
        }
        .content td { 
            padding: 16px 20px; border-bottom: 1px solid #e9ecef; 
            transition: all 0.2s ease;
        }
        .content tr:nth-child(even) { background: #f8f9ff; }
        .content tr:hover { 
            background: linear-gradient(90deg, #e3f2fd, #f0f4ff); 
            transform: scale(1.01); box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        /* ✅ НОВЫЙ ДИЗАЙН ЦИТАТ - СИНИЙ СТИЛЬ */
        .content blockquote { 
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
            border-left: 0;
            padding: 30px 35px 30px 80px; 
            margin: 35px 0; 
            border-radius: 15px; 
            font-style: italic; 
            color: #1565c0;
            position: relative; 
            box-shadow: 0 10px 35px rgba(33, 150, 243, 0.2);
            animation: quoteBreathe 4s ease-in-out infinite;
            font-size: 1.05em;
            line-height: 1.8;
        }
        @keyframes quoteBreathe {
            0%, 100% { transform: translateY(0px); box-shadow: 0 10px 35px rgba(33, 150, 243, 0.2); }
            50% { transform: translateY(-3px); box-shadow: 0 15px 45px rgba(33, 150, 243, 0.3); }
        }
        .content blockquote::before { 
            content: """; 
            font-size: 6em; 
            position: absolute; 
            left: 15px; 
            top: 10px; 
            color: #42a5f5;
            opacity: 0.4;
            font-family: Georgia, serif;
            line-height: 1;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .content blockquote::after {
            content: ""; 
            position: absolute; 
            top: 15px;
            right: 15px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #42a5f5, #2196f3);
            border-radius: 50%;
            opacity: 0.15;
        }

        /* ✅ СУПЕР УЛУЧШЕННЫЕ СТИЛИ ДЛЯ ИЗОБРАЖЕНИЙ */
        .content img { 
            max-width: 100%; 
            height: auto; 
            border-radius: 20px; 
            margin: 35px auto; 
            display: block;
            box-shadow: 0 15px 50px rgba(0,0,0,0.2); 
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
            cursor: pointer;
            border: 4px solid transparent;
            position: relative;
        }
        .content img:hover { 
            transform: scale(1.05) translateY(-8px) rotate(1deg); 
            box-shadow: 0 25px 70px rgba(102, 126, 234, 0.4);
            border-color: var(--primary);
        }

        .content a { 
            color: var(--primary); text-decoration: none; font-weight: 500;
            position: relative; transition: all 0.3s ease;
        }
        .content a::after {
            content: ""; position: absolute; bottom: -2px; left: 0;
            width: 0; height: 2px; background: var(--primary); transition: width 0.3s ease;
        }
        .content a:hover { color: var(--accent); }
        .content a:hover::after { width: 100%; }

        .footer { 
            background: var(--bg); padding: 30px 40px; text-align: center; 
            border-top: 1px solid #e9ecef; color: var(--text-light);
        }
        .footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .footer a:hover { text-decoration: underline; }
        .footer .powered { margin-top: 15px; font-size: 0.9em; }

        @media (max-width: 768px) { 
            .container { margin: 20px; border-radius: 12px; } 
            .header { padding: 30px 20px; } 
            .header h1 { font-size: 2em; } 
            .meta { flex-direction: column; gap: 15px; } 
            .content { padding: 30px 20px; } 
            .footer { padding: 20px; }
            .content h1 { font-size: 2em; padding: 20px 20px; }
            .content h2 { font-size: 1.6em; }
            .video-wrapper iframe { height: 300px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>' . htmlspecialchars($title) . '</h1>
            <div class="meta">
                <span>🌐 ' . $langName . '</span>
                <span>👤 <a href="' . $authorUrl . '">' . htmlspecialchars($author) . '</a></span>
                <span>📅 ' . $date . '</span>
            </div>
        </div>
        <div class="content">' . $content . '</div>
        <div class="footer">
            <p><a href="' . $authorUrl . '">' . $translations['all_articles'] . htmlspecialchars($author) . '</a></p>
            <p style="margin-top: 10px;"><a href="/blog/blogs.php" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">📚 ' . $translations['read_blogs'] . '</a></p>
            <div class="powered">' . $translations['powered_by'] . '<a href="https://softo.top" target="_blank">softo.top</a></div>
        </div>
    </div>
</body>
</html>';
    
    return $html;
}

function createAuthorPage($authorFolder, $author, $defaultLanguage = 'ru') {
    // ✅ ИСПРАВЛЕНО: Путь к папке автора
    $authorPath = __DIR__ . '/' . $authorFolder;
    
    $articles = [];
    $detectedLanguage = $defaultLanguage;
    
    if (is_dir($authorPath)) {
        $dirs = glob($authorPath . '/*', GLOB_ONLYDIR);
        foreach ($dirs as $dir) {
            $slug = basename($dir);
            $indexFile = $dir . '/index.html';
            if (is_file($indexFile)) {
                $content = file_get_contents($indexFile);
                
                // Определяем язык статьи
                if (preg_match('/<html lang="([^"]+)"/', $content, $langMatches)) {
                    $articleLang = $langMatches[1];
                    if (count($articles) === 0) {
                        $detectedLanguage = $articleLang;
                    }
                }
                
                if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $content, $matches)) {
                    $title = trim(strip_tags($matches[1]));
                    $articles[] = [
                        'title' => $title,
                        'slug' => $slug,
                        // ✅ ИСПРАВЛЕНО: URL без /relaxation/
                        'url' => "/blog/{$authorFolder}/{$slug}/"
                    ];
                }
            }
        }
        usort($articles, function($a, $b) use ($authorPath) {
            $fileA = $authorPath . '/' . $a['slug'] . '/index.html';
            $fileB = $authorPath . '/' . $b['slug'] . '/index.html';
            return filemtime($fileB) - filemtime($fileA);
        });
    }
    
    $html = generateAuthorPage($authorFolder, $author, $articles, $detectedLanguage);
    $authorIndex = $authorPath . '/index.html';
    file_put_contents($authorIndex, $html);
    chmod($authorIndex, 0644);
}

function generateAuthorPage($authorFolder, $author, $articles, $language = 'ru') {
    $count = count($articles);
    $translations = getTranslations($language);
    
    $articlesList = '';
    if (empty($articles)) {
        $articlesList = '<div style="text-align: center; padding: 40px; color: #666; font-size: 1.2em;">' . $translations['no_articles'] . '</div>';
    } else {
        $articlesList = '<div class="articles-grid">';
        foreach ($articles as $article) {
            $articlesList .= '
            <div class="article-card">
                <h3>' . htmlspecialchars($article['title']) . '</h3>
                <a href="' . $article['url'] . '" class="article-link">' . $translations['read_more'] . ' →</a>
            </div>';
        }
        $articlesList .= '</div>';
    }
    
    return '<!DOCTYPE html>
<html lang="' . htmlspecialchars($language) . '">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($author) . ' - ' . $translations['all_articles'] . '</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; 
            line-height: 1.7; color: #333; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .container { 
            max-width: 1000px; margin: 40px auto; background: white; 
            border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
            padding: 50px 40px; text-align: center;
        }
        .header h1 { font-size: 3em; margin-bottom: 10px; }
        .articles-count { font-size: 1.3em; opacity: 0.95; }
        .back-link { 
            display: inline-block; margin: 20px 40px; padding: 12px 20px; 
            background: #667eea; color: white; text-decoration: none; border-radius: 8px;
        }
        .back-link:hover { background: #5a67d8; }
        .articles-section { padding: 50px 40px; }
        .articles-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 25px; margin-top: 30px;
        }
        .article-card { 
            background: #f8f9fa; padding: 25px; border-radius: 12px; 
            transition: all 0.3s ease; border: 1px solid #e9ecef;
        }
        .article-card:hover { 
            transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }
        .article-card h3 { 
            font-size: 1.3em; color: #222; margin-bottom: 15px; line-height: 1.4;
        }
        .article-link { 
            display: inline-block; padding: 10px 20px; background: #667eea; 
            color: white; text-decoration: none; border-radius: 6px; font-weight: 600;
        }
        .article-link:hover { background: #5a67d8; }
        .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e9ecef; color: #666; font-size: 0.9em; }
        .footer a { color: #667eea; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        @media (max-width: 768px) { 
            .container { margin: 20px; } 
            .header { padding: 40px 20px; } 
            .header h1 { font-size: 2.2em; } 
            .articles-section { padding: 30px 20px; } 
            .articles-grid { grid-template-columns: 1fr; } 
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="display: flex; gap: 15px; margin: 20px 40px; flex-wrap: wrap;">
            <a href="/blog/" class="back-link">← ' . $translations['editor'] . '</a>
            <a href="/blog/blogs.php" class="back-link" style="background: linear-gradient(135deg, #667eea, #764ba2);">📚 ' . $translations['read_blogs'] . '</a>
        </div>
        <div class="header">
            <h1>👤 ' . htmlspecialchars($author) . '</h1>
            <p class="articles-count">' . $count . $translations['articles_count_suffix'] . '</p>
        </div>
        <div class="articles-section">
            ' . $articlesList . '
        </div>
        <div class="footer">
            <a href="https://softo.top" target="_blank">Powered by softo.top</a>
        </div>
    </div>
</body>
</html>';
}
?>