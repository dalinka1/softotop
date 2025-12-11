<?php
/**
 * Серверный API для сохранения списков URL в отдельные текстовые файлы
 */

// Разрешаем CORS для локальной разработки
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Директория для хранения списков URL
define('URL_LISTS_DIR', __DIR__ . '/url_lists');
define('RESULTS_DIR', __DIR__ . '/results');

// Создаем директории, если они не существуют
if (!file_exists(URL_LISTS_DIR)) {
    mkdir(URL_LISTS_DIR, 0755, true);
}
if (!file_exists(RESULTS_DIR)) {
    mkdir(RESULTS_DIR, 0755, true);
}

// Получаем действие из параметров
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Функции для работы с файлами
function saveUrlListToFile($data) {
    try {
        $listId = $data['id'];
        $urls = $data['urls'];
        $name = isset($data['name']) ? $data['name'] : 'Безымянный список';
        $created = isset($data['created']) ? $data['created'] : date('c');
        
        // Формируем имя файла на основе ID
        $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.txt';
        $filePath = URL_LISTS_DIR . '/' . $fileName;
        
        // Формируем содержимое файла
        $content = "# " . $name . "\n";
        $content .= "# Создано: " . $created . "\n";
        $content .= "# Количество URL: " . count($urls) . "\n";
        $content .= "# ==========================================\n\n";
        
        foreach ($urls as $url) {
            $content .= trim($url) . "\n";
        }
        
        // Сохраняем файл
        $result = file_put_contents($filePath, $content);
        
        if ($result !== false) {
            // Также сохраняем метаданные в JSON для быстрого доступа
            $metaFile = URL_LISTS_DIR . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.json';
            $metaData = [
                'id' => $listId,
                'name' => $name,
                'created' => $created,
                'urlCount' => count($urls),
                'fileName' => $fileName,
                'filePath' => $filePath
            ];
            file_put_contents($metaFile, json_encode($metaData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            return [
                'success' => true,
                'id' => $listId,
                'fileName' => $fileName,
                'urlCount' => count($urls)
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Не удалось сохранить файл'
            ];
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

function getUrlListFromFile($listId) {
    try {
        $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.txt';
        $filePath = URL_LISTS_DIR . '/' . $fileName;
        $metaFile = URL_LISTS_DIR . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.json';
        
        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'error' => 'Список не найден'
            ];
        }
        
        // Читаем метаданные
        $metaData = [];
        if (file_exists($metaFile)) {
            $metaData = json_decode(file_get_contents($metaFile), true);
        }
        
        // Читаем URL из файла
        $content = file_get_contents($filePath);
        $lines = explode("\n", $content);
        $urls = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            // Пропускаем комментарии и пустые строки
            if (!empty($line) && substr($line, 0, 1) !== '#') {
                $urls[] = $line;
            }
        }
        
        return [
            'success' => true,
            'data' => [
                'id' => $listId,
                'name' => isset($metaData['name']) ? $metaData['name'] : 'Безымянный список',
                'created' => isset($metaData['created']) ? $metaData['created'] : '',
                'urls' => $urls
            ]
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

function getAllUrlLists() {
    try {
        $lists = [];
        $files = glob(URL_LISTS_DIR . '/*.json');
        
        foreach ($files as $file) {
            $metaData = json_decode(file_get_contents($file), true);
            if ($metaData) {
                $lists[] = $metaData;
            }
        }
        
        // Сортируем по дате создания (новые первыми)
        usort($lists, function($a, $b) {
            return strtotime($b['created']) - strtotime($a['created']);
        });
        
        return [
            'success' => true,
            'data' => $lists
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

function deleteUrlList($listId) {
    try {
        $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.txt';
        $filePath = URL_LISTS_DIR . '/' . $fileName;
        $metaFile = URL_LISTS_DIR . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $listId) . '.json';
        
        $deleted = false;
        
        if (file_exists($filePath)) {
            unlink($filePath);
            $deleted = true;
        }
        
        if (file_exists($metaFile)) {
            unlink($metaFile);
            $deleted = true;
        }
        
        return [
            'success' => $deleted,
            'message' => $deleted ? 'Список удален' : 'Список не найден'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Обработка действий
switch ($action) {
    case 'save_url_list':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data || !isset($data['urls'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный формат данных'
                ]);
                exit();
            }
            
            $result = saveUrlListToFile($data);
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Метод не поддерживается'
            ]);
        }
        break;
        
    case 'get_url_list':
        $listId = isset($_GET['id']) ? $_GET['id'] : '';
        if (empty($listId)) {
            echo json_encode([
                'success' => false,
                'error' => 'ID списка не указан'
            ]);
            exit();
        }
        
        $result = getUrlListFromFile($listId);
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'get_all_url_lists':
        $result = getAllUrlLists();
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'delete_url_list':
        $listId = isset($_GET['id']) ? $_GET['id'] : '';
        if (empty($listId)) {
            echo json_encode([
                'success' => false,
                'error' => 'ID списка не указан'
            ]);
            exit();
        }
        
        $result = deleteUrlList($listId);
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'save_results':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Неверный формат данных'
                ]);
                exit();
            }
            
            $resultId = isset($data['id']) ? $data['id'] : 'result_' . time();
            $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $resultId) . '.json';
            $filePath = RESULTS_DIR . '/' . $fileName;
            
            $result = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            echo json_encode([
                'success' => $result !== false,
                'id' => $resultId,
                'fileName' => $fileName
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Метод не поддерживается'
            ]);
        }
        break;
        
    case 'get_results':
        $results = [];
        $files = glob(RESULTS_DIR . '/*.json');
        
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            if ($data) {
                $results[] = $data;
            }
        }
        
        echo json_encode($results, JSON_UNESCAPED_UNICODE);
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Неизвестное действие',
            'available_actions' => [
                'save_url_list',
                'get_url_list',
                'get_all_url_lists',
                'delete_url_list',
                'save_results',
                'get_results'
            ]
        ]);
        break;
}
?>
