// Автоматически определяем базовый путь
function getApiBasePath() {
    const currentPath = window.location.pathname;
    const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    return dir + '/api';
}

class BacklinkAPI {
    constructor(baseUrl = getApiBasePath()) {
        this.baseUrl = baseUrl;
    }

    // ========== МЕТОДЫ ДЛЯ СПИСКОВ URL ==========
    
    /**
     * Сохранение списка URL на сервер
     * @param {Array} urls - Массив URL-адресов
     * @param {Object} options - Дополнительные параметры (name, description, id)
     */
    async saveUrlList(urls, options = {}) {
        const data = {
            id: options.id || `list_${Date.now()}`,
            name: options.name || `URL List ${new Date().toLocaleDateString()}`,
            description: options.description || '',
            urls: urls,
            created: options.created || new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=save_url_list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ URL список сохранён на сервере:', result);
            }
            
            return result;
        } catch (error) {
            console.error('⚠️ Ошибка сохранения URL списка на сервер:', error);
            return this.saveUrlListToLocalStorage(data);
        }
    }

    /**
     * Получение списка URL с сервера
     */
    async getUrlList(listId) {
        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=get_url_list&id=${encodeURIComponent(listId)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки URL списка с сервера:', error);
            return this.getUrlListFromLocalStorage(listId);
        }
    }

    /**
     * Получение всех списков URL с сервера
     */
    async getAllUrlLists() {
        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=get_all_url_lists`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Ошибка загрузки списков URL с сервера:', error);
            return this.getAllUrlListsFromLocalStorage();
        }
    }

    /**
     * Удаление списка URL с сервера
     */
    async deleteUrlList(listId) {
        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=delete_url_list&id=${encodeURIComponent(listId)}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка удаления URL списка с сервера:', error);
            return this.deleteUrlListFromLocalStorage(listId);
        }
    }

    // ========== МЕТОДЫ ДЛЯ РЕЗУЛЬТАТОВ ==========

    async saveResults(data) {
        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=save_results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка сохранения результатов на сервер:', error);
            return this.saveToLocalStorage('savedResults', data);
        }
    }

    async getResults() {
        try {
            const response = await fetch(`${this.baseUrl}/server.php?action=get_results`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки результатов с сервера:', error);
            return this.getFromLocalStorage('savedResults');
        }
    }

    // ========== ЛОКАЛЬНЫЕ FALLBACK МЕТОДЫ ДЛЯ URL ==========
    
    saveUrlListToLocalStorage(data) {
        try {
            const lists = JSON.parse(localStorage.getItem('urlLists') || '[]');
            const existingIndex = lists.findIndex(list => list.id === data.id);
            
            if (existingIndex >= 0) {
                lists[existingIndex] = data;
            } else {
                lists.push(data);
            }
            
            localStorage.setItem('urlLists', JSON.stringify(lists));
            console.log('📦 URL список сохранён локально (fallback)');
            return { success: true, id: data.id, fallback: true };
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getUrlListFromLocalStorage(listId) {
        try {
            const lists = JSON.parse(localStorage.getItem('urlLists') || '[]');
            const list = lists.find(l => l.id === listId);
            return list ? { success: true, data: list } : { success: false, error: 'Список не найден' };
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getAllUrlListsFromLocalStorage() {
        try {
            return JSON.parse(localStorage.getItem('urlLists') || '[]');
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return [];
        }
    }

    deleteUrlListFromLocalStorage(listId) {
        try {
            const lists = JSON.parse(localStorage.getItem('urlLists') || '[]');
            const filtered = lists.filter(l => l.id !== listId);
            localStorage.setItem('urlLists', JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            console.error('Ошибка удаления из localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== ЛОКАЛЬНЫЕ FALLBACK МЕТОДЫ ДЛЯ РЕЗУЛЬТАТОВ ==========
    
    saveToLocalStorage(key, data) {
        try {
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            const newItem = {
                ...data,
                id: data.id || Date.now().toString()
            };
            items.push(newItem);
            localStorage.setItem(key, JSON.stringify(items));
            return { success: true, id: newItem.id };
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getFromLocalStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return [];
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ========== ЭКСПОРТ ОТЧЕТОВ ==========

/**
 * Экспорт отчета в TXT формат
 */
function exportToTxt(checkResults, searchText, settings) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const stats = calculateStats(checkResults);
    
    let txtContent = '';
    txtContent += '╔══════════════════════════════════════════════════════════════╗\n';
    txtContent += '║      ОТЧЕТ ПО ПРОВЕРКЕ ОБРАТНЫХ ССЫЛОК - SOFTO.TOP         ║\n';
    txtContent += '╚══════════════════════════════════════════════════════════════╝\n\n';
    
    txtContent += `Дата и время создания отчета: ${timestamp}\n`;
    txtContent += `Искомый текст: "${searchText}"\n`;
    txtContent += `\n`;
    
    txtContent += '─────────────────────────────────────────────────────────────\n';
    txtContent += 'НАСТРОЙКИ ПРОВЕРКИ\n';
    txtContent += '─────────────────────────────────────────────────────────────\n';
    txtContent += `  • Использовать прокси: ${settings.useProxy ? 'Да' : 'Нет'}\n`;
    txtContent += `  • Проверять небезопасные сайты: ${settings.allowUnsafe ? 'Да' : 'Нет'}\n`;
    txtContent += `  • Учитывать регистр: ${settings.caseSensitive ? 'Да' : 'Нет'}\n`;
    txtContent += `  • Только целые слова: ${settings.wholeWord ? 'Да' : 'Нет'}\n`;
    txtContent += `  • Таймаут: ${settings.timeout} сек\n`;
    txtContent += `  • Задержка между запросами: ${settings.delay} мс\n`;
    txtContent += `  • User Agent: ${settings.userAgent}\n`;
    txtContent += `\n`;
    
    txtContent += '─────────────────────────────────────────────────────────────\n';
    txtContent += 'СТАТИСТИКА\n';
    txtContent += '─────────────────────────────────────────────────────────────\n';
    txtContent += `  Всего проверено:   ${stats.total}\n`;
    txtContent += `  Найдено:          ${stats.found} (${stats.foundPercent}%)\n`;
    txtContent += `  Не найдено:       ${stats.notFound} (${stats.notFoundPercent}%)\n`;
    txtContent += `  Ошибки:           ${stats.errors} (${stats.errorsPercent}%)\n`;
    txtContent += `  Успешность:       ${stats.successRate}%\n`;
    txtContent += `\n`;
    
    txtContent += '═════════════════════════════════════════════════════════════\n';
    txtContent += 'ДЕТАЛЬНЫЕ РЕЗУЛЬТАТЫ\n';
    txtContent += '═════════════════════════════════════════════════════════════\n\n';
    
    checkResults.forEach((result, index) => {
        txtContent += `[${index + 1}] ${result.url}\n`;
        txtContent += `    Статус: ${result.error ? '❌ ОШИБКА' : (result.found && result.count > 0 ? '✅ НАЙДЕН' : '⚠️ НЕ НАЙДЕН')}\n`;
        
        if (!result.error) {
            txtContent += `    Количество вхождений: ${result.count}\n`;
            txtContent += `    Время ответа: ${result.responseTime}мс\n`;
        } else {
            txtContent += `    Ошибка: ${result.error}\n`;
        }
        
        txtContent += `    Время проверки: ${new Date(result.timestamp).toLocaleString('ru-RU')}\n`;
        
        if (result.context) {
            const cleanContext = result.context
                .replace(/<mark[^>]*>/g, '【')
                .replace(/<\/mark>/g, '】')
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            txtContent += `    Контекст:\n`;
            txtContent += `      ${cleanContext}\n`;
        }
        
        txtContent += `\n`;
    });
    
    txtContent += '═════════════════════════════════════════════════════════════\n';
    txtContent += 'Конец отчета\n';
    txtContent += '═════════════════════════════════════════════════════════════\n';
    
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backlink_report_${Date.now()}.txt`;
    link.click();
}

/**
 * Экспорт отчета в Excel (XLSX) формат
 * Использует библиотеку SheetJS (xlsx.js)
 */
function exportToExcel(checkResults, searchText, settings) {
    // Подключаем библиотеку SheetJS, если еще не подключена
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
        script.onload = () => exportToExcelInternal(checkResults, searchText, settings);
        document.head.appendChild(script);
    } else {
        exportToExcelInternal(checkResults, searchText, settings);
    }
}

function exportToExcelInternal(checkResults, searchText, settings) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const stats = calculateStats(checkResults);
    
    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    
    // === Лист 1: Статистика ===
    const statsData = [
        ['ОТЧЕТ ПО ПРОВЕРКЕ ОБРАТНЫХ ССЫЛОК - SOFTO.TOP'],
        [],
        ['Дата создания отчета:', timestamp],
        ['Искомый текст:', searchText],
        [],
        ['НАСТРОЙКИ ПРОВЕРКИ'],
        ['Использовать прокси:', settings.useProxy ? 'Да' : 'Нет'],
        ['Проверять небезопасные сайты:', settings.allowUnsafe ? 'Да' : 'Нет'],
        ['Учитывать регистр:', settings.caseSensitive ? 'Да' : 'Нет'],
        ['Только целые слова:', settings.wholeWord ? 'Да' : 'Нет'],
        ['Таймаут (сек):', settings.timeout],
        ['Задержка между запросами (мс):', settings.delay],
        ['User Agent:', settings.userAgent],
        [],
        ['СТАТИСТИКА'],
        ['Всего проверено:', stats.total],
        ['Найдено:', `${stats.found} (${stats.foundPercent}%)`],
        ['Не найдено:', `${stats.notFound} (${stats.notFoundPercent}%)`],
        ['Ошибки:', `${stats.errors} (${stats.errorsPercent}%)`],
        ['Успешность:', `${stats.successRate}%`]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    
    // Устанавливаем ширину колонок
    statsSheet['!cols'] = [
        { wch: 40 },
        { wch: 50 }
    ];
    
    XLSX.utils.book_append_sheet(wb, statsSheet, 'Статистика');
    
    // === Лист 2: Детальные результаты ===
    const resultsData = [
        ['№', 'URL', 'Статус', 'Количество вхождений', 'Время ответа (мс)', 'Контекст', 'Ошибка', 'Время проверки']
    ];
    
    checkResults.forEach((result, index) => {
        const status = result.error ? 'ОШИБКА' : (result.found && result.count > 0 ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
        const cleanContext = result.context 
            ? result.context
                .replace(/<mark[^>]*>/g, '')
                .replace(/<\/mark>/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim()
            : '';
        
        resultsData.push([
            index + 1,
            result.url,
            status,
            result.error ? '' : result.count,
            result.responseTime || '',
            cleanContext,
            result.error || '',
            new Date(result.timestamp).toLocaleString('ru-RU')
        ]);
    });
    
    const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData);
    
    // Устанавливаем ширину колонок
    resultsSheet['!cols'] = [
        { wch: 5 },   // №
        { wch: 50 },  // URL
        { wch: 12 },  // Статус
        { wch: 12 },  // Количество
        { wch: 12 },  // Время ответа
        { wch: 60 },  // Контекст
        { wch: 30 },  // Ошибка
        { wch: 20 }   // Время проверки
    ];
    
    XLSX.utils.book_append_sheet(wb, resultsSheet, 'Результаты');
    
    // === Лист 3: Только найденные ===
    const foundResults = checkResults.filter(r => r.found && r.count > 0);
    if (foundResults.length > 0) {
        const foundData = [
            ['№', 'URL', 'Количество вхождений', 'Время ответа (мс)', 'Контекст']
        ];
        
        foundResults.forEach((result, index) => {
            const cleanContext = result.context 
                ? result.context
                    .replace(/<mark[^>]*>/g, '')
                    .replace(/<\/mark>/g, '')
                    .replace(/<[^>]*>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
            
            foundData.push([
                index + 1,
                result.url,
                result.count,
                result.responseTime || '',
                cleanContext
            ]);
        });
        
        const foundSheet = XLSX.utils.aoa_to_sheet(foundData);
        foundSheet['!cols'] = [
            { wch: 5 },
            { wch: 50 },
            { wch: 12 },
            { wch: 12 },
            { wch: 60 }
        ];
        
        XLSX.utils.book_append_sheet(wb, foundSheet, 'Найденные');
    }
    
    // Сохраняем файл
    XLSX.writeFile(wb, `backlink_report_${Date.now()}.xlsx`);
}

/**
 * Экспорт отчета в RTF формат
 */
function exportToRtf(checkResults, searchText, settings) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const stats = calculateStats(checkResults);
    
    let rtfContent = '';
    
    // RTF заголовок
    rtfContent += '{\\rtf1\\ansi\\deff0\n';
    rtfContent += '{\\fonttbl{\\f0\\fnil\\fcharset204 Arial;}}\n';
    rtfContent += '{\\colortbl;\\red0\\green0\\blue0;\\red0\\green128\\blue0;\\red255\\green0\\blue0;\\red255\\green140\\blue0;}\n';
    rtfContent += '\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1134\\margb1134\n';
    
    // Заголовок отчета
    rtfContent += '\\pard\\qc\\b\\fs32 ОТЧЕТ ПО ПРОВЕРКЕ ОБРАТНЫХ ССЫЛОК - SOFTO.TOP\\b0\\fs24\\par\n';
    rtfContent += '\\pard\\par\n';
    
    rtfContent += `\\b Дата создания отчета:\\b0  ${escapeRtf(timestamp)}\\par\n`;
    rtfContent += `\\b Искомый текст:\\b0  "${escapeRtf(searchText)}"\\par\n`;
    rtfContent += '\\par\n';
    
    // Настройки проверки
    rtfContent += '\\pard\\b\\fs28 НАСТРОЙКИ ПРОВЕРКИ\\b0\\fs24\\par\n';
    rtfContent += '\\pard\\par\n';
    rtfContent += `  • Использовать прокси: ${settings.useProxy ? 'Да' : 'Нет'}\\par\n`;
    rtfContent += `  • Проверять небезопасные сайты: ${settings.allowUnsafe ? 'Да' : 'Нет'}\\par\n`;
    rtfContent += `  • Учитывать регистр: ${settings.caseSensitive ? 'Да' : 'Нет'}\\par\n`;
    rtfContent += `  • Только целые слова: ${settings.wholeWord ? 'Да' : 'Нет'}\\par\n`;
    rtfContent += `  • Таймаут: ${settings.timeout} сек\\par\n`;
    rtfContent += `  • Задержка между запросами: ${settings.delay} мс\\par\n`;
    rtfContent += `  • User Agent: ${escapeRtf(settings.userAgent)}\\par\n`;
    rtfContent += '\\par\n';
    
    // Статистика
    rtfContent += '\\pard\\b\\fs28 СТАТИСТИКА\\b0\\fs24\\par\n';
    rtfContent += '\\pard\\par\n';
    rtfContent += `  Всего проверено: ${stats.total}\\par\n`;
    rtfContent += `  \\cf2 Найдено: ${stats.found} (${stats.foundPercent}%)\\cf1\\par\n`;
    rtfContent += `  \\cf3 Не найдено: ${stats.notFound} (${stats.notFoundPercent}%)\\cf1\\par\n`;
    rtfContent += `  \\cf4 Ошибки: ${stats.errors} (${stats.errorsPercent}%)\\cf1\\par\n`;
    rtfContent += `  Успешность: ${stats.successRate}%\\par\n`;
    rtfContent += '\\par\n';
    
    // Детальные результаты
    rtfContent += '\\pard\\b\\fs28 ДЕТАЛЬНЫЕ РЕЗУЛЬТАТЫ\\b0\\fs24\\par\n';
    rtfContent += '\\pard\\par\n';
    
    checkResults.forEach((result, index) => {
        rtfContent += `\\pard\\b [${index + 1}] \\b0 ${escapeRtf(result.url)}\\par\n`;
        
        if (result.error) {
            rtfContent += `    \\cf3 Статус: ОШИБКА\\cf1\\par\n`;
            rtfContent += `    Ошибка: ${escapeRtf(result.error)}\\par\n`;
        } else if (result.found && result.count > 0) {
            rtfContent += `    \\cf2 Статус: НАЙДЕН\\cf1\\par\n`;
            rtfContent += `    Количество вхождений: ${result.count}\\par\n`;
            rtfContent += `    Время ответа: ${result.responseTime}мс\\par\n`;
        } else {
            rtfContent += `    \\cf4 Статус: НЕ НАЙДЕН\\cf1\\par\n`;
            rtfContent += `    Количество вхождений: 0\\par\n`;
            rtfContent += `    Время ответа: ${result.responseTime}мс\\par\n`;
        }
        
        rtfContent += `    Время проверки: ${escapeRtf(new Date(result.timestamp).toLocaleString('ru-RU'))}\\par\n`;
        
        if (result.context) {
            const cleanContext = result.context
                .replace(/<mark[^>]*>/g, '')
                .replace(/<\/mark>/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            rtfContent += `    Контекст: ${escapeRtf(cleanContext)}\\par\n`;
        }
        
        rtfContent += '\\par\n';
    });
    
    rtfContent += '}';
    
    const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backlink_report_${Date.now()}.rtf`;
    link.click();
}

/**
 * Экранирование специальных символов для RTF
 */
function escapeRtf(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\n/g, '\\par\n');
}

/**
 * Вычисление статистики
 */
function calculateStats(checkResults) {
    const total = checkResults.length;
    const found = checkResults.filter(r => r.found && r.count > 0).length;
    const notFound = checkResults.filter(r => !r.error && (!r.found || r.count === 0)).length;
    const errors = checkResults.filter(r => r.error).length;
    const successRate = total > 0 ? Math.round(((total - errors) / total) * 100) : 0;
    
    return {
        total,
        found,
        notFound,
        errors,
        successRate,
        foundPercent: total > 0 ? Math.round((found / total) * 100) : 0,
        notFoundPercent: total > 0 ? Math.round((notFound / total) * 100) : 0,
        errorsPercent: total > 0 ? Math.round((errors / total) * 100) : 0
    };
}

// Расширенный класс для проверки обратных ссылок
class EnhancedBacklinkChecker {
    constructor() {
        this.api = new BacklinkAPI();
        this.checkResults = [];
        this.isPaused = false;
        this.isStopped = false;
        this.startTime = null;
        this.currentFilter = 'all';
        this.currentListId = null;
        this.autoSaveTimer = null;
        
        this.proxyServices = [
            url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            url => `https://cors-anywhere.herokuapp.com/${url}`,
            url => `https://thingproxy.freeboard.io/fetch/${url}`,
            url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
            url => `https://proxy.cors.sh/${url}`,
            url => `https://yacdn.org/proxy/${url}`,
            url => `https://crossorigin.me/${url}`,
            url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            url => `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
        ];
        
        this.userAgents = {
            default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        };
        
        this.initializeEventListeners();
    }

    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.autoSaveUrls();
        }, 2000);
    }

    async autoSaveUrls() {
        const urlList = document.getElementById('urlList').value.trim();
        if (!urlList) return;
        
        const urls = urlList.split('\n').map(url => url.trim()).filter(url => url);
        if (urls.length === 0) return;
        
        const listId = `list_${Date.now()}`;
        
        const options = {
            id: listId,
            name: `Список URL от ${new Date().toLocaleString('ru-RU')}`,
            description: `Список содержит ${urls.length} URL-адресов`,
            saveToFile: true
        };
        
        await this.api.saveUrlList(urls, options);
    }

    clearUrlList() {
        document.getElementById('urlList').value = '';
        this.updateUrlCount();
        this.currentListId = null;
    }

    async fetchPageContent(url, options = {}) {
        const useProxy = document.getElementById('useProxy').checked;
        const allowUnsafe = document.getElementById('allowUnsafe').checked;
        const timeout = parseInt(document.getElementById('timeout').value) * 1000;
        const maxRetries = parseInt(document.getElementById('maxRetries').value);
        const userAgentType = document.getElementById('userAgent').value;
        const followRedirects = document.getElementById('followRedirects').checked;
        
        const fetchOptions = {
            headers: {
                'User-Agent': this.userAgents[userAgentType] || this.userAgents.default,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'no-cache'
            },
            signal: AbortSignal.timeout(timeout),
            redirect: followRedirects ? 'follow' : 'manual'
        };

        let lastError = null;
        
        if (!useProxy || allowUnsafe) {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const response = await fetch(url, fetchOptions);
                    if (response.ok) {
                        const content = await response.text();
                        if (this.isValidContent(content)) {
                            return content;
                        }
                    }
                    lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries - 1) {
                        await this.delay(1000 * (attempt + 1));
                    }
                }
            }
        }

        if (useProxy) {
            for (let proxyFn of this.proxyServices) {
                for (let attempt = 0; attempt < Math.min(maxRetries, 2); attempt++) {
                    try {
                        const proxyUrl = proxyFn(url);
                        const response = await fetch(proxyUrl, {
                            ...fetchOptions,
                            signal: AbortSignal.timeout(timeout + 5000)
                        });
                        
                        if (response.ok) {
                            let content = await response.text();
                            
                            if (proxyUrl.includes('allorigins.win/get')) {
                                const jsonData = JSON.parse(content);
                                content = jsonData.contents || '';
                            }
                            
                            if (this.isValidContent(content)) {
                                return content;
                            }
                        }
                        lastError = new Error(`Proxy failed: HTTP ${response.status}`);
                    } catch (error) {
                        lastError = error;
                        if (attempt < 1) {
                            await this.delay(500);
                        }
                    }
                }
            }
        }
        
        throw lastError || new Error('Не удалось загрузить страницу');
    }

    isValidContent(content) {
        if (!content || content.length < 100) return false;
        
        const hasHtmlTags = /<(html|head|body|div|p|span)/i.test(content);
        const hasText = content.replace(/<[^>]*>/g, '').trim().length > 50;
        
        return hasHtmlTags || hasText;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    searchInText(content, searchText, options) {
        let text = content;
        let search = searchText;
        
        if (!options.caseSensitive) {
            text = text.toLowerCase();
            search = search.toLowerCase();
        }
        
        try {
            if (options.wholeWord) {
                const regex = new RegExp(`\\b${this.escapeRegex(search)}\\b`, options.caseSensitive ? 'g' : 'gi');
                const matches = text.match(regex);
                return matches ? matches.length : 0;
            } else if (options.useRegex) {
                const regex = new RegExp(search, options.caseSensitive ? 'g' : 'gi');
                const matches = text.match(regex);
                return matches ? matches.length : 0;
            } else {
                const matches = text.split(search);
                return matches.length - 1;
            }
        } catch (error) {
            console.warn('Ошибка регулярного выражения, использую простой поиск:', error);
            const matches = text.split(search);
            return matches.length - 1;
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getContext(content, searchText, options) {
        if (!options.showContext) return '';
        
        let text = content;
        let search = searchText;
        const originalSearch = searchText;
        
        if (!options.caseSensitive) {
            text = text.toLowerCase();
            search = search.toLowerCase();
        }
        
        const contexts = [];
        let index = text.indexOf(search);
        let contextCount = 0;
        const maxContexts = options.checkMultiple ? 5 : 1;
        
        while (index !== -1 && contextCount < maxContexts) {
            const start = Math.max(0, index - 80);
            const end = Math.min(content.length, index + search.length + 80);
            
            let context = content.substring(start, end);
            context = this.highlightText(context, originalSearch, options.caseSensitive);
            
            contexts.push(context);
            contextCount++;
            
            if (!options.checkMultiple) break;
            index = text.indexOf(search, index + 1);
        }
        
        return contexts.map(ctx => `...${ctx}...`).join('<br><hr class="my-2"><br>');
    }

    highlightText(text, searchText, caseSensitive) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(this.escapeRegex(searchText), flags);
        return text.replace(regex, `<mark class="bg-yellow-300 px-1 rounded">${searchText}</mark>`);
    }

    updateUrlCount() {
        const urlList = document.getElementById('urlList').value.trim();
        const urls = urlList.split('\n').map(url => url.trim()).filter(url => url);
        document.getElementById('urlCount').textContent = `${urls.length} URL`;
    }

    initializeEventListeners() {
        if (document.getElementById('urlList')) {
            document.getElementById('urlList').addEventListener('input', () => {
                this.updateUrlCount();
                this.scheduleAutoSave();
            });
        }
        
        if (document.getElementById('clearUrlList')) {
            document.getElementById('clearUrlList').addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить список URL?')) {
                    this.clearUrlList();
                }
            });
        }
        
        if (document.getElementById('startCheck')) {
            document.getElementById('startCheck').addEventListener('click', () => this.checkWebsites());
        }
        
        this.updateUrlCount();
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backlinkChecker = new EnhancedBacklinkChecker();
    });
}