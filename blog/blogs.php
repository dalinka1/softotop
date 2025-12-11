<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ ПОЛУЧАЕМ ЯЗЫК ИЗ QUERY ПАРАМЕТРА (по умолчанию русский)
$currentLanguage = $_GET['lang'] ?? 'ru';

// ✅ ПОДКЛЮЧАЕМ ФУНКЦИЮ ТРАНСЛИТЕРАЦИИ ИЗ publish.php
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

// ✅ МНОГОЯЗЫЧНЫЙ СЛОВАРЬ
function getTranslations($language) {
    $translations = [
        'ru' => [
            'page_title' => 'Все Блоги',
            'page_subtitle' => 'Откройте для себя интересные Темы',
            'search_placeholder' => 'Поиск по блогам...',
            'no_results' => 'Блоги не найдены',
            'try_search' => 'Попробуйте изменить запрос',
            'read_more' => 'Читать',
            'by_author' => 'от',
            'create_new' => '✏️ Создать Тему',
            'all_blogs' => '📚 Все блоги',
            'previous' => '← Предыдущая',
            'next' => 'Следующая →',
            'page' => 'Страница'
        ],
        'en' => [
            'page_title' => 'All Blogs',
            'page_subtitle' => 'Discover interesting articles',
            'search_placeholder' => 'Search blogs...',
            'no_results' => 'No blogs found',
            'try_search' => 'Try changing your search query',
            'read_more' => 'Read',
            'by_author' => 'by',
            'create_new' => '✏️ Create Article',
            'all_blogs' => '📚 All Blogs',
            'previous' => '← Previous',
            'next' => 'Next →',
            'page' => 'Page'
        ],
        'es' => [
            'page_title' => 'Todos los Blogs',
            'page_subtitle' => 'Descubre artículos interesantes',
            'search_placeholder' => 'Buscar blogs...',
            'no_results' => 'No se encontraron blogs',
            'try_search' => 'Intenta cambiar tu búsqueda',
            'read_more' => 'Leer',
            'by_author' => 'por',
            'create_new' => '✏️ Crear Artículo',
            'all_blogs' => '📚 Todos los Blogs',
            'previous' => '← Anterior',
            'next' => 'Siguiente →',
            'page' => 'Página'
        ],
        'de' => [
            'page_title' => 'Alle Blogs',
            'page_subtitle' => 'Entdecke interessante Artikel',
            'search_placeholder' => 'Blogs durchsuchen...',
            'no_results' => 'Keine Blogs gefunden',
            'try_search' => 'Versuchen Sie eine andere Suche',
            'read_more' => 'Lesen',
            'by_author' => 'von',
            'create_new' => '✏️ Artikel erstellen',
            'all_blogs' => '📚 Alle Blogs',
            'previous' => '← Zurück',
            'next' => 'Weiter →',
            'page' => 'Seite'
        ],
        'fr' => [
            'page_title' => 'Tous les Blogs',
            'page_subtitle' => 'Découvrez des articles intéressants',
            'search_placeholder' => 'Rechercher des blogs...',
            'no_results' => 'Aucun blog trouvé',
            'try_search' => 'Essayez de modifier votre recherche',
            'read_more' => 'Lire',
            'by_author' => 'par',
            'create_new' => '✏️ Créer un Article',
            'all_blogs' => '📚 Tous les Blogs',
            'previous' => '← Précédent',
            'next' => 'Suivant →',
            'page' => 'Page'
        ],
        'it' => [
            'page_title' => 'Tutti i Blog',
            'page_subtitle' => 'Scopri articoli interessanti',
            'search_placeholder' => 'Cerca blog...',
            'no_results' => 'Nessun blog trovato',
            'try_search' => 'Prova a modificare la ricerca',
            'read_more' => 'Leggi',
            'by_author' => 'di',
            'create_new' => '✏️ Crea Articolo',
            'all_blogs' => '📚 Tutti i Blog',
            'previous' => '← Precedente',
            'next' => 'Successivo →',
            'page' => 'Pagina'
        ],
        'pl' => [
            'page_title' => 'Wszystkie Blogi',
            'page_subtitle' => 'Odkryj ciekawe artykuły',
            'search_placeholder' => 'Szukaj blogów...',
            'no_results' => 'Nie znaleziono blogów',
            'try_search' => 'Spróbuj zmienić zapytanie',
            'read_more' => 'Czytaj',
            'by_author' => 'autor',
            'create_new' => '✏️ Utwórz Artykuł',
            'all_blogs' => '📚 Wszystkie Blogi',
            'previous' => '← Poprzednia',
            'next' => 'Następna →',
            'page' => 'Strona'
        ]
    ];
    return $translations[$language] ?? $translations['ru'];
}

$t = getTranslations($currentLanguage);

// ✅ СБОР ВСЕХ СТАТЕЙ
$articles = [];
$blogPath = __DIR__;

if (is_dir($blogPath)) {
    $authorDirs = glob($blogPath . '/*', GLOB_ONLYDIR);
    
    foreach ($authorDirs as $authorDir) {
        $authorFolder = basename($authorDir);
        
        // Пропускаем системные папки
        if (in_array($authorFolder, ['menu', 'images', 'assets', 'css', 'js'])) {
            continue;
        }
        
        $articleDirs = glob($authorDir . '/*', GLOB_ONLYDIR);
        
        foreach ($articleDirs as $articleDir) {
            $slug = basename($articleDir);
            $indexFile = $articleDir . '/index.html';
            
            if (is_file($indexFile)) {
                $content = file_get_contents($indexFile);
                
                // Извлекаем заголовок
                if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $content, $titleMatches)) {
                    $fullTitle = trim(strip_tags($titleMatches[1]));
                    // Убираем автора из заголовка
                    $title = preg_replace('/\s*\|.*$/', '', $fullTitle);
                } else {
                    $title = $slug;
                }
                
                // Извлекаем автора
                $author = '';
                if (preg_match('/<a href="[^"]*">([^<]+)<\/a><\/span>\s*<span>📅/s', $content, $authorMatches)) {
                    $author = trim($authorMatches[1]);
                }
                
                // Извлекаем описание
                $description = '';
                if (preg_match('/<meta name="description" content="([^"]+)"/i', $content, $descMatches)) {
                    $description = trim($descMatches[1]);
                }
                
                // Извлекаем язык статьи
                $articleLang = 'ru';
                if (preg_match('/<html lang="([^"]+)"/', $content, $langMatches)) {
                    $articleLang = $langMatches[1];
                }
                
                $articles[] = [
                    'title' => $title,
                    'author' => $author,
                    'authorFolder' => $authorFolder,
                    'slug' => $slug,
                    'description' => $description,
                    'url' => "/blog/{$authorFolder}/{$slug}/",
                    'authorUrl' => "/blog/{$authorFolder}/",
                    'timestamp' => filemtime($indexFile),
                    'language' => $articleLang
                ];
            }
        }
    }
}

// Сортируем по дате (новые сначала)
usort($articles, function($a, $b) {
    return $b['timestamp'] - $a['timestamp'];
});

// ✅ ПОИСК
$searchQuery = $_GET['search'] ?? '';
if (!empty($searchQuery)) {
    $articles = array_filter($articles, function($article) use ($searchQuery) {
        $searchLower = mb_strtolower($searchQuery, 'UTF-8');
        return 
            mb_stripos($article['title'], $searchLower) !== false ||
            mb_stripos($article['author'], $searchLower) !== false ||
            mb_stripos($article['description'], $searchLower) !== false;
    });
}

// ✅ ПАГИНАЦИЯ
$itemsPerPage = 20;
$currentPage = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$totalArticles = count($articles);
$totalPages = ceil($totalArticles / $itemsPerPage);
$offset = ($currentPage - 1) * $itemsPerPage;
$paginatedArticles = array_slice($articles, $offset, $itemsPerPage);

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLanguage); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $t['page_title']; ?> - Blog</title>
    <link rel="stylesheet" href="/menu/menu.css">
    <script src="/menu/menu.js" defer></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.7; 
            color: #333; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            padding: 20px;
        }
        
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 60px 40px; 
            text-align: center;
            border-radius: 20px;
            margin-bottom: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'><defs><pattern id='grain' width='100' height='10' patternUnits='userSpaceOnUse'><circle cx='50' cy='5' r='1' fill='white' opacity='0.1'/></pattern></defs><rect width='100' height='10' fill='url(%23grain)'/></svg>");
        }
        
        .header h1 { 
            font-size: 3.5em; 
            margin-bottom: 15px; 
            position: relative; 
            z-index: 2;
            text-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        
        .header p { 
            font-size: 1.3em; 
            opacity: 0.95; 
            position: relative; 
            z-index: 2;
        }
        
        .top-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1em;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            display: inline-block;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }
        
        .search-container {
            max-width: 600px;
            margin: 0 auto 40px;
        }
        
        .search-box {
            display: flex;
            gap: 10px;
            background: white;
            padding: 10px;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .search-box:focus-within {
            box-shadow: 0 15px 50px rgba(102, 126, 234, 0.3);
            transform: translateY(-2px);
        }
        
        .search-box input {
            flex: 1;
            border: none;
            padding: 12px 20px;
            font-size: 1.1em;
            outline: none;
            background: transparent;
        }
        
        .search-box button {
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-box button:hover {
            transform: scale(1.05);
        }
        
        .articles-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
            gap: 30px; 
            margin-bottom: 50px;
        }
        
        .article-card { 
            background: white;
            padding: 30px; 
            border-radius: 20px; 
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .article-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transform: scaleX(0);
            transition: transform 0.4s ease;
        }
        
        .article-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
        }
        
        .article-card:hover::before {
            transform: scaleX(1);
        }
        
        .article-card h3 { 
            font-size: 1.6em; 
            color: #222; 
            margin-bottom: 12px; 
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .article-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 0.95em;
            color: #666;
            flex-wrap: wrap;
        }
        
        .article-meta a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        
        .article-meta a:hover {
            text-decoration: underline;
        }
        
        .article-description {
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .article-link { 
            display: inline-block; 
            padding: 12px 25px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; 
            text-decoration: none; 
            border-radius: 10px; 
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .article-link:hover { 
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin: 50px 0;
            flex-wrap: wrap;
        }
        
        .pagination a,
        .pagination span {
            padding: 12px 20px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .pagination a:hover {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .pagination .current {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .no-results {
            text-align: center;
            padding: 80px 20px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .no-results h2 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .no-results p {
            font-size: 1.2em;
            color: #666;
        }
        
        @media (max-width: 768px) { 
            .header h1 { font-size: 2.5em; } 
            .articles-grid { 
                grid-template-columns: 1fr; 
                gap: 20px;
            }
            .article-card { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 <?php echo $t['page_title']; ?></h1>
            <p><?php echo $t['page_subtitle']; ?></p>
        </div>
        
        <div class="top-buttons">
            <a href="/blog/" class="btn"><?php echo $t['create_new']; ?></a>
        </div>
        
        <div class="search-container">
            <form method="GET" action="" class="search-box">
                <input 
                    type="text" 
                    name="search" 
                    placeholder="<?php echo $t['search_placeholder']; ?>"
                    value="<?php echo htmlspecialchars($searchQuery); ?>"
                >
                <button type="submit">🔍</button>
            </form>
        </div>
        
        <?php if (empty($paginatedArticles)): ?>
            <div class="no-results">
                <h2>🔍 <?php echo $t['no_results']; ?></h2>
                <p><?php echo $t['try_search']; ?></p>
            </div>
        <?php else: ?>
            <div class="articles-grid">
                <?php foreach ($paginatedArticles as $article): ?>
                    <div class="article-card">
                        <h3><?php echo htmlspecialchars($article['title']); ?></h3>
                        
                        <div class="article-meta">
                            <span>👤 <a href="<?php echo $article['authorUrl']; ?>"><?php echo htmlspecialchars($article['author']); ?></a></span>
                            <span>🌐 <?php echo strtoupper($article['language']); ?></span>
                        </div>
                        
                        <?php if (!empty($article['description'])): ?>
                            <p class="article-description"><?php echo htmlspecialchars($article['description']); ?></p>
                        <?php endif; ?>
                        
                        <a href="<?php echo $article['url']; ?>" class="article-link">
                            <?php echo $t['read_more']; ?> →
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <?php if ($totalPages > 1): ?>
                <div class="pagination">
                    <?php if ($currentPage > 1): ?>
                        <a href="?page=<?php echo $currentPage - 1; ?><?php echo !empty($searchQuery) ? '&search=' . urlencode($searchQuery) : ''; ?>">
                            <?php echo $t['previous']; ?>
                        </a>
                    <?php endif; ?>
                    
                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <?php if ($i == $currentPage): ?>
                            <span class="current"><?php echo $i; ?></span>
                        <?php else: ?>
                            <a href="?page=<?php echo $i; ?><?php echo !empty($searchQuery) ? '&search=' . urlencode($searchQuery) : ''; ?>">
                                <?php echo $i; ?>
                            </a>
                        <?php endif; ?>
                    <?php endfor; ?>
                    
                    <?php if ($currentPage < $totalPages): ?>
                        <a href="?page=<?php echo $currentPage + 1; ?><?php echo !empty($searchQuery) ? '&search=' . urlencode($searchQuery) : ''; ?>">
                            <?php echo $t['next']; ?>
                        </a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</body>
</html>